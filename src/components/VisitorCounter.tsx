"use client";

import { useEffect, useState } from "react";

/**
 * Total page views, tracked server-side in DynamoDB via a small
 * public Lambda Function URL (this site has no other backend --
 * everything else runs entirely client-side). Increments once per
 * page load, every load, with no dedup -- a classic "hit counter,"
 * not a unique-visitor count. Fails silently (renders nothing) if the
 * request errors, since this is a nice-to-have, not core
 * functionality, and a broken counter shouldn't ever be visible to
 * users as an error.
 */
const COUNTER_URL = "https://hf2immk2wijulvkkktxtr6k5by0noezi.lambda-url.us-east-1.on.aws/";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTER_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((data: { count: number }) => {
        if (!cancelled) setCount(data.count);
      })
      .catch(() => {
        // silently ignore -- see file header
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <>
      <span className="mx-2">·</span>
      <span>{count.toLocaleString()} page views</span>
    </>
  );
}
