#!/bin/bash

# Run All Tests Script for LendSmart Project

# Exit immediately if a command exits with a non-zero status, treat unset variables as an error, and fail if any command in a pipeline fails
set -euo pipefail

# --- Configuration ---
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
VENV_PATH="$PROJECT_ROOT/venv"
BACKEND_DIR="$PROJECT_ROOT/code/backend"
ML_SERVICES_DIR="$PROJECT_ROOT/code/ml_services"
WEB_FRONTEND_DIR="$PROJECT_ROOT/web-frontend"
MOBILE_FRONTEND_DIR="$PROJECT_ROOT/mobile-frontend"
SMART_CONTRACTS_DIR="$PROJECT_ROOT/code/blockchain" # Assuming smart contracts are here based on architecture

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting All Tests for LendSmart Project...${NC}"
OVERALL_STATUS=0

# --- Helper Functions ---

run_test_suite() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "\n${YELLOW}--- Running $name Tests in $dir ---${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Warning: Directory '$dir' not found. Skipping $name tests.${NC}"
        return 0
    fi
    
    (
        cd "$dir"
        # Execute the test command
        if eval "$command"; then
            echo -e "${GREEN}$name Tests Passed.${NC}"
        else
            echo -e "${RED}$name Tests Failed. Check logs above.${NC}"
            OVERALL_STATUS=1
        fi
    )
}

# --- 1. Smart Contract Tests (Truffle/Hardhat) ---
# Assuming the user has a smart-contracts directory, let's use the one from the architecture diagram
run_test_suite "Smart Contract" "$SMART_CONTRACTS_DIR" "npx hardhat test"

# --- 2. Backend Tests (Node.js/Jest) ---
run_test_suite "Backend" "$BACKEND_DIR" "npm test"

# --- 2b. ML Services Tests (Python/pytest) ---
if [ -d "$ML_SERVICES_DIR" ]; then
    echo -e "\n${YELLOW}--- Running ML Services Tests in $ML_SERVICES_DIR ---${NC}"
    if [ -d "$VENV_PATH" ]; then
        source "$VENV_PATH/bin/activate"
        pip install pytest > /dev/null 2>&1 || echo -e "${RED}Warning: Failed to install pytest.${NC}"
        (
            cd "$ML_SERVICES_DIR"
            if pytest; then
                echo -e "${GREEN}ML Services Tests Passed.${NC}"
            else
                echo -e "${RED}ML Services Tests Failed. Check logs above.${NC}"
                OVERALL_STATUS=1
            fi
        )
        deactivate
    else
        echo -e "${RED}Error: Python virtual environment not found at $VENV_PATH. Skipping ML Services tests.${NC}"
        OVERALL_STATUS=1
    fi
fi

# --- 3. Web Frontend Tests (npm test) ---
run_test_suite "Web Frontend" "$WEB_FRONTEND_DIR" "CI=true npm test"

# --- 4. Mobile Frontend Tests (yarn test) ---
run_test_suite "Mobile Frontend" "$MOBILE_FRONTEND_DIR" "CI=true npm test -- --watchAll=false"

# --- Final Summary ---
echo -e "\n${BLUE}----------------------------------------${NC}"
if [ "$OVERALL_STATUS" -eq 0 ]; then
    echo -e "${GREEN}All Tests Completed Successfully!${NC}"
else
    echo -e "${RED}Some Tests Failed. Please review the output above.${NC}"
fi
echo -e "${BLUE}----------------------------------------${NC}"

exit "$OVERALL_STATUS"
