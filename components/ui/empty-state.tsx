import { Briefcase, ClipboardCheck, User, BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  type: 'track-record' | 'jobs' | 'users' | 'analytics'
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

const icons = {
  'track-record': { bg: 'bg-amikom-purple/10', text: 'text-amikom-purple', Icon: Briefcase },
  'jobs': { bg: 'bg-blue-50', text: 'text-blue-600', Icon: Briefcase },
  'users': { bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: User },
  'analytics': { bg: 'bg-amber-50', text: 'text-amber-600', Icon: BarChart3 },
}

export function EmptyState({ type, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const { bg, text, Icon } = icons[type]

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-16 shadow-sm">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg} ${text}`}>
        <Icon className="h-8 w-8" />
      </div>
      <p className="mt-4 text-base font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500 max-w-sm text-center">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-6 rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm inline-flex items-center gap-2"
        >
          {actionLabel}
        </a>
      )}
    </div>
  )
}