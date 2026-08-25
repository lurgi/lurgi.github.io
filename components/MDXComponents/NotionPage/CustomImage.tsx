/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CSSProperties,
  ImgHTMLAttributes,
  SyntheticEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ImageLoading from "./ImageLoading";

export interface CustomImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: number;
  priority?: boolean;
}

export default function CustomImage({
  src,
  alt = "",
  className,
  style,
  aspectRatio,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority,
  onLoad,
  onError,
  ...props
}: CustomImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBookmarkThumbnail, setIsBookmarkThumbnail] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    setIsBookmarkThumbnail(
      wrapperRef.current?.parentElement?.classList.contains(
        "notion-bookmark-image"
      ) ?? false
    );

    const img = imgRef.current;
    if (!img?.complete) {
      return;
    }

    setHasError(img.naturalWidth === 0);
    setIsLoaded(true);
  }, [src]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(false);
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(event);
  };

  if (isBookmarkThumbnail && hasError) {
    return null;
  }

  const imageStyle: CSSProperties = isBookmarkThumbnail
    ? {
        ...style,
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
        opacity: isLoaded && !hasError ? 1 : 0,
        position: isLoaded ? undefined : "absolute",
        inset: isLoaded ? undefined : 0,
        pointerEvents: isLoaded ? undefined : "none",
      }
    : {
        ...style,
        width: "100%",
        height: "auto",
        opacity: isLoaded && !hasError ? 1 : 0,
        position: isLoaded ? undefined : "absolute",
        inset: isLoaded ? undefined : 0,
        pointerEvents: isLoaded ? undefined : "none",
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
        className={`custom-image${className ? ` ${className}` : ""}`}
        {...props}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
      />
      <style jsx>{`
        .custom-image {
          transition: opacity 180ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .custom-image {
            transition: none;
          }
        }
      `}</style>

      {!isLoaded && !hasError && (
        <ImageLoading
          aspectRatio={aspectRatio}
          isBookmarkThumbnail={isBookmarkThumbnail}
        />
      )}

      {hasError && (
        <div
          style={{
            width: "100%",
            minHeight: aspectRatio ? undefined : "200px",
            aspectRatio,
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
