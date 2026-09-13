# Changelog

## [2.2.0](https://github.com/Taylor8484/outlook-for-linux/compare/v2.1.1...v2.2.0) (2026-09-13)


### Features

* open mailto: links in an Outlook compose window ([1d8ca56](https://github.com/Taylor8484/outlook-for-linux/commit/1d8ca56706fbcc7f1a2d93250c8f4ebc2bf7b8b7))


### Bug Fixes

* fail passkey prompts fast when security key support is off ([4dd4bbe](https://github.com/Taylor8484/outlook-for-linux/commit/4dd4bbebdef847bc6bc849a0030af8fd5e0ece2e))
* set desktopName so desktops match the window to its launcher ([17ad6e3](https://github.com/Taylor8484/outlook-for-linux/commit/17ad6e3b2a0b38635bee0d2d23e32d95234d7a08))
* set the package author email required for deb and rpm builds ([e2c42cb](https://github.com/Taylor8484/outlook-for-linux/commit/e2c42cb1984db951a0fb7c94965baeec1df73415))


### CI/CD

* keep release-please green when no release PR is opened ([41860ce](https://github.com/Taylor8484/outlook-for-linux/commit/41860ceff09cd94f3a117d9b8a8213986b10d19f))


### Maintenance

* bootstrap release-please at the 2.0.0 re-fork ([24a4211](https://github.com/Taylor8484/outlook-for-linux/commit/24a4211815c232861e1949bab6cee0cf2164734c))
* **develop-outlook:** release 2.1.0 ([#1](https://github.com/Taylor8484/outlook-for-linux/issues/1)) ([fdf25f1](https://github.com/Taylor8484/outlook-for-linux/commit/fdf25f18254348309c6ddadc7096ed881441ffb3))
* **develop-outlook:** release 2.1.1 ([#2](https://github.com/Taylor8484/outlook-for-linux/issues/2)) ([807860f](https://github.com/Taylor8484/outlook-for-linux/commit/807860f2900c1aee56b464d40dafcac2aec1d512))

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
