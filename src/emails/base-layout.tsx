import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";
import { riso, fonts, SHEET_WIDTH, SITE_URL } from "./theme.js";

/**
 * The shared riso sheet every haruspex email is printed on.
 *
 * Two rules govern everything here.
 *
 * First, colour is declared TWICE: once inline for the light edition, and once
 * in a <style> block for the dark one. That is not redundancy. React Email
 * inlines styles, and an inline style cannot be overridden by a media query --
 * so the dark rules have to arrive as classes with !important. Clients that
 * strip <style> (a real thing) still get a complete light design; clients that
 * keep it get the dark edition when the reader's system asks for one.
 *
 * Second, dark mode is best-effort by nature. Apple Mail and Outlook.com honour
 * prefers-color-scheme. Gmail -- web and both apps -- ignores it and applies its
 * own auto-darkening instead. The color-scheme meta tags below ask Gmail to
 * leave a declared palette alone; it often obliges and sometimes does not. A
 * Gmail reader seeing a recoloured version of this is expected, not a bug.
 */
const darkCss = `
@media (prefers-color-scheme: dark) {
  .hx-body, .hx-sheet { background-color: ${riso.dark.paper} !important; }
  .hx-heading, .hx-text { color: ${riso.dark.ink} !important; }
  .hx-masthead { border-bottom-color: ${riso.dark.ink} !important; }
  .hx-kicker, .hx-footer, .hx-footer-link { color: ${riso.dark.muted} !important; }
  .hx-hairline { border-top-color: ${riso.dark.rule} !important; }
  .hx-action {
    background-color: ${riso.dark.ink} !important;
    color: ${riso.dark.paper} !important;
  }
}
`;

interface BaseLayoutProps {
  children: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
}

export function BaseLayout({ children, actionUrl, actionLabel }: BaseLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style dangerouslySetInnerHTML={{ __html: darkCss }} />
      </Head>
      <Body className="hx-body" style={body}>
        <Container className="hx-sheet" style={sheet}>
          {/* The masthead: a kicker over a 2px ink rule. In the app a 2px rule
              opens a section and a hairline separates two items; the same two
              weights carry the same two meanings here. */}
          <Section className="hx-masthead" style={masthead}>
            <Link className="hx-kicker" href={SITE_URL} style={kicker}>
              Haruspex
            </Link>
          </Section>

          {children}

          {actionUrl && (
            <Link className="hx-action" href={actionUrl} style={action}>
              {actionLabel ?? "View"}
            </Link>
          )}

          <Hr className="hx-hairline" style={hairline} />
          <Text className="hx-footer" style={footer}>
            Sent by Haruspex &middot;{" "}
            <Link className="hx-footer-link" href={SITE_URL} style={footerLink}>
              haruspex.fyi
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Heading and body type for the templates, so a template carries content and
 * nothing else. Anything with its own inline colour would also need its own
 * dark-mode class, which is exactly the duplication this avoids.
 */
export function SheetHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h1" className="hx-heading" style={heading}>
      {children}
    </Heading>
  );
}

export function SheetText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Text className="hx-text" style={{ ...text, ...style }}>
      {children}
    </Text>
  );
}

const body = {
  backgroundColor: riso.light.paper,
  color: riso.light.ink,
  fontFamily: fonts.text,
  margin: "0",
  padding: "24px 12px",
};

const sheet = {
  backgroundColor: riso.light.paper,
  margin: "0 auto",
  padding: "0",
  maxWidth: `${SHEET_WIDTH}px`,
  width: "100%",
};

const masthead = {
  borderBottom: `2px solid ${riso.light.ink}`,
  paddingBottom: "8px",
  marginBottom: "28px",
};

const kicker = {
  fontFamily: fonts.mono,
  fontSize: "11px",
  lineHeight: "16px",
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  color: riso.light.muted,
  textDecoration: "none" as const,
  margin: "0",
  display: "inline-block" as const,
};

const heading = {
  fontFamily: fonts.text,
  fontSize: "28px",
  lineHeight: "34px",
  fontWeight: 700 as const,
  color: riso.light.ink,
  letterSpacing: "-0.01em",
  margin: "0 0 20px",
};

const text = {
  fontFamily: fonts.text,
  fontSize: "16px",
  lineHeight: "26px",
  color: riso.light.ink,
  margin: "0 0 16px",
};

const action = {
  display: "inline-block" as const,
  backgroundColor: riso.light.ink,
  color: riso.light.paper,
  fontFamily: fonts.mono,
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  padding: "14px 28px",
  textDecoration: "none" as const,
  // Square. Depth in this language is a hairline, never a shadow, and nothing
  // is rounded.
  borderRadius: "0",
  marginTop: "12px",
};

const hairline = {
  borderTop: `1px solid ${riso.light.rule}`,
  borderBottom: "none",
  borderLeft: "none",
  borderRight: "none",
  margin: "32px 0 12px",
};

/**
 * Both links carry an explicit colour rather than inheriting. Without one, a
 * client paints them its own link blue -- and several will autolink a bare
 * "haruspex.fyi" anyway, so the choice is between styling the link ourselves
 * and letting Gmail style it for us.
 *
 * The masthead reuses the kicker style and stays undecorated: it is a
 * wordmark, and underlining it reads as a mistake. The footer keeps its
 * underline, where it is doing the ordinary job of marking a URL.
 */
const footerLink = {
  color: riso.light.muted,
  textDecoration: "underline" as const,
};

const footer = {
  fontFamily: fonts.mono,
  fontSize: "11px",
  lineHeight: "16px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: riso.light.muted,
  margin: "0",
};
