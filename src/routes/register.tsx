import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/market-auth';
import { pageHead } from '@/lib/marketplace';
export const Route = createFileRoute('/register')({ validateSearch: (search: Record<string, unknown>) => ({ role: search['role'] === 'vendor' ? 'vendor' as const : 'customer' as const }), head: () => pageHead('Create Your Account', 'Join Kings Marketplace as a customer or independent seller.'), component: Register });
function Register() { const { role } = Route.useSearch(); return <AuthForm key={role} register initialRole={role} />; }