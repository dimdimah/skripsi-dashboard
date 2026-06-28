# BRAIN.md — SITRACK AI Context

> Update: 21 Juni 2026

---

## I. CURRENT STATE (Codebase Snapshot)

**Framework:** Next.js 14+ App Router, shadcn/ui, Tailwind CSS, Supabase
**Fonts:** Geist (sans/display) + Geist Mono (mono) — ganti dari Work Sans + DM Mono (via `geist/font` package)
**Design Tokens:** `amikom-*` di `tailwind.config.ts` — jangan hardcoded hex
**Bahasa UI:** Indonesia (semua halaman), kecuali label teknis tertentu

### Canonical Pages (redirect tujuan)
| Fungsi | Canonical | Redirect Dari |
|---|---|---|
| Profile | `/dashboard/profile` | `/user/profile` |
| Add user | `/admin/add-user` | `/super-user/add-user` |

### Route Structure
```
/                              → Landing (Server Component)
/login                         → Server + Client Form Island (login-form.tsx)
/dashboard/*                   → Protected (Navbar + Main + BottomBar + Toaster)
  /dashboard                   → PageHeader + Quick Actions + Account Info
  /dashboard/track-record      → CRUD + Pagination + AlertDialog
  /dashboard/profile           → Client: form + password + completeness
  /dashboard/tracer-study      → Multi-step form + submitted view
  /dashboard/career            → JobList component
/admin/*                       → Protected
  /admin                       → 5-row data-driven dashboard (Server Component)
  /admin/alumni                → CRUD + Modal + AlertDialog
  /admin/kuesioner             → CRUD + Export Excel + AlertDialog
  /admin/career-center         → CRUD + AlertDialog
  /admin/analytics             → Charts + Filter Tahun
  /admin/add-user              → AddUserForm + Server Component
  /admin/bulk-import           → CSV Upload
/super-user/*
  /super-user/users            → PageHeader + DataTable
/user/*
  /user/rekomendasi            → PageHeader + Match Results
  /user/profile                → Redirect ke /dashboard/profile
  /user/lowongan               → JobList component
```

---

## II. ACTIVE DECISIONS (Must Follow)

