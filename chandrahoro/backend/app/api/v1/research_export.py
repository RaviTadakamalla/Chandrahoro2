"""Research export API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
import json
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ExportRequest(BaseModel):
    """Export request."""
    session_id: str = Field(..., description="Session ID")
    data: Dict[str, Any] = Field(..., description="Data to export")
    format: str = Field("json", description="Export format (json, csv, pdf, excel)")


@router.post("/research-export/session-json")
async def export_session_json(
    request: ExportRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export session as JSON.
    
    Args:
        request: Export request
        user: Current user
        
    Returns:
        JSON export
    """
    try:
        export_data = {
            "session_id": request.session_id,
            "exported_by": user.id,
            "data": request.data,
        }
        
        logger.info(f"Exported session {request.session_id} as JSON")
        
        return {
            "format": "json",
            "session_id": request.session_id,
            "data": export_data,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/research-export/results-csv")
async def export_results_csv(
    results: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export results as CSV.
    
    Args:
        results: List of results
        user: Current user
        
    Returns:
        CSV export
    """
    if not results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results are required",
        )
    
    try:
        # Create CSV content
        output = io.StringIO()
        if results:
            fieldnames = results[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(results)
        
        csv_content = output.getvalue()
        
        logger.info(f"Exported {len(results)} results as CSV")
        
        return {
            "format": "csv",
            "total_records": len(results),
            "content": csv_content,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/research-export/analysis-pdf")
async def export_analysis_pdf(
    analysis: Dict[str, Any] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export analysis as PDF.
    
    Args:
        analysis: Analysis data
        user: Current user
        
    Returns:
        PDF export info
    """
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis data is required",
        )
    
    try:
        # In production, use reportlab or similar
        pdf_info = {
            "title": analysis.get("title", "Research Analysis"),
            "content": analysis,
            "pages": 1,
        }
        
        logger.info(f"Exported analysis as PDF")
        
        return {
            "format": "pdf",
            "pdf_info": pdf_info,
            "message": "PDF export prepared (use reportlab in production)",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/research-export/feature-matrix-excel")
async def export_feature_matrix_excel(
    features: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export feature matrix as Excel.
    
    Args:
        features: Feature data
        user: Current user
        
    Returns:
        Excel export info
    """
    if not features:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Features are required",
        )
    
    try:
        # In production, use openpyxl or similar
        excel_info = {
            "sheets": ["Features", "Summary"],
            "total_rows": len(features),
            "columns": list(features[0].keys()) if features else [],
        }
        
        logger.info(f"Exported {len(features)} features as Excel")
        
        return {
            "format": "excel",
            "excel_info": excel_info,
            "message": "Excel export prepared (use openpyxl in production)",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/research-export/batch")
async def export_batch(
    request: ExportRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export in multiple formats.
    
    Args:
        request: Export request
        user: Current user
        
    Returns:
        Batch export
    """
    try:
        exports = {
            "session_id": request.session_id,
            "formats": ["json", "csv", "pdf"],
            "exports": {
                "json": request.data,
                "csv": "CSV export prepared",
                "pdf": "PDF export prepared",
            },
        }
        
        logger.info(f"Exported session {request.session_id} in multiple formats")
        
        return exports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

