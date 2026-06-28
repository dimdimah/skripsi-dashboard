'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { resolveBreadcrumbs } from '@/lib/breadcrumbs'

export default function DashboardBreadcrumb() {
  const pathname = usePathname()
  const items = resolveBreadcrumbs(pathname)

  if (items.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item) => (
          <BreadcrumbItem key={item.href}>
            {item.isLast ? (
              <BreadcrumbPage className="text-sm font-medium text-amikom-ink">
                {item.label}
              </BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="text-sm text-amikom-ink/40 hover:text-amikom-purple transition-colors">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
