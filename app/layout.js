import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Blog Platform',
  description: 'A scalable blogging platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
