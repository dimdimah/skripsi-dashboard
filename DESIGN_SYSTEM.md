# SITRACK Design System

> Amikom design language · Amikom brand colors · Universitas Amikom Solo

Sistem desain ini mengadaptasi bahasa visual Apple dengan warna identitas resmi Universitas Amikom Solo.
Filosofi: UI meresap ke latar, konten berbicara. Satu aksen interaktif: **Amikom Purple**.

---

## 1. Colors

### Primary — Satu Aksen Interaktif

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--primary` | `bg-amikom-purple` | `#700070` | Semua elemen interaktif |
| `--primary-hover` | `bg-amikom-purple-hover` | `#580058` | Press/hover state |
| `--primary-focus` | `ring-amikom-purple-focus` | `#4A1B9D` | Focus ring keyboard |
| `--primary-on-dark` | `text-amikom-purple-bright` | `#9B30FF` | Link di atas dark tile |
| `--primary-light` | `bg-amikom-purple-light` | `#f0d4f0` | Background subtle |

### Secondary — Dekoratif Saja (Tidak untuk Interaksi)

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--secondary` | `text-amikom-jonquil` | `#FFCC00` | Badge, label highlight |
| `--secondary-warm` | `text-amikom-jonquil-warm` | `#FFAC00` | Energi, achievement |
| `--secondary-vivid` | `text-amikom-jonquil-vivid` | `#FF7900` | Urgensi, status kritis |

### Surface

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--canvas` | `bg-amikom-canvas` | `#ffffff` | Canvas utama, card background |
| `--parchment` | `bg-amikom-parchment` | `#f5f5f7` | Off-white Apple |
| `--pearl` | `bg-amikom-pearl` | `#fafafc` | Pearl button, primary page background |
| `--tile-1` | `bg-amikom-tile-1` | `#272729` | Dark tile primer |
| `--tile-2` | `bg-amikom-tile-2` | `#2a2a2c` | Dark tile sekunder |
| `--tile-3` | `bg-amikom-tile-3` | `#252527` | Dark tile tersier |
| `--surface-black` | `bg-amikom-black` | `#000000` | Legacy dark nav, video |

### Soft White — Light Page Palette (v2)

Palet ini digunakan untuk **Landing Page** dan **Login Page** agar tidak menyilaukan mata.
Background tidak pernah menggunakan pure `#ffffff` secara full-page — hanya untuk card/komponen.

| Token | Tailwind Utility | Hex | Peran |
|---|---|---|---|
| `--soft-bg` | `bg-[#FAFBFC]` | `#FAFBFC` | Primary page background (landing, login) |
| `--section-alt` | `bg-[#F2F3F5]` | `#F2F3F5` | Alternating section background |
| `--soft-border` | `border-[#E8E8ED]` | `#E8E8ED` | Soft border untuk card & nav |
| `--text-primary` | `text-[#1A1A1E]` | `#1A1A1E` | Primary heading & text (soft black) |
| `--text-secondary` | `text-[#5A5A6E]` | `#5A5A6E` | Body copy & subtitle |
| `--text-tertiary` | `text-[#8E8E93]` | `#8E8E93` | Muted label, fine print |
| `--nav-glass` | `bg-white/80 backdrop-blur-sm` | — | Frosted glass navigation bar |
| `--purple-dim-bg` | `bg-amikom-purple/10` | — | Nav button, subtle purple tint |
| `--purple-overlay` | `from-amikom-purple/[0.03]` | — | Subtle gradient overlay di hero/login |

**Aturan pemakaian:**
- Page background: `#FAFBFC` (jangan `#ffffff` full-page)
- Card/component: `#ffffff` dengan border `#E8E8ED`
- Heading: `#1A1A1E` (bukan `#000000`)
- Body copy: `#5A5A6E` (bukan `#1d1d1f`)
- Nav link: `#8E8E93`, hover → `#5A5A6E` atau `amikom-purple`

### Text

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--ink` | `text-amikom-ink` | `#1d1d1f` | Teks utama light surface |
| `--on-dark` | `text-amikom-on-dark` | `#ffffff` | Teks di dark tile |
| `--muted` | `text-amikom-muted` | `#cccccc` | Secondary copy dark tile |
| `--ink-muted-80` | `text-amikom-ink-muted-80` | `#333333` | Pearl button text |
| `--ink-muted-48` | `text-amikom-ink-muted-48` | `#7a7a7a` | Disabled, fine-print |

