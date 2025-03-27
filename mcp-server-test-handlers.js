// Import the formatWorkToJson helper
import { formatWorkToJson } from "./mcp-server-utils.js";

// Handlers for testing
export const handlers = {
  // Search by title handler
  searchByTitle: async ({ title, rows = 5 }) => {
    try {
      const url = `https://api.crossref.org/works?query.title=${encodeURIComponent(
        title
      )}&rows=${rows}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server Test",
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
              type: "json",
              json: {
                status: "no_results",
                query: { title, rows },
                results: [],
              },
            },
          ],
        };
      }

      const formattedWorks = works.map((work) => formatWorkToJson(work));

      return {
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { title, rows },
              count: formattedWorks.length,
              results: formattedWorks,
            },
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: error.message,
              query: { title, rows },
            },
          },
        ],
      };
    }
  },

  // Search by author handler
  searchByAuthor: async ({ author, rows = 5 }) => {
    try {
      const url = `https://api.crossref.org/works?query.author=${encodeURIComponent(
        author
      )}&rows=${rows}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server Test",
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
              type: "json",
              json: {
                status: "no_results",
                query: { author, rows },
                results: [],
              },
            },
          ],
        };
      }

      const formattedWorks = works.map((work) => formatWorkToJson(work));

      return {
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { author, rows },
              count: formattedWorks.length,
              results: formattedWorks,
            },
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: error.message,
              query: { author, rows },
            },
          },
        ],
      };
    }
  },

  // Get work by DOI handler
  getWorkByDOI: async ({ doi }) => {
    try {
      // Remove any URL prefix if present
      const cleanDoi = doi.replace(/^https?:\/\/doi.org\//, "");

      const url = `https://api.crossref.org/works/${cleanDoi}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Crossref MCP Server Test",
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
              type: "json",
              json: {
                status: "not_found",
                query: { doi },
                message: `No work found with DOI: ${doi}`,
              },
            },
          ],
        };
      }

      const formattedWork = formatWorkToJson(work);

      return {
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { doi },
              result: formattedWork,
            },
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: error.message,
              query: { doi },
            },
          },
        ],
      };
    }
  },

  // Add handler
  add: async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  }),
};
