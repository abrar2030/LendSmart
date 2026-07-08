#!/bin/bash

# Build Docker Images Script for LendSmart Project

# Exit immediately if a command exits with a non-zero status, treat unset variables as an error, and fail if any command in a pipeline fails
set -euo pipefail

# --- Configuration ---
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
BACKEND_DIR="$PROJECT_ROOT/code/backend"
FRONTEND_DIR="$PROJECT_ROOT/web-frontend"
DOCKER_ORCHESTRATOR_SCRIPT="$PROJECT_ROOT/scripts/docker_orchestrator.sh"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Docker Image Build Process for LendSmart...${NC}"

# --- Pre-flight Checks ---
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker to build images.${NC}"
    exit 1
fi

if [ ! -f "$DOCKER_ORCHESTRATOR_SCRIPT" ]; then
    echo -e "${RED}Error: Required script 'docker_orchestrator.sh' not found at $DOCKER_ORCHESTRATOR_SCRIPT.${NC}"
    exit 1
fi

# --- Build Backend Image ---
echo -e "${BLUE}Building Backend Docker Image...${NC}"
if [ -d "$BACKEND_DIR" ]; then
    (
        # Build using the canonical Dockerfile in infrastructure/docker.
        docker build -t lendsmart-backend:latest \
            -f "$PROJECT_ROOT/infrastructure/docker/Dockerfile.backend" "$BACKEND_DIR"
        echo -e "${GREEN}Backend image 'lendsmart-backend:latest' built successfully.${NC}"
    )
else
    echo -e "${RED}Warning: Backend directory '$BACKEND_DIR' not found. Skipping backend image build.${NC}"
fi

# --- Build Web Frontend Image ---
echo -e "${BLUE}Building Web Frontend Docker Image...${NC}"
if [ -d "$FRONTEND_DIR" ]; then
    (
        # Build using the canonical Dockerfile in infrastructure/docker.
        docker build -t lendsmart-frontend:latest \
            -f "$PROJECT_ROOT/infrastructure/docker/Dockerfile.frontend" "$FRONTEND_DIR"
        echo -e "${GREEN}Frontend image 'lendsmart-frontend:latest' built successfully.${NC}"
    )
else
    echo -e "${RED}Warning: Web Frontend directory '$FRONTEND_DIR' not found. Skipping frontend image build.${NC}"
fi

echo -e "${GREEN}Docker Image Build Process Completed!${NC}"
echo -e "${BLUE}You can now use 'docker_orchestrator.sh' to run the containers.${NC}"
