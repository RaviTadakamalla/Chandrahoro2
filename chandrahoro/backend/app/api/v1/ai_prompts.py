"""API endpoints for AI prompt configuration."""

import logging
import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.ai_prompt_models import AiModuleType
from app.schemas.ai_prompt_schemas import (
    AiPromptConfigCreate,
    AiPromptConfigUpdate,
    AiPromptConfigResponse,
    AiPromptConfigList,
    AiModuleListResponse,
    ResetToDefaultRequest,
    BulkEnableDisableRequest,
    AiPromptTestRequest,
    AiPromptTestResponse,
    InitializeDefaultsResponse
)
from app.services.ai_prompt_service import AiPromptService

logger = logging.getLogger("chandrahoro")
router = APIRouter(prefix="/ai-prompts", tags=["AI Prompts"])
prompt_service = AiPromptService()


@router.get("/modules", response_model=AiModuleListResponse)
async def get_available_modules(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get list of all available AI modules with their prompt configuration status.

    Returns information about each module including:
    - Module type and display name
    - Default prompt template
    - Available variables
    - Whether user has a custom prompt configured

    Note: Authentication is optional. If not authenticated, all modules will show as using defaults.
    """
    try:
        user_id = current_user.id if current_user else None
        modules = await prompt_service.get_available_modules(db, user_id)

        return AiModuleListResponse(
            modules=modules,
            total=len(modules)
        )
    except Exception as e:
        logger.error(f"Error getting available modules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available modules: {str(e)}"
        )


@router.get("/", response_model=AiPromptConfigList)
async def get_user_prompts(
    include_system: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all prompt configurations for the current user.
    
    Args:
        include_system: Whether to include system default prompts
        
    Returns:
        List of prompt configurations (user custom + system defaults)
    """
    try:
        prompts = await prompt_service.get_user_prompts(db, current_user.id, include_system)
        
        # Check if user has any custom prompts
        has_custom = any(p.user_id == current_user.id for p in prompts)
        
        return AiPromptConfigList(
            prompts=prompts,
            total=len(prompts),
            has_custom=has_custom
        )
    except Exception as e:
        logger.error(f"Error getting user prompts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prompts: {str(e)}"
        )


@router.get("/{prompt_id}", response_model=AiPromptConfigResponse)
async def get_prompt_config(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific prompt configuration by ID."""
    try:
        from sqlalchemy import select
        from app.models.ai_prompt_models import AiPromptConfig
        
        stmt = select(AiPromptConfig).where(AiPromptConfig.id == prompt_id)
        result = await db.execute(stmt)
        prompt = result.scalar_one_or_none()
        
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prompt configuration not found: {prompt_id}"
            )
        
        # Users can only view their own custom prompts or system prompts
        from app.models.ai_prompt_models import PromptScope
        if prompt.scope == PromptScope.USER and prompt.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own custom prompts"
            )
        
        return prompt
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prompt config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prompt configuration: {str(e)}"
        )


@router.post("/", response_model=AiPromptConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt_config(
    prompt_data: AiPromptConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new custom prompt configuration.
    
    This creates a user-specific prompt that will override the system default
    for the specified module type.
    """
    try:
        prompt = await prompt_service.create_prompt_config(db, current_user.id, prompt_data)
        return prompt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating prompt config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create prompt configuration: {str(e)}"
        )


@router.put("/{prompt_id}", response_model=AiPromptConfigResponse)
async def update_prompt_config(
    prompt_id: str,
    prompt_data: AiPromptConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing prompt configuration.

    Users can only update their own custom prompts.
    Updating the prompt content will create a new version in the history.
    """
    try:
        prompt = await prompt_service.update_prompt_config(
            db, prompt_id, current_user.id, prompt_data
        )
        return prompt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating prompt config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update prompt configuration: {str(e)}"
        )


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt_config(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a custom prompt configuration.

    After deletion, the system will fall back to the default prompt for that module.
    System default prompts cannot be deleted.
    """
    try:
        await prompt_service.delete_prompt_config(db, prompt_id, current_user.id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error deleting prompt config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete prompt configuration: {str(e)}"
        )


@router.post("/reset-to-default", response_model=dict)
async def reset_to_default(
    request: ResetToDefaultRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reset a module's prompt to the system default.

    This deletes the user's custom prompt for the specified module,
    causing the system to fall back to the default prompt.
    """
    try:
        # Find user's custom prompt for this module
        prompt = await prompt_service.get_prompt_for_module(
            db, request.module_type, current_user.id
        )

        if not prompt or prompt.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No custom prompt found for module {request.module_type}"
            )

        # Delete the custom prompt
        await prompt_service.delete_prompt_config(db, prompt.id, current_user.id)

        return {
            "success": True,
            "message": f"Reset to default prompt for module {request.module_type}",
            "module_type": request.module_type
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting to default: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset to default: {str(e)}"
        )


@router.post("/bulk-enable-disable", response_model=dict)
async def bulk_enable_disable(
    request: BulkEnableDisableRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enable or disable multiple prompt configurations at once.

    This is useful for temporarily disabling custom prompts without deleting them.
    """
    try:
        from sqlalchemy import select, update
        from app.models.ai_prompt_models import AiPromptConfig, PromptScope

        # Verify all prompts belong to the user
        stmt = select(AiPromptConfig).where(
            AiPromptConfig.id.in_(request.prompt_ids)
        )
        result = await db.execute(stmt)
        prompts = result.scalars().all()

        # Check ownership
        for prompt in prompts:
            if prompt.scope == PromptScope.USER and prompt.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only modify your own custom prompts"
                )

        # Update all prompts
        stmt = update(AiPromptConfig).where(
            AiPromptConfig.id.in_(request.prompt_ids)
        ).values(is_enabled=request.is_enabled)

        await db.execute(stmt)
        await db.commit()

        action = "enabled" if request.is_enabled else "disabled"
        return {
            "success": True,
            "message": f"Successfully {action} {len(request.prompt_ids)} prompts",
            "count": len(request.prompt_ids)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk enable/disable: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update prompts: {str(e)}"
        )


@router.post("/initialize-defaults", response_model=InitializeDefaultsResponse)
async def initialize_system_defaults(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initialize system default prompts for all AI modules.

    This endpoint creates system-level prompt configurations (scope=SYSTEM, user_id=NULL)
    for all modules defined in DEFAULT_PROMPTS. It's idempotent - only creates prompts
    that don't already exist.

    **Admin only**: Only users with admin or owner role can initialize system defaults.
    """
    # Check if user is admin
    if current_user.role not in ['admin', 'owner']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can initialize system defaults"
        )

    try:
        result = await prompt_service.initialize_system_defaults(db)

        return InitializeDefaultsResponse(
            success=True,
            message=f"Successfully initialized {result['created']} system default prompts",
            created_count=result['created'],
            skipped_count=result['skipped'],
            total_modules=result['total']
        )
    except Exception as e:
        logger.error(f"Error initializing system defaults: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize system defaults: {str(e)}"
        )


@router.post("/test", response_model=AiPromptTestResponse)
async def test_prompt(
    request: AiPromptTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Test a prompt with sample or real chart data.

    This endpoint allows users to test their custom prompts before saving them.
    It fills in template variables with the provided chart data and returns
    a preview of how the prompt will look.

    **Parameters:**
    - `module_type`: The AI module type to test
    - `custom_prompt`: The prompt template to test
    - `chart_data`: Optional chart data to fill template variables (if not provided, uses sample data)
    - `temperature`: Optional temperature override for testing
    - `max_tokens`: Optional max_tokens override for testing
    """
    try:
        result = await prompt_service.test_prompt(
            db=db,
            user_id=current_user.id,
            module_type=request.module_type,
            custom_prompt=request.custom_prompt,
            chart_data=request.chart_data,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )

        return AiPromptTestResponse(
            success=True,
            filled_prompt=result['filled_prompt'],
            template_variables=result['template_variables'],
            missing_variables=result.get('missing_variables', []),
            warnings=result.get('warnings', [])
        )
    except Exception as e:
        logger.error(f"Error testing prompt: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to test prompt: {str(e)}"
        )


@router.post("/{prompt_id}/upload-sample-format", response_model=AiPromptConfigResponse)
async def upload_sample_format(
    prompt_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a sample format file (HTML or PDF) for an AI prompt configuration.

    The uploaded file will be used as a reference for the AI to match the output format.
    Supported file types: .html, .pdf
    """
    try:
        # Validate file type
        allowed_extensions = ['.html', '.pdf', '.htm']
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )

        # Get the prompt config
        prompt_config = await prompt_service.get_prompt_by_id(db, prompt_id, current_user.id)
        if not prompt_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt configuration not found"
            )

        # Check ownership
        if prompt_config.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload sample formats for your own prompts"
            )

        # Create upload directory if it doesn't exist
        upload_dir = "uploads/prompt_templates"
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Update the prompt config with file information
        update_data = {
            "sample_format_filename": file.filename,
            "sample_format_path": file_path,
            "sample_format_type": file_ext.lstrip('.'),
            "sample_format_uploaded_at": datetime.utcnow()
        }

        updated_prompt = await prompt_service.update_sample_format(
            db, prompt_id, current_user.id, update_data
        )

        logger.info(f"Sample format uploaded for prompt {prompt_id}: {file.filename}")
        return updated_prompt

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading sample format: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload sample format: {str(e)}"
        )


@router.delete("/{prompt_id}/sample-format", response_model=AiPromptConfigResponse)
async def delete_sample_format(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete the sample format file for an AI prompt configuration.
    """
    try:
        # Get the prompt config
        prompt_config = await prompt_service.get_prompt_by_id(db, prompt_id, current_user.id)
        if not prompt_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt configuration not found"
            )

        # Check ownership
        if prompt_config.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete sample formats for your own prompts"
            )

        # Delete the file if it exists
        if prompt_config.sample_format_path and os.path.exists(prompt_config.sample_format_path):
            os.remove(prompt_config.sample_format_path)

        # Update the prompt config to remove file information
        update_data = {
            "sample_format_filename": None,
            "sample_format_path": None,
            "sample_format_type": None,
            "sample_format_uploaded_at": None
        }

        updated_prompt = await prompt_service.update_sample_format(
            db, prompt_id, current_user.id, update_data
        )

        logger.info(f"Sample format deleted for prompt {prompt_id}")
        return updated_prompt

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sample format: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sample format: {str(e)}"
        )
