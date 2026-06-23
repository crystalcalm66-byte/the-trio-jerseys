# The Trio Jerseys — Project Plan

## 1. Product Requirements

### 1.1 Brand Overview
| Property | Value |
|---|---|
| Store Name | The Trio Jerseys |
| Market | Pakistan (currency PKR, English copy) |
| Audience | Football fans & streetwear enthusiasts, ages 12–40 |
| Positioning | Premium player-version jerseys at affordable prices |
| Slogan | **BUILT FOR MATCHDAY** |
| Values | Trust · Pride · Football Culture · Professionalism |

### 1.2 Feature Requirements
- Browse 12 football jerseys (Club + National Team)
- Filter by category (Clubs / National Teams) and search by keyword
- Product detail view accessible via query string (`?id=XYZ`)
- Add to cart with size and quantity selection
- Cart persists in `localStorage` across all pages
- Wishlist toggle (heart icon) persists in `localStorage`
- Quantity stepper in cart (increment/decrement/remove)
- Free shipping when subtotal >= PKR 5,000
- Checkout form with HTML5 validation
- Payment methods: COD (default), JazzCash, EasyPaisa
- JazzCash / EasyPaisa reveal numbered instructions + WhatsApp button
- Order success screen clears cart
- Mobile sidebar navigation (hamburger → slide-in from left)
- IntersectionObserver fade-in animations (respects `prefers-reduced-motion`)

### 1.3 Pages (6 HTML files)

| Page | File | Key Sections |
|---|---|---|
| Home | `index.html` | Hero, Trust Bar, Matchday Picks (8 best sellers), Why Choose Us, Instagram Grid, Footer |
| Shop + Detail | `shop.html` | Catalog grid (filter + search) ↔ Product Detail view (gallery, sizes, qty, related) |
| About Us | `about.html` | Our Story, Our Mission, Why We Started, The Trio Family, Football Culture in Pakistan |
| Policies | `policies.html` | Delivery Policy, Privacy Policy, Terms & Conditions (tabbed/sticky nav) |
| Cart | `cart.html` | Item table, qty stepper, summary (subtotal, shipping, total), empty state |
| Checkout | `checkout.html` | Form (name, phone, city, address, notes), order summary, payment radio, success screen |

---

## 2. Technical Requirements

### 2.1 Stack (Strict)
| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic, one file per page) |
| Styles | CSS3 (one shared `styles.css`, no frameworks, no Tailwind, no Bootstrap) |
| Scripting | Vanilla JavaScript ES6+ (one shared `main.js`, no modules, no bundler) |
| Dependencies | **None** — zero npm, zero build tools, zero frameworks, zero backend |
| Fonts | Google Fonts via `<link>` (Anton + Inter) |
| State | `localStorage` only (cart + wishlist) |
| Images | `https://picsum.photos/seed/<id>/600/800` (seeded placeholders) |

### 2.2 Folder Structure
```
/the-trio-jerseys/
├── index.html              (Home)
├── shop.html               (Shop + Product Detail via ?id=)
├── about.html              (About Us)
├── policies.html           (Delivery / Privacy / Terms — tabbed)
├── cart.html               (Cart)
├── checkout.html           (Checkout)
├── PLAN.md                 (this file)
├── css/
│   └── styles.css          (shared stylesheet)
├── js/
│   ├── main.js             (shared JavaScript — cart, wishlist, UI)
│   └── products.js         (global PRODUCTS array — single source of truth)
└── assets/                 (placeholder directory for future images)
```

### 2.3 Responsiveness
- Mobile-first CSS
- Breakpoints: `640px` / `1024px` / `1280px`
- Test at: 375px / 768px / 1280px / 1920px
- Touch targets >= 44×44px
- No horizontal scroll at any width
- Images: `width: 100%; height: auto; display: block;`

### 2.4 Cross-Page Scripting
- `products.js` loaded before `main.js` on every page
- `main.js` initializes header, footer, cart badge, wishlist buttons, IntersectionObserver
- `shop.html` uses `URLSearchParams` to toggle between catalog and detail view
- Cart + wishlist CRUD functions are global (no modules)

