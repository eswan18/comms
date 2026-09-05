/**
 * The riso palette and type stacks, mirrored from haruspex's app/globals.css.
 *
 * That file is the source of truth. These are its `--riso-*` tokens converted
 * from oklch to sRGB hex, because no mail client understands oklch. Conversion
 * is Björn Ottosson's OKLCH -> OKLab -> linear sRGB -> sRGB; if the app's
 * edition changes, re-convert rather than eyeballing a near-enough hex.
 *
 * Deliberately a copy rather than a shared package. It is six values that
 * change about never (`--riso-red` is fixed across editions by design), and a
 * published package would make comms redeploy to follow an app's palette --
 * which is the coupling we were avoiding. Drift here shows up as an email that
 * looks slightly off, not as a breakage.
 *
 * `muted` and `rule` are not tokens in the app; there they come from
 * color-mix() against the ink, which Outlook does not support. They are
 * pre-blended to solid hex at the same ratios the sheets use.
 */
export const riso = {
  light: {
    paper: "#f7f0e9",
    ink: "#211512",
    red: "#c64449",
    redText: "#b3363d",
    muted: "#726864", // ink at 62% over paper
    rule: "#c8c0ba", //  ink at 22% over paper
  },
  dark: {
    paper: "#18110e",
    ink: "#eee6de",
    red: "#c64449",
    redText: "#e15957",
    muted: "#9d958f", // ink at 62% over paper
    rule: "#504844", //  ink at 26% over paper
  },
} as const;

/**
 * No webfonts. Archivo and Roboto Mono are what the app loads, but Gmail and
 * Outlook desktop drop @font-face entirely, and a remote font request also
 * leaks the open. Naming them first means they are used where already
 * installed, and the stack degrades to a system face everywhere else.
 */
export const fonts = {
  text: 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

/**
 * 640 rather than the 600 that email convention assumes: the old templates
 * read as a narrow column. Past ~640 Outlook's rendering and small phones both
 * start to suffer, so this is the wide end of safe, not an arbitrary bump.
 */
export const SHEET_WIDTH = 640;

/** Where the masthead and the footer both point. */
export const SITE_URL = "https://haruspex.fyi";
