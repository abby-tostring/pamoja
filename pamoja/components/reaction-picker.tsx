'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {toast} from 'sonner';
const reactions=[['','No reaction'],['🤡','🤡 Clown behavior'],['💸','💸 Financial ruin'],['🔥','🔥 Worth it'],['🫶','🫶 Good vibes']] as const;
/** Each expense reaction is private to its author and stored in Supabase. */
export default function ReactionPicker({expenseId,userId}:{expenseId:string;userId:string}){
 const [value,setValue]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let alive=true;supabase().from('expense_reactions').select('emoji').eq('expense_id',expenseId).eq('user_id',userId).maybeSingle().then(({data,error})=>{if(alive&&!error)setValue(data?.emoji||'')});return()=>{alive=false}},[expenseId,userId]);
 async function change(emoji:string){setBusy(true);const old=value;setValue(emoji);const db=supabase();const {error}=emoji?await db.from('expense_reactions').upsert({expense_id:expenseId,user_id:userId,emoji},{onConflict:'expense_id,user_id'}):await db.from('expense_reactions').delete().eq('expense_id',expenseId).eq('user_id',userId);if(error){setValue(old);toast.error(error.message)}setBusy(false)}
 return <label className="inline-flex items-center gap-1 text-xs"><span className="sr-only">Reaction for expense</span><select aria-label="React to expense" className="vibe-reaction" value={value} disabled={busy} onChange={e=>void change(e.target.value)}>{reactions.map(([emoji,label])=><option value={emoji} key={emoji}>{label}</option>)}</select></label>
}
