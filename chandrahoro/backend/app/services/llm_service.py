"""LLM configuration and key management service."""

import os
import json
import time
import asyncio
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, func
from sqlalchemy.orm import selectinload
from app.models import (
    User, LlmConfig, LlmSharedKey, LlmSharedKeyUsage, LlmAdminDefaults, LlmUserAccess, LlmAuditLog,
    LlmProvider, ResponseFormat, AuditAction, AiModuleType
)
from app.core.security import hash_password
import logging
import httpx

logger = logging.getLogger(__name__)


class LlmKeyVault:
    """Secure key storage using Fernet encryption."""

    def __init__(self):
        # Get encryption key from environment or generate one
        key = os.getenv("LLM_VAULT_KEY")
        if not key:
            # Generate a key for development (in production, use a proper key management system)
            key = Fernet.generate_key().decode()
            logger.warning("No LLM_VAULT_KEY found, using generated key (not suitable for production)")

        if isinstance(key, str):
            key = key.encode()

        self.cipher = Fernet(key)
        self.vault_dir = os.getenv("LLM_VAULT_DIR", "/tmp/llm_vault")
        os.makedirs(self.vault_dir, exist_ok=True)

    def encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key."""
        return self.cipher.encrypt(api_key.encode()).decode()

    def decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt an API key."""
        return self.cipher.decrypt(encrypted_key.encode()).decode()

    def generate_vault_ref(self, user_id: str, provider: str) -> str:
        """Generate a vault reference."""
        return f"vault://secret/user-{user_id}-{provider}-key"

    async def store_key(self, vault_ref: str, api_key: str) -> None:
        """Store an encrypted API key in the vault."""
        encrypted = self.encrypt_key(api_key)
        # Extract key name from vault ref (e.g., "vault://secret/user-123-openai-key" -> "user-123-openai-key")
        key_name = vault_ref.replace("vault://secret/", "")
        file_path = os.path.join(self.vault_dir, f"{key_name}.enc")

        with open(file_path, 'w') as f:
            f.write(encrypted)

    async def retrieve_key(self, vault_ref: str) -> Optional[str]:
        """Retrieve and decrypt an API key from the vault."""
        key_name = vault_ref.replace("vault://secret/", "")
        file_path = os.path.join(self.vault_dir, f"{key_name}.enc")

        if not os.path.exists(file_path):
            return None

        with open(file_path, 'r') as f:
            encrypted = f.read()

        return self.decrypt_key(encrypted)

    async def delete_key(self, vault_ref: str) -> None:
        """Delete an API key from the vault."""
        key_name = vault_ref.replace("vault://secret/", "")
        file_path = os.path.join(self.vault_dir, f"{key_name}.enc")

        if os.path.exists(file_path):
            os.remove(file_path)


