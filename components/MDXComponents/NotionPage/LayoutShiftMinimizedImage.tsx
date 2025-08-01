/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function LayoutShiftMinimizedImage({
  src,
  alt = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority, // 무시
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          visibility: isLoaded && !hasError ? "visible" : "hidden",
          ...props.style,
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
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
            minHeight: "200px",
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
