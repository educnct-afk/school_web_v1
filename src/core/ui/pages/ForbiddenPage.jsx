import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 grid place-items-center">
          <ShieldAlert size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-display font-bold">Access denied</h1>
        <p className="mt-2 text-ink-500">
          You don't have permission to view this page. Ask an administrator to grant the required role.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  );
}
