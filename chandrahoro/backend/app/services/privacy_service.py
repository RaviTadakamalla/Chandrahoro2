"""Privacy and consent management service."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import hashlib
import json

logger = logging.getLogger(__name__)


@dataclass
class ConsentRecord:
    """Consent record data."""
    user_id: str
    consent_type: str
    granted: bool
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class PrivacyManager:
    """Manage privacy and consent."""
    
    # Consent types
    CONSENT_TYPES = {
        "data_processing": "Processing of personal data for astrological analysis",
        "profile_sharing": "Sharing profile with linked users",
        "team_analysis": "Including in team synergy analysis",
        "research": "Using anonymized data for research",
        "marketing": "Marketing communications",
        "analytics": "Analytics and usage tracking",
    }
    
    def __init__(self):
        """Initialize privacy manager."""
        self.consent_records: Dict[str, List[ConsentRecord]] = {}
        self.audit_log: List[Dict[str, Any]] = []
    
    def get_consent_status(self, user_id: str) -> Dict[str, bool]:
        """
        Get consent status for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Consent status for each type
        """
        status = {}
        for consent_type in self.CONSENT_TYPES.keys():
            status[consent_type] = self._get_latest_consent(user_id, consent_type)
        
        return status
    
    def grant_consent(
        self,
        user_id: str,
        consent_type: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Grant consent for a user.
        
        Args:
            user_id: User ID
            consent_type: Type of consent
            ip_address: IP address
            user_agent: User agent
            
        Returns:
            Consent record
        """
        if consent_type not in self.CONSENT_TYPES:
            raise ValueError(f"Invalid consent type: {consent_type}")
        
        record = ConsentRecord(
            user_id=user_id,
            consent_type=consent_type,
            granted=True,
            timestamp=datetime.now(),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        if user_id not in self.consent_records:
            self.consent_records[user_id] = []
        
        self.consent_records[user_id].append(record)
        
        # Log to audit
        self._log_audit(
            user_id,
            "consent_granted",
            consent_type,
            ip_address,
        )
        
        logger.info(f"Granted {consent_type} consent for user {user_id}")
        
        return {
            "user_id": user_id,
            "consent_type": consent_type,
            "granted": True,
            "timestamp": record.timestamp.isoformat(),
        }
    
    def revoke_consent(
        self,
        user_id: str,
        consent_type: str,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Revoke consent for a user.
        
        Args:
            user_id: User ID
            consent_type: Type of consent
            ip_address: IP address
            
        Returns:
            Revocation record
        """
        if consent_type not in self.CONSENT_TYPES:
            raise ValueError(f"Invalid consent type: {consent_type}")
        
        record = ConsentRecord(
            user_id=user_id,
            consent_type=consent_type,
            granted=False,
            timestamp=datetime.now(),
            ip_address=ip_address,
        )
        
        if user_id not in self.consent_records:
            self.consent_records[user_id] = []
        
        self.consent_records[user_id].append(record)
        
        # Log to audit
        self._log_audit(
            user_id,
            "consent_revoked",
            consent_type,
            ip_address,
        )
        
        logger.info(f"Revoked {consent_type} consent for user {user_id}")
        
        return {
            "user_id": user_id,
            "consent_type": consent_type,
            "granted": False,
            "timestamp": record.timestamp.isoformat(),
        }
    
    def _get_latest_consent(self, user_id: str, consent_type: str) -> bool:
        """Get latest consent status for a user and type."""
        if user_id not in self.consent_records:
            return False
        
        records = [
            r for r in self.consent_records[user_id]
            if r.consent_type == consent_type
        ]
        
        if not records:
            return False
        
        # Return latest consent status
        latest = max(records, key=lambda r: r.timestamp)
        return latest.granted
    
    def _log_audit(
        self,
        user_id: str,
        action: str,
        consent_type: str,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log audit entry."""
        self.audit_log.append({
            "user_id": user_id,
            "action": action,
            "consent_type": consent_type,
            "timestamp": datetime.now().isoformat(),
            "ip_address": ip_address,
        })
    
    def get_audit_log(self, user_id: str) -> List[Dict[str, Any]]:
        """Get audit log for a user."""
        return [
            entry for entry in self.audit_log
            if entry["user_id"] == user_id
        ]
    
    def anonymize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize user data.
        
        Args:
            data: User data to anonymize
            
        Returns:
            Anonymized data
        """
        anonymized = {}
        
        for key, value in data.items():
            if key in ["email", "phone", "name"]:
                # Hash sensitive fields
                anonymized[key] = self._hash_value(value)
            elif key in ["id", "user_id"]:
                # Hash IDs
                anonymized[key] = self._hash_value(value)
            else:
                # Keep other fields
                anonymized[key] = value
        
        return anonymized
    
    def _hash_value(self, value: str) -> str:
        """Hash a value for anonymization."""
        return hashlib.sha256(value.encode()).hexdigest()[:16]
    
    def encrypt_data(self, data: Dict[str, Any], key: str) -> str:
        """
        Encrypt data (placeholder for actual encryption).
        
        Args:
            data: Data to encrypt
            key: Encryption key
            
        Returns:
            Encrypted data
        """
        # In production, use proper encryption like AES
        json_str = json.dumps(data)
        return hashlib.sha256((json_str + key).encode()).hexdigest()
    
    def get_consent_summary(self, user_id: str) -> Dict[str, Any]:
        """Get consent summary for a user."""
        status = self.get_consent_status(user_id)
        audit_log = self.get_audit_log(user_id)
        
        return {
            "user_id": user_id,
            "consent_status": status,
            "audit_log_entries": len(audit_log),
            "last_updated": (
                max(entry["timestamp"] for entry in audit_log)
                if audit_log else None
            ),
        }

