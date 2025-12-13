#!/bin/bash
# VS Code Performance Cleanup Script
# Removes temporary files, caches, and optimizes repository structure

set -e

echo "🧹 Starting VS Code Performance Cleanup..."
echo ""

# Phase 1: Clean Python bytecode
echo "📦 Phase 1: Cleaning Python bytecode..."
find chandrahoro/backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find chandrahoro/backend -type f -name "*.pyc" -delete 2>/dev/null || true
find chandrahoro/backend -type f -name "*.pyo" -delete 2>/dev/null || true
find chandrahoro/backend -type f -name "*.pyd" -delete 2>/dev/null || true
echo "✅ Cleaned Python bytecode"

# Phase 2: Clean Node.js build artifacts
echo ""
echo "📦 Phase 2: Cleaning Node.js build artifacts..."
rm -rf chandrahoro/frontend/.next 2>/dev/null || true
rm -rf chandrahoro/frontend/out 2>/dev/null || true
rm -rf chandrahoro/frontend/.cache 2>/dev/null || true
rm -f chandrahoro/frontend/tsconfig.tsbuildinfo 2>/dev/null || true
echo "✅ Cleaned Node.js build artifacts"

# Phase 3: Remove backup directories
echo ""
echo "📦 Phase 3: Removing backup directories..."
rm -rf chandrahoro/frontend/app_backup 2>/dev/null || true
rm -rf chandrahoro/frontend/temp_backup 2>/dev/null || true
echo "✅ Removed backup directories"

# Phase 4: Clean log files
echo ""
echo "📦 Phase 4: Cleaning log files..."
find chandrahoro -name "*.log" -type f -delete 2>/dev/null || true
echo "✅ Cleaned log files"

# Phase 5: Clean DS_Store files
echo ""
echo "📦 Phase 5: Cleaning .DS_Store files..."
find chandrahoro -name ".DS_Store" -type f -delete 2>/dev/null || true
echo "✅ Cleaned .DS_Store files"

# Phase 6: Archive redundant documentation
echo ""
echo "📦 Phase 6: Archiving redundant documentation..."
mkdir -p chandrahoro/docs/archive 2>/dev/null || true

# Move completed/summary docs to archive
mv chandrahoro/*COMPLETE*.md chandrahoro/docs/archive/ 2>/dev/null || true
mv chandrahoro/*SUMMARY*.md chandrahoro/docs/archive/ 2>/dev/null || true
mv chandrahoro/*GUIDE*.md chandrahoro/docs/archive/ 2>/dev/null || true
mv chandrahoro/*FIX*.md chandrahoro/docs/archive/ 2>/dev/null || true
mv chandrahoro/*STATUS*.md chandrahoro/docs/archive/ 2>/dev/null || true
mv chandrahoro/*REPORT*.md chandrahoro/docs/archive/ 2>/dev/null || true

# Keep only essential docs in root
echo "✅ Archived redundant documentation"

# Phase 7: Organize shell scripts
echo ""
echo "📦 Phase 7: Organizing shell scripts..."
mkdir -p chandrahoro/scripts 2>/dev/null || true
mv chandrahoro/*.sh chandrahoro/scripts/ 2>/dev/null || true
echo "✅ Organized shell scripts"

# Summary
echo ""
echo "✨ Cleanup Complete!"
echo ""
echo "📊 Results:"
echo "  - Removed Python bytecode (__pycache__, *.pyc)"
echo "  - Removed Node.js build artifacts (.next, out)"
echo "  - Removed backup directories"
echo "  - Cleaned log files"
echo "  - Archived redundant documentation"
echo "  - Organized shell scripts"
echo ""
echo "🚀 VS Code should now be significantly faster!"
echo "💡 Tip: Reload VS Code window (Cmd+Shift+P → 'Reload Window') to apply changes"