class LlmService:
    """Service for managing LLM configurations and API keys."""
    
    def __init__(self):
        self.vault = LlmKeyVault()
    
    async def test_connection(
        self,
        provider: LlmProvider,
        model: str,
        api_key: str,
        base_url: Optional[str] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """
        Test LLM API connection.
        
        Returns:
            Tuple of (success, latency_ms, error_message)
        """
        start_time = time.time()
        
        try:
            # Build headers
            headers = {"Content-Type": "application/json"}
            if extra_headers:
                headers.update(extra_headers)
            
            # Provider-specific configuration
            if provider == LlmProvider.OPENAI:
                headers["Authorization"] = f"Bearer {api_key}"
                url = base_url or "https://api.openai.com/v1/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": "Test"}],
                    "max_tokens": 5
                }
            
            elif provider == LlmProvider.ANTHROPIC:
                headers["x-api-key"] = api_key
                headers["anthropic-version"] = "2023-06-01"
                url = base_url or "https://api.anthropic.com/v1/messages"
                payload = {
                    "model": model,
                    "max_tokens": 5,
                    "messages": [{"role": "user", "content": "Test"}]
                }
            
            elif provider == LlmProvider.GOOGLE:
                url = base_url or f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                url += f"?key={api_key}"
                payload = {
                    "contents": [{"parts": [{"text": "Test"}]}],
                    "generationConfig": {"maxOutputTokens": 5}
                }

            elif provider == LlmProvider.PERPLEXITY:
                headers["Authorization"] = f"Bearer {api_key}"
                url = base_url or "https://api.perplexity.ai/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": "Test"}],
                    "max_tokens": 5
                }

            else:
                # Generic provider (OpenRouter, custom, etc.)
                headers["Authorization"] = f"Bearer {api_key}"
                url = base_url or "https://openrouter.ai/api/v1/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": "Test"}],
                    "max_tokens": 5
                }
            
            # Make test request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                
                latency_ms = int((time.time() - start_time) * 1000)
                
                if response.status_code == 200:
                    return True, latency_ms, None
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                    return False, latency_ms, error_msg
        
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            return False, latency_ms, str(e)
    
    async def save_config(
        self,
        db: AsyncSession,
        user_id: str,
        provider: LlmProvider,
        model: str,
        api_key: str,
        base_url: Optional[str] = None,
        region: Optional[str] = None,
        deployment: Optional[str] = None,
        extra_headers: Optional[Dict[str, str]] = None,
        response_format: ResponseFormat = ResponseFormat.AUTO,
        daily_limit: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> LlmConfig:
        """Save user LLM configuration."""
        
        # Encrypt API key
        encrypted_key = self.vault.encrypt_key(api_key)
        vault_ref = self.vault.generate_vault_ref(user_id, provider.value)
        key_last_four = api_key[-4:] if len(api_key) >= 4 else "****"
        
        # Check if config exists
        result = await db.execute(
            select(LlmConfig).where(LlmConfig.user_id == user_id)
        )
        existing_config = result.scalar_one_or_none()
        
        if existing_config:
            # Update existing config
            existing_config.provider = provider
            existing_config.model = model
            existing_config.base_url = base_url
            existing_config.region = region
            existing_config.deployment = deployment
            existing_config.extra_headers = extra_headers
            existing_config.response_format = response_format
            existing_config.daily_limit = daily_limit
            existing_config.key_vault_ref = vault_ref
            existing_config.key_last_four = key_last_four
            existing_config.updated_at = datetime.utcnow()
            config = existing_config
            action = AuditAction.UPDATE
        else:
            # Create new config
            config = LlmConfig(
                user_id=user_id,
                provider=provider,
                model=model,
                base_url=base_url,
                region=region,
                deployment=deployment,
                extra_headers=extra_headers,
                response_format=response_format,
                daily_limit=daily_limit,
                key_vault_ref=vault_ref,
                key_last_four=key_last_four,
                is_active=True,
                usage_today=0,
                usage_this_month=0
            )
            db.add(config)
            action = AuditAction.CREATE
        
        # Store encrypted key (in production, use proper vault)
        # For now, store in a simple file-based vault
        await self._store_encrypted_key(vault_ref, encrypted_key)
        
        await db.commit()
        await db.refresh(config)
        
        # Log audit event
        await self._log_audit(
            db, user_id, action, "config", config.id,
            provider=provider, model=model,
            ip_address=ip_address, user_agent=user_agent, success=True
        )
        
        return config

    async def save_config_with_owner_name(
        self,
        db: AsyncSession,
        user_id: str,
        key_owner_name: str,
        provider: LlmProvider,
        model: str,
        api_key: str,
        base_url: Optional[str] = None,
        region: Optional[str] = None,
        deployment: Optional[str] = None,
        extra_headers: Optional[Dict[str, str]] = None,
        response_format: ResponseFormat = ResponseFormat.AUTO,
        daily_limit: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> LlmConfig:
        """Save LLM configuration with owner name (simple key sharing for testing).

        The API key is stored by owner name, not user ID. Multiple users can share
        the same API key by using the same owner name.
        """
        # Generate vault reference using owner name instead of user ID
        vault_ref = f"vault://secret/owner-{key_owner_name}-{provider.value}-key"

        # Encrypt API key
        encrypted_key = self.vault.encrypt_key(api_key)
        key_last_four = api_key[-4:] if len(api_key) >= 4 else api_key

        # Check if config exists for this user
        result = await db.execute(
            select(LlmConfig).where(LlmConfig.user_id == user_id)
        )
        existing_config = result.scalar_one_or_none()

        if existing_config:
            # Update existing config
            existing_config.use_shared_key = False
            existing_config.shared_key_account_name = None
            existing_config.use_owner_name = True
            existing_config.key_owner_name = key_owner_name
            existing_config.provider = provider
            existing_config.model = model
            existing_config.base_url = base_url
            existing_config.region = region
            existing_config.deployment = deployment
            existing_config.extra_headers = extra_headers
            existing_config.response_format = response_format
            existing_config.daily_limit = daily_limit
            existing_config.key_vault_ref = vault_ref
            existing_config.key_last_four = key_last_four
            existing_config.is_active = True
            existing_config.updated_at = datetime.utcnow()
            config = existing_config
            action = AuditAction.UPDATE
        else:
            # Create new config
            config = LlmConfig(
                user_id=user_id,
                use_shared_key=False,
                use_owner_name=True,
                key_owner_name=key_owner_name,
                provider=provider,
                model=model,
                base_url=base_url,
                region=region,
                deployment=deployment,
                extra_headers=extra_headers,
                response_format=response_format,
                daily_limit=daily_limit,
                key_vault_ref=vault_ref,
                key_last_four=key_last_four,
                is_active=True,
                usage_today=0,
                usage_this_month=0
            )
            db.add(config)
            action = AuditAction.CREATE

        # Store encrypted key in vault (by owner name)
        await self.vault.store_key(vault_ref, api_key)

        await db.commit()
        await db.refresh(config)

        # Log audit event
        await self._log_audit(
            db, user_id, action, "config", config.id,
            provider=provider, model=model,
            ip_address=ip_address, user_agent=user_agent, success=True
        )

        return config

    async def get_config(self, db: AsyncSession, user_id: str) -> Optional[LlmConfig]:
        """Get user LLM configuration."""
        result = await db.execute(
            select(LlmConfig).where(
                and_(LlmConfig.user_id == user_id, LlmConfig.is_active == True)
            )
        )
        return result.scalar_one_or_none()
    
    async def delete_config(
        self,
        db: AsyncSession,
        user_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """Delete user LLM configuration."""
        config = await self.get_config(db, user_id)
        if not config:
            return False
        
        # Delete encrypted key from vault
        await self._delete_encrypted_key(config.key_vault_ref)
        
        # Delete config
        await db.delete(config)
        await db.commit()
        
        # Log audit event
        await self._log_audit(
            db, user_id, AuditAction.DELETE, "config", config.id,
            provider=config.provider, model=config.model,
            ip_address=ip_address, user_agent=user_agent, success=True
        )
        
        return True
    
    async def _store_encrypted_key(self, vault_ref: str, encrypted_key: str):
        """Store encrypted key (simple file-based implementation)."""
        # In production, use HashiCorp Vault or AWS Secrets Manager
        vault_dir = "/tmp/llm_vault"
        os.makedirs(vault_dir, exist_ok=True)
        
        # Use hash of vault_ref as filename for security
        import hashlib
        filename = hashlib.sha256(vault_ref.encode()).hexdigest()
        filepath = os.path.join(vault_dir, filename)
        
        with open(filepath, 'w') as f:
            f.write(encrypted_key)
    
    async def _delete_encrypted_key(self, vault_ref: str):
        """Delete encrypted key from vault."""
        vault_dir = "/tmp/llm_vault"
        import hashlib
        filename = hashlib.sha256(vault_ref.encode()).hexdigest()
        filepath = os.path.join(vault_dir, filename)

        if os.path.exists(filepath):
            os.remove(filepath)

    async def _retrieve_encrypted_key(self, vault_ref: str) -> str:
        """Retrieve encrypted key from vault."""
        vault_dir = "/tmp/llm_vault"
        import hashlib
        filename = hashlib.sha256(vault_ref.encode()).hexdigest()
        filepath = os.path.join(vault_dir, filename)

        if not os.path.exists(filepath):
            raise ValueError(f"Encrypted key not found for vault reference: {vault_ref}")

        with open(filepath, 'r') as f:
            return f.read().strip()
    
    async def _log_audit(
        self,
        db: AsyncSession,
        user_id: str,
        action: AuditAction,
        resource_type: str,
        resource_id: Optional[str] = None,
        admin_user_id: Optional[str] = None,
        provider: Optional[LlmProvider] = None,
        model: Optional[str] = None,
        old_values: Optional[Dict] = None,
        new_values: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ):
        """Log audit event."""
        # Mask IP address for privacy (keep first 3 octets for IPv4)
        masked_ip = None
        if ip_address:
            parts = ip_address.split('.')
            if len(parts) == 4:  # IPv4
                masked_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.xxx"
            else:  # IPv6 or other
                masked_ip = ip_address[:16] + "..."
        
        audit_log = LlmAuditLog(
            user_id=user_id,
            admin_user_id=admin_user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            provider=provider,
            model=model,
            old_values=old_values,
            new_values=new_values,
            ip_address=masked_ip,
            user_agent=user_agent[:500] if user_agent else None,
            success=success,
            error_message=error_message
        )
        
        db.add(audit_log)
        await db.commit()

    async def generate_interpretation(
        self,
        db: AsyncSession,
        user_id: str,
        chart_data: Dict[str, Any],
        include_sections: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI interpretation using user's LLM configuration.

        Args:
            db: Database session
            user_id: User ID
            chart_data: Chart data to interpret
            include_sections: Sections to include in interpretation

        Returns:
            Interpretation result with content and metadata
        """
        # Get user's LLM configuration
        config = await self.get_config(db, user_id)
        if not config or not config.is_active:
            return {
                "success": False,
                "error": "No active LLM configuration found"
            }

        # Retrieve and decrypt API key
        try:
            encrypted_key = await self._retrieve_encrypted_key(config.key_vault_ref)
            api_key = self.vault.decrypt_key(encrypted_key)
        except Exception as e:
            # Check for encryption/decryption errors
            error_str = str(e)
            error_type = type(e).__name__
            if 'InvalidToken' in error_type or 'InvalidSignature' in error_type or 'InvalidToken' in error_str or 'Signature did not match' in error_str or 'InvalidSignature' in error_str:
                return {
                    "success": False,
                    "error": "API_KEY_ENCRYPTION_ERROR",
                    "message": "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                }
            # Re-raise other errors
            raise

        try:
            # Get custom prompt template if configured
            try:
                prompt_template = await self._get_prompt_template(
                    db, AiModuleType.CHART_INTERPRETATION, user_id
                )
                logger.info(f"Using custom prompt template for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to get custom prompt, using default: {e}")
                prompt_template = None

            # Generate interpretation using the configured provider
            result = await self._generate_with_provider(
                config.provider, api_key, config.model,
                chart_data, "interpretation", custom_prompt=prompt_template
            )

            # Log usage if successful
            if result.get("success"):
                await self._log_audit(
                    db, user_id, AuditAction.TEST, "interpretation",
                    provider=config.provider, model=config.model,
                    success=True
                )

                # Update usage tracking
                config.usage_today += 1
                config.last_used_at = datetime.utcnow()
                await db.commit()

            return result

        except Exception as e:
            logger.error(f"Error generating interpretation: {e}")
            await self._log_audit(
                db, user_id, AuditAction.TEST, "interpretation",
                provider=config.provider, model=config.model,
                success=False, error_message=str(e)
            )
            return {
                "success": False,
                "error": f"Failed to generate interpretation: {str(e)}"
            }

    async def generate_chat_response(
        self,
        db: AsyncSession,
        user_id: str,
        chart_data: Dict[str, Any],
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI chat response using user's LLM configuration.

        Args:
            db: Database session
            user_id: User ID
            chart_data: Chart data for context
            question: User's question
            conversation_history: Previous conversation messages

        Returns:
            Chat response result with content and metadata
        """
        # Get user's LLM configuration
        config = await self.get_config(db, user_id)
        if not config or not config.is_active:
            return {
                "success": False,
                "error": "No active LLM configuration found"
            }

        # Retrieve and decrypt API key
        try:
            encrypted_key = await self._retrieve_encrypted_key(config.key_vault_ref)
            api_key = self.vault.decrypt_key(encrypted_key)
        except Exception as e:
            # Check for encryption/decryption errors
            error_str = str(e)
            error_type = type(e).__name__
            if 'InvalidToken' in error_type or 'InvalidSignature' in error_type or 'InvalidToken' in error_str or 'Signature did not match' in error_str or 'InvalidSignature' in error_str:
                return {
                    "success": False,
                    "error": "API_KEY_ENCRYPTION_ERROR",
                    "message": "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                }
            # Re-raise other errors
            raise

        try:
            # Generate chat response using the configured provider
            result = await self._generate_with_provider(
                config.provider, api_key, config.model,
                {"chart_data": chart_data, "question": question, "history": conversation_history or []},
                "chat"
            )

            # Log usage if successful
            if result.get("success"):
                await self._log_audit(
                    db, user_id, AuditAction.TEST, "chat",
                    provider=config.provider, model=config.model,
                    success=True
                )

                # Update usage tracking
                config.usage_today += 1
                config.last_used_at = datetime.utcnow()
                await db.commit()

            return result

        except Exception as e:
            logger.error(f"Error generating chat response: {e}")
            await self._log_audit(
                db, user_id, AuditAction.TEST, "chat",
                provider=config.provider, model=config.model,
                success=False, error_message=str(e)
            )
            return {
                "success": False,
                "error": f"Failed to generate chat response: {str(e)}"
            }

    async def generate_compatibility_analysis(
        self,
        db: AsyncSession,
        user_id: str,
        primary_chart_data: Dict[str, Any],
        partner_chart_data: Dict[str, Any],
        analysis_focus: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI compatibility analysis between two charts.

        Args:
            db: Database session
            user_id: User ID
            primary_chart_data: Primary person's chart data
            partner_chart_data: Partner's chart data
            analysis_focus: Areas to focus on (emotional, intellectual, etc.)

        Returns:
            Compatibility analysis result with content and metadata
        """
        # Get user's LLM configuration
        config = await self.get_config(db, user_id)
        if not config or not config.is_active:
            return {
                "success": False,
                "error": "No active LLM configuration found"
            }

        # Retrieve and decrypt API key
        try:
            encrypted_key = await self._retrieve_encrypted_key(config.key_vault_ref)
            api_key = self.vault.decrypt_key(encrypted_key)
        except Exception as e:
            # Check for encryption/decryption errors
            error_str = str(e)
            error_type = type(e).__name__
            if 'InvalidToken' in error_type or 'InvalidSignature' in error_type or 'InvalidToken' in error_str or 'Signature did not match' in error_str or 'InvalidSignature' in error_str:
                return {
                    "success": False,
                    "error": "API_KEY_ENCRYPTION_ERROR",
                    "message": "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                }
            # Re-raise other errors
            raise

        try:
            # Generate compatibility analysis using the configured provider
            result = await self._generate_with_provider(
                config.provider, api_key, config.model,
                {
                    "primary_chart": primary_chart_data,
                    "partner_chart": partner_chart_data,
                    "focus_areas": analysis_focus or []
                },
                "compatibility"
            )

            # Log usage if successful
            if result.get("success"):
                await self._log_audit(
                    db, user_id, AuditAction.TEST, "compatibility",
                    provider=config.provider, model=config.model,
                    success=True
                )

                # Update usage tracking
                config.usage_today += 1
                config.last_used_at = datetime.utcnow()
                await db.commit()

            return result

        except Exception as e:
            logger.error(f"Error generating compatibility analysis: {e}")
            await self._log_audit(
                db, user_id, AuditAction.TEST, "compatibility",
                provider=config.provider, model=config.model,
                success=False, error_message=str(e)
            )
            return {
                "success": False,
                "error": f"Failed to generate compatibility analysis: {str(e)}"
            }

    async def generate_match_horoscope_analysis(
        self,
        db: AsyncSession,
        user_id: str,
        primary_chart_data: Dict[str, Any],
        partner_chart_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate traditional Vedic astrology matchmaking analysis with Ashtakoot scoring.

        Args:
            db: Database session
            user_id: User ID
            primary_chart_data: Primary person's chart data
            partner_chart_data: Partner's chart data

        Returns:
            Match horoscope analysis with Ashtakoot scores and detailed analysis
        """
        # Get user's LLM configuration
        config = await self.get_config(db, user_id)
        if not config or not config.is_active:
            return {
                "success": False,
                "error": "No active LLM configuration found"
            }

        # Retrieve and decrypt API key
        try:
            encrypted_key = await self._retrieve_encrypted_key(config.key_vault_ref)
            api_key = self.vault.decrypt_key(encrypted_key)
        except Exception as e:
            # Check for encryption/decryption errors
            error_str = str(e)
            error_type = type(e).__name__
            if 'InvalidToken' in error_type or 'InvalidSignature' in error_type or 'InvalidToken' in error_str or 'Signature did not match' in error_str or 'InvalidSignature' in error_str:
                return {
                    "success": False,
                    "error": "API_KEY_ENCRYPTION_ERROR",
                    "message": "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                }
            # Re-raise other errors
            raise

        try:
            # Generate match horoscope analysis using the configured provider
            result = await self._generate_with_provider(
                config.provider, api_key, config.model,
                {
                    "primary_chart": primary_chart_data,
                    "partner_chart": partner_chart_data
                },
                "match_horoscope"
            )

            # Log usage if successful
            if result.get("success"):
                await self._log_audit(
                    db, user_id, AuditAction.TEST, "match_horoscope",
                    provider=config.provider, model=config.model,
                    success=True
                )

                # Update usage tracking
                config.usage_today += 1
                config.last_used_at = datetime.utcnow()
                await db.commit()

            return result

        except Exception as e:
            logger.error(f"Error generating match horoscope analysis: {e}")
            await self._log_audit(
                db, user_id, AuditAction.TEST, "match_horoscope",
                provider=config.provider, model=config.model,
                success=False, error_message=str(e)
            )
            return {
                "success": False,
                "error": f"Failed to generate match horoscope analysis: {str(e)}"
            }

    async def generate_match_horoscope_pdf(
        self,
        analysis_data: Dict[str, Any],
        user_name: str,
        partner_name: str
    ) -> Dict[str, Any]:
        """
        Generate PDF report for match horoscope analysis.

        Args:
            analysis_data: Match horoscope analysis results
            user_name: Primary person's name
            partner_name: Partner's name

        Returns:
            PDF generation result
        """
        try:
            # For now, return a simple success response
            # In a full implementation, you would use a PDF library like reportlab
            return {
                "success": True,
                "pdf_content": b"PDF content would be generated here",
                "filename": f"match-horoscope-{partner_name.replace(' ', '-')}.pdf"
            }
        except Exception as e:
            logger.error(f"Error generating match horoscope PDF: {e}")
            return {
                "success": False,
                "error": f"Failed to generate PDF: {str(e)}"
            }

    async def _generate_with_provider(
        self,
        provider: LlmProvider,
        api_key: str,
        model: str,
        data: Dict[str, Any],
        request_type: str,
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate content using the specified provider.

        Args:
            provider: LLM provider
            api_key: API key
            model: Model name
            data: Chart data and other context
            request_type: Type of request (interpretation, chat, etc.)
            custom_prompt: Optional custom prompt template to use instead of default

        Args:
            provider: LLM provider enum
            api_key: Decrypted API key
            model: Model name
            data: Request data (chart_data for interpretation, or combined data for chat)
            request_type: "interpretation" or "chat"

        Returns:
            Generation result with content and metadata
        """
        # Check for demo mode
        if os.getenv("AI_DEMO_MODE", "false").lower() == "true":
            return await self._generate_demo_response(request_type, data)

        try:
            if provider == LlmProvider.OPENROUTER:
                return await self._generate_openrouter(api_key, model, data, request_type, custom_prompt)
            elif provider == LlmProvider.OPENAI:
                return await self._generate_openai(api_key, model, data, request_type, custom_prompt)
            elif provider == LlmProvider.ANTHROPIC:
                return await self._generate_anthropic(api_key, model, data, request_type, custom_prompt)
            elif provider == LlmProvider.PERPLEXITY:
                return await self._generate_perplexity(api_key, model, data, request_type, custom_prompt)
            else:
                return {
                    "success": False,
                    "error": f"Unsupported provider: {provider}"
                }
        except Exception as e:
            logger.error(f"Error in _generate_with_provider: {e}")
            return {
                "success": False,
                "error": f"Provider error: {str(e)}"
            }

    async def _generate_demo_response(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate demo/mock responses for testing without real API calls."""

        if request_type == "interpretation":
            return {
                "success": True,
                "content": """# Vedic Chart Interpretation (Demo)

## Personality Overview
Based on your birth chart, you possess a unique blend of characteristics that make you both analytical and intuitive. Your Ascendant suggests a natural leadership quality, while the planetary positions indicate a strong connection to spiritual and philosophical pursuits.

## Key Planetary Influences
- **Sun**: Positioned favorably, indicating strong self-confidence and leadership abilities
- **Moon**: Emotional depth and intuitive understanding of others
- **Mars**: Dynamic energy and determination in pursuing goals
- **Mercury**: Sharp intellect and excellent communication skills

## Life Path Insights
Your chart suggests a life path focused on service to others and spiritual growth. The planetary combinations indicate success in fields related to education, counseling, or spiritual guidance.

## Recommendations
- Practice meditation and mindfulness for inner balance
- Pursue learning opportunities that expand your philosophical understanding
- Trust your intuitive insights when making important decisions

*This is a demo interpretation for testing purposes.*""",
                "model": "demo-model",
                "tokens": {"input": 150, "output": 200},
                "timestamp": datetime.utcnow().isoformat()
            }

        elif request_type == "chat":
            question = data.get("question", "")
            return {
                "success": True,
                "content": f"""Thank you for your question: "{question}"

Based on your birth chart data, I can provide some insights. In demo mode, I would analyze your specific planetary positions and their current transits to give you personalized guidance.

Your chart shows interesting patterns that suggest this is a good time for introspection and planning. The current planetary transits support making thoughtful decisions about your future direction.

*This is a demo response for testing purposes. In live mode, you would receive detailed astrological analysis based on your specific chart and current planetary transits.*""",
                "model": "demo-model",
                "tokens": {"input": 100, "output": 120},
                "timestamp": datetime.utcnow().isoformat()
            }

        elif request_type == "match_horoscope":
            return {
                "success": True,
                "report_title": "Matching between Test User and Test Partner Match Horoscope",
                "birth_details": {
                    "male": {
                        "name": "Test User",
                        "sex": "Male",
                        "date_of_birth": "15 : 5 : 1990",
                        "time_of_birth": "10 : 30 : 00",
                        "day_of_birth": "Tuesday",
                        "place_of_birth": "Mumbai, India",
                        "latitude": "19 : 05 : N",
                        "longitude": "72 : 53 : E",
                        "time_zone": "5.5",
                        "lagna": "Cancer",
                        "rashi": "Taurus",
                        "nakshatra_pada": "Rohini - 3",
                        "nakshatra_lord": "Moon"
                    },
                    "female": {
                        "name": "Test Partner",
                        "sex": "Female",
                        "date_of_birth": "15 : 6 : 1985",
                        "time_of_birth": "14 : 30 : 00",
                        "day_of_birth": "Saturday",
                        "place_of_birth": "Mumbai, India",
                        "latitude": "19 : 05 : N",
                        "longitude": "72 : 53 : E",
                        "time_zone": "5.5",
                        "lagna": "Scorpio",
                        "rashi": "Virgo",
                        "nakshatra_pada": "Hasta - 2",
                        "nakshatra_lord": "Moon"
                    }
                },
                "ashtakoot_analysis": {
                    "total_points": 26.5,
                    "max_points": 36,
                    "percentage": 73.6,
                    "guna_details": [
                        {
                            "guna": "VARNA",
                            "boy_value": "Brahmin",
                            "girl_value": "Kshatriya",
                            "max_points": 1,
                            "points_obtained": 1,
                            "area_of_life": "Work"
                        },
                        {
                            "guna": "VASYA",
                            "boy_value": "Jalchar",
                            "girl_value": "Chatushpad",
                            "max_points": 2,
                            "points_obtained": 1,
                            "area_of_life": "Dominance"
                        },
                        {
                            "guna": "TARA",
                            "boy_value": "Kshema",
                            "girl_value": "Ati mitra",
                            "max_points": 3,
                            "points_obtained": 1.5,
                            "area_of_life": "Destiny"
                        },
                        {
                            "guna": "YONI",
                            "boy_value": "Gaja",
                            "girl_value": "Gaja",
                            "max_points": 4,
                            "points_obtained": 4,
                            "area_of_life": "Mentality"
                        },
                        {
                            "guna": "MAITRI",
                            "boy_value": "Jupiter",
                            "girl_value": "Mars",
                            "max_points": 5,
                            "points_obtained": 5,
                            "area_of_life": "Compatibility"
                        },
                        {
                            "guna": "GANA",
                            "boy_value": "Devta",
                            "girl_value": "Manushya",
                            "max_points": 6,
                            "points_obtained": 6,
                            "area_of_life": "Guna Level"
                        },
                        {
                            "guna": "BHAKOOT",
                            "boy_value": "Taurus",
                            "girl_value": "Virgo",
                            "max_points": 7,
                            "points_obtained": 0,
                            "area_of_life": "Love"
                        },
                        {
                            "guna": "NADI",
                            "boy_value": "Antya",
                            "girl_value": "Madhya",
                            "max_points": 8,
                            "points_obtained": 8,
                            "area_of_life": "Health"
                        }
                    ]
                },
                "manglik_analysis": {
                    "male_status": "High Mangal Dosha",
                    "female_status": "No Mangal Dosha",
                    "compatibility_note": "Substantial difference in Mangal Dosha levels"
                },
                "conclusion": "Ashtakoot Match (36 points match) is successful however there is substantial difference in the level of Mangal Dosha compatibility of both the horoscopes. It is advisable to consult a learned astrologer before proceeding to marriage.",
                "detailed_interpretations": {
                    "varna": "The boy's varna is Brahmin and the girl comes under Kshatriya varna. This association shows that boy could have the tendency to think out home affairs well, while the girl would be more tilted towards accomplishing those tasks efficiently. She will be organized in manners and quite laborious in actions. This combination shows good level of understanding between the natives.",
                    "vasya": "Vashya for boy is Jalchar while the girl belongs to Chatushpad vashya. Boy's support and appreciation will bring out the best of her in every field whereas girl's corporation will give him regard and success in his field. This is indicative of over-all favorable results in respect of matters pertaining to married life in general.",
                    "tara": "The boy belongs to Ksheme tara while the girl belongs to Atimitra tara. As far as tara compatibility is concerned this is so far the best alliance to be taken into consideration. Both are equally creative and share an excellent temperamental adjustment. Both will be able to understand each other's needs and inter psychic responses at times.",
                    "yoni": "The boy and the girl both belong to Gaj yoni. This is an excellent combination as far as yoni compatibility is concerned. Usually, their mutual ambitions seal them together. On physical plane, they will find each other absolutely compatible. Couple will complement each other very well and their relationship will be joyous and rewarding.",
                    "maitri": "The boy belongs to the rasi lord Jupiter and the girl belongs to Mars lordship. This is termed as very good combination in consideration with the compatibility ratio. These two partners usually ask one another about their feelings and experience with dependability and commitment. This combination is usually inclusive of the feeling of trust and mutual confidence.",
                    "gana": "The boy's gan is Dev and the girl comes under Manushya gan. This is considered to be an excellent combination for gana match. They will go well with each other and will be very supportive. The boy will be generally peace-loving, contented and calm. The girl will do her best to help boy achieving his career and social objectives.",
                    "bhakoot": "The boy's Zodiac sign is Taurus and the girl belongs to Virgo sign. This is a difficult coalition. The boy may regard that the girl does not cope well with certain domestic issues. In turn, she may feel that he is too bossy to be tolerated. Since the energy level of both does not match, the incompatibility ratio is high.",
                    "nadi": "The boy's nadi is Antya and the girl comes under Madhya nadi. From nadi viewpoint, it is considered a very good combination. Natives will be very kind, spiritual in nature and fountain of compassion toward others. Their alliance will be on the spiritual level and they will love each other from the bottom of their hearts."
                },
                "model": "demo-model",
                "tokens": {"input": 200, "output": 300},
                "timestamp": datetime.utcnow().isoformat()
            }

        else:
            return {
                "success": True,
                "content": f"Demo response for {request_type}. This is a placeholder response for testing the AI integration without requiring real API keys.",
                "model": "demo-model",
                "tokens": {"input": 50, "output": 25},
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _generate_openrouter(
        self, api_key: str, model: str, data: Dict[str, Any], request_type: str, custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using OpenRouter API."""
        try:
            import openai

            client = openai.OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )

            # Use custom prompt if provided, otherwise use default
            if custom_prompt:
                prompt = self._fill_prompt_template(custom_prompt, data, request_type)
            else:
                if request_type == "interpretation":
                    prompt = self._build_interpretation_prompt(data)
                elif request_type == "chat":
                    prompt = self._build_chat_prompt(data["chart_data"], data["question"], data["history"])
                elif request_type == "compatibility":
                    prompt = self._build_compatibility_prompt(data["primary_chart"], data["partner_chart"], data["focus_areas"])
                elif request_type == "match_horoscope":
                    prompt = self._build_match_horoscope_prompt(data["primary_chart"], data["partner_chart"])
                else:
                    raise ValueError(f"Unknown request type: {request_type}")

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=8000,  # Increased for comprehensive horoscope reports
                temperature=0.7
            )

            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            # Special handling for match horoscope JSON response
            if request_type == "match_horoscope":
                try:
                    import json
                    import re

                    # Extract JSON from the response
                    json_match = re.search(r'```json\s*(\{.*?\})\s*```', content, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                        parsed_data = json.loads(json_str)

                        # Return the parsed match horoscope data
                        result = {
                            "success": True,
                            "model": model,
                            "tokens": tokens,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        result.update(parsed_data)
                        return result
                    else:
                        # Fallback to regular content if JSON parsing fails
                        return {
                            "success": True,
                            "content": content,
                            "model": model,
                            "tokens": tokens,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                except Exception as e:
                    logger.warning(f"Failed to parse match horoscope JSON: {e}")
                    return {
                        "success": True,
                        "content": content,
                        "model": model,
                        "tokens": tokens,
                        "timestamp": datetime.utcnow().isoformat()
                    }

            return {
                "success": True,
                "content": content,
                "model": model,
                "tokens": tokens,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"OpenRouter API error: {e}")
            return {
                "success": False,
                "error": f"OpenRouter API error: {str(e)}"
            }

    async def _generate_openai(
        self, api_key: str, model: str, data: Dict[str, Any], request_type: str, custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using OpenAI API."""
        try:
            import openai

            client = openai.OpenAI(api_key=api_key)

            # Use custom prompt if provided, otherwise use default
            if custom_prompt:
                prompt = self._fill_prompt_template(custom_prompt, data, request_type)
            else:
                if request_type == "interpretation":
                    prompt = self._build_interpretation_prompt(data)
                elif request_type == "chat":
                    prompt = self._build_chat_prompt(data["chart_data"], data["question"], data["history"])
                elif request_type == "compatibility":
                    prompt = self._build_compatibility_prompt(data["primary_chart"], data["partner_chart"], data["focus_areas"])
                elif request_type == "match_horoscope":
                    prompt = self._build_match_horoscope_prompt(data["primary_chart"], data["partner_chart"])
                else:
                    raise ValueError(f"Unknown request type: {request_type}")

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=8000,  # Increased for comprehensive horoscope reports
                temperature=0.7
            )

            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            return {
                "success": True,
                "content": content,
                "model": model,
                "tokens": tokens,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return {
                "success": False,
                "error": f"OpenAI API error: {str(e)}"
            }

    async def _generate_anthropic(
        self, api_key: str, model: str, data: Dict[str, Any], request_type: str, custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using Anthropic API."""
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=api_key)

            # Use custom prompt if provided, otherwise use default
            if custom_prompt:
                prompt = self._fill_prompt_template(custom_prompt, data, request_type)
            else:
                if request_type == "interpretation":
                    prompt = self._build_interpretation_prompt(data)
                elif request_type == "chat":
                    prompt = self._build_chat_prompt(data["chart_data"], data["question"], data["history"])
                elif request_type == "compatibility":
                    prompt = self._build_compatibility_prompt(data["primary_chart"], data["partner_chart"], data["focus_areas"])
                elif request_type == "match_horoscope":
                    prompt = self._build_match_horoscope_prompt(data["primary_chart"], data["partner_chart"])
                else:
                    raise ValueError(f"Unknown request type: {request_type}")

            response = client.messages.create(
                model=model,
                max_tokens=8000,  # Increased for comprehensive horoscope reports
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            content = response.content[0].text
            tokens = response.usage.input_tokens + response.usage.output_tokens

            return {
                "success": True,
                "content": content,
                "model": model,
                "tokens": tokens,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            return {
                "success": False,
                "error": f"Anthropic API error: {str(e)}"
            }

    async def _generate_perplexity(
        self, api_key: str, model: str, data: Dict[str, Any], request_type: str, custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using Perplexity API (OpenAI-compatible)."""
        try:
            import openai

            client = openai.OpenAI(
                api_key=api_key,
                base_url="https://api.perplexity.ai"
            )

            # Use custom prompt if provided, otherwise use default
            if custom_prompt:
                prompt = self._fill_prompt_template(custom_prompt, data, request_type)
            else:
                if request_type == "interpretation":
                    prompt = self._build_interpretation_prompt(data)
                elif request_type == "chat":
                    prompt = self._build_chat_prompt(data["chart_data"], data["question"], data["history"])
                elif request_type == "compatibility":
                    prompt = self._build_compatibility_prompt(data["primary_chart"], data["partner_chart"], data["focus_areas"])
                elif request_type == "match_horoscope":
                    prompt = self._build_match_horoscope_prompt(data["primary_chart"], data["partner_chart"])
                else:
                    raise ValueError(f"Unknown request type: {request_type}")

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=8000,  # Increased for comprehensive horoscope reports
                temperature=0.7
            )

            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            return {
                "success": True,
                "content": content,
                "model": model,
                "tokens": tokens,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return {
                "success": False,
                "error": f"Perplexity API error: {str(e)}"
            }

    async def _get_prompt_template(
        self,
        db: AsyncSession,
        module_type: AiModuleType,
        user_id: Optional[str] = None
    ) -> str:
        """
        Get prompt template from configuration system with fallback to default.

        Args:
            db: Database session
            module_type: Type of AI module
            user_id: User ID (optional)

        Returns:
            Prompt template string
        """
        try:
            from app.services.ai_prompt_service import AiPromptService
            prompt_service = AiPromptService()

            # Try to get custom or system prompt from database
            prompt_text = await prompt_service.get_prompt_text(db, module_type, user_id)
            logger.info(f"Using configured prompt for module {module_type}")
            return prompt_text
        except Exception as e:
            logger.warning(f"Failed to get configured prompt for {module_type}: {e}. Using hardcoded default.")
            # Fall back to hardcoded default
            return self._get_hardcoded_prompt(module_type)

    def _get_hardcoded_prompt(self, module_type: AiModuleType) -> str:
        """Get hardcoded default prompt as ultimate fallback."""
        if module_type == AiModuleType.CHART_INTERPRETATION:
            return self._build_interpretation_prompt_template()
        elif module_type == AiModuleType.CHAT:
            return self._build_chat_prompt_template()
        elif module_type == AiModuleType.COMPATIBILITY_ANALYSIS:
            return self._build_compatibility_prompt_template()
        elif module_type == AiModuleType.MATCH_HOROSCOPE:
            return self._build_match_horoscope_prompt_template()
        else:
            raise ValueError(f"No hardcoded prompt available for module type: {module_type}")

    def _fill_prompt_template(
        self,
        template: str,
        data: Dict[str, Any],
        request_type: str
    ) -> str:
        """
        Fill a prompt template with actual data.

        Args:
            template: Prompt template with {variables}
            data: Data dictionary
            request_type: Type of request

        Returns:
            Filled prompt string
        """
        # Prepare variables based on request type
        variables = {}

        if request_type == "interpretation":
            # Format chart data for the prompt
            chart_str = self._format_chart_data(data)
            variables["chart_data"] = chart_str

        elif request_type == "chat":
            chart_str = self._format_chart_data(data.get("chart_data", {}))
            variables["chart_data"] = chart_str
            variables["question"] = data.get("question", "")

            # Format conversation history
            history = data.get("history", [])
            history_str = ""
            if history:
                for msg in history[-5:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    history_str += f"{role.title()}: {content}\n"
            variables["conversation_history"] = history_str

        elif request_type == "compatibility":
            primary_str = self._format_chart_data(data.get("primary_chart", {}))
            partner_str = self._format_chart_data(data.get("partner_chart", {}))
            variables["primary_chart"] = primary_str
            variables["partner_chart"] = partner_str
            variables["focus_areas"] = ", ".join(data.get("focus_areas", []))

        elif request_type == "match_horoscope":
            primary_str = self._format_chart_data(data.get("primary_chart", {}))
            partner_str = self._format_chart_data(data.get("partner_chart", {}))
            variables["primary_chart"] = primary_str
            variables["partner_chart"] = partner_str

        # Fill template
        try:
            filled_prompt = template.format(**variables)
            return filled_prompt
        except KeyError as e:
            logger.warning(f"Missing variable in prompt template: {e}. Using template as-is.")
            return template

    def _format_chart_data(self, chart_data: Dict[str, Any]) -> str:
        """Format chart data for inclusion in prompts."""
        formatted = ""

        # Add birth info
        if "birth_info" in chart_data:
            birth_info = chart_data["birth_info"]
            formatted += f"Name: {birth_info.get('name', 'Unknown')}\n"
            formatted += f"Date: {birth_info.get('date', 'Unknown')}\n"
            formatted += f"Time: {birth_info.get('time', 'Unknown')}\n"
            formatted += f"Location: {birth_info.get('location', 'Unknown')}\n\n"

        # Add planetary positions
        if "planets" in chart_data:
            formatted += "Planetary Positions:\n"
            planets = chart_data["planets"]
            if isinstance(planets, list):
                for planet_data in planets:
                    name = planet_data.get('name', 'Unknown')
                    sign = planet_data.get('sign', 'Unknown')
                    longitude = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
                    formatted += f"  {name}: {sign} {longitude:.2f}°\n"
            elif isinstance(planets, dict):
                for planet, pdata in planets.items():
                    formatted += f"  {planet}: {pdata.get('sign', 'Unknown')} {pdata.get('longitude', 0):.2f}°\n"

        return formatted

    def _build_interpretation_prompt_template(self) -> str:
        """Build template for chart interpretation prompt."""
        return """Provide a comprehensive Vedic astrology interpretation of this birth chart:

Chart Data:
{chart_data}

Please provide interpretation covering:
1. **Personality & Character** - Based on Ascendant and Moon
2. **Mental Nature** - Based on Mercury and Moon
3. **Career & Profession** - Based on 10th house and its lord
4. **Relationships** - Based on 7th house and Venus
5. **Health & Vitality** - Based on 6th house and Mars
6. **Wealth & Resources** - Based on 2nd and 11th houses
7. **Discipline & Karma** - Based on Saturn
8. **Key Life Themes** - Based on overall chart patterns

Be specific with planetary positions and astrological principles."""

    def _build_interpretation_prompt(self, chart_data: Dict[str, Any]) -> str:
        """Build prompt for chart interpretation."""
        # Debug logging
        logger.info("=== Building Interpretation Prompt ===")
        logger.info(f"Chart data keys: {list(chart_data.keys())}")
        if "birth_info" in chart_data:
            logger.info(f"Birth info found: {chart_data['birth_info']}")
        else:
            logger.warning("No birth_info in chart_data!")

        prompt = """Provide a comprehensive Vedic astrology interpretation of this birth chart:

Chart Data:
"""

        # Add birth info
        if "birth_info" in chart_data:
            birth_info = chart_data["birth_info"]
            name = birth_info.get('name', 'Unknown')
            date = birth_info.get('date', 'Unknown')
            time = birth_info.get('time', 'Unknown')
            location = birth_info.get('location_name', birth_info.get('location', 'Unknown'))

            logger.info(f"Extracted birth details - Name: {name}, Date: {date}, Time: {time}, Location: {location}")

            prompt += f"Name: {name}\n"
            prompt += f"Date: {date}\n"
            prompt += f"Time: {time}\n"
            prompt += f"Location: {location}\n\n"

        # Add planetary positions
        if "planets" in chart_data:
            prompt += "Planetary Positions:\n"
            planets = chart_data["planets"]
            if isinstance(planets, list):
                # Handle list format (from frontend)
                for planet_data in planets:
                    name = planet_data.get('name', 'Unknown')
                    sign = planet_data.get('sign', 'Unknown')
                    longitude = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
                    prompt += f"  {name}: {sign} {longitude:.2f}°\n"
            elif isinstance(planets, dict):
                # Handle dict format (legacy)
                for planet, data in planets.items():
                    prompt += f"  {planet}: {data.get('sign', 'Unknown')} {data.get('longitude', 0):.2f}°\n"
            prompt += "\n"

        prompt += """Please provide interpretation covering:
1. **Personality & Character** - Based on Ascendant and Moon
2. **Mental Nature** - Based on Mercury and Moon
3. **Career & Profession** - Based on 10th house and its lord
4. **Relationships** - Based on 7th house and Venus
5. **Health & Vitality** - Based on 6th house and Mars
6. **Wealth & Resources** - Based on 2nd and 11th houses
7. **Discipline & Karma** - Based on Saturn
8. **Key Life Themes** - Based on overall chart patterns

Be specific with planetary positions and astrological principles."""

        return prompt

    def _build_chat_prompt_template(self) -> str:
        """Build template for chat prompt."""
        return """You are an expert Vedic astrologer. Answer the following question about this birth chart:

Chart Data:
{chart_data}

Previous Conversation:
{conversation_history}

Question: {question}

Please provide a detailed answer based on Vedic astrology principles and the chart data above."""

    def _build_compatibility_prompt_template(self) -> str:
        """Build template for compatibility analysis prompt."""
        return """Provide a comprehensive Vedic astrology compatibility analysis between these two birth charts:

Primary Chart:
{primary_chart}

Partner Chart:
{partner_chart}

Focus Areas: {focus_areas}

Please analyze:
1. **Overall Compatibility Score** - Based on Guna Milan and synastry
2. **Emotional Compatibility** - Moon and Venus connections
3. **Mental Compatibility** - Mercury and communication styles
4. **Physical Compatibility** - Mars and attraction factors
5. **Long-term Potential** - Saturn and commitment indicators
6. **Challenge Areas** - Potential conflicts and how to navigate them
7. **Strengths** - Natural harmonies and supportive factors

Use traditional Vedic astrology principles including Guna Milan, Manglik Dosha, and planetary aspects."""

    def _build_match_horoscope_prompt_template(self) -> str:
        """Build template for match horoscope prompt."""
        return """Perform a traditional Vedic astrology matchmaking analysis (Kundali Milan) between these two birth charts using the Ashtakoot (8-fold) system:

Primary Chart:
{primary_chart}

Partner Chart:
{partner_chart}

Please provide:
1. **Ashtakoot Scores** - Detailed breakdown of all 8 Kutas
2. **Total Compatibility Score** - Out of 36 points
3. **Manglik Dosha Analysis** - For both charts
4. **Nadi Dosha Check** - And remedies if present
5. **Bhakoot Analysis** - Sign compatibility
6. **Recommendations** - Marriage suitability and timing

Follow traditional Vedic matchmaking principles strictly."""

    def _build_chat_prompt(self, chart_data: Dict[str, Any], question: str, history: List[Dict[str, str]]) -> str:
        """Build prompt for chat response."""
        prompt = f"""You are an expert Vedic astrologer. Answer the following question about this birth chart:

Chart Data:
"""

        # Add birth info
        if "birth_info" in chart_data:
            birth_info = chart_data["birth_info"]
            prompt += f"Name: {birth_info.get('name', 'Unknown')}\n"
            prompt += f"Date: {birth_info.get('date', 'Unknown')}\n"
            prompt += f"Time: {birth_info.get('time', 'Unknown')}\n"
            prompt += f"Location: {birth_info.get('location', 'Unknown')}\n\n"

        # Add planetary positions
        if "planets" in chart_data:
            prompt += "Planetary Positions:\n"
            planets = chart_data["planets"]
            if isinstance(planets, list):
                # Handle list format (from frontend)
                for planet_data in planets:
                    name = planet_data.get('name', 'Unknown')
                    sign = planet_data.get('sign', 'Unknown')
                    longitude = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
                    prompt += f"  {name}: {sign} {longitude:.2f}°\n"
            elif isinstance(planets, dict):
                # Handle dict format (legacy)
                for planet, data in planets.items():
                    prompt += f"  {planet}: {data.get('sign', 'Unknown')} {data.get('longitude', 0):.2f}°\n"
            prompt += "\n"

        # Add conversation history
        if history:
            prompt += "Previous Conversation:\n"
            for msg in history[-5:]:  # Last 5 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt += f"{role.title()}: {content}\n"
            prompt += "\n"

        prompt += f"Question: {question}\n\n"
        prompt += "Please provide a detailed answer based on Vedic astrology principles and the chart data above."

        return prompt

    def _build_compatibility_prompt(
        self,
        primary_chart: Dict[str, Any],
        partner_chart: Dict[str, Any],
        focus_areas: List[str]
    ) -> str:
        """Build prompt for compatibility analysis."""
        prompt = """Provide a comprehensive Vedic astrology compatibility analysis between these two birth charts:

PRIMARY PERSON'S CHART:
"""

        # Add primary person's birth info
        if "birth_info" in primary_chart:
            birth_info = primary_chart["birth_info"]
            prompt += f"Name: {birth_info.get('name', 'Person 1')}\n"
            prompt += f"Date: {birth_info.get('date', 'Unknown')}\n"
            prompt += f"Time: {birth_info.get('time', 'Unknown')}\n"
            prompt += f"Location: {birth_info.get('location', 'Unknown')}\n\n"

        # Add primary person's planetary positions
        if "planets" in primary_chart:
            prompt += "Planetary Positions:\n"
            planets = primary_chart["planets"]
            if isinstance(planets, list):
                for planet_data in planets:
                    name = planet_data.get('name', 'Unknown')
                    sign = planet_data.get('sign', 'Unknown')
                    longitude = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
                    prompt += f"  {name}: {sign} {longitude:.2f}°\n"
            elif isinstance(planets, dict):
                for planet, data in planets.items():
                    prompt += f"  {planet}: {data.get('sign', 'Unknown')} {data.get('longitude', 0):.2f}°\n"
            prompt += "\n"

        prompt += """
PARTNER'S CHART:
"""

        # Add partner's birth info
        if "birth_info" in partner_chart:
            birth_info = partner_chart["birth_info"]
            prompt += f"Name: {birth_info.get('name', 'Person 2')}\n"
            prompt += f"Date: {birth_info.get('date', 'Unknown')}\n"
            prompt += f"Time: {birth_info.get('time', 'Unknown')}\n"
            prompt += f"Location: {birth_info.get('location', 'Unknown')}\n\n"

        # Add focus areas if specified
        if focus_areas:
            prompt += f"Focus Areas: {', '.join(focus_areas)}\n\n"

        prompt += """Please provide a detailed compatibility analysis covering:

1. **Overall Compatibility Score** (1-10 scale with explanation)
2. **Emotional Compatibility** - Moon signs, emotional needs, nurturing styles
3. **Intellectual Compatibility** - Mercury positions, communication styles, mental approach
4. **Physical/Attraction Compatibility** - Mars and Venus positions, physical chemistry
5. **Spiritual Compatibility** - Jupiter positions, life philosophy, growth potential
6. **Relationship Dynamics** - 7th house analysis, relationship patterns
7. **Challenges & Growth Areas** - Potential conflicts and how to overcome them
8. **Long-term Potential** - Marriage compatibility, family life, shared goals
9. **Remedial Suggestions** - Gemstones, mantras, or practices to enhance compatibility

Use traditional Vedic astrology principles including:
- Guna Milan (Ashtakoot matching)
- Manglik Dosha analysis
- Planetary aspects between charts
- House overlays and synastry
- Dasha compatibility

Be specific about planetary positions and provide practical relationship advice."""

        return prompt

    def _build_match_horoscope_prompt(
        self,
        primary_chart: Dict[str, Any],
        partner_chart: Dict[str, Any]
    ) -> str:
        """Build prompt for traditional Vedic matchmaking analysis with Ashtakoot scoring."""
        prompt = """Perform a traditional Vedic astrology matchmaking analysis (Kundali Milan) between these two birth charts using the Ashtakoot (8-fold) system:

PRIMARY PERSON'S CHART:
"""

        # Add primary person's birth info
        if "birth_info" in primary_chart:
            birth_info = primary_chart["birth_info"]
            prompt += f"Name: {birth_info.get('name', 'Person 1')}\n"
            prompt += f"Date: {birth_info.get('date', 'Unknown')}\n"
            prompt += f"Time: {birth_info.get('time', 'Unknown')}\n"
            prompt += f"Location: {birth_info.get('location', 'Unknown')}\n\n"

        # Add primary person's planetary positions
        if "planets" in primary_chart:
            prompt += "Planetary Positions:\n"
            planets = primary_chart["planets"]
            if isinstance(planets, list):
                for planet_data in planets:
                    name = planet_data.get('name', 'Unknown')
                    sign = planet_data.get('sign', 'Unknown')
                    longitude = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
                    nakshatra = planet_data.get('nakshatra', 'Unknown')
                    prompt += f"  {name}: {sign} {longitude:.2f}° (Nakshatra: {nakshatra})\n"
            elif isinstance(planets, dict):
                for planet, data in planets.items():
                    prompt += f"  {planet}: {data.get('sign', 'Unknown')} {data.get('longitude', 0):.2f}° (Nakshatra: {data.get('nakshatra', 'Unknown')})\n"
            prompt += "\n"

        prompt += """
PARTNER'S CHART:
"""

        # Add partner's birth info
        if "birth_details" in partner_chart:
            birth_info = partner_chart["birth_details"]
            prompt += f"Name: {birth_info.get('name', 'Person 2')}\n"
            prompt += f"Date: {birth_info.get('birth_date', 'Unknown')}\n"
            prompt += f"Time: {birth_info.get('birth_time', 'Unknown')}\n"
            prompt += f"Location: {birth_info.get('birth_location', 'Unknown')}\n\n"

        prompt += """Please provide a comprehensive traditional Vedic matchmaking analysis following the exact format of professional match horoscope reports.

**RESPONSE FORMAT (IMPORTANT - Return as structured JSON):**
```json
{
  "success": true,
  "report_title": "Matching between [Male Name] and [Female Name] Match Horoscope",
  "birth_details": {
    "male": {
      "name": "[Male Name]",
      "sex": "Male",
      "date_of_birth": "[DD : MM : YYYY format]",
      "time_of_birth": "[HH : MM : SS format]",
      "day_of_birth": "[Day of week]",
      "place_of_birth": "[City, Country]",
      "latitude": "[DD : MM : N/S format]",
      "longitude": "[DD : MM : E/W format]",
      "time_zone": "[Timezone offset]",
      "lagna": "[Ascendant sign]",
      "rashi": "[Moon sign]",
      "nakshatra_pada": "[Nakshatra - Pada]",
      "nakshatra_lord": "[Ruling planet]"
    },
    "female": {
      "name": "[Female Name]",
      "sex": "Female",
      "date_of_birth": "[DD : MM : YYYY format]",
      "time_of_birth": "[HH : MM : SS format]",
      "day_of_birth": "[Day of week]",
      "place_of_birth": "[City, Country]",
      "latitude": "[DD : MM : N/S format]",
      "longitude": "[DD : MM : E/W format]",
      "time_zone": "[Timezone offset]",
      "lagna": "[Ascendant sign]",
      "rashi": "[Moon sign]",
      "nakshatra_pada": "[Nakshatra - Pada]",
      "nakshatra_lord": "[Ruling planet]"
    }
  },
  "ashtakoot_analysis": {
    "total_points": [calculated total out of 36],
    "max_points": 36,
    "percentage": [percentage with 1 decimal],
    "guna_details": [
      {
        "guna": "VARNA",
        "boy_value": "[Brahmin/Kshatriya/Vaishya/Shudra]",
        "girl_value": "[Brahmin/Kshatriya/Vaishya/Shudra]",
        "max_points": 1,
        "points_obtained": [0 or 1],
        "area_of_life": "Work"
      },
      {
        "guna": "VASYA",
        "boy_value": "[Jalchar/Chatushpad/Manav/Vanchar/Keeta]",
        "girl_value": "[Jalchar/Chatushpad/Manav/Vanchar/Keeta]",
        "max_points": 2,
        "points_obtained": [0, 1, or 2],
        "area_of_life": "Dominance"
      },
      {
        "guna": "TARA",
        "boy_value": "[Janma/Sampat/Vipat/Kshema/Pratyak/Sadhana/Vadha/Mitra/Atimitra]",
        "girl_value": "[Janma/Sampat/Vipat/Kshema/Pratyak/Sadhana/Vadha/Mitra/Atimitra]",
        "max_points": 3,
        "points_obtained": [0, 1.5, or 3],
        "area_of_life": "Destiny"
      },
      {
        "guna": "YONI",
        "boy_value": "[Animal name like Gaja, Ashwa, etc.]",
        "girl_value": "[Animal name like Gaja, Ashwa, etc.]",
        "max_points": 4,
        "points_obtained": [0, 1, 2, 3, or 4],
        "area_of_life": "Mentality"
      },
      {
        "guna": "MAITRI",
        "boy_value": "[Ruling planet of boy's moon sign]",
        "girl_value": "[Ruling planet of girl's moon sign]",
        "max_points": 5,
        "points_obtained": [0, 1, 3, 4, or 5],
        "area_of_life": "Compatibility"
      },
      {
        "guna": "GANA",
        "boy_value": "[Devta/Manushya/Rakshasa]",
        "girl_value": "[Devta/Manushya/Rakshasa]",
        "max_points": 6,
        "points_obtained": [0, 1, or 6],
        "area_of_life": "Guna Level"
      },
      {
        "guna": "BHAKOOT",
        "boy_value": "[Moon sign]",
        "girl_value": "[Moon sign]",
        "max_points": 7,
        "points_obtained": [0 or 7],
        "area_of_life": "Love"
      },
      {
        "guna": "NADI",
        "boy_value": "[Aadi/Madhya/Antya]",
        "girl_value": "[Aadi/Madhya/Antya]",
        "max_points": 8,
        "points_obtained": [0 or 8],
        "area_of_life": "Health"
      }
    ]
  },
  "manglik_analysis": {
    "male_status": "[No Mangal Dosha/Low Mangal Dosha/High Mangal Dosha]",
    "female_status": "[No Mangal Dosha/Low Mangal Dosha/High Mangal Dosha]",
    "compatibility_note": "[Compatibility assessment note]"
  },
  "conclusion": "[Overall conclusion paragraph matching traditional format]",
  "detailed_interpretations": {
    "varna": "[Detailed interpretation of Varna compatibility]",
    "vasya": "[Detailed interpretation of Vasya compatibility]",
    "tara": "[Detailed interpretation of Tara compatibility]",
    "yoni": "[Detailed interpretation of Yoni compatibility]",
    "maitri": "[Detailed interpretation of Maitri compatibility]",
    "gana": "[Detailed interpretation of Gana compatibility]",
    "bhakoot": "[Detailed interpretation of Bhakoot compatibility]",
    "nadi": "[Detailed interpretation of Nadi compatibility]"
  }
}
```

**ASHTAKOOT SCORING METHODOLOGY (Follow Traditional Rules):**

1. **VARNA (1 point)** - Based on Moon sign spiritual hierarchy:
   - Brahmin: Cancer, Scorpio, Pisces
   - Kshatriya: Aries, Leo, Sagittarius
   - Vaishya: Taurus, Virgo, Capricorn
   - Shudra: Gemini, Libra, Aquarius
   - Score 1 if boy's varna >= girl's varna, else 0

2. **VASYA (2 points)** - Based on zodiac dominance categories:
   - Jalchar (Water): Cancer, Scorpio, Pisces
   - Chatushpad (Quadruped): Aries, Taurus, Leo, Sagittarius (2nd half)
   - Manav (Human): Gemini, Virgo, Libra, Aquarius, Sagittarius (1st half)
   - Vanchar (Wild): Leo
   - Keeta (Insect): Scorpio
   - Score based on mutual attraction/control

3. **TARA (3 points)** - Based on Nakshatra counting from boy to girl:
   - Count Nakshatras from boy's to girl's birth star
   - Janma/Sampat/Vipat/Kshema/Pratyak/Sadhana/Vadha/Mitra/Atimitra
   - Score: 3 for favorable, 1.5 for neutral, 0 for unfavorable

4. **YONI (4 points)** - Based on Nakshatra animal symbols:
   - Same animal: 4 points
   - Friendly animals: 3 points
   - Neutral: 2 points
   - Enemy animals: 1 point
   - Bitter enemies: 0 points

5. **MAITRI (5 points)** - Based on Moon sign lord relationships:
   - Same planet: 5 points
   - Friend planets: 4 points
   - Neutral: 3 points
   - Enemy: 1 point
   - Bitter enemy: 0 points

6. **GANA (6 points)** - Based on Nakshatra temperament:
   - Devta-Devta, Manushya-Manushya, Rakshasa-Rakshasa: 6 points
   - Devta-Manushya: 6 points
   - Devta-Rakshasa: 0 points
   - Manushya-Rakshasa: 0 points

7. **BHAKOOT (7 points)** - Based on Moon sign positions:
   - Count signs from boy to girl
   - 2nd-12th, 5th-9th, 6th-8th positions: 0 points
   - All other positions: 7 points

8. **NADI (8 points)** - Based on Nakshatra groups:
   - Aadi, Madhya, Antya Nadi classification
   - Same Nadi: 0 points (health issues)
   - Different Nadi: 8 points

**MANGAL DOSHA ANALYSIS:**
- Check Mars in 1st, 2nd, 4th, 7th, 8th, 12th houses from Lagna/Moon/Venus
- High Dosha: Mars in 1st, 4th, 7th, 8th, 12th
- Low Dosha: Mars in 2nd house only
- No Dosha: Mars in 3rd, 5th, 6th, 9th, 10th, 11th

**CONCLUSION GUIDELINES:**
- 18+ points: Match is successful
- Below 18 points: Needs careful consideration
- Consider Mangal Dosha compatibility
- Provide traditional conclusion format

Generate detailed interpretations for each Guna explaining the compatibility in traditional Vedic astrology language."""

        return prompt