1. **Satu aksen interaktif:** `amikom-purple (#700070)` — semua button/link. Jonquil hanya dekorasi.
2. **Teks:** heading `text-amikom-ink`, body `text-amikom-ink-muted-48`, jangan `#000000` atau `text-black`
3. **Background:** landing/login `bg-amikom-pearl`, card `bg-amikom-canvas`, jangan full-page `#ffffff`
4. **Label:** `font-mono text-[11px] uppercase tracking-wider` — `text-[10px]` hanya untuk table header & badge
5. **Header halaman:** WAJIB pakai `<PageHeader>`, jangan manual
6. **Delete confirmation:** WAJIB `<AlertDialog>`, jangan `confirm()` native
7. **Delete toast:** WAJIB `toast.promise()`, jangan `try/catch` + `toast.success()`
8. **Redirect:** Halaman deprecated → `redirect('/canonical')` di Server Component
9. **Interaktif non-button:** WAJIB `role="button"` + `tabIndex={0}` + `onKeyDown` handler
10. **Aksesibilitas:** Skip-to-content link (#main-content), aria-label pada semua interactive control

---

## III. COMPONENT & PATTERN REFERENCE

### PageHeader
```tsx
<PageHeader icon={<span className="text-[11px]">◆</span>} label="Label" title="Judul." subtitle="Deskripsi." action={<button>+ Tambah</button>} />
```

### AlertDialog (Delete)
```tsx
const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
<AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
  <AlertDialogHeader><AlertDialogTitle>Hapus?</AlertDialogTitle><AlertDialogDescription>Tindakan tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
  <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600">Hapus</AlertDialogAction></AlertDialogFooter>
</AlertDialog>
```

### Delete with Toast Promise
```tsx
const promise = deleteItem(id)
toast.promise(promise, { loading: 'Menghapus...', success: () => { loadItems(); return 'Berhasil' }, error: (err) => err.message })
```

### Interactive Card
```tsx
<div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); handleClick() }}} onClick={handleClick} className="... cursor-pointer">
```

### Quick Link Card
```tsx
<Link href="..." className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Label</p>
  <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Judul</h3>
  <p className="text-sm text-slate-600 mt-1">Deskripsi.</p>
</Link>
```

### CSS Tokens (ganti hardcoded hex)
| Hex | Token |
|---|---|
| `#FAFBFC` | `bg-amikom-pearl` |
| `#1A1A1E` | `text-amikom-ink` |
| `#5A5A6E` | `text-amikom-ink-muted-48` |
| `#E8E8ED` | `border-amikom-hairline` |
| `#f0f0f0` | `border-amikom-divider-soft` |
| `#700070` | `bg-amikom-purple` |
| `#580058` | `bg-amikom-purple-hover` |
| `#e0e0e0` | `border-amikom-hairline` |
| `#ffffff` | `bg-amikom-canvas` |

---

## IV. PROGRESS LOG

| Item | File Utama | Status |
|---|---|---|
| Design token mapping | `tailwind.config.ts` | ✅ |
| `confirm()` → `AlertDialog` | track-record, kuesioner, career-center, alumni | ✅ |
| Skip-to-content + aria-label | `app/layout.tsx`, navbar, alumni table | ✅ |
| Profile consolidation | `/dashboard/profile` (canonical), `/user/profile` (redirect) | ✅ |
| Add-user consolidation | `/admin/add-user` (canonical), `/super-user/add-user` (redirect) | ✅ |
| PageHeader (14 pages) | `components/ui/page-header.tsx` | ✅ |
| `text-[10px]` → `text-[11px]` | Semua section label | ✅ |
| Password toggle login | `app/(auth)/login/login-form.tsx` | ✅ |
| `toast.promise()` delete | track-record, kuesioner, career-center | ✅ |
| Font swap (Work Sans → Geist) | `layout.tsx`, `tailwind.config.ts`, `globals.css` | ✅ |
| Font swap (Work Sans/DM Mono → Geist/Geist Mono) | `layout.tsx`, `tailwind.config.ts`, `globals.css`, `DESIGN_SYSTEM.md` | ✅ |
| Fix rekomendasi — tambah url & source di form admin career | `app/(protected)/admin/career-center/page.tsx` | ✅ |
| Fix rekomendasi — cache matching di-invalidate setelah update profil | `lib/actions/profile.ts` | ✅ |
| Fix rekomendasi — silent catch diganti console.error | `app/(protected)/user/rekomendasi/page.tsx` | ✅ |
| Fix rekomendasi — kolom url/source tidak ada di DB (migration 005) | `supabase/migrations/005_add_jobs_url_source.sql` | ✅ |
| Fix rekomendasi — url/source dijadikan optional di Zod + insert conditional | `lib/schemas/jobs.ts`, `lib/actions/jobs.ts` | ✅ |
| Admin dashboard redesain | `app/(protected)/admin/page.tsx` | ✅ |
| DESIGN_SYSTEM.md revisi | `DESIGN_SYSTEM.md` | ✅ |
| Idempotency key di `createTrackRecord` | `lib/actions/track-record.ts`, `app/(protected)/dashboard/track-record/page.tsx`, `supabase/migrations/006_add_idempotency_key.sql` | ✅ |
| Redirect guard di login form | `app/(auth)/login/login-form.tsx` | ✅ |
| Landing page alumni-first + motion | `app/page.tsx` | ✅ |
| Fix motion import (pre-existing) | `components/landing/motion-wrapper.tsx` | ✅ |
| Sidebar dashboard layout (replace navbar + bottom bar) | `components/dashboard-sidebar.tsx`, `components/navbar.tsx`, `app/(protected)/layout.tsx` | ✅ |
| Sidebar mobile: add bg-white background | `components/dashboard-sidebar.tsx` | ✅ |
| Navbar mobile: non-transparent bg (no backdrop-blur) + hamburger visibility fix | `components/navbar.tsx` | ✅ |
| Navbar desktop: add breadcrumb (mobile hidden) | `components/navbar.tsx` | ✅ |
| Hapus bottom-bar.tsx (orphaned setelah sidebar layout) | `components/bottom-bar.tsx` | ✅ |
| CI/CD pipeline — Node 22 + E2E job | `.github/workflows/ci.yml` | ✅ |
| Playwright E2E testing — config + 3 test files | `playwright.config.ts`, `e2e/` | ✅ |
| Gitignore — playwright-report/ & test-results/ | `.gitignore` | ✅ |
| Script test:e2e + tsconfig exclude e2e/ | `package.json`, `tsconfig.json` | ✅ |
| Migrasi Shadcn HSL → amikom tokens — 13 HSL variables diselaraskan | `app/globals.css` | ✅ |
| Bersihkan conflicting CSS vars (--primary/--secondary → --amikom-*/--jonquil-*) | `app/globals.css` | ✅ |
| E2E auth helper — mock data + Supabase route interception | `e2e/helpers/auth.ts` | ✅ |
| E2E authenticated dashboard tests — 10 test cases untuk 5 halaman | `e2e/dashboard-auth.spec.ts` | ✅ |
| Collaborative Filtering (CF) hybrid — Jaccard similarity + user-based scoring | `lib/cf.ts`, `lib/actions/matching.ts`, `types/database.ts` | ✅ |

### Security Fixes Applied (Juni 2026)
- **Role escalation prevention:** CSV import dan add user kini mengunci role ke 'user', tidak bisa diubah via input
- **Password validation:** Standard 8+ karakter dengan huruf besar, kecil, dan angka di semua form
- **CSP hardening:** Menghapus 'unsafe-eval' dari script-src
- **Error sanitization:** Pesan error Supabase disamarkan dari client

### Pre-existing Constraints
- **TS errors:** 57 error di `__tests__/*` saja — jangan diperbaiki (pre-existing)
- **Shadcn HSL + amikom tokens:** Dua sistem berjalan paralel, migrasi bertahap
- **Toaster:** Hanya di `(protected)/layout.tsx`, bukan di root layout
- **CF hybrid bobot:** skill=0.35, location=0.15, salary=0.15, type=0.15, cf=0.2 — education reserved (0.0)

---

## V. NEXT STEPS (Belum Dikerjakan)

| Prioritas | Item | Lokasi |
|---|---|---|
| 🟡 | Tampilkan skor CF di UI breakdown rekomendasi | `app/(protected)/user/rekomendasi/page.tsx` |
| 🟡 | Ambil tindakan lebih lanjut—tunggu instruksi pengguna | — |

---

## VI. BUILD COMMANDS

```bash
npm run dev          # Development
npx tsc --noEmit     # TypeScript check
npx jest             # Test suite
npm run build        # Production build
```
