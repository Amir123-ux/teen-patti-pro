import { Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/auth-form';
import { Layout } from '@/components/layout/layout';

export default function LoginPage() {
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        <div className="p-6 bg-card rounded-lg shadow-sm border">
          <AuthForm type="login" />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}