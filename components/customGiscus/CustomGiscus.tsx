import { useEffect, useRef } from "react";

export default function Giscus({ postFileName }: { postFileName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = "light";

  useEffect(() => {
    const scriptElem = document.createElement("script");
    scriptElem.src = "https://giscus.app/client.js";
    scriptElem.async = true;
    scriptElem.crossOrigin = "anonymous";

    scriptElem.setAttribute("data-repo", "lurgi/lurgi.github.io");
    scriptElem.setAttribute("data-repo-id", "R_kgDONXhXsQ");
    scriptElem.setAttribute("data-category", "General");
    scriptElem.setAttribute("data-category-id", "DIC_kwDONXhXsc4ClDdL");
    scriptElem.setAttribute("data-mapping", "specific");
    scriptElem.setAttribute("data-term", postFileName);
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "0");
    scriptElem.setAttribute("data-input-position", "bottom");
    scriptElem.setAttribute("data-theme", theme);
    scriptElem.setAttribute("data-lang", "ko");

    ref?.current?.appendChild(scriptElem);
  }, [postFileName]);

  // https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#isetconfigmessage
  // useEffect(() => {
  //   const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  //   iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  // }, [theme]);

  return <section ref={ref} />;
}
