import { Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/auth-form';
import { Layout } from '@/components/layout/layout';

export default function RegisterPage() {
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        <div className="p-6 bg-card rounded-lg shadow-sm border">
          <AuthForm type="register" />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}