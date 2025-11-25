# GitHub Repository Setup Guide - ChandraHoro

**Version**: 1.0  
**Date**: 2025-10-29  
**Application**: ChandraHoro V2.1

---

## 📋 Prerequisites

- [ ] GitHub account (create at https://github.com if needed)
- [ ] Git installed locally (`git --version` to verify)
- [ ] SSH key configured (optional but recommended)
- [ ] Local ChandraHoro repository ready

---

## 🚀 Step-by-Step GitHub Setup

### Step 1: Create GitHub Repository

#### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub**: https://github.com/new
2. **Fill in Repository Details**:
   - **Repository name**: `chandrahoro`
   - **Description**: `Full-stack Vedic Astrology Platform with AI Features`
   - **Visibility**: 
     - ✅ **Private** (Recommended for production)
     - ⚠️ Public (if you want to share)
   - **Initialize repository**: Leave unchecked (we'll push existing code)
   - **Add .gitignore**: Select "Node" (we have custom .gitignore)
   - **Add license**: Select "MIT" (optional)

3. **Click "Create repository"**

4. **Copy the repository URL**:
   - HTTPS: `https://github.com/YOUR_USERNAME/chandrahoro.git`
   - SSH: `git@github.com:YOUR_USERNAME/chandrahoro.git`

#### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if needed: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create chandrahoro \
  --private \
  --description "Full-stack Vedic Astrology Platform with AI Features" \
  --source=. \
  --remote=origin \
  --push
```

---

### Step 2: Initialize Git Locally (if not already done)

```bash
# Navigate to project directory
cd /Users/ravitadakamalla/chandrahoro

# Check if Git is already initialized
git status

# If not initialized, initialize Git
git init

# Verify initialization
git status
```

---

### Step 3: Configure Git User (if not already done)

```bash
# Set global Git user (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global user.name
git config --global user.email
```

---

### Step 4: Add Remote Repository

```bash
# Add GitHub repository as remote
# Replace YOUR_USERNAME with your actual GitHub username

# Using HTTPS (easier, but requires password each time)
git remote add origin https://github.com/YOUR_USERNAME/chandrahoro.git

# OR using SSH (requires SSH key setup, but more secure)
git remote add origin git@github.com:YOUR_USERNAME/chandrahoro.git

# Verify remote was added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/chandrahoro.git (fetch)
# origin  https://github.com/YOUR_USERNAME/chandrahoro.git (push)
```

---

### Step 5: Create .gitignore (if not already present)

```bash
# Check if .gitignore exists
ls -la | grep gitignore

# If not present, create one
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc
.Python
env/
ENV/

# Environment variables
.env
.env.local
.env.*.local
.env.production

# Build outputs
.next/
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Testing
.coverage
htmlcov/
.pytest_cache/

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF

# Verify .gitignore was created
cat .gitignore
```

---

### Step 6: Stage and Commit Files

```bash
# Check status
git status

# Stage all files
git add .

# Verify staged files
git status

# Create initial commit
git commit -m "Initial commit: Add ChandraHoro deployment configuration

- Add Docker configuration (frontend and backend Dockerfiles)
- Add docker-compose.yml for local development
- Add environment variable templates (.env.production.example)
- Add GitHub Actions CI/CD workflow for Azure deployment
- Add comprehensive deployment documentation and guides
- Add deployment checklist and troubleshooting guide
- Add Azure resource analysis and optimization recommendations"

# Verify commit
git log --oneline -1
```

---

### Step 7: Create Main Branch (if needed)

```bash
# Check current branch
git branch

# If on 'master', rename to 'main'
git branch -M main

# Verify branch name
git branch
```

---

### Step 8: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# For subsequent pushes
git push origin main

# Verify push was successful
git log --oneline -5
```

---

### Step 9: Create Production Branch

```bash
# Create production branch from main
git checkout -b production

# Push production branch to GitHub
git push -u origin production

# Switch back to main
git checkout main

# Verify branches
git branch -a
```

---

### Step 10: Configure GitHub Secrets for CI/CD

1. **Go to GitHub Repository Settings**:
   - Navigate to: https://github.com/YOUR_USERNAME/chandrahoro/settings/secrets/actions

2. **Add the following secrets**:

   ```
   AZURE_SUBSCRIPTION_ID
   Value: Your Azure subscription ID
   
   AZURE_RESOURCE_GROUP
   Value: chandrahoro-prod
   
   AZURE_REGISTRY_LOGIN_SERVER
   Value: pmactivitiesacr.azurecr.io (or your registry)
   
   AZURE_REGISTRY_USERNAME
   Value: Your registry username
   
   AZURE_REGISTRY_PASSWORD
   Value: Your registry password
   
   AZURE_CREDENTIALS
   Value: Service principal JSON (see below)
   
   NEXTAUTH_SECRET
   Value: Generated secret (openssl rand -base64 32)
   
   JWT_SECRET
   Value: Generated secret (openssl rand -base64 32)
   
   ANTHROPIC_API_KEY
   Value: Your Anthropic API key
   ```

3. **Generate Azure Service Principal** (for AZURE_CREDENTIALS):

   ```bash
   # Login to Azure
   az login
   
   # Get subscription ID
   az account show --query id -o tsv
   
   # Create service principal
   az ad sp create-for-rbac \
     --name "chandrahoro-deployment" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}
   
   # Copy the entire JSON output and paste as AZURE_CREDENTIALS secret
   ```

---

## 🌿 Branch Strategy

### Main Branch (`main`)
- **Purpose**: Development branch
- **Protection**: Require pull request reviews
- **Deployment**: Manual deployment to staging
- **Merge from**: Feature branches via pull requests

### Production Branch (`production`)
- **Purpose**: Production-ready code
- **Protection**: Require pull request reviews + status checks
- **Deployment**: Automatic deployment to Azure
- **Merge from**: Main branch only (via pull request)

### Feature Branches
- **Naming**: `feature/feature-name` or `fix/bug-name`
- **Created from**: Main branch
- **Merged back to**: Main branch via pull request

---

## 📝 Workflow Example

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push feature branch
git push -u origin feature/new-feature

# 4. Create pull request on GitHub
# (Go to GitHub and click "Compare & pull request")

# 5. After review and merge, pull latest main
git checkout main
git pull origin main

# 6. Delete local feature branch
git branch -d feature/new-feature
```

---

## ✅ Verification Checklist

- [ ] GitHub repository created
- [ ] Git initialized locally
- [ ] Remote repository configured
- [ ] .gitignore file present
- [ ] Initial commit created
- [ ] Main branch created and pushed
- [ ] Production branch created and pushed
- [ ] GitHub secrets configured
- [ ] Branch protection rules set up
- [ ] CI/CD workflow ready

---

## 🔐 Security Best Practices

1. **Never commit secrets**:
   - Use .env files (in .gitignore)
   - Use GitHub Secrets for CI/CD
   - Use Azure Key Vault for production

2. **Use SSH keys** (recommended):
   - Generate SSH key: `ssh-keygen -t ed25519`
   - Add to GitHub: Settings → SSH and GPG keys
   - Use SSH URLs for git operations

3. **Enable branch protection**:
   - Require pull request reviews
   - Require status checks to pass
   - Dismiss stale pull request approvals

4. **Use signed commits** (optional):
   - Sign commits with GPG key
   - Verify commits on GitHub

---

## 🆘 Troubleshooting

### Issue: "fatal: not a git repository"
```bash
# Solution: Initialize Git
git init
```

### Issue: "fatal: remote origin already exists"
```bash
# Solution: Remove existing remote
git remote remove origin
# Then add new remote
git remote add origin https://github.com/YOUR_USERNAME/chandrahoro.git
```

### Issue: "Permission denied (publickey)"
```bash
# Solution: Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/chandrahoro.git
```

### Issue: "fatal: The current branch main has no upstream branch"
```bash
# Solution: Push with -u flag
git push -u origin main
```

---

## 📚 Next Steps

1. ✅ **Complete GitHub Setup** (this guide)
2. ⏳ **Configure Azure Secrets** (see Step 10)
3. ⏳ **Create Azure Resources** (see AZURE_DEPLOYMENT_SETUP_OPTIMIZED.md)
4. ⏳ **Deploy to Azure** (see DEPLOYMENT_CHECKLIST.md)

---

## 📞 Resources

- **GitHub Docs**: https://docs.github.com/
- **Git Documentation**: https://git-scm.com/doc
- **GitHub CLI**: https://cli.github.com/
- **SSH Key Setup**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

**Status**: ✅ Ready to Execute  
**Time Estimate**: 15-20 minutes  
**Difficulty**: Easy

