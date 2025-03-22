# MCP Server Boilerplate

## Overview

**MCP (Model Context Protocol)** is a framework that allows you to integrate custom tools into AI-assisted development environments—such as Cursor AI. MCP servers expose functionality (like data retrieval or code analysis) so that an LLM-based IDE can call these tools on demand. Learn more about MCP in the [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction).

This project demonstrates an MCP server boilerplate that provides two basic tools. One tool, **add**, accepts two numbers and returns their sum, while the other, **getApiKey**, retrieves the API key from the environment (via the `API_KEY` variable).

## Requirements

- **Node.js:** Version 20 or higher is required.

## Features

- **MCP Integration:** Exposes tool functionality to LLM-based IDEs.
- **Addition Tool:** Accepts two numeric parameters and returns their sum.
- **Env Var Retrieval:** Demonstrates how to load an example environment variable from the configuration file.
- **Input Validation:** Uses [Zod](https://github.com/colinhacks/zod) for schema validation.
- **Standard I/O Transport:** Connects via `StdioServerTransport` for integration with development environments.

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Dependencies**

   You can install the project dependencies in one of two ways:

   **Option 1: Install using the existing `package.json`**

   Simply run:

   ```bash
   npm install
   ```

   **Option 2: Install dependencies manually**

   If you prefer, delete the existing `package.json` and install the required packages manually:

   ```bash
   npm install @modelcontextprotocol/sdk @coinpaprika/api-nodejs-client zod
   ```

   Then, update the newly generated `package.json` file to include the following line, which enables ES Modules:

   ```json
   "type": "module"
   ```

3. **Enable ES Modules**

   After installing dependencies, edit your `package.json` to include:

   ```json
   "type": "module"
   ```

4. **Ensure Node.js Version 20+**

   Confirm your Node.js version by running:

   ```bash
   node -v
   ```

   Update Node.js if necessary.

## Integrating with Cursor AI

This project includes a `./cursor` subdirectory that contains an `mcp.json` file for configuring the MCP server. Cursor AI uses this file to automatically discover and launch your MCP server. Open the file and update the fields as follows:

### The `./cursor/mcp.json` Structure

Below is the full JSON structure of the configuration file:

```json
{
  "mcpServers": {
    "MCP Server Boilerplate": {
      "command": "/path/to/node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "API_KEY": "abc-1234567890"
      }
    }
  }
}
```

- **mcpServers:**  
  An object mapping server names to their configuration.

- **MCP Server Boilerplate:**  
  This is the key for your server configuration. You can name it as you like.

- **command:**  
  Specifies the absolute path to your Node.js executable. For example:

  ```
  /home/john/.nvm/versions/node/v20.13.1/bin/node
  ```

- **args:**  
  An array containing the absolute path to your MCP server file. For example:

  ```
  ["/home/john/mcp-server-boilerplate/index.js"]
  ```

- **env:** (Optional)  
  Defines environment variables for your MCP server process. In this example, the `API_KEY` is set to `"abc-1234567890"`. Adjust this value as needed for your environment.

You can verify the absolute path to your Node.js executable by running `which node` in your terminal.

### Optional: Global Configuration

If desired, you can move the `mcp.json` file from the `./cursor` subdirectory to your global Cursor AI configuration directory located at `~/.cursor`. This allows Cursor AI to recognize your MCP server configuration globally.

## Using the MCP Tool in Cursor Composer (Agent Mode)

With the MCP server integrated into Cursor AI and with Agent mode enabled in Cursor Composer, simply use a natural language prompt like:

```
add 3 and 5
```

or

```
what is my API key?
```

The AI agent will infer the available `add` or `getApiKey` tool from your MCP server and execute it accordingly.

## Code Overview

The project comprises the following key parts:

- **MCP Server Initialization:**  
  The MCP server is instantiated using `McpServer` from the MCP SDK and connected via `StdioServerTransport`.

- **Tool Definitions:**
  - **add:**  
    Defined with a Zod schema that accepts two numbers (`a` and `b`) and returns their sum as text.
  - **getApiKey:**  
    Retrieves the API key from the environment variable `API_KEY` and returns it as text.

## What is MCP?

**Model Context Protocol (MCP)** provides a standardized approach to integrate custom tools into AI-assisted development environments. With MCP, you can define tools that perform specific tasks—such as retrieving external data, validating code, or enforcing coding standards—and the AI assistant in your IDE can call these tools automatically based on context. This helps improve developer productivity, ensures consistent quality, and streamlines workflows.

## Reference

[Use Your Own MCP on Cursor in 5 Minutes](https://dev.to/andyrewlee/use-your-own-mcp-on-cursor-in-5-minutes-1ag4)

## License

This project is licensed under the [MIT License](LICENSE).
