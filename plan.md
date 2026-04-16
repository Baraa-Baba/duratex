# Duratex Middle East Frontend Website

Build a visually stunning, pure Vue frontend for Duratex Middle East focusing on bold "Industrial Luxury" aesthetic, providing static product listings extracted from the main Brazilian site, and a functional contact form.

## User Review Required

> [!IMPORTANT]
> **Aesthetic Direction**: I will implement an "Industrial Luxury" aesthetic. This means:
>
> - **Color/Theme**: Very dark, elegant palette (charcoal/obsidian background) with contrasting wood-tone gradients/accents (warm amber, oak, mahogany) to represent the wood panel products.(make it light theme please)
> - **Typography**: An uppercase, geometric, architectural sans-serif for headings (e.g., Unbounded or Syne) paired with a precise, highly readable sans for body text.
> - **Layout & Motion**: Grid-breaking asymmetric elements, staggered entrance animations using CSS, and parallax-like effects that evoke architectural drafting and layered interior design.
>
> **Does this aesthetic direction align with your vision for the brand?**

> [!NOTE]
> During execution, I will write a quick Node.js script to dynamically scrape all pages from `https://www.duratex.com.br/produtos?page=[PAGE]` to create a robust static `products.json` file.(make sure to get the images to into the pulblic folder)

## Proposed Changes

---

### Project Setup

#### [MODIFY] package.json

Install `vue-router` to handle client-side navigation.

#### [MODIFY] src/main.ts

Integrate Vue Router with the main Vue instance.

#### [NEW] src/router/index.ts

Define routes for `/`, `/products`, and `/contact`.

---

### Core Layout & Styles

#### [MODIFY] src/style.css

Wipe existing styles and implement the comprehensive Industrial Luxury CSS design system:

- CSS variables for colors, typography, spacing.
- Global animations and transition classes.
- Typography resets and font imports (Google Fonts).

#### [MODIFY] src/App.vue

Implement the global navigation bar (Logo, Home, Products, Contact) and footer.
Include interactive hover states and page transition foundations.

---

### Pages

#### [NEW] src/pages/Home.vue

- Parallax hero section with bold typography outlining "Duratex Middle East".
- "About Us" section highlighting experience and scale (Extracted from Duratex Brazilian info).
- Animated calls to action.

#### [NEW] src/pages/Products.vue

- Display a grid of wood products loaded from a static JSON file.
- Clean hover effects revealing product details.
- A prominent "View Catalog" section per instructions.

#### [NEW] src/pages/Contact.vue

- Address and contact info styling.
- Functional form using FormSubmit (no captcha).
- Embedded Google Map.

---

### Data and Assets

#### [NEW] script/scrapeProducts.js (Temporary Script)

A small script to fetch and parse the Duratex products API or HTML and output them to a JSON file.

#### [NEW] src/data/products.json

The final static JSON array of products to be consumed by the Vue components.

submit formsubmit to info@duratex.co

## Verification Plan

### Automated/Build Verification

- Run `npm run build` to ensure Vue TypeScript compiles correctly.
- Ensure the `scrapeProducts.js` writes a valid non-empty JSON file.
