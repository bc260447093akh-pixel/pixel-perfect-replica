import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/market-auth';
import { pageHead } from '@/lib/marketplace';
export const Route = createFileRoute('/login')({ head: () => pageHead('Sign In', 'Sign in to your Kings Marketplace account.'), component: AuthForm });