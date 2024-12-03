import { Outlet, useLocation } from "react-router";
import styles from "./Main.module.css";
import { useLayoutEffect, useRef } from "react";

const Main = () => {
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const element = ref.current;
      element.style.transition = "none";
      element.style.opacity = "0";

      setTimeout(() => {
        element.style.transition = "opacity 0.8s ease";
        element.style.opacity = "1";
      }, 16);
    }
  }, [pathname]);

  return (
    <main ref={ref} className={styles.main}>
      <Outlet />
    </main>
  );
};

export default Main;
