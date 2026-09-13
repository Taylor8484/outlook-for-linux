# Outlook for Linux Documentation Site

This directory contains the Docusaurus-based documentation website for Outlook for Linux.

## Quick Start

```bash
# Install dependencies
npm ci

# Start development server
npm run start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## Deployment

The documentation is deployed to GitHub Pages by the `.github/workflows/docs.yml` workflow.

- **Production**: Pushes to the `develop-outlook` branch that touch `docs-site/**` automatically deploy to GitHub Pages
- **Manual**: The workflow can also be run on demand from the GitHub Actions tab (`workflow_dispatch`)
- **Pull requests**: Pull requests that touch `docs-site/**` run the workflow so build failures (for example broken links) are caught before merge

## Development

### Adding New Documentation
1. Create `.md` or `.mdx` files in the `docs/` directory
2. Update `sidebars.ts` to include new pages in navigation
3. Test locally with `npm run start`
4. Commit and push changes

### Customization
- **Theme**: Edit `src/css/custom.css` for styling changes
- **Configuration**: Modify `docusaurus.config.ts` for site settings
- **Navigation**: Update `sidebars.ts` for sidebar structure

## Architecture

```
docs-site/
├── docs/                 # Documentation pages (.md/.mdx)
├── src/
│   ├── components/       # React components (e.g. ConfigExplorer)
│   └── css/
│       └── custom.css    # Custom styling
├── static/               # Static assets
├── docusaurus.config.ts  # Main configuration
├── sidebars.ts           # Navigation structure
└── package.json          # Dependencies and scripts
```

## GitHub Pages Configuration

The site is configured to deploy to GitHub Pages with:
- **URL**: `https://taylor8484.github.io/outlook-for-linux/`
- **Source**: GitHub Actions deployment
- **Base URL**: `/outlook-for-linux/`

## Features

- ✅ Mobile-first responsive design
- ✅ Dark/light theme support
- ✅ Local search functionality with [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local)
- ✅ Accessibility features
- ✅ Outlook-inspired blue branding
- ✅ Mermaid diagram support
- ✅ Enhanced markdown with admonitions

## Performance

The site is optimized for:
- Fast loading times
- Mobile responsiveness
- SEO-friendly structure
- Accessibility compliance
