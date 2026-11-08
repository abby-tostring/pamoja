import './globals.css';import type {Metadata} from 'next';import {Toaster} from 'sonner';
export const metadata:Metadata={title:'Pamoja — Better together, down to the last shilling',description:'Split group expenses, settle up easily and make memories without money stress.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="font-sans antialiased"><Toaster richColors position="top-right"/>{children}</body></html>}
