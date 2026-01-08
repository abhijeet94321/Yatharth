'use client';
import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-3" aria-label="Yatharth">
      <Image
        src="https://raw.githubusercontent.com/abhijeet94321/abhijeet/main/image.png"
        alt="Yatharth Logo"
        width={32}
        height={32}
        className="rounded-md"
      />
      <h1 className="text-xl font-bold tracking-tight">Yatharth</h1>
    </div>
  );
}
