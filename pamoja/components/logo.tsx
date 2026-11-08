import Link from 'next/link';

export default function Logo({light = false}:{light?: boolean}) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/20 bg-emerald-100 text-xl font-black text-emerald-900 shadow-sm dark:border-emerald-300/40 dark:bg-emerald-500/10 dark:text-emerald-100">
        p.
      </span>
      <span className={light ? 'text-white dark:text-white' : 'text-ink dark:text-white'}>
        pamoja<span className="text-emerald-600 dark:text-emerald-400">.</span>
      </span>
    </Link>
  );
}
