export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'oklch(0.972 0.012 75)', fontFamily: 'var(--font-geist-sans, ui-sans-serif)' }}
    >
      {children}
    </div>
  )
}
