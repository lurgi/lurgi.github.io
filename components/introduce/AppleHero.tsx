import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Introduce.module.scss";

const posterSrc = "/statics/apple-hero-poster.webp";
const spriteSrc = "/statics/apple-hero-sprite.webp";
const spriteMedia =
  "(scripting: enabled) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const spriteColumns = 4;
const frameCount = 13;
const duration = 480;
const spriteTimeout = 8_000;

type ImageState = "initial" | "loading" | "sprite" | "poster" | "failed";

export default function AppleHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageState, setImageState] = useState<ImageState>("initial");
  const [usePoster, setUsePoster] = useState(false);
  const spriteReady = imageState === "sprite";

  useEffect(() => {
    const image = imageRef.current!;
    const media = window.matchMedia(spriteMedia);
    const spriteUrl = new URL(spriteSrc, document.baseURI).href;
    const posterUrl = new URL(posterSrc, document.baseURI).href;
    let attempt = 0;
    let decoding = false;
    let timeout: number | undefined;

    const wantsSprite = () => !usePoster && media.matches;
    const expectedUrl = () => (wantsSprite() ? spriteUrl : posterUrl);

    function showPoster() {
      attempt++;
      window.clearTimeout(timeout);
      setImageState("loading");
      setUsePoster(true);
    }

    function handleError() {
      if (image.currentSrc && image.currentSrc !== expectedUrl()) return;
      if (wantsSprite()) showPoster();
      else setImageState("failed");
    }

    function handleLoad() {
      if (image.currentSrc !== expectedUrl() || image.naturalWidth === 0)
        return;
      if (!wantsSprite()) {
        setImageState("poster");
        return;
      }
      if (decoding) return;

      decoding = true;
      const decodingAttempt = attempt;
      void image.decode().then(
        () => {
          if (decodingAttempt !== attempt || !wantsSprite()) return;
          window.clearTimeout(timeout);
          setImageState("sprite");
        },
        () => {
          if (decodingAttempt === attempt && wantsSprite()) showPoster();
        }
      );
    }

    function checkImage() {
      attempt++;
      decoding = false;
      window.clearTimeout(timeout);
      if (wantsSprite()) timeout = window.setTimeout(showPoster, spriteTimeout);
      if (!image.complete || image.currentSrc !== expectedUrl()) return;
      if (image.naturalWidth > 0) handleLoad();
      else handleError();
    }

    function handleMediaChange() {
      setImageState("loading");
      checkImage();
    }

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (!usePoster) media.addEventListener("change", handleMediaChange);
    checkImage();

    return () => {
      attempt++;
      window.clearTimeout(timeout);
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      media.removeEventListener("change", handleMediaChange);
    };
  }, [usePoster]);

  useLayoutEffect(() => {
    if (!spriteReady) return;
    const hero = heroRef.current!;
    const image = imageRef.current!;
    let position = 0;
    let target = 0;
    let lastTime = 0;
    let request: number | null = null;

    function tick(now: number) {
      const distance = target - position;
      const step = Math.min(Math.abs(distance), now - lastTime);
      position += Math.sign(distance) * step;
      lastTime = now;

      const frame = Math.round((position / duration) * (frameCount - 1));
      const column = frame % spriteColumns;
      const row = Math.floor(frame / spriteColumns);
      image.style.transform = `translate(${-column * 25}%, ${-row * 25}%)`;
      request = position === target ? null : window.requestAnimationFrame(tick);
    }

    function playTo(nextTarget: number) {
      target = nextTarget;
      if (request === null && position !== target) {
        lastTime = performance.now();
        request = window.requestAnimationFrame(tick);
      }
    }

    function enter(event: PointerEvent) {
      if (event.pointerType !== "touch") playTo(duration);
    }

    function leave(event: PointerEvent) {
      if (event.pointerType !== "touch") playTo(0);
    }

    hero.addEventListener("pointerenter", enter);
    hero.addEventListener("pointerleave", leave);
    if (hero.matches(":hover")) playTo(duration);

    return () => {
      if (request !== null) window.cancelAnimationFrame(request);
      hero.removeEventListener("pointerenter", enter);
      hero.removeEventListener("pointerleave", leave);
      image.style.removeProperty("transform");
    };
  }, [spriteReady]);

  return (
    <div ref={heroRef} className={styles.hero}>
      <picture data-sprite-candidate={!usePoster}>
        {!usePoster && <source media={spriteMedia} srcSet={spriteSrc} />}
        {/* Keep the native image so the browser selects the source in the initial HTML. */}
        <img
          ref={imageRef}
          className={styles.heroImage}
          data-image={imageState}
          src={posterSrc}
          alt="흰 배경 위의 초록 사과"
          width={480}
          height={640}
          fetchPriority="high"
          draggable={false}
        />
      </picture>
    </div>
  );
}
