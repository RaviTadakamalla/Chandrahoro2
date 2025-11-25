"""Team synergy analysis service."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import statistics

logger = logging.getLogger(__name__)


@dataclass
class TeamMember:
    """Team member data."""
    member_id: str
    name: str
    strengths: Dict[str, float]
    role: Optional[str] = None


class TeamSynergyCalculator:
    """Calculate team synergy and dynamics."""
    
    # Planetary compatibility matrix for team dynamics
    COMPATIBILITY_MATRIX = {
        ("Risk-Taking", "Leadership"): 0.9,
        ("Risk-Taking", "Creativity"): 0.85,
        ("Leadership", "Logical"): 0.8,
        ("Leadership", "Hardworking"): 0.85,
        ("Creativity", "Logical"): 0.7,
        ("Loyalty", "Honesty"): 0.95,
        ("Loyalty", "Hardworking"): 0.85,
        ("Adaptability", "Creativity"): 0.8,
        ("Adaptability", "Logical"): 0.75,
    }
    
    def calculate_team_synergy(
        self,
        team_members: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Calculate overall team synergy.
        
        Args:
            team_members: List of team member data with strengths
            
        Returns:
            Team synergy analysis
        """
        if len(team_members) < 2:
            return {
                "team_synergy_score": 0.0,
                "diversity_score": 0.0,
                "leadership_fit": 0.0,
                "pairwise_compatibility": [],
                "friction_points": [],
                "recommendations": ["Team needs at least 2 members for synergy analysis"],
            }
        
        # Calculate pairwise compatibility
        pairwise_scores = self._calculate_pairwise_compatibility(team_members)
        
        # Calculate diversity score
        diversity_score = self._calculate_diversity_score(team_members)
        
        # Calculate leadership fit
        leadership_fit = self._calculate_leadership_fit(team_members)
        
        # Calculate overall team synergy
        team_synergy = (
            statistics.mean([p["compatibility_score"] for p in pairwise_scores]) * 0.5 +
            diversity_score * 0.3 +
            leadership_fit * 0.2
        )
        
        # Identify friction points
        friction_points = self._identify_friction_points(pairwise_scores, team_members)
        
        # Generate recommendations
        recommendations = self._generate_team_recommendations(
            team_synergy,
            diversity_score,
            leadership_fit,
            friction_points,
        )
        
        logger.info(f"Calculated team synergy: {team_synergy:.1f}")
        
        return {
            "team_synergy_score": round(team_synergy, 1),
            "diversity_score": round(diversity_score, 1),
            "leadership_fit": round(leadership_fit, 1),
            "pairwise_compatibility": pairwise_scores,
            "friction_points": friction_points,
            "recommendations": recommendations,
        }
    
    def _calculate_pairwise_compatibility(
        self,
        team_members: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Calculate compatibility between all team member pairs."""
        pairwise_scores = []
        
        for i in range(len(team_members)):
            for j in range(i + 1, len(team_members)):
                member1 = team_members[i]
                member2 = team_members[j]
                
                compatibility = self._calculate_member_compatibility(
                    member1.get("strengths", {}),
                    member2.get("strengths", {}),
                )
                
                pairwise_scores.append({
                    "member1_id": member1.get("id"),
                    "member1_name": member1.get("name"),
                    "member2_id": member2.get("id"),
                    "member2_name": member2.get("name"),
                    "compatibility_score": compatibility,
                })
        
        return pairwise_scores
    
    def _calculate_member_compatibility(
        self,
        strengths1: Dict[str, float],
        strengths2: Dict[str, float],
    ) -> float:
        """Calculate compatibility between two members."""
        if not strengths1 or not strengths2:
            return 50.0
        
        compatibility_score = 0.0
        count = 0
        
        for attr1, score1 in strengths1.items():
            for attr2, score2 in strengths2.items():
                key = tuple(sorted([attr1, attr2]))
                
                # Get compatibility from matrix or default
                base_compatibility = self.COMPATIBILITY_MATRIX.get(key, 0.5)
                
                # Adjust based on strength levels
                score1_norm = (score1 - 1.0) / 9.0
                score2_norm = (score2 - 1.0) / 9.0
                
                # Higher scores in complementary attributes increase compatibility
                adjusted = base_compatibility * (score1_norm + score2_norm) / 2
                compatibility_score += adjusted
                count += 1
        
        if count == 0:
            return 50.0
        
        return (compatibility_score / count) * 100
    
    def _calculate_diversity_score(
        self,
        team_members: List[Dict[str, Any]],
    ) -> float:
        """Calculate team diversity score."""
        if len(team_members) < 2:
            return 0.0
        
        # Collect all strength attributes
        all_strengths = {}
        for member in team_members:
            for attr, score in member.get("strengths", {}).items():
                if attr not in all_strengths:
                    all_strengths[attr] = []
                all_strengths[attr].append(score)
        
        # Calculate variance for each attribute
        diversity_scores = []
        for attr, scores in all_strengths.items():
            if len(scores) > 1:
                variance = statistics.variance(scores)
                # Normalize variance to 0-100 scale
                normalized = min(variance * 10, 100)
                diversity_scores.append(normalized)
        
        if not diversity_scores:
            return 50.0
        
        return statistics.mean(diversity_scores)
    
    def _calculate_leadership_fit(
        self,
        team_members: List[Dict[str, Any]],
    ) -> float:
        """Calculate leadership fit for the team."""
        leadership_scores = []
        
        for member in team_members:
            leadership = member.get("strengths", {}).get("Leadership", 5.0)
            leadership_scores.append(leadership)
        
        if not leadership_scores:
            return 50.0
        
        # Ideal: one strong leader (8+) and others with moderate leadership
        max_leadership = max(leadership_scores)
        avg_leadership = statistics.mean(leadership_scores)
        
        # Score based on leadership distribution
        if max_leadership >= 8.0 and avg_leadership >= 5.0:
            fit_score = 85.0
        elif max_leadership >= 7.0 and avg_leadership >= 4.5:
            fit_score = 70.0
        elif max_leadership >= 6.0:
            fit_score = 55.0
        else:
            fit_score = 40.0
        
        return fit_score
    
    def _identify_friction_points(
        self,
        pairwise_scores: List[Dict[str, Any]],
        team_members: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Identify potential friction points in the team."""
        friction_points = []
        
        for pair in pairwise_scores:
            if pair["compatibility_score"] < 50.0:
                friction_points.append({
                    "member1": pair["member1_name"],
                    "member2": pair["member2_name"],
                    "compatibility_score": pair["compatibility_score"],
                    "severity": "high" if pair["compatibility_score"] < 30 else "medium",
                    "recommendation": "Consider conflict resolution or role adjustment",
                })
        
        return friction_points
    
    def _generate_team_recommendations(
        self,
        team_synergy: float,
        diversity_score: float,
        leadership_fit: float,
        friction_points: List[Dict[str, Any]],
    ) -> List[str]:
        """Generate team recommendations."""
        recommendations = []
        
        if team_synergy >= 75:
            recommendations.append("✅ Excellent team synergy - Team is well-aligned")
        elif team_synergy >= 60:
            recommendations.append("✅ Good team synergy - Team works well together")
        elif team_synergy >= 45:
            recommendations.append("⚠️ Moderate team synergy - Some alignment issues")
        else:
            recommendations.append("❌ Poor team synergy - Significant alignment issues")
        
        if diversity_score >= 70:
            recommendations.append("✅ High diversity - Good mix of strengths")
        elif diversity_score < 40:
            recommendations.append("⚠️ Low diversity - Consider adding complementary skills")
        
        if leadership_fit >= 75:
            recommendations.append("✅ Strong leadership structure")
        elif leadership_fit < 50:
            recommendations.append("⚠️ Weak leadership - Consider leadership development")
        
        if friction_points:
            recommendations.append(f"⚠️ {len(friction_points)} potential friction point(s) identified")
        
        return recommendations

