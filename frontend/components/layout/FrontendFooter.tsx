'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer'

export default function FrontendHeader() {
  const pathname = usePathname();
  
  const hideFooter = pathname?.startsWith('/admin');
  
  if (hideFooter) {
    return null;
  }
  
  return <Footer />;
}