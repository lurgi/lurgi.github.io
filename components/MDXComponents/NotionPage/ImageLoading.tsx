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
      style={{
        width: "100%",
        height: isBookmarkThumbnail ? "100%" : undefined,
        minHeight: isBookmarkThumbnail || hasAspectRatio ? undefined : "200px",
        aspectRatio:
          !isBookmarkThumbnail && hasAspectRatio ? aspectRatio : undefined,
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "2px solid #e5e5e5",
          borderTopColor: "#6b7280",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
