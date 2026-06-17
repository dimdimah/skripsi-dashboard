'use client'

interface BottomBarProps {
  profile: {
    full_name?: string | null
    email?: string | null
    created_at?: string | null
    updated_at?: string | null
  } | null
}

export default function BottomBar({ profile }: BottomBarProps) {
  const fullName = profile?.full_name ?? 'Pengguna'
  const email = profile?.email ?? '-'
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'
  const updatedDate = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-amikom-hairline bg-white/95 backdrop-blur-md">
      <div className="page-container">
        <div className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-amikom-ink">{fullName}</p>
            <p className="text-[10px] font-mono text-amikom-ink/40">{email}</p>
            <p className="text-[10px] font-mono text-amikom-ink/40">
              Bergabung {joinedDate}
            </p>
            <p className="text-[10px] font-mono text-amikom-ink/40">
              Diperbarui {updatedDate}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
