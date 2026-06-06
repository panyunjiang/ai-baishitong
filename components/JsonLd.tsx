export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AI百事通",
          url: "https://bs.aiv.yn.cn",
          description: "AI百事通收录并评测各类AI工具，帮助你快速找到最适合的AI助手。",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://bs.aiv.yn.cn/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          url,
          image: image || "https://bs.aiv.yn.cn/og-default.png",
          datePublished,
          dateModified: dateModified || datePublished,
          publisher: {
            "@type": "Organization",
            name: "AI百事通",
            url: "https://bs.aiv.yn.cn",
          },
        }),
      }}
    />
  );
}

export function ToolJsonLd({
  name,
  description,
  url,
  rating,
}: {
  name: string;
  description: string;
  url: string;
  rating?: number;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name,
          description,
          url,
          applicationCategory: "AI Tool",
          operatingSystem: "Web",
          ...(rating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}
