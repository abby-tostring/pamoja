'use client';
import {FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {supabase} from '@/lib/supabase';
import {currencies} from '@/lib/money';

export default function GroupCreate({onDone}:{onDone?: () => void}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      toast.error('Please enter a group name.');
      return;
    }

    setBusy(true);
    try {
      const client = supabase();
      const {data: userData, error: userError} = await client.auth.getUser();

      if (userError || !userData.user) {
        throw new Error('Please log in again and try creating the group.');
      }

      const {data, error} = await client
        .from('groups')
        .insert({
          name: trimmedName,
          description: trimmedDescription || null,
          currency,
          created_by: userData.user.id,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast.success('Group created!');
      onDone?.();
      router.push('/groups/' + data.id);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create group';
      toast.error(message.includes('violates row-level security') || message.includes('permission denied')
        ? 'You do not have permission to create groups right now.'
        : 'Could not create group. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Group name</label>
        <input className="field" maxLength={80} required placeholder="e.g. Diani weekend 🌴" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <textarea className="field" rows={2} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the occasion?" />
      </div>
      <div>
        <label className="label">Group currency</label>
        <select className="field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {currencies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <p className="mt-1 text-xs text-muted">All expenses and settlements in this group use this currency.</p>
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create group'}</button>
    </form>
  );
}
