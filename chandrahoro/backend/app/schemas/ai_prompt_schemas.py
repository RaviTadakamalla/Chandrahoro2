"""Pydantic schemas for AI prompt configuration."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from app.models.ai_prompt_models import AiModuleType, PromptScope


class AiPromptConfigBase(BaseModel):
    """Base schema for AI prompt configuration."""
    module_type: AiModuleType
    module_name: Optional[str] = Field(None, max_length=100)
    module_description: Optional[str] = None
    custom_prompt: str = Field(..., min_length=10)
    system_variables: Optional[List[str]] = None
    output_format: Optional[str] = None
    is_enabled: bool = True
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    model_override: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None


class AiPromptConfigCreate(AiPromptConfigBase):
    """Schema for creating a new AI prompt configuration."""
    scope: PromptScope = PromptScope.USER
    
    @validator('custom_prompt')
    def validate_prompt(cls, v):
        """Validate prompt has minimum content."""
        if len(v.strip()) < 10:
            raise ValueError('Prompt must be at least 10 characters long')
        return v


class AiPromptConfigUpdate(BaseModel):
    """Schema for updating an AI prompt configuration."""
    module_name: Optional[str] = Field(None, max_length=100)
    module_description: Optional[str] = None
    custom_prompt: Optional[str] = Field(None, min_length=10)
    system_variables: Optional[List[str]] = None
    output_format: Optional[str] = None
    is_enabled: Optional[bool] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    model_override: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    change_notes: Optional[str] = None


class AiPromptConfigResponse(AiPromptConfigBase):
    """Schema for AI prompt configuration response."""
    id: str
    scope: PromptScope
    user_id: Optional[str] = None
    is_default: bool
    version: str
    usage_count: str
    last_used_at: Optional[datetime] = None
    is_validated: bool
    validation_notes: Optional[str] = None
    sample_format_filename: Optional[str] = None
    sample_format_type: Optional[str] = None
    sample_format_uploaded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AiPromptConfigList(BaseModel):
    """Schema for list of AI prompt configurations."""
    prompts: List[AiPromptConfigResponse]
    total: int
    has_custom: bool  # Whether user has any custom prompts


class AiPromptTestRequest(BaseModel):
    """Schema for testing a prompt."""
    prompt: str = Field(..., min_length=10)
    test_data: Dict[str, Any] = Field(..., description="Sample chart data for testing")
    module_type: AiModuleType


class AiPromptTestResponse(BaseModel):
    """Schema for prompt test response."""
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None
    response_time_ms: Optional[int] = None
    tokens_used: Optional[Dict[str, int]] = None


class AiPromptVersionResponse(BaseModel):
    """Schema for prompt version history."""
    id: str
    version_number: str
    prompt_content: str
    output_format: Optional[str] = None
    changed_by_user_id: Optional[str] = None
    change_notes: Optional[str] = None
    avg_response_time_ms: Optional[str] = None
    success_rate: Optional[str] = None
    user_satisfaction: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AiModuleInfo(BaseModel):
    """Schema for AI module information."""
    module_type: AiModuleType
    display_name: str
    description: str
    default_prompt: str
    available_variables: List[str]
    has_custom_prompt: bool = False
    custom_prompt_id: Optional[str] = None


class AiModuleListResponse(BaseModel):
    """Schema for list of available AI modules."""
    modules: List[AiModuleInfo]
    total: int


class ResetToDefaultRequest(BaseModel):
    """Schema for resetting prompt to default."""
    module_type: AiModuleType


class BulkEnableDisableRequest(BaseModel):
    """Schema for bulk enable/disable prompts."""
    prompt_ids: List[str]
    is_enabled: bool


class PromptValidationRequest(BaseModel):
    """Schema for validating a prompt."""
    prompt: str
    module_type: AiModuleType


class PromptValidationResponse(BaseModel):
    """Schema for prompt validation response."""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []


class AiPromptTestRequest(BaseModel):
    """Schema for testing a prompt."""
    module_type: AiModuleType
    custom_prompt: str
    chart_data: Optional[Dict[str, Any]] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class AiPromptTestResponse(BaseModel):
    """Schema for prompt test response."""
    success: bool
    filled_prompt: str
    template_variables: List[str]
    missing_variables: List[str] = []
    warnings: List[str] = []


class InitializeDefaultsResponse(BaseModel):
    """Schema for initialize defaults response."""
    success: bool
    message: str
    created_count: int
    skipped_count: int
    total_modules: int
