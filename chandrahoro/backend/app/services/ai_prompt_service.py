"""Service for managing AI prompt configurations."""

import logging
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.ai_prompt_models import (
    AiPromptConfig, AiPromptVersion, AiModuleType, PromptScope, DEFAULT_PROMPTS
)
from app.schemas.ai_prompt_schemas import (
    AiPromptConfigCreate, AiPromptConfigUpdate, AiModuleInfo
)

logger = logging.getLogger("chandrahoro")


class AiPromptService:
    """Service for managing AI prompt configurations."""

    async def get_prompt_for_module(
        self,
        db: AsyncSession,
        module_type: AiModuleType,
        user_id: Optional[str] = None
    ) -> Optional[AiPromptConfig]:
        """
        Get the active prompt for a module.
        Priority: User custom prompt > System default prompt.
        
        Args:
            db: Database session
            module_type: Type of AI module
            user_id: User ID (optional)
            
        Returns:
            AiPromptConfig or None
        """
        # First, try to get user's custom prompt if user_id is provided
        if user_id:
            stmt = select(AiPromptConfig).where(
                and_(
                    AiPromptConfig.module_type == module_type,
                    AiPromptConfig.user_id == user_id,
                    AiPromptConfig.scope == PromptScope.USER,
                    AiPromptConfig.is_enabled == True
                )
            )
            result = await db.execute(stmt)
            user_prompt = result.scalar_one_or_none()
            
            if user_prompt:
                logger.info(f"Using custom prompt for module {module_type} and user {user_id}")
                return user_prompt
        
        # Fall back to system default prompt
        stmt = select(AiPromptConfig).where(
            and_(
                AiPromptConfig.module_type == module_type,
                AiPromptConfig.scope == PromptScope.SYSTEM,
                AiPromptConfig.is_default == True,
                AiPromptConfig.is_enabled == True
            )
        )
        result = await db.execute(stmt)
        system_prompt = result.scalar_one_or_none()
        
        if system_prompt:
            logger.info(f"Using system default prompt for module {module_type}")
            return system_prompt
        
        logger.warning(f"No prompt found for module {module_type}")
        return None

    async def get_prompt_text(
        self,
        db: AsyncSession,
        module_type: AiModuleType,
        user_id: Optional[str] = None
    ) -> str:
        """
        Get the prompt text for a module with fallback to hardcoded default.
        If a sample format file is uploaded, it will be incorporated into the prompt.

        Args:
            db: Database session
            module_type: Type of AI module
            user_id: User ID (optional)

        Returns:
            Prompt text string (potentially enhanced with sample format instructions)
        """
        # Try to get from database
        prompt_config = await self.get_prompt_for_module(db, module_type, user_id)

        if prompt_config:
            base_prompt = prompt_config.custom_prompt

            # Check if there's a sample format file
            if prompt_config.sample_format_path and os.path.exists(prompt_config.sample_format_path):
                sample_format_content = self._read_sample_format(prompt_config.sample_format_path)
                if sample_format_content:
                    # Enhance the prompt with sample format instructions
                    enhanced_prompt = self._enhance_prompt_with_sample_format(
                        base_prompt,
                        sample_format_content,
                        prompt_config.sample_format_type or 'unknown'
                    )
                    logger.info(f"Enhanced prompt with sample format for module {module_type}")
                    return enhanced_prompt

            return base_prompt

        # Fall back to hardcoded default
        if module_type in DEFAULT_PROMPTS:
            logger.info(f"Using hardcoded default prompt for module {module_type}")
            return DEFAULT_PROMPTS[module_type]["prompt"]

        # Ultimate fallback
        logger.error(f"No prompt available for module {module_type}")
        raise ValueError(f"No prompt configured for module type: {module_type}")

    def _read_sample_format(self, file_path: str) -> Optional[str]:
        """
        Read the sample format file content.

        Args:
            file_path: Path to the sample format file

        Returns:
            File content as string, or None if error
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Limit content size to avoid token overflow (max 10KB)
                if len(content) > 10000:
                    logger.warning(f"Sample format file too large ({len(content)} bytes), truncating to 10KB")
                    content = content[:10000] + "\n... [truncated]"
                return content
        except Exception as e:
            logger.error(f"Error reading sample format file {file_path}: {e}")
            return None

    def _enhance_prompt_with_sample_format(
        self,
        base_prompt: str,
        sample_format_content: str,
        format_type: str
    ) -> str:
        """
        Enhance the base prompt with sample format instructions.

        Args:
            base_prompt: Original prompt text
            sample_format_content: Content of the sample format file
            format_type: Type of format file (html, pdf, etc.)

        Returns:
            Enhanced prompt with sample format instructions
        """
        format_instructions = f"""

