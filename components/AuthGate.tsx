'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { api, getPassword, setPassword, signOut, SIGNED_OUT_EVENT } from '@/lib/api';

/**
 * Shows the password prompt until the admin server accepts the password,
 * then renders the app. Any 401 later (e.g. the password was rotated) signs
 * out and brings the prompt back.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // null = haven't read storage yet (avoids flashing the prompt on refresh).
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [password, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // localStorage only exists in the browser, so this has to run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignedIn(Boolean(getPassword()));
    const onSignedOut = () => {
      queryClient.clear();
      setSignedIn(false);
    };
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
  }, [queryClient]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError('');
    try {
      await api('/api/session', { method: 'POST', password });
      setPassword(password);
      setPasswordInput('');
      setSignedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the admin server.");
    } finally {
      setChecking(false);
    }
  }

  if (signedIn === null) return null;

  if (!signedIn) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Ambi Admin</h1>
            <p className="text-sm text-secondary">Enter the admin password.</p>
          </div>
          <input
            type="password"
            className="input"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button className="btn-primary w-full" disabled={!password || checking}>
            {checking ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold">
            Ambi Admin
          </Link>
          <button className="text-sm text-secondary hover:text-ink" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
