import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/market-auth';
import { pageHead } from '@/lib/marketplace';
export const Route = createFileRoute('/register')({ head: () => pageHead('Create Your Account', 'Join Kings Marketplace as a customer or independent seller.'), component: Register });
function Register() { return <AuthForm register />; }