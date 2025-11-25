-- Add missing columns to llm_configs table
ALTER TABLE llm_configs ADD COLUMN IF NOT EXISTS use_shared_key BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE llm_configs ADD COLUMN IF NOT EXISTS shared_key_account_name VARCHAR(100) NULL;

-- Add missing column to llm_audit_logs table
ALTER TABLE llm_audit_logs ADD COLUMN IF NOT EXISTS shared_key_account_name VARCHAR(100) NULL;

-- Make provider nullable
ALTER TABLE llm_configs MODIFY COLUMN provider ENUM('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom') NULL;

-- Make model nullable
ALTER TABLE llm_configs MODIFY COLUMN model VARCHAR(100) NULL;

-- Make key_vault_ref nullable
ALTER TABLE llm_configs MODIFY COLUMN key_vault_ref VARCHAR(200) NULL;

-- Make key_last_four nullable
ALTER TABLE llm_configs MODIFY COLUMN key_last_four VARCHAR(4) NULL;

