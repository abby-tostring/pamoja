"use client";
/** Accessible, dismissible tours. No user data leaves the browser. */
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,X,Compass} from 'lucide-react';
export type TourStep={target:string;title:string;description:string};
export default function GuidedTour({scope,steps,autoStart=false,compact=false}:{scope:string;steps:TourStep[];autoStart?:boolean;compact?:boolean}){
 const [active,setActive]=useState(false),[index,setIndex]=useState(0),[rect,setRect]=useState<DOMRect|null>(null);
 const lastFocus=useRef<HTMLElement|null>(null);
 const key='pamoja-tour-completed-'+scope;
 const close=useCallback(()=>{setActive(false);setRect(null);lastFocus.current?.focus();},[]);
 const start=()=>{lastFocus.current=document.activeElement as HTMLElement;setIndex(0);setActive(true)};
 useEffect(()=>{if(autoStart && !localStorage.getItem(key)){const id=window.setTimeout(start,800);return()=>window.clearTimeout(id)}},[autoStart,key]);
 useEffect(()=>{if(!active)return;const el=document.querySelector(steps[index]?.target) as HTMLElement|null;if(!el){setRect(null);return}el.scrollIntoView({behavior:'smooth',block:'center'});const update=()=>setRect(el.getBoundingClientRect());update();const t=window.setTimeout(update,400);window.addEventListener('resize',update);window.addEventListener('scroll',update,true);return()=>{window.clearTimeout(t);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)}},[active,index,steps]);
 useEffect(()=>{if(!active)return;const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')setIndex(i=>Math.min(steps.length-1,i+1));if(e.key==='ArrowLeft')setIndex(i=>Math.max(0,i-1));};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[active,close,steps.length]);
 const finish=()=>{localStorage.setItem(key,'yes');close()};
 const r=rect;const top=r?Math.max(8,r.top-7):0;const left=r?Math.max(8,r.left-7):0;
 return <><button type="button" onClick={start} className={compact?'tour-launch tour-launch-compact':'tour-launch'} aria-label={'Start '+scope+' tour'}><Compass size={17}/> {compact?'Tour':'Take a quick tour'}</button>{active&&<div className="tour-root" role="presentation"><div className="tour-shade" onClick={close}/>{r&&<div className="tour-highlight" aria-hidden="true" style={{top,left,width:r.width+14,height:r.height+14}}/>}<section className="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-description"><div className="tour-dialog-top"><span className="tour-counter">PAmoja FIELD GUIDE · {index+1}/{steps.length}</span><button type="button" className="tour-close" onClick={close} aria-label="Close tour"><X size={19}/></button></div><div className="tour-progress" aria-hidden="true"><span style={{width:`${(index+1)/steps.length*100}%`}}/></div><h2 id="tour-title">{steps[index].title}</h2><p id="tour-description">{steps[index].description}</p><div className="tour-actions"><button type="button" onClick={finish} className="tour-skip">Skip tour</button><div><button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)} className="tour-back"><ArrowLeft size={16}/> Back</button>{index===steps.length-1?<button type="button" onClick={finish} className="tour-next">Let's go <ArrowRight size={16}/></button>:<button type="button" onClick={()=>setIndex(i=>i+1)} className="tour-next">Next <ArrowRight size={16}/></button>}</div></div></section></div>}</>
}
