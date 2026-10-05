"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, Check, ChevronDown, Info } from "lucide-react";

/**
 * Renders a plain-text product description as structured, styled content.
 *
 * Supported plain-text conventions (all optional — plain paragraphs still look good):
 *   - Blank line            → new paragraph
 *   - "- item" / "• item" / "1. item" / "✓ item" → bullet list with check icons
 *   - "Material: Leather"   → spec row (label / value table)
 *   - "Features:" or "## Features" → section heading
 *   - "**bold**"            → bold text
 */

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] }
  | { type: "specs"; rows: { label: string; value: string }[] }
  | { type: "heading"; text: string };

const BULLET_RE = /^\s*(?:[-*•●▪◦✓✔✅➤►→]|\d+[.)])\s+(.*)$/;
const MD_HEADING_RE = /^\s*#{1,3}\s+(.*)$/;
const SPEC_RE = /^\s*([^:.!?]{2,30}?)\s*[:：]\s+(.{1,80})$/;

const stripBold = (text: string) => text.replace(/^\*\*(.*)\*\*$/, "$1").trim();

const isHeading = (line: string) => {
  const t = line.trim();
  if (MD_HEADING_RE.test(t)) return true;
  // Short line that ends with a colon, e.g. "Key Features:"
  if (/^[^:]{2,50}[:：]$/.test(t)) return true;
  // Whole line in bold, e.g. "**Why you'll love it**"
  return /^\*\*[^*]{2,60}\*\*$/.test(t);
};

const headingText = (line: string) =>
  stripBold(line.trim().replace(MD_HEADING_RE, "$1").replace(/[:：]$/, ""));

export function parseDescription(text: string): Block[] {
  const blocks: Block[] = [];
  const last = () => blocks[blocks.length - 1];
  let breakBefore = true; // a blank line ends the current paragraph

  (text || "").replace(/\r\n?/g, "\n").split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      breakBefore = true;
      return;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      const prev = last();
      if (prev?.type === "list") prev.items.push(bullet[1]);
      else blocks.push({ type: "list", items: [bullet[1]] });
    } else if (isHeading(line)) {
      blocks.push({ type: "heading", text: headingText(line) });
    } else if (SPEC_RE.test(line)) {
      const [, label, value] = line.match(SPEC_RE)!;
      const prev = last();
      const row = { label: stripBold(label), value: value.trim() };
      if (prev?.type === "specs") prev.rows.push(row);
      else blocks.push({ type: "specs", rows: [row] });
    } else {
      const prev = last();
      if (prev?.type === "paragraph" && !breakBefore) prev.lines.push(line);
      else blocks.push({ type: "paragraph", lines: [line] });
    }
    breakBefore = false;
  });

  return blocks;
}

// Renders **bold** segments inside a line
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\*\*[^*]+\*\*$/.test(part) ? (
          <strong key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

function BlockView({ block, isFirst }: { block: Block; isFirst: boolean }) {
  switch (block.type) {
    case "heading":
      return (
        <h4 className="flex items-center gap-2 pt-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
          <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#FD0002] to-pink-500" />
          {block.text}
        </h4>
      );

    case "list":
      return (
        <ul className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-700 leading-relaxed">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FD0002] to-pink-500 shadow-sm">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "specs":
      return (
        <dl className="overflow-hidden rounded-lg border border-gray-100">
          {block.rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[minmax(80px,38%)_1fr] gap-2 px-3 py-2 text-[11px] sm:text-xs ${
                i % 2 === 0 ? "bg-gray-50/80" : "bg-white"
              }`}
            >
              <dt className="font-medium text-gray-500">{row.label}</dt>
              <dd className="font-semibold text-gray-900 break-words">
                <RichText text={row.value} />
              </dd>
            </div>
          ))}
        </dl>
      );

    default:
      return (
        <p
          className={`leading-relaxed ${
            isFirst
              ? "text-xs sm:text-[13px] text-gray-800 font-medium"
              : "text-[11px] sm:text-xs text-gray-600"
          }`}
        >
          {block.lines.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              <RichText text={line} />
            </React.Fragment>
          ))}
        </p>
      );
  }
}

interface ProductDescriptionProps {
  description?: string;
  features?: string[];
  title?: string;
  /** Collapse long descriptions behind a "Read more" toggle */
  collapsible?: boolean;
}

const COLLAPSE_CHARS = 420;

export default function ProductDescription({
  description = "",
  features = [],
  title = "Product Details",
  collapsible = true,
}: ProductDescriptionProps) {
  const blocks = useMemo(() => parseDescription(description), [description]);
  const highlights = (features || []).map((f) => f?.trim()).filter(Boolean);
  const [expanded, setExpanded] = useState(false);

  if (blocks.length === 0 && highlights.length === 0) return null;

  const isLong = collapsible && (description.length > COLLAPSE_CHARS || blocks.length > 4);
  const collapsed = isLong && !expanded;

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FD0002] via-pink-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-2">
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-pink-100 ring-1 ring-red-100">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FD0002]" />
        </span>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{title}</h3>
          <p className="text-[10px] sm:text-[11px] text-gray-400 leading-tight">Everything you need to know</p>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3.5 sm:px-4 pb-2">
          {highlights.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-gradient-to-r from-red-50 to-pink-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#FD0002]"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      {blocks.length > 0 && (
        <div className="relative px-3.5 sm:px-4 pb-3.5 sm:pb-4">
          <div
            className={`space-y-2.5 sm:space-y-3 transition-[max-height] duration-500 ease-in-out ${
              collapsed ? "max-h-40 overflow-hidden" : "max-h-none"
            }`}
          >
            {blocks.map((block, i) => (
              <BlockView key={i} block={block} isFirst={i === 0} />
            ))}
          </div>

          {collapsed && (
            <div className="pointer-events-none absolute inset-x-0 bottom-10 h-16 bg-gradient-to-t from-white to-transparent" />
          )}

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-white transition-all hover:bg-[#FD0002] hover:scale-105"
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Small formatting cheat-sheet shown under the admin description field */
export function DescriptionFormatHint() {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
      <p className="leading-relaxed">
        <span className="font-semibold text-gray-700">Formatting:</span> blank line = new paragraph ·{" "}
        <code className="rounded bg-white px-1 text-gray-700">- item</code> = bullet ·{" "}
        <code className="rounded bg-white px-1 text-gray-700">Material: Leather</code> = spec row ·{" "}
        <code className="rounded bg-white px-1 text-gray-700">Key Features:</code> = heading ·{" "}
        <code className="rounded bg-white px-1 text-gray-700">**bold**</code>
      </p>
    </div>
  );
}
