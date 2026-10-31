import { Heading, Hr, Link, Text } from "@react-email/components";
import { marked, type Token, type Tokens } from "marked";
import * as React from "react";
import { riso, fonts } from "./theme.js";

/**
 * The body of an admin-written email, as markdown.
 *
 * Rendered from marked's tokens into React elements rather than through
 * marked's HTML (or @react-email/markdown, which is that HTML plus inline
 * styles). Going through React means every piece of text is escaped by
 * construction, and only the elements below can appear at all: raw HTML is
 * printed as the text it is, and a link whose scheme is not http(s) or mailto
 * is printed as its words. It also lets each element carry the hx-* classes
 * the dark edition hangs on, which inline styles alone cannot.
 *
 * `breaks: true` keeps a single line break as a line break, as the plain-text
 * body always did: without it "Thanks,\nEthan" would run together. haruspex's
 * preview parses with the same options, so what the admin previews is what
 * this renders.
 *
 * Only for text an admin wrote. Anything a member can write (a prop's claim)
 * stays plain: rendering it would let any member put a formatted link in mail
 * that goes to a whole competition.
 */
export const MARKDOWN_OPTIONS = { gfm: true, breaks: true } as const;

export function MarkdownBody({ source }: { source: string }) {
  const tokens = marked.lexer(source, MARKDOWN_OPTIONS);
  return <>{blocks(tokens)}</>;
}

function blocks(tokens: Token[]): React.ReactNode[] {
  return tokens.map((token, i) => block(token, i));
}

function block(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case "space":
      return null;
    case "paragraph":
      return (
        <Text key={key} className="hx-text" style={text}>
          {inlines((token as Tokens.Paragraph).tokens)}
        </Text>
      );
    case "heading": {
      const { depth, tokens } = token as Tokens.Heading;
      // Two sizes are plenty in a letter: # and ## are a section, anything
      // deeper a subsection. Neither is as large as a template's own title.
      const major = depth <= 2;
      return (
        <Heading
          key={key}
          as={major ? "h2" : "h3"}
          className="hx-heading"
          style={major ? h2 : h3}
        >
          {inlines(tokens)}
        </Heading>
      );
    }
    case "list": {
      const { ordered, start, items } = token as Tokens.List;
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className="hx-text"
          style={list}
          start={ordered && typeof start === "number" ? start : undefined}
        >
          {items.map((item, j) => (
            <li key={j} style={listItem}>
              {listItemContent(item)}
            </li>
          ))}
        </Tag>
      );
    }
    case "blockquote":
      return (
        <div key={key} className="hx-quote" style={quote}>
          {blocks((token as Tokens.Blockquote).tokens)}
        </div>
      );
    case "hr":
      return <Hr key={key} className="hx-hairline" style={rule} />;
    case "code":
      return (
        <Text key={key} className="hx-text" style={codeBlock}>
          {(token as Tokens.Code).text}
        </Text>
      );
    case "text": {
      // A bare text block, which marked produces inside tight list items.
      const t = token as Tokens.Text;
      return (
        <React.Fragment key={key}>
          {t.tokens ? inlines(t.tokens) : t.text}
        </React.Fragment>
      );
    }
    default:
      // html, table, and anything else: printed as typed.
      return (
        <Text key={key} className="hx-text" style={text}>
          {token.raw.trim()}
        </Text>
      );
  }
}

/** A tight item is inline text; a loose one, or one holding a list, is blocks. */
function listItemContent(item: Tokens.ListItem): React.ReactNode {
  return item.tokens.map((token, i) => {
    if (token.type === "text") {
      const t = token as Tokens.Text;
      return (
        <React.Fragment key={i}>
          {t.tokens ? inlines(t.tokens) : t.text}
        </React.Fragment>
      );
    }
    if (token.type === "paragraph") {
      // Inside an item a paragraph is just its words; a Text's margins would
      // open a gap after every bullet.
      return (
        <React.Fragment key={i}>
          {inlines((token as Tokens.Paragraph).tokens)}
        </React.Fragment>
      );
    }
    return block(token, i);
  });
}

function inlines(tokens: Token[] | undefined): React.ReactNode[] {
  return (tokens ?? []).map((token, i) => inline(token, i));
}

function inline(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case "text": {
      const t = token as Tokens.Text;
      return (
        <React.Fragment key={key}>
          {t.tokens ? inlines(t.tokens) : t.text}
        </React.Fragment>
      );
    }
    case "escape":
      return (token as Tokens.Escape).text;
    case "strong":
      return <strong key={key}>{inlines((token as Tokens.Strong).tokens)}</strong>;
    case "em":
      return <em key={key}>{inlines((token as Tokens.Em).tokens)}</em>;
    case "del":
      return <del key={key}>{inlines((token as Tokens.Del).tokens)}</del>;
    case "codespan":
      return (
        <code key={key} style={codeInline}>
          {(token as Tokens.Codespan).text}
        </code>
      );
    case "br":
      return <br key={key} />;
    case "link": {
      const { href, tokens } = token as Tokens.Link;
      const children = inlines(tokens);
      if (!isSafeHref(href)) return <React.Fragment key={key}>{children}</React.Fragment>;
      return (
        <Link key={key} href={href} className="hx-link" style={link}>
          {children}
        </Link>
      );
    }
    case "image":
      // No images in these emails: the alt text stands in.
      return (token as Tokens.Image).text;
    default:
      // Inline html and anything unforeseen: the characters as typed.
      return token.raw;
  }
}

/** http(s) and mailto only. Anything else is printed as its link text. */
export function isSafeHref(href: string): boolean {
  try {
    const { protocol } = new URL(href);
    return protocol === "https:" || protocol === "http:" || protocol === "mailto:";
  } catch {
    return false;
  }
}

const text = {
  fontFamily: fonts.text,
  fontSize: "16px",
  lineHeight: "26px",
  color: riso.light.ink,
  margin: "0 0 16px",
};

// A section opens with room above it, so the break reads before the words do.
const h2 = {
  fontFamily: fonts.text,
  fontSize: "21px",
  lineHeight: "28px",
  fontWeight: 700 as const,
  color: riso.light.ink,
  letterSpacing: "-0.01em",
  margin: "32px 0 10px",
};

const h3 = {
  ...h2,
  fontSize: "17px",
  lineHeight: "24px",
  margin: "24px 0 8px",
};

const list = {
  ...text,
  paddingLeft: "24px",
};

const listItem = { margin: "0 0 6px" };

const quote = {
  borderLeft: `2px solid ${riso.light.rule}`,
  paddingLeft: "16px",
  margin: "0 0 16px",
};

const rule = {
  borderTop: `1px solid ${riso.light.rule}`,
  borderBottom: "none",
  borderLeft: "none",
  borderRight: "none",
  margin: "24px 0",
};

const codeInline = {
  fontFamily: fonts.mono,
  fontSize: "14px",
};

const codeBlock = {
  ...text,
  fontFamily: fonts.mono,
  fontSize: "14px",
  lineHeight: "22px",
  whiteSpace: "pre-wrap" as const,
};

// Ink, not red: red is spoken for in this language ("this is you", "this
// failed"). The underline is what says link, as in the footer.
const link = {
  color: riso.light.ink,
  textDecoration: "underline" as const,
};
