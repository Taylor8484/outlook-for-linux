import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Outlook for Linux documentation sidebar
  docsSidebar: [
    'index',
    'quick-reference',
    'privacy',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'installation',
        'uninstall',
        'configuration',
        'configuration-generated',
        'configuration-explorer',
        'multiple-instances',
        'intune-sso',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'certificate',
        'troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Developer Documentation',
      items: [
        'development/README',
        'development/contributing',
        {
          type: 'category',
          label: 'Development Guides',
          items: [
            'development/ipc-api',
            'development/log-config',
            'development/release-info',
          ],
        },
        {
          type: 'category',
          label: 'Architecture',
          items: [
            'development/module-index',
            'development/security-architecture',
          ],
        },
        {
          type: 'category',
          label: 'Architecture Decisions',
          items: [
            'development/adr/README',
            'development/adr/004-agents-md-standard-investigation',
            'development/adr/006-cli-argument-parsing-library',
            'development/adr/009-automated-testing-strategy',
            'development/adr/011-appimage-update-info',
            'development/adr/012-intune-sso-broker-compatibility',
            'development/adr/013-pii-log-sanitization',
            'development/adr/020-multi-account-profile-switcher',
            'development/adr/021-webauthn-fido2-linux',
            'development/adr/022-custom-notification-toast-scope',
            'development/adr/023-release-automation-tooling',
            'development/adr/024-smartcard-pkcs11-pin-dialog',
            'development/adr/025-config-option-naming-convention',
            'development/adr/026-performance-audit-outcomes',
            'development/adr/028-third-party-idp-otc-prefill',
            'development/adr/029-config-schema-single-source-of-truth',
            'development/adr/031-ozone-platform-x11-default',
          ],
        },
        {
          type: 'category',
          label: 'Research & Analysis',
          items: [
            'development/research/README',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
