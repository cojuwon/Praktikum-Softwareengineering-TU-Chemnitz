// app/layout.tsx
import '@/components/ui/global.css';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/lib/userContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}


//import './globals.css';
/*
import '@/components/ui/global.css';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/lib/userContext';
import Navbar from '@/components/ui/dashboard/navbar';
import SideNav from '@/components/ui/dashboard/sidenav';


const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}*/

/*
import '@/components/ui/global.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/ui/dashboard/navbar';
import SideNav from '@/components/ui/dashboard/sidenav';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>
     
        <Navbar />

        <div className="flex flex-1 min-h-screen">
     
          <div className="hidden md:block">
            <SideNav />
          </div>

       
          <main className="flex-1 p-4 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}*/


/*
import '@/components/ui/global.css';
import { inter } from '@/components/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
    
  );
}
*/