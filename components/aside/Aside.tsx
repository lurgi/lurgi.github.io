import styles from "./Aside.module.scss";
import LinkedInIcon from "@/public/linkedin.svg";
import GithubIcon from "@/public/github.svg";
import BrunchIcon from "@/public/brunch.svg";

import Link from "next/link";
import { postTypes } from "@/src/data";
import { useRouter } from "next/router";

const LINK = {
  github: {
    href: "https://github.com/lurgi",
    icon: <GithubIcon />,
  },
  linkedIn: {
    href: "https://www.linkedin.com/in/lurgi/",
    icon: <LinkedInIcon />,
  },
  brunchStory: {
    href: "https://brunch.co.kr/@lurgi",
    icon: <BrunchIcon />,
  },
} as const;

const LINK_TYPES = Object.keys(LINK) as (keyof typeof LINK)[];

export default function Aside() {
  const router = useRouter();
  const pathname = router.pathname;
  const postType = router.query.postType as string | undefined;

  return (
    <aside className={styles.aside}>
      <nav>
        <ul>
          <li>
            <Link href={"/"}>
              <p className={pathname === "/" ? styles["link-text-highlight"] : undefined}>Park Jeong Woo (lurgi)</p>
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
              <a className={styles["hyper-link"]} href={href} target="_blank">
                {icon}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
