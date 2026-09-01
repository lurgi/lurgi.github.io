import styles from "./Aside.module.scss";
import SelectedNotionPosts from "./SelectedNotionPosts";
import ExternalLinks from "@/components/externalLinks/ExternalLinks";

import Link from "next/link";
import { postTypes } from "@/src/data";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { SelectedNotionPost } from "@/utils/getSelectedNotionPosts";

const HEADER_VISIBILITY_SCROLL_Y = 100;
const HEADER_HIDE_DISTANCE = 48;
const HEADER_SHOW_DISTANCE = 32;

type ScrollDirection = "up" | "down" | null;

function getClampedScrollY() {
  const maxScrollY = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0
  );

  return Math.min(Math.max(window.scrollY, 0), maxScrollY);
}

interface AsideProps {
  selectedNotionPosts?: SelectedNotionPost[];
}

export default function Aside({ selectedNotionPosts }: AsideProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const postType = router.query.postType as string | undefined;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const directionStartYRef = useRef(0);
  const scrollDirectionRef = useRef<ScrollDirection>(null);
  const isHiddenRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateHeader = () => {
      animationFrameId = null;

      const currentScrollY = getClampedScrollY();
      const previousScrollY = lastScrollYRef.current;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY <= HEADER_VISIBILITY_SCROLL_Y) {
        if (isHiddenRef.current) {
          isHiddenRef.current = false;
          setIsHidden(false);
        }

        scrollDirectionRef.current = null;
        directionStartYRef.current = currentScrollY;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY === previousScrollY) {
        return;
      }

      const nextDirection: Exclude<ScrollDirection, null> =
        currentScrollY > previousScrollY ? "down" : "up";

      if (scrollDirectionRef.current !== nextDirection) {
        scrollDirectionRef.current = nextDirection;
        directionStartYRef.current = currentScrollY;
      } else if (
        Math.abs(currentScrollY - directionStartYRef.current) >=
        (nextDirection === "down" ? HEADER_HIDE_DISTANCE : HEADER_SHOW_DISTANCE)
      ) {
        const shouldHide = nextDirection === "down";

        if (isHiddenRef.current !== shouldHide) {
          isHiddenRef.current = shouldHide;
          setIsHidden(shouldHide);
        }

        directionStartYRef.current = currentScrollY;
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(updateHeader);
      }
    };

    const initialScrollY = getClampedScrollY();
    lastScrollYRef.current = initialScrollY;
    directionStartYRef.current = initialScrollY;
    setIsScrolled(initialScrollY > 20);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <aside
      className={`${styles.aside} ${isScrolled ? styles.scrolled : ""} ${isHidden ? styles.hidden : ""}`}
    >
      <nav className={styles.nav}>
        <ul className={styles["category-container"]}>
          <li>
            <Link href={"/"}>
              <div
                className={
                  pathname === "/" ? styles["link-text-highlight"] : undefined
                }
              >
                Lurgi
              </div>
            </Link>
          </li>
          {postTypes.map((type) => (
            <li key={type}>
              <Link href={`/${type}`}>
                <div
                  className={
                    postType === type
                      ? styles["link-text-highlight"]
                      : undefined
                  }
                >
                  {type}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <SelectedNotionPosts posts={selectedNotionPosts} />

        <ExternalLinks className={styles["aside-external-links"]} />
      </nav>
    </aside>
  );
}
