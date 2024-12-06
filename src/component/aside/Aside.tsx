import { Link } from "react-router";
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
  return (
    <aside className={styles.aside}>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>Park Jeong Woo (lurgi)</Link>
          </li>
          {postTypes.map((type) => (
            <li key={type}>
              <Link to={`/${type}`}>{type}</Link>
            </li>
          ))}
        </ul>
        <ul className={styles["hyper-link-container"]}>
          {LINK_TYPES.map((type) => LINK[type]).map(({ href, icon }, idx) => (
            <a key={idx} className={styles["hyper-link"]} href={href} target="_blank">
              {icon}
            </a>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
