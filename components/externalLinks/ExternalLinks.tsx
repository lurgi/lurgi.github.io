import Image from "next/image";

import BrunchIcon from "@/public/brunch.svg";
import GithubIcon from "@/public/github.svg";
import LinkedInIcon from "@/public/linkedin.svg";

import styles from "./ExternalLinks.module.scss";

const LINKS = [
  {
    href: "https://github.com/lurgi",
    label: "GitHub",
    icon: <GithubIcon width={30} height={30} />,
  },
  {
    href: "https://www.linkedin.com/in/lurgi/",
    label: "LinkedIn",
    icon: <LinkedInIcon width={30} height={30} />,
  },
  {
    href: "https://brunch.co.kr/@lurgi",
    label: "Brunch Story",
    icon: <BrunchIcon width={30} height={30} />,
  },
] as const;

interface ExternalLinksProps {
  className?: string;
}

export default function ExternalLinks({ className }: ExternalLinksProps) {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <ul className={styles["social-links"]}>
        {LINKS.map(({ href, label, icon }) => (
          <li key={href}>
            <a
              className={styles.link}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              {icon}
            </a>
          </li>
        ))}
      </ul>

      <a
        className={`${styles.link} ${styles["oboksobok-link"]}`}
        href="https://oboksobok.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          className={styles["oboksobok-logo"]}
          src="/oboksobok-homepagelogo.png"
          alt="oboksobok"
          width={80}
          height={33}
        />
      </a>
    </div>
  );
}
