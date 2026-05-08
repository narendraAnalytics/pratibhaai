import { DashboardHeader } from './components/DashboardHeader'
import { StatsCards } from './components/StatsCards'
import { QuickActions } from './components/QuickActions'
import { RecentJobs } from './components/RecentJobs'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 px-8 py-8 space-y-8">
        <StatsCards />
        <QuickActions />
        <RecentJobs />
      </main>
    </div>
  )
}
