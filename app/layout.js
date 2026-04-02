import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Blog Platform',
  description: 'A scalable blogging platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body id="global-body" className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <main id="global-main" className="flex-1 max-w-5xl mx-auto w-full px-4 pt-10 pb-16">
          {children}
        </main>

        <footer id="global-footer" className="w-full bg-[#FAFAFA] border-t border-[#F0F0F0] py-10 px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start md:items-end z-10 mt-auto shadow-inner">
           <div className="flex flex-col gap-2">
              <h3 className="font-serif font-extrabold text-gray-900 text-lg tracking-tight">The Editorial Archive</h3>
              <p className="text-xs text-gray-500 font-medium tracking-wide">© 2024 The Editorial Archive. Designed for the Digital Curator.</p>
           </div>
           <div className="flex gap-6 text-xs font-semibold text-gray-500 mt-6 md:mt-0 tracking-wide">
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Membership</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Write</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Help</a>
           </div>
        </footer>
      </body>
    </html>
  );
}
