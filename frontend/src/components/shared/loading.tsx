import { Loader2 } from 'lucide-react';

export function Loading({ label = 'A carregar...' }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}