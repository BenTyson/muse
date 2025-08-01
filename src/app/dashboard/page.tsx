import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Your dashboard is coming soon. From here you'll be able to:
          </p>
          <ul className="mt-4 list-disc list-inside text-gray-600">
            <li>Book new photo sessions</li>
            <li>View upcoming sessions</li>
            <li>Access your photo galleries</li>
            <li>Order prints and products</li>
            <li>Manage your account</li>
          </ul>
        </div>
      </div>
    </div>
  )
}