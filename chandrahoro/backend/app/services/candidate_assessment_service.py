"""Candidate assessment service for role fit evaluation."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class CandidateAssessment:
    """Candidate assessment data."""
    candidate_id: str
    role_id: str
    fit_score: float
    strength_gaps: List[Dict[str, Any]]
    recommendations: List[str]
    assessment_date: datetime


class CandidateAssessmentCalculator:
    """Calculate candidate fit for roles."""
    
    def assess_candidate_for_role(
        self,
        candidate_strengths: Dict[str, float],
        required_strengths: Dict[str, float],
    ) -> Dict[str, Any]:
        """
        Assess candidate fit for a specific role.
        
        Args:
            candidate_strengths: Candidate's strength attributes (1-10 scale)
            required_strengths: Required strengths with weights
            
        Returns:
            Assessment with fit score, gaps, and recommendations
        """
        if not required_strengths:
            return {
                "fit_score": 0.0,
                "strength_gaps": [],
                "recommendations": ["No required strengths defined for this role"],
                "assessment_level": "unknown",
            }
        
        fit_score = 0.0
        strength_gaps = []
        total_weight = sum(required_strengths.values())
        
        # Calculate fit score
        for attr_name, weight in required_strengths.items():
            candidate_score = candidate_strengths.get(attr_name, 5.0)
            normalized_score = (candidate_score - 1.0) / 9.0
            contribution = normalized_score * weight
            fit_score += contribution
        
        # Normalize to 0-100 scale
        fit_score = (fit_score / total_weight) * 100 if total_weight > 0 else 0
        
        # Identify strength gaps
        for attr_name, weight in required_strengths.items():
            candidate_score = candidate_strengths.get(attr_name, 5.0)
            
            if candidate_score < 5.0:
                gap_severity = (5.0 - candidate_score) / 4.0
                strength_gaps.append({
                    "attribute": attr_name,
                    "current_level": candidate_score,
                    "required_level": 5.0,
                    "gap": 5.0 - candidate_score,
                    "severity": gap_severity,
                    "weight": weight,
                    "development_priority": "high" if gap_severity > 0.5 else "medium",
                })
        
        # Sort gaps by severity
        strength_gaps.sort(key=lambda x: x["severity"], reverse=True)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            fit_score,
            strength_gaps,
            candidate_strengths,
            required_strengths,
        )
        
        # Determine assessment level
        assessment_level = self._determine_assessment_level(fit_score)
        
        logger.info(f"Assessed candidate with fit score: {fit_score:.1f}")
        
        return {
            "fit_score": round(fit_score, 1),
            "strength_gaps": strength_gaps,
            "recommendations": recommendations,
            "assessment_level": assessment_level,
        }
    
    def _generate_recommendations(
        self,
        fit_score: float,
        strength_gaps: List[Dict[str, Any]],
        candidate_strengths: Dict[str, float],
        required_strengths: Dict[str, float],
    ) -> List[str]:
        """Generate hiring recommendations."""
        recommendations = []
        
        if fit_score >= 80:
            recommendations.append("✅ Excellent fit - Highly recommended for this role")
            recommendations.append("Candidate demonstrates strong alignment with role requirements")
        elif fit_score >= 65:
            recommendations.append("✅ Good fit - Recommended with development plan")
            recommendations.append("Candidate has solid foundation with some areas for growth")
        elif fit_score >= 50:
            recommendations.append("⚠️ Moderate fit - Consider with targeted development")
            recommendations.append("Candidate requires focused development in key areas")
        else:
            recommendations.append("❌ Poor fit - Not recommended for this role")
            recommendations.append("Significant gaps in required strengths")
        
        # Add specific development recommendations
        if strength_gaps:
            top_gaps = strength_gaps[:3]
            recommendations.append("\nKey Development Areas:")
            for gap in top_gaps:
                recommendations.append(
                    f"• {gap['attribute']}: Develop from {gap['current_level']:.1f} to {gap['required_level']:.1f}"
                )
        
        # Add strengths to leverage
        strengths_to_leverage = []
        for attr_name, weight in required_strengths.items():
            candidate_score = candidate_strengths.get(attr_name, 5.0)
            if candidate_score >= 7.0:
                strengths_to_leverage.append(f"{attr_name} ({candidate_score:.1f}/10)")
        
        if strengths_to_leverage:
            recommendations.append("\nStrengths to Leverage:")
            for strength in strengths_to_leverage:
                recommendations.append(f"• {strength}")
        
        return recommendations
    
    def _determine_assessment_level(self, fit_score: float) -> str:
        """Determine assessment level based on fit score."""
        if fit_score >= 80:
            return "excellent"
        elif fit_score >= 65:
            return "good"
        elif fit_score >= 50:
            return "moderate"
        else:
            return "poor"
    
    def batch_assess_candidates(
        self,
        candidates: List[Dict[str, Any]],
        required_strengths: Dict[str, float],
    ) -> List[Dict[str, Any]]:
        """
        Assess multiple candidates for a role.
        
        Args:
            candidates: List of candidate data with strengths
            required_strengths: Required strengths for the role
            
        Returns:
            List of assessments sorted by fit score
        """
        assessments = []
        
        for candidate in candidates:
            assessment = self.assess_candidate_for_role(
                candidate.get("strengths", {}),
                required_strengths,
            )
            
            assessments.append({
                "candidate_id": candidate.get("id"),
                "candidate_name": candidate.get("name"),
                "fit_score": assessment["fit_score"],
                "assessment_level": assessment["assessment_level"],
                "strength_gaps": assessment["strength_gaps"],
                "recommendations": assessment["recommendations"],
            })
        
        # Sort by fit score descending
        assessments.sort(key=lambda x: x["fit_score"], reverse=True)
        
        logger.info(f"Batch assessed {len(assessments)} candidates")
        
        return assessments
    
    def identify_top_candidates(
        self,
        candidates: List[Dict[str, Any]],
        required_strengths: Dict[str, float],
        top_n: int = 5,
        min_fit_score: float = 50.0,
    ) -> List[Dict[str, Any]]:
        """
        Identify top candidates for a role.
        
        Args:
            candidates: List of candidate data
            required_strengths: Required strengths
            top_n: Number of top candidates to return
            min_fit_score: Minimum fit score threshold
            
        Returns:
            Top candidates meeting criteria
        """
        assessments = self.batch_assess_candidates(candidates, required_strengths)
        
        # Filter by minimum fit score
        qualified = [a for a in assessments if a["fit_score"] >= min_fit_score]
        
        # Return top N
        top_candidates = qualified[:top_n]
        
        logger.info(f"Identified {len(top_candidates)} top candidates")
        
        return top_candidates

