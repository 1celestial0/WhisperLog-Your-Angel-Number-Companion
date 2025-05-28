
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/log');
  return null; // Or a loading component if preferred before redirect completes
}