---

## 3. Design System

### 3.1 Color Palette
| Token | Value | Usage |
|---|---|---|
| Primary background | `#FFFFFF` | Page backgrounds, cards |
| Secondary background | `#F8F9FA` | Trust bar, footer, section alternation |
| Primary text | `#111111` | Headlines, body copy |
| Secondary text | `#666666` | Labels, descriptions, subtitles |
| Borders | `#E5E5E5` | Dividers, card outlines, table borders |
| Button bg / text | `#111111` / `#FFFFFF` | Primary CTA buttons |
| Button hover | `#FFFFFF` bg / `#111111` text + `1px solid #111` | Button hover state (inversion) |
| Danger (remove) | `#C8102E` | Remove from cart, wishlist fill |
| Success (added) | `#1B7F3B` | "ADDED ✓" feedback |

### 3.2 Typography
| Property | Value |
|---|---|
| Headline font | **Anton** (Google Fonts) — uppercase, `letter-spacing: -0.02em`, one weight (400) |
| Body font | **Inter** (Google Fonts) — weights 400 / 500 / 600 / 700 |
| H1 size | `2.5rem` (mobile) → `4.5rem` (desktop) |
| H2 size | `1.75rem` (mobile) → `2.5rem` (desktop) |
| Body size | `1rem` |
| Line height | `1.6` |

### 3.3 Spacing Scale (px)
```
4, 8, 12, 16, 24, 32, 48, 64, 96
```

### 3.4 Layout
| Property | Value |
|---|---|
| Container max-width | `1280px` |
| Gutter | `24px` |
| Border radius (buttons & cards) | `0` (sharp, sporty) |
| Border radius (inputs) | `4px` |

### 3.5 Effects
| Element | Effect |
|---|---|
| Image hover | `transform: scale(1.05); transition: 400ms ease` |
| Section entrance | `IntersectionObserver` — `opacity: 0 → 1`, `translateY(16px → 0)`, `500ms` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables animations |
| Add to Cart | Button flips to "ADDED ✓" for 1.5s, cart badge increments |

---

## 4. Component Specifications

### 4.1 Header (Sticky)
- **Logo**: "TRIO" in Anton (large), "JERSEYS" subscript in Inter 600
- **Desktop nav**: Home · Shop · About · Policies · Contact
- **Right icons**: Search (decorative SVG/magnifier) + Cart icon with item-count badge
- **Mobile**: Hamburger icon (top-left) → sidebar overlay from left, 320px wide, scrim backdrop

### 4.2 Footer (4 Columns)
| Column | Content |
|---|---|
| Brand | Logo, slogan, 1-line description |
| Quick Links | Shop, About, Cart, Checkout |
| Policies | Delivery, Privacy, Terms |
| Contact | Instagram, WhatsApp, Email, Payment badges (COD / JazzCash / EasyPaisa as text) |
| Bottom strip | `© 2025 The Trio Jerseys. All rights reserved.` |

### 4.3 Product Card
- Image (with hover zoom)
- Name + country/club label
- Price (PKR formatted)
- Size chips (S / M / L / XL)
- Wishlist heart icon (outline ↔ filled `#C8102E`)
- BUY NOW button → checkout
- ADD TO CART button → feedback + badge increment

### 4.4 Product Detail View (`shop.html?id=X`)
- Image gallery: 1 main + 4 thumbnails (click to swap)
- Product info: name, price, description (from `products.js`)
- Size selector (radio chips, must pick one)
- Quantity stepper (− / number / +)
- BUY NOW → checkout with that item
- ADD TO CART
- Related products row (same category, exclude current, max 4)

### 4.5 Cart
- Table: Image, Name+Size, Unit Price, Qty stepper, Line Total, Remove (×)
- Summary: Subtotal → Shipping (free ≥ PKR 5000, else PKR 300) → Total
- Empty state: "Your cart is empty" + BROWSE JERSEYS button
- CONTINUE SHOPPING → `shop.html`
- PROCEED TO CHECKOUT → `checkout.html`

