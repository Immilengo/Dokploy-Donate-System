import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            H
          </div>
          <h1 className="text-xl font-semibold text-foreground">Fundação Hubble</h1>
          <p className="text-sm text-muted-foreground">Doações que salvam vidas</p>
        </div>
        <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}