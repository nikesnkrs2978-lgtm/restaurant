"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/UI';

export default function Landing() {
  const [tableInput, setTableInput] = React.useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

      <div className="z-10 max-w-sm w-full space-y-12 animate-fade-in">
        <div>
          <h1 className="text-7xl font-extrabold text-white tracking-tighter mb-2">Lumina</h1>
          <p className="text-accent text-sm font-bold uppercase tracking-[0.3em]">Dining OS 2.0</p>
        </div>

        <div className="ultra-glass p-10 rounded-[2.5rem] space-y-8 relative">
          {/* Decorative Corner Lines */}
          <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-lg" />

          <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Table ID</label>
            <Input
              type="text"
              placeholder="05"
              className="text-center font-mono text-3xl font-bold tracking-widest bg-black/40 border-zinc-700 h-16"
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
            />
          </div>
          <Button
            className="w-full h-16 text-lg rounded-2xl"
            disabled={!tableInput}
            onClick={() => router.push(`/table/table-${tableInput}`)}
          >
            Access Menu
          </Button>
        </div>

        <div className="pt-4">
          <button
            onClick={() => router.push('/kitchen')}
            className="text-zinc-500 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase"
          >
            Kitchen View
          </button>
        </div>
      </div>
    </div>
  );
}
