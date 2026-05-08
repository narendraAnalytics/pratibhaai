import { Sidebar } from './components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <Sidebar />
      <div className="ml-64 min-h-screen">
        {children}
      </div>
    </div>
  )
}
