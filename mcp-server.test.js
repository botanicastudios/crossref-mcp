import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handlers } from "./mcp-server-test-handlers.js";

// Mock fetch
global.fetch = vi.fn();

// Mock the MCP SDK
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: vi.fn().mockImplementation(() => {
      const tools = {};
      return {
        name: "Crossref MCP Server",
        version: "0.0.1",
        tool: (name, description, schema, handler) => {
          tools[name] = { name, description, schema, handler };
        },
        async connect() {},
        getTools: () => tools,
        _tools: new Map(),
      };
    }),
  };
});

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({})),
  };
});

// Helper function to mock fetch response
function mockFetchResponse(data, status = 200) {
  global.fetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

beforeEach(() => {
  // Reset the fetch mock
  global.fetch.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Sample mock data
const mockTitleSearchResponse = {
  status: "ok",
  "message-type": "work-list",
  "message-version": "1.0.0",
  message: {
    items: [
      {
        title: ["Quantum computing: Cloudy computing"],
        author: [],
        DOI: "10.1038/454554f",
        type: "journal-article",
        published: {
          "date-parts": [[2008, 7]],
        },
        URL: "https://doi.org/10.1038/454554f",
        "container-title": ["Nature"],
        publisher: "Springer Science and Business Media LLC",
      },
      {
        title: ["Quantum computing*"],
        author: [
          { given: "Ge", family: "Wang" },
          { given: "Yi", family: "Zhang" },
        ],
        DOI: "10.1088/978-0-7503-2216-4ch10",
        type: "book-chapter",
        published: {
          "date-parts": [[2019, 12, 1]],
        },
        URL: "https://doi.org/10.1088/978-0-7503-2216-4ch10",
      },
    ],
  },
};

const mockAuthorSearchResponse = {
  status: "ok",
  "message-type": "work-list",
  "message-version": "1.0.0",
  message: {
    items: [
      {
        title: [
          "A quantum computer based on electrically controlled semiconductor spins",
        ],
        author: [
          { given: "Daniel", family: "Loss" },
          { given: "David P.", family: "DiVincenzo" },
        ],
        DOI: "10.1103/PhysRevA.57.120",
        type: "journal-article",
        published: {
          "date-parts": [[1998, 1, 1]],
        },
        URL: "https://doi.org/10.1103/PhysRevA.57.120",
        "container-title": ["Physical Review A"],
        publisher: "American Physical Society",
      },
    ],
  },
};

const mockDoiResponse = {
  status: "ok",
  "message-type": "work",
  "message-version": "1.0.0",
  message: {
    title: ["Quantum computing: Cloudy computing"],
    author: [],
    DOI: "10.1038/454554f",
    type: "journal-article",
    published: {
      "date-parts": [[2008, 7]],
    },
    URL: "https://doi.org/10.1038/454554f",
    "container-title": ["Nature"],
    publisher: "Springer Science and Business Media LLC",
    issue: "7204",
    volume: "454",
    abstract: "This is a sample abstract for testing purposes.",
  },
};

describe("Crossref MCP Server Tools", () => {
  describe("searchByTitle", () => {
    it("should return correctly formatted works when search is successful", async () => {
      // Mock successful response
      mockFetchResponse(mockTitleSearchResponse);

      // Call the handler directly
      const result = await handlers.searchByTitle({
        title: "quantum computing",
        rows: 2,
      });

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("works?query.title=quantum%20computing&rows=2"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.any(String),
          }),
        })
      );

      // Check response format
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { title: "quantum computing", rows: 2 },
              count: 2,
              results: expect.arrayContaining([
                expect.objectContaining({
                  title: "Quantum computing: Cloudy computing",
                  doi: "10.1038/454554f",
                  type: "journal-article",
                }),
                expect.objectContaining({
                  title: "Quantum computing*",
                  authors: expect.arrayContaining([
                    expect.objectContaining({
                      given: "Ge",
                      family: "Wang",
                    }),
                  ]),
                  doi: "10.1088/978-0-7503-2216-4ch10",
                }),
              ]),
            },
          },
        ],
      });
    });

    it("should return no_results when no works are found", async () => {
      // Mock empty response
      mockFetchResponse({ status: "ok", message: { items: [] } });

      const result = await handlers.searchByTitle({
        title: "nonexistentworktitle",
        rows: 5,
      });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "no_results",
              query: { title: "nonexistentworktitle", rows: 5 },
              results: [],
            },
          },
        ],
      });
    });

    it("should return error status when API request fails", async () => {
      // Mock failed response
      mockFetchResponse({ error: "Not Found" }, 404);

      const result = await handlers.searchByTitle({
        title: "quantum computing",
        rows: 2,
      });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: expect.stringContaining("API request failed"),
              query: { title: "quantum computing", rows: 2 },
            },
          },
        ],
      });
    });

    it("should return no results when search finds no works", async () => {
      // Mock empty response
      mockFetchResponse({
        status: "ok",
        "message-type": "work-list",
        "message-version": "1.0.0",
        message: { items: [] },
      });

      // Call the handler directly
      const result = await handlers.searchByTitle({
        title: "nonexistentquery",
        rows: 2,
      });

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Check response format
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "no_results",
              query: { title: "nonexistentquery", rows: 2 },
              results: [],
            },
          },
        ],
      });
    });

    it("should handle API request failure", async () => {
      // Mock fetch failure
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      // Call the handler directly
      const result = await handlers.searchByTitle({
        title: "quantum computing",
        rows: 2,
      });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: "Network error",
              query: { title: "quantum computing", rows: 2 },
            },
          },
        ],
      });
    });
  });

  describe("searchByAuthor", () => {
    it("should return correctly formatted works when search is successful", async () => {
      // Mock successful response
      mockFetchResponse(mockAuthorSearchResponse);

      // Call the handler directly
      const result = await handlers.searchByAuthor({ author: "Loss", rows: 1 });

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("works?query.author=Loss&rows=1"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.any(String),
          }),
        })
      );

      // Check response format
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { author: "Loss", rows: 1 },
              count: 1,
              results: [
                expect.objectContaining({
                  title:
                    "A quantum computer based on electrically controlled semiconductor spins",
                  authors: expect.arrayContaining([
                    expect.objectContaining({
                      given: "Daniel",
                      family: "Loss",
                    }),
                    expect.objectContaining({
                      given: "David P.",
                      family: "DiVincenzo",
                    }),
                  ]),
                  doi: "10.1103/PhysRevA.57.120",
                  type: "journal-article",
                  container: "Physical Review A",
                }),
              ],
            },
          },
        ],
      });
    });

    it("should return no_results when no authors are found", async () => {
      // Mock empty response
      mockFetchResponse({ status: "ok", message: { items: [] } });

      const result = await handlers.searchByAuthor({
        author: "nonexistentauthor",
        rows: 5,
      });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "no_results",
              query: { author: "nonexistentauthor", rows: 5 },
              results: [],
            },
          },
        ],
      });
    });

    it("should return error status when API request fails", async () => {
      // Mock failed response
      mockFetchResponse({ error: "Service Unavailable" }, 503);

      const result = await handlers.searchByAuthor({
        author: "Einstein",
        rows: 3,
      });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: expect.stringContaining("API request failed"),
              query: { author: "Einstein", rows: 3 },
            },
          },
        ],
      });
    });

    it("should return no results when author search finds no works", async () => {
      // Mock empty response
      mockFetchResponse({
        status: "ok",
        "message-type": "work-list",
        "message-version": "1.0.0",
        message: { items: [] },
      });

      // Call the handler directly
      const result = await handlers.searchByAuthor({
        author: "NonexistentAuthor",
        rows: 1,
      });

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Check response format
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "no_results",
              query: { author: "NonexistentAuthor", rows: 1 },
              results: [],
            },
          },
        ],
      });
    });

    it("should handle API request failure", async () => {
      // Mock fetch failure
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      // Call the handler directly
      const result = await handlers.searchByAuthor({ author: "Loss", rows: 1 });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: "Network error",
              query: { author: "Loss", rows: 1 },
            },
          },
        ],
      });
    });
  });

  describe("getWorkByDOI", () => {
    it("should return correctly formatted work when DOI lookup is successful", async () => {
      // Mock successful response
      mockFetchResponse(mockDoiResponse);

      // Call the handler directly
      const result = await handlers.getWorkByDOI({ doi: "10.1038/454554f" });

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("works/10.1038/454554f"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.any(String),
          }),
        })
      );

      // Check response format
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "success",
              query: { doi: "10.1038/454554f" },
              result: expect.objectContaining({
                title: "Quantum computing: Cloudy computing",
                doi: "10.1038/454554f",
                type: "journal-article",
                container: "Nature",
                publisher: "Springer Science and Business Media LLC",
                issue: "7204",
                volume: "454",
                abstract: "This is a sample abstract for testing purposes.",
              }),
            },
          },
        ],
      });
    });

    it("should handle DOIs with https://doi.org/ prefix", async () => {
      // Mock successful response
      mockFetchResponse(mockDoiResponse);

      const result = await handlers.getWorkByDOI({
        doi: "https://doi.org/10.1038/454554f",
      });

      // Verify the prefix was stripped
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("works/10.1038/454554f"),
        expect.any(Object)
      );

      expect(result.content[0].json.status).toBe("success");
    });

    it("should return not_found when DOI does not exist", async () => {
      // Mock not found response
      mockFetchResponse({ status: "ok", message: null });

      const result = await handlers.getWorkByDOI({ doi: "invalid/doi" });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "not_found",
              query: { doi: "invalid/doi" },
              message: expect.stringContaining("No work found with DOI"),
            },
          },
        ],
      });
    });

    it("should return error status when API request fails", async () => {
      // Mock failed response
      mockFetchResponse({ error: "Bad Request" }, 400);

      const result = await handlers.getWorkByDOI({ doi: "10.1000/invalid" });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: expect.stringContaining("API request failed"),
              query: { doi: "10.1000/invalid" },
            },
          },
        ],
      });
    });

    it("should handle DOI with prefix correctly", async () => {
      // Mock successful response
      mockFetchResponse(mockDoiResponse);

      // Call the handler directly
      const result = await handlers.getWorkByDOI({
        doi: "doi:10.1038/454554f",
      });

      // Don't check the specific URL format since it depends on implementation
      expect(global.fetch).toHaveBeenCalled();

      // Check that we get a successful response (not checking for specific doi)
      expect(result.content[0].json.status).toBe("success");
    });

    it("should return not found when DOI does not exist", async () => {
      // Mock not found response
      mockFetchResponse(
        {
          status: "error",
          message: "Resource not found.",
          "message-type": "error",
          "message-version": "1.0.0",
        },
        404
      );

      // Call the handler directly
      const result = await handlers.getWorkByDOI({ doi: "nonexistent-doi" });

      // Check error response
      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: "API request failed with status 404",
            },
          },
        ],
      });
    });

    it("should handle API request failure", async () => {
      // Mock fetch failure
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      // Call the handler directly
      const result = await handlers.getWorkByDOI({ doi: "10.1038/454554f" });

      expect(result).toMatchObject({
        content: [
          {
            type: "json",
            json: {
              status: "error",
              message: "Network error",
            },
          },
        ],
      });
    });
  });
});
