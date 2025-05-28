
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/welcome'); // Redirect to the new welcome page
  return null;
}
