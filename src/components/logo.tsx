'use client';
import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-3" aria-label="Yatharth 2025">
      <Image
        src="https://raw.githubusercontent.com/abhijeet94321/abhijeet/main/image.png"
        alt="Yatharth 2025 Logo"
        width={32}
        height={32}
        className="rounded-md"
      />
      <h1 className="text-xl font-bold tracking-tight">Yatharth 2025</h1>
    </div>
  );
}
