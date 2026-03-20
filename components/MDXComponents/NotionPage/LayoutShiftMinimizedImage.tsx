/* eslint-disable @next/next/no-img-element */
"use client";

import { CSSProperties, useState, useLayoutEffect, useRef } from "react";

export default function LayoutShiftMinimizedImage({
  src,
  alt = "",
  style,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority, // 무시
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBookmarkThumbnail, setIsBookmarkThumbnail] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    const isBookmark =
      wrapperRef.current?.parentElement?.classList.contains(
        "notion-bookmark-image"
      ) ?? false;

    setIsBookmarkThumbnail(isBookmark);

    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      if (img.naturalWidth === 0) {
        setHasError(true);
        setIsLoaded(true);
      } else {
        setIsLoaded(true);
      }
      return;
    }

    const handleLoad = (event: Event) => {
      setIsLoaded(true);
      onLoad?.(
        event as unknown as React.SyntheticEvent<HTMLImageElement, Event>
      );
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(true);
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src, onLoad]);

  if (isBookmarkThumbnail && hasError) {
    return null;
  }

  const visibility: CSSProperties["visibility"] =
    isLoaded && !hasError ? "visible" : "hidden";

  const mergedStyle: CSSProperties = isBookmarkThumbnail
    ? {
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover" as const,
        visibility,
        ...style,
      }
    : {
        width: "100%",
        height: "auto",
        visibility,
        ...style,
      };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        height: isBookmarkThumbnail ? "100%" : undefined,
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        {...props}
        style={mergedStyle}
      />

      {!isLoaded && !hasError && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            minHeight: isBookmarkThumbnail ? "100%" : "200px",
            height: isBookmarkThumbnail ? "100%" : undefined,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid #e5e5e5",
              borderTop: "2px solid #6b7280",
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
      )}

      {hasError && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            minHeight: "200px",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            이미지를 불러올 수 없습니다
          </div>
        </div>
      )}
    </div>
  );
}
