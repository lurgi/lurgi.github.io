import SyntaxHighlighter from "react-syntax-highlighter";
import { solarizedLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

type Language =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "terminal"
  | "bash"
  | "shell"
  | "html"
  | "css"
  | "python"
  | "java"
  | "c"
  | "cpp";

interface FancyCodeProps {
  children: string;
  className?: Language;
  meta?: string;
}

export default function FancyCode({ children, className }: FancyCodeProps) {
  const match = /language-(\w+)/.exec(className || "");

  return (
    <SyntaxHighlighter language={match?.[1]} style={solarizedLight} PreTag="div">
      {children}
    </SyntaxHighlighter>
  );
}
