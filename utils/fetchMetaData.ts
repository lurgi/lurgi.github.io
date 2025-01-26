import { JSDOM } from "jsdom";

export async function fetchMetadata(url: string) {
  if (typeof window !== "undefined") {
    throw new Error("fetchMetadata should not be called on the client.");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch URL");

    const html = await response.text();
    const dom = new JSDOM(html);
    const metaTags = dom.window.document.querySelectorAll("meta");

    const metadata: { title?: string; description?: string; image?: string } = {};

    metaTags.forEach((tag) => {
      if (tag.getAttribute("property") === "og:title") metadata.title = tag.getAttribute("content") || "";
      if (tag.getAttribute("property") === "og:description") metadata.description = tag.getAttribute("content") || "";
      if (tag.getAttribute("property") === "og:image") metadata.image = tag.getAttribute("content") || "";
    });

    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}
