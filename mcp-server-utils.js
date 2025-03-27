// Function to format works for JSON output
export const formatWorkToJson = (work) => {
  if (!work) return { error: "No data available" };

  return {
    title: work.title?.[0] || null,
    authors: work.author
      ? work.author.map((a) => ({
          given: a.given || null,
          family: a.family || null,
          name: `${a.given || ""} ${a.family || ""}`.trim(),
        }))
      : [],
    published: work.published
      ? {
          dateParts: work.published["date-parts"]?.[0] || [],
          dateString: work.published["date-parts"]?.[0]?.join("-") || null,
        }
      : null,
    type: work.type || null,
    doi: work.DOI || null,
    url: work.URL || null,
    container: work["container-title"]?.[0] || null,
    publisher: work.publisher || null,
    issue: work.issue || null,
    volume: work.volume || null,
    abstract: work.abstract || null,
  };
};
