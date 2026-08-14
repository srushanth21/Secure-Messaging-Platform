'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('signal_token');
    router.replace(token ? '/chat' : '/auth');
  }, [router]);
  return null;
}
