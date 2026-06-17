import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[#FAFBFC]">

      {/* ═══════════════ GLOBAL NAV ═══════════════ */}
      <nav className="sticky top-0 z-50 h-14 bg-white/80 backdrop-blur-sm border-b border-[#E8E8ED]">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[#1A1A1E] text-sm font-bold tracking-[-0.01em] hover:text-amikom-purple transition-colors">
              SITRACK
            </Link>
            <div className="hidden md:flex items-center gap-5">
              <Link href="#cara-kerja" className="text-[#5A5A6E] text-sm hover:text-amikom-purple transition-colors">Cara Kerja</Link>
              <Link href="#fitur" className="text-[#5A5A6E] text-sm hover:text-amikom-purple transition-colors">Fitur</Link>
              <Link href="#analytics" className="text-[#5A5A6E] text-sm hover:text-amikom-purple transition-colors">Analytics</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-sm bg-amikom-purple/10 px-3.5 py-1.5 text-sm font-medium text-amikom-purple transition-all hover:bg-amikom-purple/20 active:scale-[0.95]"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-[#FAFBFC]">
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amikom-purple/[0.03] via-transparent to-transparent" />

        <div className="relative mx-auto max-w-[980px] px-6 pt-[100px] pb-[80px] text-center lg:px-12 lg:pt-[120px]">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amikom-purple/5 border border-amikom-purple/10 px-4 py-1.5 animate-fade-in-up">
            <span className="h-1.5 w-1.5 rounded-full bg-amikom-purple animate-pulse" />
            <span className="text-xs font-medium text-amikom-purple">Platform Resmi Alumni</span>
          </div>

          <h1 className="font-display text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1A1A1E] animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            Telusuri Jejak<br className="sm:hidden" /> Alumni Amikom.
          </h1>
          <p className="mt-5 md:mt-6 text-[18px] sm:text-[20px] md:text-[22px] font-normal leading-[1.5] text-[#5A5A6E] max-w-[640px] mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Sistem informasi tracer study untuk melacak karir, kontribusi, dan perkembangan lulusan STMIK Amikom Surakarta.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-amikom-purple px-7 py-3 text-[16px] font-normal text-white transition-all hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm hover:shadow-lg hover:shadow-amikom-purple/20 active:scale-[0.98]"
            >
              Masuk ke Portal
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#cara-kerja"
              className="inline-flex items-center rounded-full border border-[#E0E0E5] bg-white px-7 py-3 text-[16px] font-normal text-[#1A1A1E] transition-all hover:border-amikom-purple/30 hover:text-amikom-purple active:scale-[0.98]"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-[#8E8E93] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amikom-purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Terdata &amp; Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amikom-purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 16.176A5 5 0 0110 12a5 5 0 017.834 4.176M10 10a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Aman &amp; Privat</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amikom-purple" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Untuk Akreditasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CARA KERJA ═══════════════ */}
      <section id="cara-kerja" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-[80px] lg:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amikom-purple mb-3">Alur Penggunaan</p>
            <h2 className="text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1A1A1E]">
              Cara Kerja.
            </h2>
            <p className="mt-3 text-[18px] font-normal leading-[1.5] text-[#5A5A6E] max-w-[520px] mx-auto">
              Tiga langkah sederhana untuk mulai menggunakan SITRACK.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Masuk ke Portal',
                desc: 'Gunakan email institusi @amikomsolo.ac.id dan password yang diberikan admin untuk mengakses dashboard personal.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m-3 3h12" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Isi Data & Kuesioner',
                desc: 'Lengkapi profil, track record karir, dan isi kuesioner tracer study. Data tersimpan aman dan hanya bisa diakses oleh admin terverifikasi.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.683a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Akses Career Center',
                desc: 'Jelajahi lowongan kerja terkurasi yang sesuai dengan keahlian alumni. Update data secara berkala untuk rekomendasi terbaik.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#E8E8ED] bg-[#FAFBFC] p-8 transition-all hover:border-amikom-purple/20 hover:shadow-sm"
                style={{ animationDelay: `${0.05 * (i + 1)}s` }}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-1 h-8 w-8 rounded-full bg-amikom-purple text-amikom-jonquil-warm text-xs font-bold flex items-center justify-center font-mono">
                  {item.step}
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amikom-purple/5 text-amikom-purple mt-2">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-[18px] font-semibold leading-[1.24] tracking-[-0.02em] text-[#1A1A1E]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] font-normal leading-[1.6] text-[#5A5A6E]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="fitur" className="bg-[#F2F3F5]">
        <div className="mx-auto max-w-[1280px] px-6 py-[80px] lg:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amikom-purple mb-3">Kapabilitas</p>
            <h2 className="text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1A1A1E]">
              Fitur Lengkap.
            </h2>
            <p className="mt-3 text-[18px] font-normal leading-[1.5] text-[#5A5A6E] max-w-[520px] mx-auto">
              Semua yang alumni dan admin butuhkan dalam satu platform terintegrasi.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Track Record',
                desc: 'Kelola riwayat karir dan pengalaman kerja setelah lulus. Update kapan saja, akses oleh admin untuk analitik.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                ),
              },
              {
                title: 'Tracer Study',
                desc: 'Isi kuesioner rutin untuk membantu akreditasi dan peningkatan kualitas kurikulum program studi.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.363 2.363 0 00-.1-.664m-5.8 0A2.364 2.364 0 005.647 4.98a48.42 48.42 0 011.123-.08m5.801 0a2.364 2.364 0 013.396.893m-3.396-.893c-.382-.63-.99-1.104-1.707-1.313m0 0a48.38 48.38 0 00-3.478 0m3.478 0c.382-.63.99-1.104 1.707-1.313m-5.185 2.626a2.364 2.364 0 01-1.707-1.313m0 0A48.38 48.38 0 015.647 4.98m2.98 2.626c-.382-.63-.99-1.104-1.707-1.313m0 0a48.38 48.38 0 00-3.478 0m3.478 0a2.364 2.364 0 001.707-1.313m0 0a48.38 48.38 0 00-3.478 0m3.478 0c.382-.63.99-1.104 1.707-1.313" />
                  </svg>
                ),
              },
              {
                title: 'Career Center',
                desc: 'Akses informasi lowongan kerja terbaru yang dikurasi khusus untuk alumni Amikom Solo.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738.135l-.275.223a2.25 2.25 0 01-1.597.398l-.952-.19a2.25 2.25 0 00-1.597.398l-.952-.19a2.25 2.25 0 00-1.597.398l-.275.223a.89.89 0 01-.738.135l-1.273-.363a.414.414 0 00-.663.107.827.827 0 01-.812-.21l-1.08 2.16a2.252 2.252 0 01-.421.585l-1.135 1.135a2.25 2.25 0 000 3.182l1.135 1.135c.18.18.332.386.45.614l1.08 2.16a.414.414 0 00.663.107.827.827 0 01.812-.21l1.273.363a.89.89 0 00.738-.135l.275-.223a2.25 2.25 0 011.597-.398l.952.19a2.25 2.25 0 001.597-.398l.952.19a2.25 2.25 0 001.597-.398l.275-.223a.89.89 0 01.738-.135l1.273.363a.414.414 0 00.663-.107.827.827 0 01.812.21l1.08-2.16a2.25 2.25 0 00.45-.614l1.135-1.135a2.25 2.25 0 000-3.182z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  </svg>
                ),
              },
              {
                title: 'Admin Dashboard',
                desc: 'Panel admin dengan statistik real-time, manajemen user, dan import data massal via CSV.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                ),
              },
              {
                title: 'Analytics & Laporan',
                desc: 'Visualisasi data tracer study: employment rate, distribusi gaji, kesesuaian bidang — untuk akreditasi.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                title: 'Keamanan RBAC',
                desc: 'Row-Level Security di database + middleware routing. Setiap user hanya bisa akses data yang diizinkan.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[#E8E8ED] bg-white p-7 transition-all hover:border-amikom-purple/20 hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amikom-purple/5 text-amikom-purple">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-[17px] font-semibold leading-[1.24] tracking-[-0.02em] text-[#1A1A1E]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] font-normal leading-[1.6] text-[#5A5A6E]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ ANALYTICS HIGHLIGHT ═══════════════ */}
      <section id="analytics" className="bg-white">
        <div className="mx-auto max-w-[980px] px-6 py-[80px] text-center lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amikom-purple mb-3">Untuk Akreditasi</p>
          <h2 className="text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1A1A1E]">
            Data yang Berbicara.
          </h2>
          <p className="mt-4 text-[18px] font-normal leading-[1.5] text-[#5A5A6E] max-w-[560px] mx-auto">
            Kuesioner terstruktur menghasilkan data berharga untuk akreditasi dan peningkatan kualitas pendidikan.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { label: 'Employment Rate', value: '87%', desc: 'Alumni bekerja setelah lulus', color: 'text-amikom-purple' },
              { label: 'Response Rate', value: '92%', desc: 'Rata-rata pengisian kuesioner', color: 'text-[#1A1A1E]' },
              { label: 'Field Match', value: '78%', desc: 'Pekerjaan sesuai bidang studi', color: 'text-amikom-purple' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E8E8ED] bg-[#FAFBFC] px-6 py-8 text-center transition-all hover:border-amikom-purple/20"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8E8E93]">
                  {stat.label}
                </p>
                <p className={`mt-3 text-[36px] font-semibold tracking-[-0.03em] ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[#8E8E93]">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="bg-[#F2F3F5]">
        <div className="mx-auto max-w-[980px] px-6 py-[80px] text-center lg:px-12">
          <div className="rounded-3xl bg-gradient-to-br from-amikom-purple to-[#4A004A] p-10 md:p-14 text-center">
            <h2 className="text-[28px] md:text-[36px] font-semibold leading-[1.1] text-white">
              Siap Memulai?
            </h2>
            <p className="mt-3 text-[17px] font-normal leading-[1.5] text-white/80 max-w-[480px] mx-auto">
              Masuk ke portal SITRACK dan mulai lengkapi data tracer study Anda.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[16px] font-normal text-amikom-purple transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
              >
                Masuk ke Portal
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#FAFBFC] border-t border-[#E8E8ED]">
        <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 — Brand */}
            <div>
              <h4 className="text-[14px] font-semibold leading-[1.29] tracking-[-0.016em] text-[#1A1A1E]">
                SITRACK
              </h4>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#5A5A6E]">
                Sistem Informasi Track Record Alumni Universitas Amikom Surakarta.
              </p>
            </div>

            {/* Column 2 — Platform */}
            <div>
              <h4 className="text-[14px] font-semibold leading-[1.29] tracking-[-0.016em] text-[#1A1A1E]">
                Platform
              </h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="#cara-kerja" className="text-[15px] leading-[1.6] text-[#5A5A6E] hover:text-amikom-purple transition-colors">Cara Kerja</Link></li>
                <li><Link href="#fitur" className="text-[15px] leading-[1.6] text-[#5A5A6E] hover:text-amikom-purple transition-colors">Fitur</Link></li>
                <li><Link href="#analytics" className="text-[15px] leading-[1.6] text-[#5A5A6E] hover:text-amikom-purple transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Column 3 — Akun */}
            <div>
              <h4 className="text-[14px] font-semibold leading-[1.29] tracking-[-0.016em] text-[#1A1A1E]">
                Akun
              </h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/login" className="text-[15px] leading-[1.6] text-[#5A5A6E] hover:text-amikom-purple transition-colors">Masuk</Link></li>
                <li><span className="text-[15px] leading-[1.6] text-[#8E8E93]">Pendaftaran via Admin</span></li>
              </ul>
            </div>

            {/* Column 4 — Kampus */}
            <div>
              <h4 className="text-[14px] font-semibold leading-[1.29] tracking-[-0.016em] text-[#1A1A1E]">
                Kampus
              </h4>
              <ul className="mt-3 space-y-2">
                <li><a href="https://solo.amikom.ac.id" target="_blank" rel="noopener noreferrer" className="text-[15px] leading-[1.6] text-[#5A5A6E] hover:text-amikom-purple transition-colors">Website Resmi</a></li>
                <li><span className="text-[15px] leading-[1.6] text-[#5A5A6E]">Surakarta, Jawa Tengah</span></li>
              </ul>
            </div>
          </div>

          {/* Legal */}
          <div className="mt-10 pt-8 border-t border-[#E8E8ED] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#8E8E93]">
              STMIK Amikom Surakarta &copy; {year}
            </p>
            <p className="text-[12px] text-[#8E8E93]">
              Dibangun untuk akreditasi &amp; peningkatan kualitas pendidikan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
