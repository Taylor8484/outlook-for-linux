# Changelog

## [2.1.1](https://github.com/Taylor8484/outlook-for-linux/compare/v2.1.0...v2.1.1) (2026-09-13)


### Bug Fixes

* fail passkey prompts fast when security key support is off ([4dd4bbe](https://github.com/Taylor8484/outlook-for-linux/commit/4dd4bbebdef847bc6bc849a0030af8fd5e0ece2e))

## [2.1.0](https://github.com/Taylor8484/outlook-for-linux/compare/v2.0.0...v2.1.0) (2026-09-13)


### Features

* open mailto: links in an Outlook compose window ([1d8ca56](https://github.com/Taylor8484/outlook-for-linux/commit/1d8ca56706fbcc7f1a2d93250c8f4ebc2bf7b8b7))


### Bug Fixes

* set desktopName so desktops match the window to its launcher ([17ad6e3](https://github.com/Taylor8484/outlook-for-linux/commit/17ad6e3b2a0b38635bee0d2d23e32d95234d7a08))


### CI/CD

* keep release-please green when no release PR is opened ([41860ce](https://github.com/Taylor8484/outlook-for-linux/commit/41860ceff09cd94f3a117d9b8a8213986b10d19f))

## 2.0.0 (2026-09-13)

First release of the re-forked outlook-for-linux.

### Features

* Rebased on [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) 2.21.0 (Electron 43)
* Multiple accounts through profiles
* FIDO2 security key and Intune single sign-on support
* Download notifications
* AppImage auto-update

### Removed

* Teams-only features: calls, screen sharing, MQTT, quick chat, custom backgrounds and stickers

### Earlier history

Changes before 2.0.0 are recorded in the
[teams-for-linux changelog](https://github.com/IsmaelMartinez/teams-for-linux/blob/main/CHANGELOG.md)
and in the original 2023
[outlook-for-linux fork](https://github.com/mahmoudbahaa/outlook-for-linux).
