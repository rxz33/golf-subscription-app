import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Golf Subscription',
  description: 'Track your golf scores and support charities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        {children}
      </body>
    </html>
  )
}