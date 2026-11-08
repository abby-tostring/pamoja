import type {TourStep} from './guided-tour';
/** Public tour shows real product explanations, not fabricated account data. */
export const publicTour:TourStep[]=[
 {target:'[data-tour="hero"]',title:'Meet Pamoja ✳',description:'Pamoja means together. We make shared spending feel simple, fair and a little more fun.'},
 {target:'[data-tour="preview"]',title:'Your group, at a glance',description:'This Diani weekend is an illustration. Once you join, your actual groups and balances appear in your own dashboard.'},
 {target:'[data-tour="why"]',title:'Why we built this',description:'Because nobody should have to chase friends through the group chat just to settle a bill.'},
 {target:'[data-tour="how"]',title:'Three steps, zero drama',description:'Create a group, add expenses with your preferred split, then track who owes whom.'},
 {target:'[data-tour="features"]',title:'The useful stuff',description:'Invite friends, attach receipts, see insights, record settlements and download reports.'},
 {target:'[data-tour="cta"]',title:'Ready for your money era?',description:'Create your free account and start a group. Pamoja tracks payments; it does not send money on your behalf.'}
];
export const appTour:TourStep[]=[
 {target:'[data-tour="app-nav"]',title:'Your command centre',description:'Jump between your overview, groups, expense feed, settlements, insights and settings.'},
 {target:'[data-tour="app-groups"]',title:'Start with your squad',description:'Create a group and invite your friends. Only members of a group should be able to access its expenses.'},
 {target:'[data-tour="app-main"]',title:'Your personal overview',description:'Your real groups and recent expenses appear here. The budget check-in and streak are currently stored only on this device.'},
 {target:'[data-tour="app-theme"]',title:'Make it yours',description:'Switch between light and dark mode any time.'},
 {target:'[data-tour="app-profile"]',title:'You’re in control',description:'See which account is signed in and sign out when you’re done.'}
];
