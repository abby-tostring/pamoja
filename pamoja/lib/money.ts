import type {Expense,Settlement,Debt} from './types';
export const currencies=['KES','USD','EUR','GBP','UGX','TZS','ZAR','INR','CAD','AUD'];
export function money(value:number,currency='KES'){return new Intl.NumberFormat('en-KE',{style:'currency',currency,maximumFractionDigits:2}).format(value||0)}
export function round(n:number){return Math.round((n+Number.EPSILON)*100)/100}
export function splitAmounts(amount:number,ids:string[],mode:'equal'|'percentage'|'custom',values:number[]=[]){
 const cents=Math.round(amount*100);if(!ids.length)throw Error('Add members first');
 if(mode==='equal'){const each=Math.floor(cents/ids.length);return ids.map((_,i)=>(each+(i<cents%ids.length?1:0))/100)}
 if(values.length!==ids.length||values.some(v=>!Number.isFinite(v)||v<0))throw Error('Invalid split values');
 if(mode==='percentage'){
  if(Math.abs(values.reduce((a,b)=>a+b,0)-100)>0.001)throw Error('Percentages must total 100%');
  const raw=values.map(v=>cents*v/100),base=raw.map(Math.floor);let rem=cents-base.reduce((a,b)=>a+b,0);
  const order=raw.map((v,i)=>({i,frac:v-base[i]})).sort((a,b)=>b.frac-a.frac);for(let i=0;i<rem;i++)base[order[i].i]++;return base.map(v=>v/100);
 }
 if(Math.round(values.reduce((a,b)=>a+b,0)*100)!==cents)throw Error('Custom amounts must total the expense amount');
 return values.map(round);
}
export function balances(ids:string[],expenses:Expense[],settlements:Settlement[]){
 const net:Record<string,number>={};ids.forEach(id=>net[id]=0);
 expenses.forEach(e=>{net[e.paid_by]=(net[e.paid_by]||0)+Math.round(Number(e.amount)*100);(e.expense_splits||[]).forEach(s=>net[s.user_id]=(net[s.user_id]||0)-Math.round(Number(s.amount)*100))});
 settlements.forEach(s=>{net[s.from_user]=(net[s.from_user]||0)+Math.round(Number(s.amount)*100);net[s.to_user]=(net[s.to_user]||0)-Math.round(Number(s.amount)*100)});
 return Object.fromEntries(Object.entries(net).map(([id,c])=>[id,c/100]));
}
export function simplify(net:Record<string,number>):Debt[]{
 const debtors=Object.entries(net).filter(([,v])=>v<-.005).map(([id,v])=>({id,cents:-Math.round(v*100)}));
 const creditors=Object.entries(net).filter(([,v])=>v>.005).map(([id,v])=>({id,cents:Math.round(v*100)}));
 const result:Debt[]=[];let i=0,j=0;while(i<debtors.length&&j<creditors.length){const n=Math.min(debtors[i].cents,creditors[j].cents);if(n>0)result.push({from:debtors[i].id,to:creditors[j].id,amount:n/100});debtors[i].cents-=n;creditors[j].cents-=n;if(!debtors[i].cents)i++;if(!creditors[j].cents)j++;}return result;
}
