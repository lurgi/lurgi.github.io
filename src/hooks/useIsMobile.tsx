import { useLayoutEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    function updateIsMobile() {
      setIsMobile(window.innerWidth <= 450);
    }

    window.addEventListener("resize", updateIsMobile);

    updateIsMobile();

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  return isMobile;
}
