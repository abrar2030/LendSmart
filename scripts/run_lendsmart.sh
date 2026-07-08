#!/bin/bash

# Run script for LendSmart: starts the Node backend and the React web frontend.
set -euo pipefail

# --- Configuration ---
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
BACKEND_DIR="$PROJECT_ROOT/code/backend"
FRONTEND_DIR="$PROJECT_ROOT/web-frontend"
BACKEND_PORT=5000  # Node/Express backend (PORT env); kept off 3000 to avoid the React dev-server clash
FRONTEND_PORT=3000 # React dev server

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting LendSmart application...${NC}"

# --- Graceful shutdown ---
cleanup() {
  echo -e "\n${BLUE}Stopping services...${NC}"
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    echo -e "${GREEN}Frontend (PID: $FRONTEND_PID) stopped.${NC}"
  fi
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    echo -e "${GREEN}Backend (PID: $BACKEND_PID) stopped.${NC}"
  fi
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Pre-flight checks ---
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}Error: backend directory not found at $BACKEND_DIR.${NC}"
  exit 1
fi
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}Error: frontend directory not found at $FRONTEND_DIR.${NC}"
  exit 1
fi

# --- Start backend (Node/Express) ---
echo -e "${BLUE}Starting backend server on port $BACKEND_PORT...${NC}"
(
  cd "$BACKEND_DIR"
  npm install >/dev/null 2>&1 || echo -e "${RED}Warning: failed to install backend dependencies.${NC}"
  PORT="$BACKEND_PORT" npm start
) &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"

echo -e "${BLUE}Waiting for backend to initialize...${NC}"
sleep 5

# --- Start web frontend (React) ---
echo -e "${BLUE}Starting web frontend on port $FRONTEND_PORT...${NC}"
(
  cd "$FRONTEND_DIR"
  npm install >/dev/null 2>&1 || echo -e "${RED}Warning: failed to install frontend dependencies.${NC}"
  PORT="$FRONTEND_PORT" REACT_APP_API_URL="http://localhost:$BACKEND_PORT/api" npm start
) &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

# --- Final output ---
echo -e "${GREEN}LendSmart application is running!${NC}"
echo -e "${GREEN}Backend running on port: $BACKEND_PORT${NC}"
echo -e "${GREEN}Frontend running on port: $FRONTEND_PORT${NC}"
echo -e "${GREEN}Access the application at: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"

wait
