const NOTION_ORIGIN = "https://www.notion.so";
const NOTION_IMAGE_PATH = "/image";

interface NotionImageProxyOptions {
  pageId: string;
  table?: string;
}

function isNotionImageProxyUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "www.notion.so" || parsed.hostname === "notion.so") &&
      parsed.pathname === NOTION_IMAGE_PATH
    );
  } catch {
    return false;
  }
}

function isNotionHostedSignedUrl(url: string) {
  if (!url) {
    return false;
  }

  if (url.startsWith("attachment:")) {
    return true;
  }

  if (url.startsWith("/image") || url.startsWith("/images")) {
    return true;
  }

  if (isNotionImageProxyUrl(url)) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const isNotionS3Path = parsed.pathname.includes("secure.notion-static.com");
    const isNotionS3Host = parsed.hostname.includes("prod-files-secure.s3.");
    const hasAwsSignature =
      parsed.searchParams.has("X-Amz-Algorithm") &&
      parsed.searchParams.has("X-Amz-Signature");

    return isNotionS3Path || isNotionS3Host || hasAwsSignature;
  } catch {
    return false;
  }
}

function createNotionImageProxyUrl(
  imageUrl: string,
  { pageId, table = "block" }: NotionImageProxyOptions
) {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return null;
  }

  let proxySourceUrl = trimmed;
  if (proxySourceUrl.startsWith("/images")) {
    proxySourceUrl = `${NOTION_ORIGIN}${proxySourceUrl}`;
  }

  const notionImageUrl = proxySourceUrl.startsWith("/image")
    ? `${NOTION_ORIGIN}${proxySourceUrl}`
    : `${NOTION_ORIGIN}${NOTION_IMAGE_PATH}/${encodeURIComponent(proxySourceUrl)}`;

  const proxyUrl = new URL(notionImageUrl);
  proxyUrl.searchParams.set("table", table);
  proxyUrl.searchParams.set("id", pageId);
  proxyUrl.searchParams.set("cache", "v2");

  return proxyUrl.toString();
}

export function getOgImageUrlFromNotionSource(
  imageUrl: string | null,
  options: NotionImageProxyOptions
) {
  if (!imageUrl) {
    return null;
  }

  if (!isNotionHostedSignedUrl(imageUrl)) {
    return imageUrl;
  }

  return createNotionImageProxyUrl(imageUrl, options) || imageUrl;
}
