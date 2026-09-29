// Netlify Function: Visitors Counter
// Endpoint: GET /api/counter (called on every page visit)
// Increments a shared counter and returns the new value as JSON.
// Counter starts at 230 (CountAPI baseline offset).
//
// This is a Netlify Function (not Edge Function) for drag-and-drop deploy support.
// URL routing: /api/counter -> /.netlify/functions/counter (via _redirects proxy)

const COUNTER_API = "https://api.countapi.xyz/hit/dazzle-media/visitors";
const BASELINE = 230;

exports.handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store, max-age=0",
  };

  try {
    const res = await fetch(COUNTER_API);
    const data = await res.json();
    const count = (data.value ?? 0) + BASELINE;

    // For GET requests (home page display + non-home page increment)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    // If CountAPI is down, return the baseline count
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count: BASELINE, error: "CountAPI unavailable" }),
    };
  }
};