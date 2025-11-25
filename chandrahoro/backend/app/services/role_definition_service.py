"""Role definition service for corporate role templates."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class RoleTemplate:
    """Role template data."""
    title: str
    description: str
    required_strengths: Dict[str, float]  # {attribute: weight}
    department: Optional[str] = None
    level: Optional[str] = None  # entry, mid, senior, executive
    tags: Optional[List[str]] = None


class RoleDefinitionCalculator:
    """Calculate role fit and strength requirements."""
    
    # Predefined role templates
    ROLE_TEMPLATES = {
        "Finance Operations": {
            "description": "Financial operations and accounting role",
            "department": "Finance",
            "level": "mid",
            "required_strengths": {
                "Logical": 0.35,
                "Hardworking": 0.30,
                "Honesty": 0.25,
                "Adaptability": 0.10,
            },
            "tags": ["finance", "operations", "accounting"],
        },
        "Sales Executive": {
            "description": "Sales and business development role",
            "department": "Sales",
            "level": "mid",
            "required_strengths": {
                "Risk-Taking": 0.30,
                "Leadership": 0.25,
                "Creativity": 0.20,
                "Loyalty": 0.15,
                "Adaptability": 0.10,
            },
            "tags": ["sales", "business", "development"],
        },
        "Creative Director": {
            "description": "Creative and design leadership role",
            "department": "Creative",
            "level": "senior",
            "required_strengths": {
                "Creativity": 0.35,
                "Leadership": 0.30,
                "Risk-Taking": 0.20,
                "Logical": 0.15,
            },
            "tags": ["creative", "design", "leadership"],
        },
        "Engineering Manager": {
            "description": "Technical team management role",
            "department": "Engineering",
            "level": "senior",
            "required_strengths": {
                "Logical": 0.30,
                "Leadership": 0.30,
                "Hardworking": 0.20,
                "Adaptability": 0.20,
            },
            "tags": ["engineering", "technical", "management"],
        },
        "HR Manager": {
            "description": "Human resources and talent management role",
            "department": "HR",
            "level": "mid",
            "required_strengths": {
                "Loyalty": 0.30,
                "Leadership": 0.25,
                "Honesty": 0.25,
                "Adaptability": 0.20,
            },
            "tags": ["hr", "talent", "management"],
        },
        "Product Manager": {
            "description": "Product strategy and management role",
            "department": "Product",
            "level": "mid",
            "required_strengths": {
                "Logical": 0.25,
                "Leadership": 0.25,
                "Creativity": 0.25,
                "Risk-Taking": 0.15,
                "Adaptability": 0.10,
            },
            "tags": ["product", "strategy", "management"],
        },
        "Customer Success": {
            "description": "Customer support and success role",
            "department": "Support",
            "level": "entry",
            "required_strengths": {
                "Loyalty": 0.30,
                "Adaptability": 0.25,
                "Honesty": 0.20,
                "Hardworking": 0.15,
                "Leadership": 0.10,
            },
            "tags": ["customer", "support", "success"],
        },
        "Executive Leadership": {
            "description": "C-level executive role",
            "department": "Executive",
            "level": "executive",
            "required_strengths": {
                "Leadership": 0.35,
                "Logical": 0.25,
                "Risk-Taking": 0.20,
                "Honesty": 0.15,
                "Adaptability": 0.05,
            },
            "tags": ["executive", "leadership", "strategy"],
        },
    }
    
    def get_role_template(self, role_name: str) -> Optional[Dict[str, Any]]:
        """
        Get predefined role template.
        
        Args:
            role_name: Role template name
            
        Returns:
            Role template data or None
        """
        if role_name not in self.ROLE_TEMPLATES:
            return None
        
        template = self.ROLE_TEMPLATES[role_name]
        return {
            "title": role_name,
            "description": template["description"],
            "department": template["department"],
            "level": template["level"],
            "required_strengths": template["required_strengths"],
            "tags": template["tags"],
        }
    
    def list_role_templates(self) -> List[Dict[str, Any]]:
        """
        List all available role templates.
        
        Returns:
            List of role templates
        """
        templates = []
        for role_name, template in self.ROLE_TEMPLATES.items():
            templates.append({
                "title": role_name,
                "description": template["description"],
                "department": template["department"],
                "level": template["level"],
                "required_strengths": template["required_strengths"],
                "tags": template["tags"],
            })
        return templates
    
    def calculate_role_fit(
        self,
        candidate_strengths: Dict[str, float],
        required_strengths: Dict[str, float],
    ) -> Dict[str, Any]:
        """
        Calculate role fit score for a candidate.
        
        Args:
            candidate_strengths: Candidate's strength attributes (1-10 scale)
            required_strengths: Required strengths with weights
            
        Returns:
            Role fit analysis with score and gaps
        """
        if not required_strengths:
            return {
                "fit_score": 0.0,
                "gaps": [],
                "strengths": [],
                "recommendations": "No required strengths defined for this role",
            }
        
        fit_score = 0.0
        gaps = []
        strengths = []
        total_weight = sum(required_strengths.values())
        
        for attr_name, weight in required_strengths.items():
            candidate_score = candidate_strengths.get(attr_name, 5.0)  # Default to 5
            
            # Normalize candidate score (1-10) to 0-1 scale
            normalized_score = (candidate_score - 1.0) / 9.0
            
            # Calculate weighted contribution
            contribution = normalized_score * weight
            fit_score += contribution
        
        # Normalize fit score to 0-100 scale
        fit_score = (fit_score / total_weight) * 100 if total_weight > 0 else 0
        
        # Identify gaps and strengths
        for attr_name, weight in required_strengths.items():
            candidate_score = candidate_strengths.get(attr_name, 5.0)
            
            if candidate_score < 5.0:
                gap_severity = (5.0 - candidate_score) / 4.0  # 0-1 scale
                gaps.append({
                    "attribute": attr_name,
                    "required_level": 5.0,
                    "current_level": candidate_score,
                    "gap": 5.0 - candidate_score,
                    "severity": gap_severity,
                    "weight": weight,
                })
            elif candidate_score >= 7.0:
                strengths.append({
                    "attribute": attr_name,
                    "level": candidate_score,
                    "weight": weight,
                })
        
        # Sort gaps by severity
        gaps.sort(key=lambda x: x["severity"], reverse=True)
        
        # Generate recommendations
        recommendations = []
        if gaps:
            top_gaps = gaps[:3]
            for gap in top_gaps:
                recommendations.append(
                    f"Develop {gap['attribute']} (current: {gap['current_level']:.1f}/10, "
                    f"needed: {gap['required_level']:.1f}/10)"
                )
        
        if not gaps:
            recommendations.append("Excellent fit for this role!")
        
        logger.info(f"Calculated role fit score: {fit_score:.1f}")
        
        return {
            "fit_score": round(fit_score, 1),
            "gaps": gaps,
            "strengths": strengths,
            "recommendations": recommendations,
        }

