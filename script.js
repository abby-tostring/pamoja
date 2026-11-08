/**
 * Pamoja / Vibes Edition
 * ---------------------
 * Standalone ES module; no dependencies, bundler, network requests, or backend.
 * Data is intentionally demo-only and persisted in localStorage. Never use this
 * storage model for financial records or personally identifiable information.
 *
 * Sections: constants → persistence → money math → renderers → event handlers.
 */

/** @typedef {{id:string,title:string,amount:number,category:string,payer:string,mode:string,shares:number[],reaction:string,date:string}} Expense */
/** @typedef {{expenses:Expense[],budget:number,streak:number,lastCheckIn:string}} AppState */

const PEOPLE = ['Abby', 'Jules', 'Sam', 'Toni'];
const STORAGE_KEY = 'pamoja-vibes-demo-v1';
const CATEGORY_EMOJI = {Food:'🍔',Travel:'🚕',Stay:'🏠',Shopping:'🛍️',Other:'✨'};
const REACTIONS = {none:'No reaction',clown:'🤡 Clown behavior',ruin:'💸 Financial ruin',iconic:'💅 Iconic purchase',worth:'✨ Worth it',ouch:'😭 Pain'};
const $ = (selector,root=document) => root.querySelector(selector);
const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
const todayISO = () => new Date().toLocaleDateString('en-CA');
const formatMoney = value => `KES ${Number(value).toLocaleString('en-KE',{minimumFractionDigits:0,maximumFractionDigits:2})}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sample = () => ({
  budget:15000,streak:7,lastCheckIn:'',
  expenses:[
    {id:'demo-1',title:'Airbnb in Diani',amount:12000,category:'Stay',payer:'Abby',mode:'equal',shares:[3000,3000,3000,3000],reaction:'worth',date:'2026-11-06'},
    {id:'demo-2',title:'Groceries for the squad',amount:3200,category:'Food',payer:'Jules',mode:'equal',shares:[800,800,800,800],reaction:'none',date:'2026-11-07'},
    {id:'demo-3',title:'Uber to the beach',amount:1600,category:'Travel',payer:'Sam',mode:'equal',shares:[400,400,400,400],reaction:'ruin',date:'2026-11-07'},
    {id:'demo-4',title:'Iced matcha situation',amount:950,category:'Food',payer:'Abby',mode:'equal',shares:[237.5,237.5,237.5,237.5],reaction:'clown',date:'2026-11-08'}
  ]
});
/** Parse and validate the local demo payload before use. */
function loadState(){
  try{
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!stored||!Array.isArray(stored.expenses)||!Number.isFinite(stored.budget)||stored.budget<=0) return sample();
    const expenses=stored.expenses.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&Number.isFinite(e.amount)&&e.amount>0&&PEOPLE.includes(e.payer)&&Array.isArray(e.shares)&&e.shares.length===4&&e.shares.every(n=>Number.isFinite(n)&&n>=0)).slice(0,300);
    return {expenses,budget:stored.budget,streak:Number.isInteger(stored.streak)?Math.max(0,stored.streak):7,lastCheckIn:typeof stored.lastCheckIn==='string'?stored.lastCheckIn:''};
  }catch{return sample();}
}
let state=loadState();
let splitMode='equal';
let percentInputs=[25,25,25,25];
let leechInputs=[1,1,1,0.25];
let currentView='dashboard';
let toastTimer;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{toast('Storage unavailable; changes will reset on refresh.');}}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-visible'),3200);}

/**
 * Split in integer cents to ensure exact totals and eliminate floating-point
 * drift. Remaining cents are assigned deterministically to earlier members.
 */
function allocateCents(amount,weights){
  const cents=Math.round(amount*100);
  const total=weights.reduce((sum,w)=>sum+w,0);
  if(!Number.isFinite(cents)||cents<0||!Number.isFinite(total)||total<=0||weights.some(w=>!Number.isFinite(w)||w<0))return null;
  const raw=weights.map(w=>cents*w/total);
  const base=raw.map(Math.floor);
  let remainder=cents-base.reduce((a,b)=>a+b,0);
  const order=raw.map((v,i)=>({i,part:v-base[i]})).sort((a,b)=>b.part-a.part||a.i-b.i);
  for(let i=0;i<remainder;i++)base[order[i].i]++;
  return base.map(c=>c/100);
}
function splitWeights(mode){
  if(mode==='equal')return [1,1,1,1];
  if(mode==='percent')return percentInputs.reduce((a,b)=>a+b,0)===100?percentInputs:null;
  return leechInputs.some(w=>w>0)?leechInputs:null;
}
function splitShares(amount,mode){const weights=splitWeights(mode);return weights?allocateCents(amount,weights):null;}

/** Dashboard balance is payer's total advances less their own owed shares. */
function netBalance(){return state.expenses.reduce((net,e)=>net+(e.payer==='Abby'?e.amount:0)-e.shares[0],0);}
function personalSpending(){return state.expenses.reduce((sum,e)=>sum+e.shares[0],0);}
function renderSummary(){
  const net=netBalance();$('#netBalance').textContent=`${net<0?'−':''}${formatMoney(Math.abs(net))}`;
  $('#balanceCaption').textContent=net>0?'Your friends owe you. Respectfully.':net<0?'You owe the crew. No pressure (some pressure).':'All settled up. Iconic.';
  $('#streakDays').textContent=state.streak;
  $('#checkInButton').disabled=state.lastCheckIn===todayISO();
  $('#checkInStatus').textContent=state.lastCheckIn===todayISO()?'Checked in today ✓':'';
  const spent=personalSpending(),ratio=spent/state.budget,warning=ratio>1;
  $('#healthTile').classList.toggle('is-warning',warning);
  $('#healthEmoji').textContent=warning?'💀':'🤠';
  $('#healthTitle').textContent=warning?'Wallet in its flop era':'You’re chillin’';
  $('#healthDescription').textContent=warning?'Budget crossed. Time to regroup.':'Your wallet is vibing.';
  $('#budgetSpent').textContent=`${formatMoney(spent)} spent`;
  $('#budgetLimit').textContent=`of ${formatMoney(state.budget)}`;
  $('#budgetFill').style.width=`${Math.min(100,ratio*100)}%`;
  $('#budgetProgress').setAttribute('aria-valuenow',String(Math.min(100,Math.round(ratio*100))));
  $('#budgetProgress').setAttribute('aria-valuetext',`${Math.round(ratio*100)} percent of budget used`);
}
function renderFeed(){
  const container=$('#expenseFeed');container.replaceChildren();$('#feedEmpty').hidden=state.expenses.length!==0;
  [...state.expenses].reverse().forEach(expense=>{
    const item=document.createElement('article');item.className='feed-item';
    const category=CATEGORY_EMOJI[expense.category]||'✨';
    const reaction=REACTIONS[expense.reaction]||REACTIONS.none;
    const options=Object.entries(REACTIONS).map(([key,label])=>`<option value="${key}" ${expense.reaction===key?'selected':''}>${label}</option>`).join('');
    item.innerHTML=`<div class="feed-avatar" aria-hidden="true">${category}</div><div class="feed-content"><div class="feed-top"><strong>${escapeHTML(expense.title)}</strong><time datetime="${escapeHTML(expense.date)}">${escapeHTML(expense.date)}</time></div><p class="feed-description"><b>${escapeHTML(expense.payer==='Abby'?'You':expense.payer)}</b> paid · ${escapeHTML(expense.mode==='leech'?'Leech Ratio':expense.mode==='percent'?'By %':'Equally')} · Your share ${formatMoney(expense.shares[0])}</p><div class="feed-meta"><span class="feed-price">${formatMoney(expense.amount)}</span><div class="feed-actions">${expense.reaction!=='none'?`<span class="reaction-tag">${reaction}</span>`:''}<label><span class="sr-only">React to ${escapeHTML(expense.title)}</span><select class="reaction-select" data-reaction-id="${escapeHTML(expense.id)}" aria-label="Reaction for ${escapeHTML(expense.title)}">${options}</select></label><button class="delete-expense" data-delete-id="${escapeHTML(expense.id)}" aria-label="Delete ${escapeHTML(expense.title)}">Remove</button></div></div></div>`;
    container.append(item);
  });
}
function renderChart(){
  const totals=Object.fromEntries(Object.keys(CATEGORY_EMOJI).map(c=>[c,0]));
  state.expenses.forEach(e=>{totals[e.category]=(totals[e.category]||0)+(e.payer==='Abby'?e.amount:0);});
  const maximum=Math.max(1,...Object.values(totals));
  $('#categoryChart').innerHTML=Object.entries(totals).map(([name,value])=>`<div class="chart-row"><span>${escapeHTML(name)}</span><div class="chart-track"><div class="chart-fill" style="width:${value/maximum*100}%"></div></div><strong>${formatMoney(value).replace('KES ','')}</strong></div>`).join('');
}
function renderSplit(){
  $$('.mode-btn').forEach(button=>{const active=button.dataset.mode===splitMode;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
  const container=$('#splitInputs');container.replaceChildren();
  if(splitMode!=='equal'){
    const values=splitMode==='percent'?percentInputs:leechInputs;
    values.forEach((value,index)=>{
      const row=document.createElement('label');row.className='split-input-row';
      row.innerHTML=`<span>${PEOPLE[index]} ${splitMode==='percent'?'(%)':'(weight)'}</span><input type="number" data-split-index="${index}" min="0" max="${splitMode==='percent'?'100':'1000'}" step="${splitMode==='percent'?'1':'0.25'}" value="${value}" aria-label="${PEOPLE[index]} ${splitMode==='percent'?'percentage':'weight'}">`;
      container.append(row);
    });
  }
  renderSplitResults();
}
function renderSplitResults(){
  const amount=Number($('#splitAmount').value),target=$('#splitResults');
  const valid=Number.isFinite(amount)&&amount>0&&amount<=100000000;
  const shares=valid?splitShares(amount,splitMode):null;
  $('#useSplitButton').disabled=!shares;
  if(!shares){target.innerHTML=`<p class="split-error">${splitMode==='percent'?'Percentages must add up to exactly 100.':'Enter a positive amount and valid split weights.'}</p>`;return;}
  target.innerHTML=PEOPLE.map((person,i)=>`<div class="split-result-row"><span>${person}${i===0?' (you)':''}</span><strong>${formatMoney(shares[i])}</strong></div>`).join('');
}
function render(){renderSummary();renderFeed();renderChart();renderSplit();}

/** View navigation keeps one accessible page and focuses the target section. */
function navigate(view){
  currentView=view;
  $$('[data-view]').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('is-active',active);if(button.classList.contains('nav-link')){if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}});
  const targets={dashboard:null,feed:'#feedSection',groups:'.group-tile',insights:'.insight-tile'};
  const descriptions={feed:'☷ Vibe feed — every shared expense, every iconic purchase.',groups:'♧ The Diani Crew — Abby, Jules, Sam & Toni. Demo group.',insights:'◉ Your spending snapshot — calculated from the demo expenses.'};
  const banner=$('#viewBanner');banner.hidden=view==='dashboard';if(view!=='dashboard')banner.textContent=descriptions[view];
  const target=targets[view]?$(targets[view]):$('#main');target.scrollIntoView({behavior:'smooth',block:'start'});
}
function openDialog(dialog){if(!dialog.open)dialog.showModal();}
function closeDialog(dialog){if(dialog.open)dialog.close();}

/** Event delegation prevents listeners being recreated for every feed update. */
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-view]');if(nav){navigate(nav.dataset.view);return;}
  if(event.target.closest('#addExpenseButton,#feedAddButton')){openDialog($('#expenseDialog'));return;}
  if(event.target.closest('#budgetButton')){$('#budgetInput').value=state.budget;openDialog($('#budgetDialog'));return;}
  if(event.target.closest('[data-close-dialog]')){closeDialog(event.target.closest('dialog'));return;}
  const mode=event.target.closest('[data-mode]');if(mode){splitMode=mode.dataset.mode;renderSplit();return;}
  const remove=event.target.closest('[data-delete-id]');if(remove){const e=state.expenses.find(item=>item.id===remove.dataset.deleteId);if(e&&confirm(`Remove “${e.title}” from this demo?`)){state.expenses=state.expenses.filter(item=>item.id!==e.id);save();render();toast('Expense removed.');}return;}
  if(event.target.closest('#checkInButton')){
    if(state.lastCheckIn===todayISO())return;
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    state.streak=state.lastCheckIn===yesterday.toLocaleDateString('en-CA')?state.streak+1:state.lastCheckIn?1:state.streak+1;
    state.lastCheckIn=todayISO();save();renderSummary();toast('🔥 Daily check-in complete!');return;
  }
  if(event.target.closest('#resetDemo')){if(confirm('Reset all local demo expenses and streaks?')){state=sample();save();render();toast('Demo reset. Fresh start!');}return;}
  if(event.target.closest('#groupButton')){navigate('groups');toast('Meet Abby, Jules, Sam and Toni — the Diani crew!');return;}
  if(event.target.closest('#profileButton')){toast('Demo profile: Abby Grace · KES · local-only data');return;}
  if(event.target.closest('#useSplitButton')){
    const amount=Number($('#splitAmount').value);if(!splitShares(amount,splitMode))return;
    $('#expenseAmount').value=amount;$('#expenseMode').value=splitMode;openDialog($('#expenseDialog'));return;
  }
});
document.addEventListener('change',event=>{
  const select=event.target.closest('[data-reaction-id]');
  if(select){const e=state.expenses.find(item=>item.id===select.dataset.reactionId);if(e){e.reaction=Object.hasOwn(REACTIONS,select.value)?select.value:'none';save();renderFeed();toast('Reaction updated instantly ✨');}}
});
document.addEventListener('input',event=>{
  if(event.target.id==='splitAmount'){renderSplitResults();return;}
  if(event.target.matches('[data-split-index]')){
    const index=Number(event.target.dataset.splitIndex),value=Number(event.target.value);
    const array=splitMode==='percent'?percentInputs:leechInputs;
    array[index]=event.target.value===''||!Number.isFinite(value)||value<0?NaN:value;
    renderSplitResults();
  }
});
$('#expenseForm').addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
  const title=$('#expenseTitle').value.trim(),amount=Number($('#expenseAmount').value),category=$('#expenseCategory').value,payer=$('#expensePayer').value,mode=$('#expenseMode').value;
  if(!title||!Number.isFinite(amount)||amount<=0||amount>100000000||!PEOPLE.includes(payer)){toast('Check the expense details and try again.');return;}
  const shares=splitShares(amount,mode);
  if(!shares){toast('Check Split Lab: percentages must total 100 and weights must be valid.');return;}
  const expense={id:crypto.randomUUID(),title,amount,category,payer,mode,shares,reaction:'none',date:todayISO()};
  state.expenses.push(expense);save();render();form.reset();closeDialog($('#expenseDialog'));toast('Expense dropped. The group chat is shaking.');
});
$('#budgetForm').addEventListener('submit',event=>{
  event.preventDefault();const amount=Number($('#budgetInput').value);
  if(!Number.isFinite(amount)||amount<=0||amount>100000000){toast('Enter a valid budget.');return;}
  state.budget=amount;save();renderSummary();closeDialog($('#budgetDialog'));toast('New budget locked in ✳');
});
$$('.app-dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog);}));
$('#todayLabel').textContent=new Intl.DateTimeFormat('en-GB',{month:'short',day:'numeric',year:'numeric'}).format(new Date()).toUpperCase();
render();
