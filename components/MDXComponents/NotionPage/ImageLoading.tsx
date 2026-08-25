"use client";

interface ImageLoadingProps {
  aspectRatio?: number;
  isBookmarkThumbnail: boolean;
}

export default function ImageLoading({
  aspectRatio,
  isBookmarkThumbnail,
}: ImageLoadingProps) {
  const hasAspectRatio =
    typeof aspectRatio === "number" &&
    Number.isFinite(aspectRatio) &&
    aspectRatio > 0;

  return (
    <div
      className="image-skeleton"
      aria-hidden="true"
      style={{
        width: "100%",
        height: isBookmarkThumbnail ? "100%" : undefined,
        minHeight: isBookmarkThumbnail || hasAspectRatio ? undefined : "200px",
        aspectRatio:
          !isBookmarkThumbnail && hasAspectRatio ? aspectRatio : undefined,
        boxSizing: "border-box",
        backgroundColor: "#f1f3f5",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="image-skeleton-shimmer" />
      <style jsx>{`
        .image-skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: image-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes image-shimmer {
          to {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .image-skeleton-shimmer {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
