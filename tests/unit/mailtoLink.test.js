'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { isMailtoUri, mailtoToComposeUrl } = require('../../app/mainAppWindow/mailtoLink');

// mailto: (RFC 6068) -> Outlook on the web compose deep link. The module is
// pure (no Electron imports), so the parsing is tested directly.

const WORK_URL = 'https://outlook.office.com/mail/';

function parse(url) {
  const parsed = new URL(url);
  return {
    origin: parsed.origin,
    path: parsed.pathname,
    params: Object.fromEntries(parsed.searchParams),
  };
}

describe('isMailtoUri', () => {
  it('matches the scheme case-insensitively', () => {
    assert.strictEqual(isMailtoUri('mailto:a@example.com'), true);
    assert.strictEqual(isMailtoUri('MAILTO:a@example.com'), true);
  });

  it('rejects anything else', () => {
    for (const value of ['https://outlook.office.com/mail/', 'mailto', '', null, undefined, 42]) {
      assert.strictEqual(isMailtoUri(value), false);
    }
  });
});

describe('mailtoToComposeUrl', () => {
  it('turns a single address into a compose link on the configured host', () => {
    const { origin, path, params } = parse(mailtoToComposeUrl('mailto:someone@example.com', WORK_URL));
    assert.strictEqual(origin, 'https://outlook.office.com');
    assert.strictEqual(path, '/mail/deeplink/compose');
    assert.deepStrictEqual(params, { to: 'someone@example.com' });
  });

  it('carries recipients, subject and body, percent-decoded', () => {
    const url = mailtoToComposeUrl(
      'mailto:a@example.com,b@example.com?cc=c%40example.com&bcc=d@example.com&subject=Hello%20there&body=Line%201%0ALine%202',
      WORK_URL,
    );
    assert.deepStrictEqual(parse(url).params, {
      to: 'a@example.com,b@example.com',
      cc: 'c@example.com',
      bcc: 'd@example.com',
      subject: 'Hello there',
      body: 'Line 1\nLine 2',
    });
  });

  it('keeps a literal plus sign rather than turning it into a space', () => {
    const url = mailtoToComposeUrl('mailto:first+tag@example.com?subject=1+1', WORK_URL);
    assert.deepStrictEqual(parse(url).params, { to: 'first+tag@example.com', subject: '1+1' });
  });

  it('merges to= headers with the address part and ignores unknown headers', () => {
    const url = mailtoToComposeUrl('mailto:a@example.com?TO=b@example.com&In-Reply-To=%3Cid%3E', WORK_URL);
    assert.deepStrictEqual(parse(url).params, { to: 'a@example.com,b@example.com' });
  });

  it('opens an empty compose window for a bare mailto:', () => {
    assert.strictEqual(
      mailtoToComposeUrl('mailto:', WORK_URL),
      'https://outlook.office.com/mail/deeplink/compose',
    );
  });

  it('composes on outlook.live.com for a personal-account app URL', () => {
    const { origin } = parse(mailtoToComposeUrl('mailto:a@example.com', 'https://outlook.live.com/mail/0/'));
    assert.strictEqual(origin, 'https://outlook.live.com');
  });

  it('falls back to outlook.office.com when the app URL is not an Outlook https host', () => {
    for (const appUrl of ['https://evil.example.com/', 'http://outlook.live.com/', 'not a url', undefined]) {
      assert.strictEqual(parse(mailtoToComposeUrl('mailto:a@example.com', appUrl)).origin, 'https://outlook.office.com');
    }
  });

  it('does not throw on malformed percent escapes', () => {
    const url = mailtoToComposeUrl('mailto:a@example.com?subject=100%', WORK_URL);
    assert.strictEqual(parse(url).params.subject, '100%');
  });

  it('rejects non-mailto input and oversized links', () => {
    assert.strictEqual(mailtoToComposeUrl('https://example.com', WORK_URL), null);
    assert.strictEqual(mailtoToComposeUrl(`mailto:${'a'.repeat(9000)}@example.com`, WORK_URL), null);
  });
});
