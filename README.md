# Brand Guidelines Documentation Site

A documentation site built with [11ty (Eleventy)](https://www.11ty.dev/) and [Web Awesome](https://webawesome.com/) components, styled to match the Web Awesome demo page aesthetic.

## Features

- 🎨 Built with Web Awesome components and utilities
- 📱 Responsive design
- 🚀 Fast static site generation with 11ty
- ♿ Accessible components
- 🎯 Modern, clean design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run serve
```

The site will be available at `http://localhost:8080`

### Building for Production

To build the static site:

```bash
npm run build
```

The output will be in the `_site` directory.

## Project Structure

```
.
├── src/                    # Source files
│   ├── _includes/         # Templates and layouts
│   │   └── layouts/       # Layout templates
│   ├── assets/            # CSS, JS, and other assets
│   │   ├── css/           # Stylesheets
│   │   └── js/            # JavaScript files
│   └── *.html             # Page files
├── webawesome/            # Web Awesome assets (from dist-cdn)
├── _site/                 # Generated site (gitignored)
├── .eleventy.js           # 11ty configuration
└── package.json           # Dependencies and scripts
```

## Pages

- `/` - Home page
- `/getting-started` - Getting started guide
- `/colors` - Color system documentation
- `/typography` - Typography guidelines
- `/components` - Component library
- `/examples` - Usage examples

## Customization

### Adding New Pages

Create a new HTML file in the `src/` directory with front matter:

```html
---
layout: layouts/base.njk
title: Page Title
description: Page description
---

Your content here...
```

### Modifying Styles

Edit `src/assets/css/main.css` to customize the site's appearance.

### Using Web Awesome Components

Web Awesome components are available throughout the site. Refer to the [Web Awesome documentation](https://webawesome.com) for component usage.

Example:
```html
<wa-button variant="primary">Click Me</wa-button>
<wa-card>
  <h3>Card Title</h3>
  <p>Card content</p>
</wa-card>
```

## Web Awesome Integration

The site uses Web Awesome's CDN-ready distribution (`dist-cdn`), which doesn't require a bundler. The assets are loaded via:

```html
<link rel="stylesheet" href="/webawesome/styles/webawesome.css">
<script type="module" src="/webawesome/webawesome.loader.js" data-webawesome="/webawesome"></script>
```

## License

MIT

