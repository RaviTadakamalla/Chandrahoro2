#!/bin/bash

# ChandraHoro Development Server Starter
# This script starts both backend and frontend in separate terminal windows

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}=========================================="
echo "Starting ChandraHoro Development Servers"
echo -e "==========================================${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open new Terminal windows
    
    echo -e "${YELLOW}Starting Backend Server...${NC}"
    osascript <<EOF
tell application "Terminal"
    do script "cd '$SCRIPT_DIR/backend' && source venv/bin/activate && echo '🚀 Starting Backend Server on http://localhost:8000' && echo 'API Docs: http://localhost:8000/docs' && echo '' && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    activate
end tell
EOF
    
    sleep 2
    
    echo -e "${YELLOW}Starting Frontend Server...${NC}"
    osascript <<EOF
tell application "Terminal"
    do script "cd '$SCRIPT_DIR/frontend' && echo '🚀 Starting Frontend Server on http://localhost:3000' && echo '' && npm run dev"
    activate
end tell
EOF
    
    echo ""
    echo -e "${GREEN}✅ Both servers are starting in separate Terminal windows${NC}"
    echo ""
    echo "Access the application:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔌 Backend API: http://localhost:8000"
    echo "  📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "To stop the servers, press Ctrl+C in each Terminal window"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use gnome-terminal or xterm
    
    if command -v gnome-terminal &> /dev/null; then
        echo -e "${YELLOW}Starting Backend Server...${NC}"
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR/backend' && source venv/bin/activate && echo '🚀 Starting Backend Server on http://localhost:8000' && echo 'API Docs: http://localhost:8000/docs' && echo '' && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; exec bash"
        
        sleep 2
        
        echo -e "${YELLOW}Starting Frontend Server...${NC}"
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR/frontend' && echo '🚀 Starting Frontend Server on http://localhost:3000' && echo '' && npm run dev; exec bash"
        
        echo ""
        echo -e "${GREEN}✅ Both servers are starting in separate terminal windows${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not detect terminal emulator${NC}"
        echo "Please run these commands manually in separate terminals:"
        echo ""
        echo "Terminal 1 - Backend:"
        echo "  cd $SCRIPT_DIR/backend"
        echo "  source venv/bin/activate"
        echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
        echo ""
        echo "Terminal 2 - Frontend:"
        echo "  cd $SCRIPT_DIR/frontend"
        echo "  npm run dev"
    fi
    
else
    # Windows or other OS
    echo -e "${YELLOW}⚠️  Automatic terminal opening not supported on this OS${NC}"
    echo "Please run these commands manually in separate terminals:"
    echo ""
    echo "Terminal 1 - Backend:"
    echo "  cd $SCRIPT_DIR/backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "  cd $SCRIPT_DIR/frontend"
    echo "  npm run dev"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Development servers are starting..."
echo -e "==========================================${NC}"

