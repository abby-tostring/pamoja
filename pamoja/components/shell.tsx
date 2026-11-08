'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {AuthProvider,useAuth} from './auth-provider';
import {ChartPie,LayoutDashboard,LogOut,Menu,Plus,Receipt,Settings,Users,Wallet,X,Moon,Sun,Sparkles} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import GuidedTour from './guided-tour';
import {appTour} from './tour-steps';
const nav=[['/dashboard','Overview',LayoutDashboard],['/groups','Your groups',Users],['/expenses','Vibe feed',Receipt],['/settlements','Settle up',Wallet],['/analytics','Insights',ChartPie],['/settings','Settings',Settings]] as const;
function Inner({children}:{children:React.ReactNode}){
 const {user,profile,loading}=useAuth(),path=usePathname(),router=useRouter();
 const [menu,setMenu]=useState(false),[dark,setDark]=useState(false);
 useEffect(()=>{setDark(localStorage.getItem('pamoja-theme')==='dark')},[]);
 useEffect(()=>{document.body.classList.toggle('dark',dark);localStorage.setItem('pamoja-theme',dark?'dark':'light')},[dark]);
 useEffect(()=>{if(!loading&&!user)router.replace('/login?next='+encodeURIComponent(path))},[loading,user,path,router]);
 if(loading||!user)return <div className="grid min-h-screen place-items-center text-muted" role="status">Loading your space…</div>;
 const links=nav.map(([href,label,Icon])=><Link key={href} onClick={()=>setMenu(false)} href={href} aria-current={path===href?'page':undefined} className={'vibe-nav '+(path===href||path.startsWith(href+'/')?'is-active':'')}><Icon size={19}/><span>{label}</span><span className="ml-auto opacity-50">↗</span></Link>);
 return <div className="vibe-app"><a href="#app-main" className="skip-link">Skip to content</a><aside className="vibe-sidebar"><Link href="/dashboard" className="vibe-brand"><span className="vibe-brand-mark">✳</span> pamoja<span className="text-emerald-600">.</span></Link><p className="vibe-caption">YOUR MONEY, BUT SOCIAL</p><nav data-tour="app-nav" aria-label="Primary navigation" className="vibe-navigation">{links}</nav><div className="vibe-sidebar-bottom"><div className="vibe-sticker">NO MORE<br/>“I'LL SEND<br/>IT LATER” <Sparkles size={27}/></div><p>REAL PEOPLE. REAL SPLITS. ZERO DRAMA.</p><Link data-tour="app-groups" href="/groups" className="vibe-new-group"><Plus size={17}/> Create a group</Link></div></aside><div className="vibe-main-wrap"><header className="vibe-topbar"><div className="flex items-center gap-3"><button className="vibe-icon-btn lg:hidden" aria-label="Toggle navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><span className="vibe-live-dot"/><span className="vibe-top-label">THE GROUP CHAT, BUT FOR MONEY</span></div><div className="flex items-center gap-3"><GuidedTour scope="dashboard" steps={appTour} compact autoStart={path==='/dashboard'}/><button data-tour="app-theme" className="vibe-icon-btn" aria-label="Toggle theme" onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><span className="hidden text-sm font-bold sm:block">{profile?.full_name||user.email}</span><span data-tour="app-profile" className="vibe-avatar">{(profile?.full_name||user.email||'P').slice(0,1).toUpperCase()}</span><button className="vibe-icon-btn" aria-label="Sign out" onClick={async()=>{await supabase().auth.signOut();router.push('/')}}><LogOut size={18}/></button></div></header>{menu&&<nav className="vibe-mobile-nav" aria-label="Mobile navigation">{links}</nav>}<main data-tour="app-main" id="app-main" className="vibe-content">{children}</main></div></div>
}
export default function Shell({children}:{children:React.ReactNode}){return <AuthProvider><Inner>{children}</Inner></AuthProvider>}
