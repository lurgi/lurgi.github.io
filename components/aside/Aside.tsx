import styles from "./Aside.module.scss";
import LinkedInIcon from "@/public/linkedin.svg";
import GithubIcon from "@/public/github.svg";
import BrunchIcon from "@/public/brunch.svg";

import Link from "next/link";
import { postTypes } from "@/src/data";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";

const LINK = {
  github: {
    href: "https://github.com/lurgi",
    icon: <GithubIcon width={30} height={30} />,
  },
  linkedIn: {
    href: "https://www.linkedin.com/in/lurgi/",
    icon: <LinkedInIcon width={30} height={30} />,
  },
  brunchStory: {
    href: "https://brunch.co.kr/@lurgi",
    icon: <BrunchIcon width={30} height={30} />,
  },
} as const;

const LINK_TYPES = Object.keys(LINK) as (keyof typeof LINK)[];

export default function Aside() {
  const router = useRouter();
  const pathname = router.pathname;
  const postType = router.query.postType as string | undefined;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useLayoutEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const SCROLL_THRESHOLD = 100; // 스크롤 임계값

      if (currentScrollY > SCROLL_THRESHOLD) {
        if (currentScrollY > lastScrollY) {
          // 스크롤 다운
          setIsHidden(true);
        } else {
          // 스크롤 업
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }

      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <aside className={`${styles.aside} ${isScrolled ? styles.scrolled : ""} ${isHidden ? styles.hidden : ""}`}>
      <nav className={styles.nav}>
        <ul className={styles["category-container"]}>
          <li>
            <Link href={"/"}>
              <p className={pathname === "/" ? styles["link-text-highlight"] : undefined}>Lurgi</p>
            </Link>
          </li>
          {postTypes.map((type) => (
            <li key={type}>
              <Link href={`/${type}`}>
                <p className={postType === type ? styles["link-text-highlight"] : undefined}>{type}</p>
              </Link>
            </li>
          ))}
        </ul>

        <ul className={styles["hyper-link-container"]}>
          {LINK_TYPES.map((type) => LINK[type]).map(({ href, icon }, idx) => (
            <li key={idx}>
              <a className={styles["hyper-link"]} href={href} target="_blank" rel="noopener noreferrer">
                {icon}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
