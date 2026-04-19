import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-brand-50 via-white to-ink-100 dark:from-ink-900 dark:via-ink-900 dark:to-ink-800">
      <aside className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 to-brand-900 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center backdrop-blur">
            <GraduationCap size={20} />
          </div>
          <span className="font-semibold text-lg">School</span>
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
            One place for students, parents & staff.
          </h2>
          <p className="mt-3 text-white/80 max-w-md">
            Attendance, fees, academics, and communications — all in a calm, modern workspace.
          </p>
        </div>
        <div className="text-white/60 text-xs">© {new Date().getFullYear()} School</div>
      </aside>

      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center">
              <GraduationCap size={20} />
            </div>
            <span className="font-semibold text-lg">School</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-ink-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
