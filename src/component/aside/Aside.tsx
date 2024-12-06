import { Link, useLocation } from "react-router";
import styles from "./Aside.module.scss";
import { postTypes } from "../../data";

import LinkedInIcon from "../../assets/linkedin.svg?react";
import GithubIcon from "../../assets/github.svg?react";

const LINK = {
  github: {
    href: "https://github.com/lurgi",
    icon: <GithubIcon width={30} height={30} />,
  },
  linkedIn: {
    href: "https://www.linkedin.com/in/lurgi/",
    icon: <LinkedInIcon width={34} height={34} />,
  },
} as const;

const LINK_TYPES = Object.keys(LINK) as (keyof typeof LINK)[];

export default function Aside() {
  const { pathname } = useLocation();

  return (
    <aside className={styles.aside}>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>
              <p className={pathname === "/" ? styles["link-text-highlight"] : undefined}>Park Jeong Woo (lurgi)</p>
            </Link>
          </li>
          {postTypes.map((type) => (
            <li key={type}>
              <Link to={`/${type}`}>
                <p className={pathname === `/${type}` ? styles["link-text-highlight"] : undefined}>{type}</p>
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
