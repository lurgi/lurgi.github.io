import { Link } from "react-router";
import styles from "./Aside.module.css";
import { postTypes } from "../../data";

export default function Aside() {
  return (
    <aside className={styles.aside}>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>Park Jeong Woo</Link>
          </li>
          {postTypes.map((type) => (
            <li key={type}>
              <Link to={"/"}>{type}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
