"use client";

import { useState } from "react";

const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' fill='%23e2e8f0'%3E%3Crect width='800' height='400'/%3E%3Ctext x='400' y='200' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='24' font-family='system-ui'%3E📰 AI百事通%3C/text%3E%3C/svg%3E";

export default function CoverImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}
