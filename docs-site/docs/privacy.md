---
title: "Privacy & Data Protection"
description: What personal data Outlook for Linux does and does not handle, stated from verifiable facts about the source code.
---

<!-- Keep this statement in sync with the summary in the root PRIVACY.md. -->

Outlook for Linux is an unofficial, community-maintained desktop wrapper around Outlook on the web. This page states, in plain language, what personal data the application itself does and does not handle. Every statement here can be verified against the [source code](https://github.com/Taylor8484/outlook-for-linux).

:::info
This is a factual, technical description of how the application behaves. It is **not legal advice** and does not constitute a data-processing agreement. Responsibility for legal compliance in any particular deployment rests with the organisation operating the Microsoft 365 environment. See [Responsibility for your Outlook data](#responsibility-for-your-outlook-data).
:::

_Last reviewed: September 2026._

## 1. Who is responsible

- **Project:** Outlook for Linux
- **Maintainer:** Taylor Pike ([@Taylor8484](https://github.com/Taylor8484))
- **Repository:** https://github.com/Taylor8484/outlook-for-linux
- **Security / vulnerability reporting:** see [SECURITY.md](https://github.com/Taylor8484/outlook-for-linux/blob/develop-outlook/SECURITY.md)

Outlook for Linux is an independent open-source project and is **not affiliated with, endorsed by, or operated by Microsoft**. It is based on [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux), whose maintainers are not responsible for this project.

## 2. What this software is

Outlook for Linux is a desktop client that uses an Electron/WebView component to provide access to **Outlook on the web**. It acts solely as an access interface to Outlook, and to Microsoft's sign-in pages during authentication, and **is not an independent email or communications service**.

## 3. Privacy & data protection

- The application **does not collect, store, or transmit users' personal data on its own account**, and it has **no application-specific user accounts**.
- Beyond displaying the Outlook web interface, the application reads limited data from the page **locally on your device** to provide desktop-integration features: for example, passing a notification's title and body to your operating system's native notifications, and reading the unread count for the tray badge. This processing stays on your device, and **none of it is sent to the maintainer**.
- The maintainer **operates no servers and no backend infrastructure**. There is nowhere for the application to send your data to the maintainer, because no such service exists.

### Responsibility for your Outlook data

Any processing of personal data arising from your use of Outlook is the responsibility of:

- **Microsoft Corporation**, as the provider of the Outlook service; and
- **the organisation that owns the Microsoft 365 environment** you sign in to (your employer or institution, and its IT administration), where applicable.

Responsibility for that data lies with those parties. Outlook for Linux and its maintainer have **no access to, and no control over, that processing**.

## 4. Telemetry & tracking

The application contains **none** of the following:

- Usage telemetry
- Behavioural analytics
- User tracking or profiling
- Advertising
- Usage or crash statistics sent to the maintainer

No usage statistics are sent to the maintainer, because the maintainer operates no server to receive them. In addition, the application **actively blocks a set of Microsoft telemetry/beacon hosts** that are not required for the web app to function.

This reflects the application's behaviour as of the review date shown above.

## 5. Network communications

The application makes network connections only for the following purposes:

1. **Outlook** — accessing Outlook on the web (its core function).
2. **Microsoft sign-in** — the Microsoft authentication endpoints required to log in, plus any third-party identity provider your organisation federates sign-in to.
3. **Application updates** — a version check against this project's [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases). This runs **only in the AppImage build**; it checks whether a newer version exists and **never downloads or installs anything without an explicit user action**. The deb, rpm, and tar.gz packages do **not** perform this check. This check never contacts maintainer-operated infrastructure, because the maintainer operates none.

If you configure a proxy server, traffic is routed through the proxy **you** specify.

The application does **not** transmit information to any infrastructure managed by the maintainer.

## 6. Local data storage

The following are stored **locally on your own device** and are not transmitted to the maintainer:

- Application configuration (under `~/.config/outlook-for-linux/`). See the [Configuration reference](configuration.md).
- The Outlook web app's own cache, cookies, and session/local storage, managed by the embedded Chromium engine as any browser would.
- No passwords. The optional SSO password pre-fill never stores a password: it runs a command **you** configure (for example, a password manager's CLI) each time a sign-in form needs one.
- Application logs, written locally, with personally identifiable information sanitised.

## 7. Source code & auditing

The complete source code is publicly available at **https://github.com/Taylor8484/outlook-for-linux**.

Any organisation may review the source to independently verify:

- the data handling described here;
- the absence of maintainer telemetry;
- the network communications the application performs; and
- the security measures implemented (see the [Security Architecture](development/security-architecture.md)).

## 8. Licence

Outlook for Linux is distributed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**. The full terms are in [LICENSE.md](https://github.com/Taylor8484/outlook-for-linux/blob/develop-outlook/LICENSE.md). As stated in that licence, the software is provided **"as is", without warranty of any kind**.

## 9. Disclaimer

The maintainer is not responsible for the availability, operation, or data processing carried out by Outlook or by any third-party service accessed through it. Outlook for Linux provides access to Outlook; it does not alter, and does not assume responsibility for, how Microsoft or your organisation processes your data.
