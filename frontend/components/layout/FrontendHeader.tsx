'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export default function FrontendHeader() {
  const pathname = usePathname();
  
  const hideHeader = pathname?.startsWith('/admin');
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
}