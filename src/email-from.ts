/**
 * Resolves the From address for an outgoing email from the event's `source`.
 *
 * Services that own a verified sending domain get an override keyed on the
 * `source` their publisher sets; everything else falls back to the default in
 * EMAIL_FROM. Adding a service is a configmap edit, not a code change.
 */
export type EmailFromResolver = (source: string) => string;

const ENV_VAR = "EMAIL_FROM_OVERRIDES";

export function parseEmailFromOverrides(
  raw: string | undefined,
): Record<string, string> {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `${ENV_VAR} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      `${ENV_VAR} must be a JSON object mapping event source to From address`,
    );
  }

  const overrides: Record<string, string> = {};
  for (const [source, from] of Object.entries(parsed)) {
    if (typeof from !== "string" || from.trim() === "") {
      throw new Error(
        `${ENV_VAR} entry "${source}" must be a non-empty string`,
      );
    }
    overrides[source] = from;
  }
  return overrides;
}

export function createEmailFromResolver(
  defaultFrom: string,
  overrides: Record<string, string>,
): EmailFromResolver {
  // A source with no override is usually legitimate, but a publisher that
  // misspells its own source silently sends under another service's domain.
  // Warn once per source so the typo shows up without flooding the logs.
  const warned = new Set<string>();

  return (source: string): string => {
    const override = overrides[source];
    if (override) return override;

    if (!warned.has(source)) {
      warned.add(source);
      console.warn(
        `Source "${source}" has no ${ENV_VAR} entry; sending as ${defaultFrom}`,
      );
    }
    return defaultFrom;
  };
}
