// Netlify Function: Visitors Counter
// GET /api/counter displays and increments the counter on the home page.
// POST /api/counter increments it for visits to other pages.

const { getStore } = require("@netlify/blobs");

const BASELINE = 230;
const STORE_NAME = "dazzle-site-metrics";
const COUNTER_KEY = "visitors";
const MAX_WRITE_ATTEMPTS = 32;

function jsonResponse(statusCode, body) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store, max-age=0",
  };

  return {
    statusCode,
    headers,
    body: statusCode === 204 ? "" : JSON.stringify(body),
  };
}

async function incrementCounter(store) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const entry = await store.getWithMetadata(COUNTER_KEY, {
      consistency: "strong",
      type: "json",
    });

    if (entry === null) {
      const result = await store.setJSON(
        COUNTER_KEY,
        BASELINE + 1,
        { onlyIfNew: true },
      );
      if (result.modified) return BASELINE + 1;
    } else {
      if (!Number.isSafeInteger(entry.data) || entry.data < BASELINE) {
        throw new Error("Stored visitor count is invalid");
      }
      if (typeof entry.etag !== "string" || entry.etag.length === 0) {
        throw new Error("Stored visitor count is missing its concurrency token");
      }

      const nextCount = entry.data + 1;
      if (!Number.isSafeInteger(nextCount)) {
        throw new Error("Stored visitor count exceeds the safe integer range");
      }

      const result = await store.setJSON(
        COUNTER_KEY,
        nextCount,
        { onlyIfMatch: entry.etag },
      );
      if (result.modified) return nextCount;
    }

    await new Promise((resolve) => {
      const backoff = Math.min(5 * (attempt + 1), 100);
      setTimeout(resolve, backoff + Math.floor(Math.random() * 10));
    });
  }

  throw new Error("Could not update visitor count after repeated concurrent writes");
}

exports.handler = async (event) => {
  const method = event.httpMethod || "GET";
  if (method === "OPTIONS") return jsonResponse(204);
  if (method !== "GET" && method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const count = await incrementCounter(getStore(STORE_NAME));
    return jsonResponse(200, { count });
  } catch (error) {
    console.error("Visitor counter update failed:", error);
    return jsonResponse(503, { error: "Visitor counter is temporarily unavailable" });
  }
};