### 4.6 Checkout
- Form fields: Full Name, Phone, City, Address, Order Notes (textarea)
- Required (HTML5): name, phone, city, address
- Payment radio:
  - Cash On Delivery (default)
  - JazzCash → reveal: account `0323-2555116`, numbered instructions, WhatsApp button
  - EasyPaisa → same pattern
- Order summary sidebar (reads cart from localStorage)
- Submit: validates → clears cart → shows success screen

---

## 5. Product Data (`js/products.js`)

12 items — 6 Clubs + 6 National Teams:

| ID | Name | Category | Price (PKR) | Best Seller | Sizes |
|---|---|---|---|---|---|
| rm | Real Madrid 2024-25 | Clubs | 3,999 | Yes | S/M/L/XL |
| mc | Manchester City 2024-25 | Clubs | 3,799 | Yes | S/M/L/XL |
| liv | Liverpool 2024-25 | Clubs | 3,499 | No | S/M/L |
| bay | Bayern Munich 2024-25 | Clubs | 3,699 | Yes | S/M/L/XL |
| psg | PSG 2024-25 | Clubs | 4,299 | No | S/M/L/XL |
| bar | Barcelona 2024-25 | Clubs | 3,899 | Yes | S/M/L/XL |
| bra | Brazil 2024-25 | National Teams | 4,499 | Yes | S/M/L/XL |
| arg | Argentina 2024-25 | National Teams | 4,999 | Yes | S/M/L/XL |
| fra | France 2024-25 | National Teams | 4,299 | No | S/M/L |
| pak | Pakistan 2024-25 | National Teams | 2,499 | Yes | S/M/L/XL |
| ger | Germany 2024-25 | National Teams | 3,999 | No | S/M/L/XL |
| por | Portugal 2024-25 | National Teams | 4,499 | No | S/M/L/XL |

Each product has 4 images at `https://picsum.photos/seed/<id>-<n>/600/800` (n = 1..4).

---

## 6. JavaScript Architecture (`js/main.js`)

### 6.1 Cart Functions (global)
```js
function getCart()                // read from localStorage, return array
function saveCart(cart)           // write to localStorage
function addToCart(id, size, qty) // push item, show feedback, update badge
function removeFromCart(id, size) // filter out, re-save
function updateQuantity(id, size, delta) // increment/decrement
function getCartCount()           // sum of quantities
function updateCartBadge()        // sync badge element
```

### 6.2 Wishlist Functions (global)
```js
function getWishlist()            // read Set from localStorage
function saveWishlist(set)        // write Set to localStorage
function toggleWishlist(id)       // add/remove, toggle heart class
function isWishlisted(id)         // boolean check
```

### 6.3 UI Functions
```js
function formatPrice(num)         // "PKR 3,499"
function showAddedFeedback(btn)   // "ADDED ✓" for 1.5s
function initIntersectionObserver() // fade-in on scroll
function initHeader()             // inject header HTML + event listeners
function initFooter()             // inject footer HTML
```

### 6.4 Page-Specific Initializers
```js
function initHomePage()           // render best sellers
function initShopPage()           // check ?id, render catalog or detail
function initCartPage()           // render cart table or empty state
function initCheckoutPage()       // render form + summary, handle payment radio
function initAboutPage()          // (static content, animations only)
function initPoliciesPage()       // (static content, smooth scroll)
```

---

## 7. Quality Checklist

- [ ] 6 HTML pages, all cross-linked, no dead links
- [ ] Shared `styles.css` + `main.js` + `products.js` loaded on every page
- [ ] Cart persists across pages via localStorage
- [ ] Wishlist toggles persist
- [ ] Product detail reachable from both Home (Matchday Picks) and Shop
- [ ] Checkout form validates required fields
- [ ] JazzCash/EasyPaisa reveal WhatsApp flow on select
- [ ] Free shipping logic (≥ PKR 5,000)
- [ ] Mobile sidebar works, no horizontal scroll
- [ ] Fonts: Anton for headlines, Inter for body
- [ ] Zero console errors, zero external JS dependencies except Google Fonts
- [ ] `prefers-reduced-motion` respected
- [ ] `IntersectionObserver` fade-in applied to all sections