IMPORTANT: OUTPUT FORMAT REQUIREMENTS
=====================================
The user has provided a sample {format_type.upper()} format that shows their desired output structure.
You MUST match this format as closely as possible in your response.

Sample Format Reference:
{sample_format_content}

Instructions:
1. Study the sample format carefully to understand the structure, sections, and styling
2. Generate your response following the same structure and organization
3. If the sample is HTML, generate valid HTML with similar CSS classes and structure
4. If the sample is JSON, follow the exact same JSON schema
5. Maintain the same level of detail and section organization as shown in the sample
6. Use similar headings, subheadings, and formatting conventions
7. Preserve any special formatting like tables, lists, or hierarchical structures

Your response should look like it was generated using the sample format as a template.
"""

        return base_prompt + format_instructions

    def _generate_module_name(self, module_type: AiModuleType) -> str:
        """Generate a display name from module type."""
        # Convert enum value to title case with spaces
        return module_type.value.replace('_', ' ').title()

    async def create_prompt_config(
        self,
        db: AsyncSession,
        user_id: str,
        prompt_data: AiPromptConfigCreate
    ) -> AiPromptConfig:
        """
        Create a new prompt configuration.

        Args:
            db: Database session
            user_id: User ID
            prompt_data: Prompt configuration data

        Returns:
            Created AiPromptConfig
        """
        # Check if user already has a custom prompt for this module
        existing = await self.get_prompt_for_module(db, prompt_data.module_type, user_id)
        if existing and existing.user_id == user_id:
            raise ValueError(f"Custom prompt already exists for module {prompt_data.module_type}")

        # Auto-generate module_name if not provided
        module_name = prompt_data.module_name or self._generate_module_name(prompt_data.module_type)

        # Create new prompt config
        prompt_config = AiPromptConfig(
            module_type=prompt_data.module_type,
            module_name=module_name,
            module_description=prompt_data.module_description,
            scope=PromptScope.USER,
            user_id=user_id,
            custom_prompt=prompt_data.custom_prompt,
            system_variables=prompt_data.system_variables,
            output_format=prompt_data.output_format,
            is_enabled=prompt_data.is_enabled,
            temperature=str(prompt_data.temperature) if prompt_data.temperature is not None else None,
            max_tokens=str(prompt_data.max_tokens) if prompt_data.max_tokens is not None else None,
            model_override=prompt_data.model_override,
            tags=prompt_data.tags,
            is_default=False,
            version="1.0"
        )
        
        db.add(prompt_config)
        await db.commit()
        await db.refresh(prompt_config)
        
        # Create initial version
        await self._create_version(db, prompt_config, user_id, "Initial version")
        
        logger.info(f"Created custom prompt for module {prompt_data.module_type} and user {user_id}")
        return prompt_config

    async def update_prompt_config(
        self,
        db: AsyncSession,
        prompt_id: str,
        user_id: str,
        prompt_data: AiPromptConfigUpdate
    ) -> AiPromptConfig:
        """
        Update an existing prompt configuration.

        Args:
            db: Database session
            prompt_id: Prompt configuration ID
            user_id: User ID
            prompt_data: Updated prompt data

        Returns:
            Updated AiPromptConfig
        """
        # Get existing prompt
        stmt = select(AiPromptConfig).where(AiPromptConfig.id == prompt_id)
        result = await db.execute(stmt)
        prompt_config = result.scalar_one_or_none()

        if not prompt_config:
            raise ValueError(f"Prompt configuration not found: {prompt_id}")

        # Verify ownership (users can only update their own prompts)
        if prompt_config.scope == PromptScope.USER and prompt_config.user_id != user_id:
            raise PermissionError("You can only update your own custom prompts")

        # Update fields
        update_data = prompt_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(prompt_config, field, value)

        # Increment version if prompt content changed
        if 'custom_prompt' in update_data:
            old_version = prompt_config.version
            major, minor = old_version.split('.')
            prompt_config.version = f"{major}.{int(minor) + 1}"

            # Create version history
            await self._create_version(
                db, prompt_config, user_id,
                f"Updated from version {old_version}"
            )

        await db.commit()
        await db.refresh(prompt_config)

        logger.info(f"Updated prompt config {prompt_id}")
        return prompt_config

    async def delete_prompt_config(
        self,
        db: AsyncSession,
        prompt_id: str,
        user_id: str
    ) -> bool:
        """
        Delete a prompt configuration.

        Args:
            db: Database session
            prompt_id: Prompt configuration ID
            user_id: User ID

        Returns:
            True if deleted
        """
        stmt = select(AiPromptConfig).where(AiPromptConfig.id == prompt_id)
        result = await db.execute(stmt)
        prompt_config = result.scalar_one_or_none()

        if not prompt_config:
            raise ValueError(f"Prompt configuration not found: {prompt_id}")

        # Verify ownership
        if prompt_config.scope == PromptScope.USER and prompt_config.user_id != user_id:
            raise PermissionError("You can only delete your own custom prompts")

        # Don't allow deleting system defaults
        if prompt_config.scope == PromptScope.SYSTEM and prompt_config.is_default:
            raise PermissionError("Cannot delete system default prompts")

        await db.delete(prompt_config)
        await db.commit()

        logger.info(f"Deleted prompt config {prompt_id}")
        return True

    async def get_user_prompts(
        self,
        db: AsyncSession,
        user_id: str,
        include_system: bool = True
    ) -> List[AiPromptConfig]:
        """
        Get all prompts for a user.

        Args:
            db: Database session
            user_id: User ID
            include_system: Whether to include system default prompts

        Returns:
            List of AiPromptConfig
        """
        conditions = []

        # User's custom prompts
        conditions.append(
            and_(
                AiPromptConfig.user_id == user_id,
                AiPromptConfig.scope == PromptScope.USER
            )
        )

        # System default prompts
        if include_system:
            conditions.append(
                and_(
                    AiPromptConfig.scope == PromptScope.SYSTEM,
                    AiPromptConfig.is_default == True
                )
            )

        stmt = select(AiPromptConfig).where(or_(*conditions)).order_by(
            AiPromptConfig.module_type, AiPromptConfig.scope
        )
        result = await db.execute(stmt)
        prompts = result.scalars().all()

        return list(prompts)

    async def get_available_modules(
        self,
        db: AsyncSession,
        user_id: Optional[str] = None
    ) -> List[AiModuleInfo]:
        """
        Get list of all available AI modules with their prompt status.

        Args:
            db: Database session
            user_id: User ID (optional)

        Returns:
            List of AiModuleInfo
        """
        modules = []

        for module_type, default_data in DEFAULT_PROMPTS.items():
            # Check if user has custom prompt
            has_custom = False
            custom_prompt_id = None

            if user_id:
                custom_prompt = await self.get_prompt_for_module(db, module_type, user_id)
                if custom_prompt and custom_prompt.user_id == user_id:
                    has_custom = True
                    custom_prompt_id = custom_prompt.id

            module_info = AiModuleInfo(
                module_type=module_type,
                display_name=default_data["name"],
                description=default_data["description"],
                default_prompt=default_data["prompt"],
                available_variables=default_data["variables"],
                has_custom_prompt=has_custom,
                custom_prompt_id=custom_prompt_id
            )
            modules.append(module_info)

        return modules

    async def _create_version(
        self,
        db: AsyncSession,
        prompt_config: AiPromptConfig,
        user_id: str,
        change_notes: str
    ) -> AiPromptVersion:
        """Create a version history entry."""
        version = AiPromptVersion(
            prompt_config_id=prompt_config.id,
            version_number=prompt_config.version,
            prompt_content=prompt_config.custom_prompt,
            output_format=prompt_config.output_format,
            changed_by_user_id=user_id,
            change_notes=change_notes
        )

        db.add(version)
        await db.commit()
        return version

    async def initialize_system_defaults(self, db: AsyncSession) -> dict:
        """
        Initialize system default prompts for all AI modules.

        Creates system-level prompt configurations (scope=SYSTEM, user_id=NULL)
        for all modules defined in DEFAULT_PROMPTS. Idempotent operation.

        Returns:
            dict with counts of created, skipped, and total modules
        """
        from app.models.ai_prompt_models import DEFAULT_PROMPTS, PromptScope

        created = 0
        skipped = 0

        for module_type, prompt_text in DEFAULT_PROMPTS.items():
            # Check if system default already exists
            stmt = select(AiPromptConfig).where(
                and_(
                    AiPromptConfig.module_type == module_type,
                    AiPromptConfig.scope == PromptScope.SYSTEM,
                    AiPromptConfig.is_default == True
                )
            )
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()

            if existing:
                logger.info(f"System default already exists for {module_type}, skipping")
                skipped += 1
                continue

            # Create system default
            module_name = self._generate_module_name(module_type)
            prompt_config = AiPromptConfig(
                module_type=module_type,
                module_name=module_name,
                scope=PromptScope.SYSTEM,
                user_id=None,  # System prompt
                custom_prompt=prompt_text,
                is_default=True,
                is_enabled=True,
                version="1.0"
            )

            db.add(prompt_config)
            created += 1
            logger.info(f"Created system default for {module_type}")

        await db.commit()

        return {
            "created": created,
            "skipped": skipped,
            "total": len(DEFAULT_PROMPTS)
        }

    async def test_prompt(
        self,
        db: AsyncSession,
        user_id: str,
        module_type: AiModuleType,
        custom_prompt: str,
        chart_data: Optional[dict] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> dict:
        """
        Test a prompt with sample or real chart data.

        Fills template variables and returns preview without calling LLM.

        Returns:
            dict with filled_prompt, template_variables, missing_variables, warnings
        """
        import re

        # Extract template variables from prompt
        template_vars = re.findall(r'\{(\w+)\}', custom_prompt)
        unique_vars = list(set(template_vars))

        # Use sample data if no chart data provided
        if not chart_data:
            chart_data = self._get_sample_chart_data(module_type)

        # Fill template variables
        filled_prompt = custom_prompt
        missing_vars = []

        for var in unique_vars:
            if var in chart_data:
                filled_prompt = filled_prompt.replace(f'{{{var}}}', str(chart_data[var]))
            else:
                missing_vars.append(var)

        # Generate warnings
        warnings = []
        if missing_vars:
            warnings.append(f"Missing template variables: {', '.join(missing_vars)}")

        if len(custom_prompt) < 50:
            warnings.append("Prompt is very short. Consider adding more context for better results.")

        if len(custom_prompt) > 10000:
            warnings.append("Prompt is very long. This may exceed token limits for some models.")

        return {
            "filled_prompt": filled_prompt,
            "template_variables": unique_vars,
            "missing_variables": missing_vars,
            "warnings": warnings
        }

    def _get_sample_chart_data(self, module_type: AiModuleType) -> dict:
        """Get sample chart data for testing prompts."""
        sample_data = {
            "chart_data": "Sample birth chart data with planetary positions...",
            "birth_info": "Born on January 15, 1990 at 14:30 in New York, USA",
            "planets": "Sun in Capricorn, Moon in Pisces, Mars in Sagittarius...",
            "houses": "1st house: Aries, 2nd house: Taurus...",
            "aspects": "Sun conjunct Mercury, Moon trine Jupiter...",
            "current_dasha": "Venus Mahadasha, Sun Antardasha",
            "upcoming_dashas": "Moon Mahadasha starting in 2026...",
            "current_transits": "Saturn transiting 10th house, Jupiter in 5th house...",
            "transit_dates": "Saturn transit: 2024-2027, Jupiter transit: 2025-2026...",
            "affected_houses": "10th house (career), 5th house (creativity)...",
            "yogas": "Gaja Kesari Yoga, Dhana Yoga, Raj Yoga...",
            "yoga_strengths": "Gaja Kesari: Strong, Dhana Yoga: Moderate...",
            "activation_periods": "Gaja Kesari active during Moon periods...",
            "challenging_factors": "Saturn in 8th house, Mars afflicted...",
            "weak_planets": "Mercury weak in 12th house...",
            "afflictions": "Sun afflicted by Saturn aspect...",
            "primary_chart": "Primary person's chart data...",
            "partner_chart": "Partner's chart data...",
            "focus_areas": "Emotional compatibility, long-term potential...",
            "guna_milan_score": "28 out of 36 points",
            "ashtakoot_scores": "Varna: 1, Vashya: 2, Tara: 3...",
            "doshas": "No Manglik Dosha, No Nadi Dosha",
            "question": "When should I start a new business?",
            "conversation_history": "Previous discussion about career and finances...",
            "dasha_timeline": "Current: Venus-Sun, Next: Venus-Moon..."
        }

        return sample_data

    async def update_sample_format(
        self,
        db: AsyncSession,
        prompt_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> AiPromptConfig:
        """
        Update the sample format file information for a prompt configuration.

        Args:
            db: Database session
            prompt_id: Prompt configuration ID
            user_id: User ID
            update_data: Dictionary with sample format fields to update

        Returns:
            Updated AiPromptConfig
        """
        # Get the prompt config
        stmt = select(AiPromptConfig).where(
            and_(
                AiPromptConfig.id == prompt_id,
                AiPromptConfig.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        prompt_config = result.scalar_one_or_none()

        if not prompt_config:
            raise ValueError("Prompt configuration not found")

        # Update the fields
        for key, value in update_data.items():
            if hasattr(prompt_config, key):
                setattr(prompt_config, key, value)

        prompt_config.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(prompt_config)

        logger.info(f"Updated sample format for prompt {prompt_id}")
        return prompt_config

    async def get_prompt_by_id(
        self,
        db: AsyncSession,
        prompt_id: str,
        user_id: Optional[str] = None
    ) -> Optional[AiPromptConfig]:
        """
        Get a prompt configuration by ID.

        Args:
            db: Database session
            prompt_id: Prompt configuration ID
            user_id: User ID (optional, for ownership check)

        Returns:
            AiPromptConfig or None
        """
        stmt = select(AiPromptConfig).where(AiPromptConfig.id == prompt_id)

        if user_id:
            stmt = stmt.where(AiPromptConfig.user_id == user_id)

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

