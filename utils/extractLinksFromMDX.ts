/* eslint-disable @typescript-eslint/no-explicit-any */
import { visit } from "unist-util-visit";
import { remark } from "remark";
import remarkParse from "remark-parse";

export function extractLinksFromMDX(mdxContent: string): string[] {
  const links: string[] = [];
  const tree = remark().use(remarkParse).parse(mdxContent);

  visit(tree, "link", (node: any) => {
    if (node.url) {
      links.push(node.url);
    }
  });

  return links;
}
