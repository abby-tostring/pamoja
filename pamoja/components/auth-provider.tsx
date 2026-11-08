'use client';import {createContext,useContext,useEffect,useState} from 'react';import type {User} from '@supabase/supabase-js';import {supabase,configured} from '@/lib/supabase';import type {Profile} from '@/lib/types';
type Auth={user:User|null;profile:Profile|null;loading:boolean;refresh:()=>Promise<void>};const Context=createContext<Auth>({user:null,profile:null,loading:true,refresh:async()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){const [user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true);
 async function refresh(){if(!configured){setLoading(false);return}try{const db=supabase();const {data:{user:u}}=await db.auth.getUser();setUser(u);if(u){const {data}=await db.from('profiles').select('*').eq('id',u.id).maybeSingle();setProfile(data)}else setProfile(null)}finally{setLoading(false)}}
 useEffect(()=>{void refresh();if(!configured)return;const {data:{subscription}}=supabase().auth.onAuthStateChange(()=>{setTimeout(()=>void refresh(),0)});return()=>subscription.unsubscribe()},[]);
 return <Context.Provider value={{user,profile,loading,refresh}}>{children}</Context.Provider>}
export const useAuth=()=>useContext(Context);
