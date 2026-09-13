// Converts mailto: links (RFC 6068) into Outlook on the web compose deep links.
//
// Pure module with no Electron imports, so the parsing is unit tested directly
// (tests/unit/mailtoLink.test.js). The addresses, subject and body are user
// data: callers must not log the input or the result.

const OUTLOOK_HOSTS = new Set([
  "outlook.office.com",
  "outlook.office365.com",
  "outlook.cloud.microsoft",
  "outlook.live.com",
]);
const DEFAULT_ORIGIN = "https://outlook.office.com";
const COMPOSE_PATH = "/mail/deeplink/compose";
const MAILTO_PREFIX = "mailto:";
// Desktop environments hand over whatever link was clicked; cap it so a
// pathological argument cannot turn into an enormous navigation.
const MAX_MAILTO_LENGTH = 8192;

function isMailtoUri(value) {
  return (
    typeof value === "string" &&
    value.slice(0, MAILTO_PREFIX.length).toLowerCase() === MAILTO_PREFIX
  );
}

// Compose on the same Outlook host the app loads (work vs personal account),
// falling back to outlook.office.com for anything else.
function composeOriginFor(appUrl) {
  try {
    const { protocol, hostname, origin } = new URL(appUrl);
    if (protocol === "https:" && OUTLOOK_HOSTS.has(hostname)) return origin;
  } catch {
    // Not a URL; use the default origin.
  }
  return DEFAULT_ORIGIN;
}

// Percent-decode without treating "+" as a space: in mailto: a plus sign is a
// literal character (first+tag@example.com), unlike form encoding.
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function addAddresses(list, value) {
  for (const address of value.split(",")) {
    const trimmed = address.trim();
    if (trimmed) list.push(trimmed);
  }
}

/**
 * Builds the Outlook compose deep link for a mailto: URI.
 *
 * @param {string} mailto - The mailto: URI, e.g. "mailto:a@example.com?subject=Hi"
 * @param {string} appUrl - The configured Outlook URL, used to pick the host
 * @returns {string|null} The compose URL, or null when the input is not a usable mailto: URI
 */
function mailtoToComposeUrl(mailto, appUrl) {
  if (!isMailtoUri(mailto) || mailto.length > MAX_MAILTO_LENGTH) return null;

  const rest = mailto.slice(MAILTO_PREFIX.length);
  const queryIndex = rest.indexOf("?");
  const addressPart = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
  const queryPart = queryIndex === -1 ? "" : rest.slice(queryIndex + 1);

  const recipients = { to: [], cc: [], bcc: [] };
  let subject = "";
  let body = "";

  addAddresses(recipients.to, safeDecode(addressPart));
  for (const pair of queryPart.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const name = safeDecode(eq === -1 ? pair : pair.slice(0, eq)).toLowerCase();
    const value = eq === -1 ? "" : safeDecode(pair.slice(eq + 1));
    if (Object.hasOwn(recipients, name)) {
      addAddresses(recipients[name], value);
    } else if (name === "subject") {
      subject = value;
    } else if (name === "body") {
      body = value;
    }
    // Other headers (in-reply-to, keywords, ...) have no compose equivalent.
  }

  const params = new URLSearchParams();
  for (const [name, list] of Object.entries(recipients)) {
    if (list.length > 0) params.set(name, list.join(","));
  }
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  const query = params.toString();
  return `${composeOriginFor(appUrl)}${COMPOSE_PATH}${query ? `?${query}` : ""}`;
}

module.exports = { isMailtoUri, mailtoToComposeUrl };
