export const routeLabels: Record<string, string> = {
  dashboard: 'Beranda',
  'track-record': 'Track Record',
  'tracer-study': 'Tracer Study',
  career: 'Lowongan',
  profile: 'Profil',
  rekomendasi: 'Rekomendasi',
  admin: 'Admin',
  alumni: 'Alumni',
  kuesioner: 'Kuesioner',
  'career-center': 'Karir',
  analytics: 'Analitik',
  'bulk-import': 'Import',
  'add-user': 'Tambah User',
}

export interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export function resolveBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const items: BreadcrumbItem[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const label = routeLabels[segment]
    if (!label) continue

    const href = '/' + segments.slice(0, i + 1).join('/')
    items.push({ label, href, isLast: i === segments.length - 1 })
  }

  return items
}
