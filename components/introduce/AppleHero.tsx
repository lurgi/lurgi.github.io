import {
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./Introduce.module.scss";

const posterSrc = "/statics/apple-hero-poster.webp";
const spriteSrc = "/statics/apple-hero-sprite.webp";
const spriteMedia =
  "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
const spriteColumns = 4;
const frameCount = 13;
const duration = 480;
const spriteTimeout = 8_000;

type ImageState = "initial" | "loading" | "sprite" | "poster" | "failed";

export default function AppleHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const position = useRef(0);
  const touchPointer = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [imageState, setImageState] = useState<ImageState>("initial");
  const [usePoster, setUsePoster] = useState(false);
  const spriteReady = imageState === "sprite";
  const active = hovered || pressed;

  function startPress(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || touchPointer.current !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    touchPointer.current = event.pointerId;
    setHovered(false);
    setPressed(true);
  }

  function endPress(event: PointerEvent<HTMLDivElement>) {
    if (touchPointer.current !== event.pointerId) return;
    touchPointer.current = null;
    setPressed(false);
  }

  useLayoutEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) {
      setHovered(heroRef.current!.matches(":hover"));
    }
  }, []);

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
    const image = imageRef.current!;
    if (!spriteReady) {
      position.current = 0;
      image.style.removeProperty("transform");
      return;
    }

    const target = active ? duration : 0;
    if (position.current === target) return;
    let lastTime = performance.now();
    let request: number;

    function tick(now: number) {
      const distance = target - position.current;
      const step = Math.min(Math.abs(distance), Math.max(0, now - lastTime));
      position.current += Math.sign(distance) * step;
      lastTime = now;

      const frame = Math.round(
        (position.current / duration) * (frameCount - 1)
      );
      const column = frame % spriteColumns;
      const row = Math.floor(frame / spriteColumns);
      image.style.transform = `translate(${-column * 25}%, ${-row * 25}%)`;
      if (position.current !== target)
        request = window.requestAnimationFrame(tick);
    }

    request = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(request);
  }, [active, spriteReady]);

  return (
    <div
      ref={heroRef}
      className={styles.hero}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(false);
      }}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onLostPointerCapture={endPress}
    >
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