### Borders

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--divider-soft` | `border-amikom-divider-soft` | `#f0f0f0` | Border subtle |
| `--hairline` | `border-amikom-hairline` | `#e0e0e0` | Border 1px card |

### Semantic (Dashboard)

| Token | Tailwind | Hex | Peran |
|---|---|---|---|
| `--danger` | `text-amikom-danger` | `#ef4444` | Error/destructive |
| `--danger-bg` | `bg-amikom-danger-bg` | `#fef2f2` | Latar error |
| `--warning` | `text-amikom-warning` | `#f59e0b` | Warning |
| `--success` | `text-amikom-success` | `#22c55e` | Success |

---

## 2. Tipografi

| Style | Size | Weight | Line Height | Letter Spacing | Penggunaan |
|---|---|---|---|---|---|
| Hero Display | 56px | 600 | 1.07 | -0.28px | Headline hero landing |
| Display LG | 40px | 600 | 1.10 | 0 | Headline tile |
| Display MD | 34px | 600 | 1.47 | -0.374px | Section head |
| Lead | 28px | 400 | 1.14 | 0 | Subcopy |
| Lead Airy | 24px | 300 | 1.5 | 0 | Lead paragraph |
| Tagline | 21px | 600 | 1.19 | 0.231px | Sub-nav kategori |
| Body Strong | 17px | 600 | 1.24 | -0.374px | Inline strong |
| Body | 17px | 400 | 1.47 | -0.374px | Paragraf default |
| Caption | 14px | 400 | 1.43 | -0.224px | Secondary copy |
| Caption Strong | 14px | 600 | 1.29 | -0.224px | Label heading |
| Button Utility | 14px | 400 | 1.29 | -0.224px | Nav button label |
| Fine Print | 12px | 400 | 1.0 | -0.12px | Legal, footer |
| Nav Link | 12px | 400 | 1.0 | -0.12px | Global nav item |

**Font Families:**
- `font-sans` → Inter (fallback: system-ui, -apple-system)
- `font-display` → Inter (headline, tighter tracking)
- `font-mono` → JetBrains Mono (angka, label teknis)

**Prinsip:**
- Letter-spacing negatif pada display size (≥17px) → "Apple tight"
- Body copy pada 17px, bukan 16px
- Weight: 300 / 400 / 600 / 700 (500 sengaja tidak ada)

---

## 3. Layout

### Spacing

| Token | Value |
|---|---|
| `spacing.xxs` | 4px |
| `spacing.xs` | 8px |
| `spacing.sm` | 12px |
| `spacing.md` | 17px |
| `spacing.lg` | 24px |
| `spacing.xl` | 32px |
| `spacing.xxl` | 48px |
| `spacing.section` | 80px |

### Container
- Max content: `1440px` (product grid), `980px` (text-heavy section)
- Gutter: 20–24px
- Section padding vertikal: `80px`

### Border Radius

| Token | Value | Penggunaan |
|---|---|---|
| `rounded-xs` | 5px | Inline chip |
| `rounded-sm` | 8px | Utility button |
| `rounded-md` | 11px | Pearl button |
| `rounded-lg` | 18px | Store card |
| `rounded-pill` | 9999px | Primary CTA, search input |

---

## 4. Komponen

### Buttons

**Primary Pill**
```tsx
className="rounded-pill bg-amikom-purple px-7 py-2.5 text-[17px] font-normal text-white transition-all hover:bg-amikom-purple-hover active:scale-[0.95]"
```

**Secondary Ghost Pill**
```tsx
className="rounded-pill border border-amikom-purple px-7 py-2.5 text-[17px] font-normal text-amikom-purple transition-all hover:bg-amikom-purple/5 active:scale-[0.95]"
```

**Dark Utility**
```tsx
className="rounded-sm bg-amikom-ink px-3.5 py-1.5 text-xs font-medium text-amikom-on-dark transition-all hover:bg-amikom-ink/90 active:scale-[0.95]"
```

### Cards

**Store Utility Card**
```tsx
className="rounded-lg border border-amikom-hairline bg-amikom-canvas px-6 py-6"
```

**Dark Stat Card**
```tsx
className="rounded-lg bg-amikom-tile-2 border border-amikom-glass-border px-6 py-6 text-center"
```

### Inputs

**Text Input**
```tsx
className="w-full rounded-pill border border-amikom-hairline bg-amikom-canvas px-5 py-2.5 text-[17px] text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
```

