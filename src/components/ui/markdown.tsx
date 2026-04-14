"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  readonly content: string;
  readonly className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose-sm max-w-none text-sm leading-relaxed",
        "prose-headings:mb-2 prose-headings:mt-3 prose-headings:font-semibold",
        "prose-h1:text-base prose-h2:text-sm prose-h3:text-sm",
        "prose-p:my-1.5 prose-p:leading-relaxed",
        "prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0",
        "prose-strong:font-semibold",
        "[&_a]:text-blue-400 [&_a]:underline-offset-2 [&_a:hover]:underline",
        "[&_table]:my-2 [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className: codeClass, children, ...rest } = props;
            const match = /language-(\w+)/.exec(codeClass || "");
            const text = String(children).replace(/\n$/, "");
            const isInline = !codeClass;

            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={text} language={match?.[1] ?? "text"} />;
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({
  code,
  language,
}: {
  readonly code: string;
  readonly language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative my-2 overflow-hidden rounded-md border border-border bg-zinc-950">
      <div className="flex items-center justify-between border-b border-border px-3 py-1 text-[10px] text-muted-foreground">
        <span className="font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "0.75rem",
          fontSize: "11px",
          background: "transparent",
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
