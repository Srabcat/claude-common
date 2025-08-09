import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to candidates page since it's our main feature
  redirect('/candidates')
}