**Search Input**
```tsx
className="w-full rounded-pill border border-amikom-hairline bg-amikom-canvas px-10 py-2.5 text-sm ..."
```

### Badge

```tsx
<Badge variant="default">     // Amikom Purple bg, white text
<Badge variant="secondary">   // Parchment bg, muted text
<Badge variant="accent">      // Jonquil bg, decorative
<Badge variant="warning">     // Amber bg
<Badge variant="destructive"> // Red bg
<Badge variant="success">     // Green bg
```

### Navigation

**Global Nav — Dark (Legacy)** — 44px, `bg-amikom-black`, text 12px
**Global Nav — Light (v2)** — 44px, `bg-white/80 backdrop-blur-sm border-b border-[#E8E8ED]`, text `#1A1A1E` / `#5A5A6E`
**Sub-nav Frosted** — 52px, `bg-amikom-parchment/80 backdrop-blur-xl`

**Light Nav Pattern:**
```tsx
// Navbar
className="sticky top-0 z-50 h-11 bg-white/80 backdrop-blur-sm border-b border-[#E8E8ED]"

// Brand link
className="text-[#1A1A1E] text-xs font-semibold hover:text-amikom-purple transition-colors"

// Nav links
className="text-[#5A5A6E] text-xs hover:text-amikom-purple transition-colors"

// Masuk button
className="rounded-sm bg-amikom-purple/10 px-3.5 py-1.5 text-xs font-medium text-amikom-purple hover:bg-amikom-purple/20"
```

---

## 5. Shadows

| Token | Value | Penggunaan |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(0,0,0,0.05)` | Utility card (dashboard) |
| `shadow-product` | `0 3px 5px 30px rgba(0,0,0,0.22)` | Product render / logo hero |

**Filosofi:** Satu drop-shadow pada product render saja. Tidak ada shadow pada card, button, atau teks di landing page.

---

## 6. Animasi

| Class | Efek |
|---|---|
| `animate-fade-in-up` | Fade + geser 16px ke atas, 0.6s |
| `animate-fade-in` | Fade in, 0.5s |
| `active:scale-[0.95]` | Press state pada semua button |

---

## 7. Responsive Breakpoints

| Nama | Lebar | Perubahan |
|---|---|---|
| Phone | ≤ 640px | Single column, hero 34px |
| Tablet | 641–1023px | 2-column grid |
| Desktop | ≥ 1024px | Layout penuh, 3-column grid |

---

## 8. Do's and Don'ts

### Do
- Gunakan `amikom-purple` untuk SEMUA elemen interaktif
- Jonquil hanya untuk badge/dekorasi non-interaktif
- `active:scale-[0.95]` pada setiap button
- Alternasikan light ↔ dark tile untuk pemisah section
- Body copy 17px, bukan 16px
- **Gunakan `#FAFBFC` untuk page background, `#ffffff` hanya untuk card**
- **Gunakan `#1A1A1E` untuk heading, `#5A5A6E` untuk body copy di halaman light**
- **Nav light: `bg-white/80 backdrop-blur-sm` dengan border `#E8E8ED`**

### Don't
- Jangan gunakan Jonquil untuk button/link
- Jangan tambahkan shadow pada card/button (kecuali dashboard)
- Jangan gunakan gradient dekoratif
- Jangan gunakan weight 500
- **Jangan gunakan `#ffffff` sebagai full-page background (menyilaukan)**
- **Jangan gunakan `#000000` sebagai teks di light surface (terlalu kontras)**
- **Jangan gunakan dark nav di halaman yang sudah light (inkonsisten)**

---

## 9. CSS Variable Reference

```css
/* Primary */
--primary: #700070;
--primary-hover: #580058;
--primary-focus: #4A1B9D;
--primary-on-dark: #9B30FF;

/* Secondary */
--secondary: #FFCC00;

/* Surface */
--canvas: #ffffff;
--parchment: #f5f5f7;
--tile-1: #272729;

/* Soft White (v2) */
--soft-bg: #FAFBFC;
--section-alt: #F2F3F5;
--soft-border: #E8E8ED;
--text-primary: #1A1A1E;
--text-secondary: #5A5A6E;
--text-tertiary: #8E8E93;

/* Text */
--ink: #1d1d1f;
--on-dark: #ffffff;

/* Borders */
--hairline: #e0e0e0;
```
