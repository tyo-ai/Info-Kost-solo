'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Mengarahkan ke halaman login...</span>
      </div>
    </div>
  );
}
