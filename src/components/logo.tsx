import { Wind } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Yatharth 2025">
      <Wind className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold tracking-tight">Yatharth 2025</h1>
    </div>
  );
}
