#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatWorkToJson } from "./mcp-server-utils.js";

const server = new McpServer({
  name: "Crossref MCP Server",
  version: "0.0.1",
});

// Base URL for Crossref API
const CROSSREF_API_BASE = "https://api.crossref.org";

// Fields to select from the Crossref API
const CROSSREF_SELECT_FIELDS =
  "DOI,URL,abstract,author,container-title,issue,published,publisher,title,type,volume";

// Search works by title
server.tool(
  "searchByTitle",
  "Search for works by title in Crossref",
  {
    title: z.string().describe("The title to search for"),
    rows: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return"),
  },
  async ({ title, rows }) => {
    try {
      const url = `${CROSSREF_API_BASE}/works?query.title=${encodeURIComponent(
        title
      )}&rows=${rows}&select=${CROSSREF_SELECT_FIELDS}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const works = data.message?.items || [];

      if (works.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "no_results",
                  query: { title, rows },
                  results: [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const formattedWorks = works.map((work) => formatWorkToJson(work));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "success",
                query: { title, rows },
                count: formattedWorks.length,
                results: formattedWorks,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                message: error.message,
                query: { title, rows },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// Search works by author
server.tool(
  "searchByAuthor",
  "Search for works by author in Crossref",
  {
    author: z.string().describe("The author name to search for"),
    rows: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return"),
  },
  async ({ author, rows }) => {
    try {
      const url = `${CROSSREF_API_BASE}/works?query.author=${encodeURIComponent(
        author
      )}&rows=${rows}&select=${CROSSREF_SELECT_FIELDS}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const works = data.message?.items || [];

      if (works.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "no_results",
                  query: { author, rows },
                  results: [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const formattedWorks = works.map((work) => formatWorkToJson(work));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "success",
                query: { author, rows },
                count: formattedWorks.length,
                results: formattedWorks,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                message: error.message,
                query: { author, rows },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// Get work by DOI
server.tool(
  "getWorkByDOI",
  "Retrieve a specific work by its DOI",
  {
    doi: z.string().describe("The DOI to look up"),
  },
  async ({ doi }) => {
    try {
      // Remove any URL prefix if present
      const cleanDoi = doi.replace(/^https?:\/\/doi.org\//, "");

      // Use the direct Crossref API endpoint
      const url = `${CROSSREF_API_BASE}/works/${cleanDoi}?select=${CROSSREF_SELECT_FIELDS}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server (mailto:your-email@example.com)",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const work = data.message;

      if (!work) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "not_found",
                  query: { doi },
                  message: `No work found with DOI: ${doi}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const formattedWork = formatWorkToJson(work);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "success",
                query: { doi },
                result: formattedWork,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                message: error.message,
                query: { doi },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// Add a method to get the tools (for testing)
server.getTools = function () {
  return {
    searchByTitle: {
      name: "searchByTitle",
      handler: this._tools.get("searchByTitle").handler,
    },
    searchByAuthor: {
      name: "searchByAuthor",
      handler: this._tools.get("searchByAuthor").handler,
    },
    getWorkByDOI: {
      name: "getWorkByDOI",
      handler: this._tools.get("getWorkByDOI").handler,
    },
  };
};

const transport = new StdioServerTransport();

// Only connect if not being imported for testing
if (!process.env.VITEST) {
  await server.connect(transport);
}

export default server;
