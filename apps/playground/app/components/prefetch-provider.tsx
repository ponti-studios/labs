// Speculation Rules for native browser prefetching
// https://developer.chrome.com/docs/web-platform/prerender-pages

export function PrefetchProvider() {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          prerender: [
            {
              source: "list",
              urls: ["/projects", "/tasks", "/tarot", "/corona"],
            },
          ],
          prefetch: [
            {
              source: "document",
              where: {
                href_matches: "/*",
                selector_matches: "a[rel=prefetch]",
              },
              eagerness: "moderate",
            },
          ],
        }),
      }}
    />
  );
}
