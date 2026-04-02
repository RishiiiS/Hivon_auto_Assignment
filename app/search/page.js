import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 w-full max-w-[1100px]">
          <p className="text-gray-500 animate-pulse mt-10">
            Searching the archives...
          </p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}

