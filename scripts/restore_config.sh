#!/bin/bash
# Determine the directory of this script.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Get the absolute path for node and mcp-server.js.
NODE_PATH=$(which node)
MCP_SERVER_PATH=$(realpath "$PROJECT_ROOT/mcp-server.js")

# Get the absolute path for the config file (in the .cursor directory).
CONFIG_PATH=$(realpath "$PROJECT_ROOT/.cursor/mcp.json")

# Revert the absolute paths to the placeholder strings.
sed -i "s|\"$NODE_PATH\"|\"/path/to/node\"|g" "$CONFIG_PATH"
sed -i "s|\"$MCP_SERVER_PATH\"|\"/path/to/mcp-server.js\"|g" "$CONFIG_PATH"

# Define color variables.
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NC="\033[0m"  # No Color

echo -e "✅ ${GREEN}Reverted config file at:${NC}\n  ${BLUE}${CONFIG_PATH}${NC}"
echo -e "✅ ${GREEN}with node path reverted to:${NC}\n  ${BLUE}/path/to/node${NC}"
echo -e "✅ ${GREEN}and mcp-server path reverted to:${NC}\n  ${BLUE}/path/to/mcp-server.js${NC}"

echo -e "\n📝 ${GREEN}Reverted config file content:${NC}"
cat "$CONFIG_PATH"
