# Crossref MCP Server

A Model Context Protocol (MCP) server for interacting with the Crossref API.

## Features

- Search works by title
- Search works by author
- Get work details by DOI

## Installation

```
{
  "mcpServers": {
    "crossref": {
      "command": "npx",
      "args": [
        "-y",
        "@botanicastudios/crossref-mcp"
      ]
    }
  }
}
```

## Usage

The server provides three main tools:

### 1. Search by Title

Search for works in Crossref by title:

```javascript
// Example: Search for works containing "quantum computing" in the title
{
  "title": "quantum computing",
  "rows": 5  // Optional, defaults to 5
}
```

### 2. Search by Author

Search for works in Crossref by author:

```javascript
// Example: Search for works by "Einstein"
{
  "author": "Einstein",
  "rows": 5  // Optional, defaults to 5
}
```

### 3. Get Work by DOI

Retrieve a specific work using its DOI:

```javascript
// Example: Get work with DOI "10.1088/1742-6596/1398/1/012023"
{
  "doi": "10.1088/1742-6596/1398/1/012023"
}
```

## Response Format

All responses are returned as structured JSON objects with the following format:

### For successful searches:

```json
{
  "status": "success",
  "query": {
    /* the original query parameters */
  },
  "count": 5,
  "results": [
    {
      "title": "Work title",
      "authors": [
        {
          "given": "First name",
          "family": "Last name",
          "name": "First name Last name"
        }
      ],
      "published": {
        "dateParts": [2023, 1, 15],
        "dateString": "2023-1-15"
      },
      "type": "journal-article",
      "doi": "10.xxxx/xxxxx",
      "url": "https://doi.org/10.xxxx/xxxxx",
      "container": "Journal Name",
      "publisher": "Publisher Name",
      "issue": "1",
      "volume": "42",
      "abstract": "This is the abstract of the work, if available."
    }
    // additional results...
  ]
}
```

### For single DOI lookup:

```json
{
  "status": "success",
  "query": { "doi": "10.xxxx/xxxxx" },
  "result": {
    // work details as shown above
  }
}
```

### For errors or no results:

```json
{
  "status": "error" | "no_results" | "not_found",
  "message": "Error message" | null,
  "query": { /* the original query parameters */ }
}
```

## Testing

The server comes with a comprehensive test suite using Vitest. Tests cover all available tools and include various scenarios including successful responses, empty results, and error handling.

### Running Tests

```
npm test
```

### Test Structure

The tests use Vitest's mocking capabilities to simulate Crossref API responses without making actual network requests. The test structure includes:

1. **Mock Data**: Sample responses for title searches, author searches, and DOI lookups
2. **Mock Handlers**: Testing versions of the handler functions in `mcp-server-test-handlers.js`
3. **Test Cases**: Tests for all tools covering:
   - Successful API responses
   - Empty result sets
   - Error handling and network failures

### Extending Tests

To add more test cases:

1. Add new mock data to the test file if needed
2. Create additional test cases in the relevant describe block
3. Use the `mockFetchResponse()` helper to simulate API responses

Example:

```javascript
it("should handle a new edge case", async () => {
  // Mock the response
  mockFetchResponse({
    // Your sample response data
  });

  // Call the handler
  const result = await handlers.searchByTitle({ title: "example" });

  // Assert the expected results
  expect(result).toMatchObject({
    // Expected response structure
  });
});
```
