import React from 'react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
import { useAppStore } from '../store';

const PolicyPageSkeleton: React.FC = () => (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-6 pb-2 border-b-2 border-pink-100"></div>
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-pink-100 space-y-4">
            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            <div className="h-4 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
            <br/>
            <div className="h-4 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded w-4/5"></div>
            <div className="h-4 bg-stone-200 rounded"></div>
             <br/>
            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            <div className="h-4 bg-stone-200 rounded"></div>
        </div>
    </main>
);


const PolicyPage: React.FC = () => {
  const { settings, loading } = useAppStore();

  if (loading) {
      return <PolicyPageSkeleton />;
  }

  const policyText = settings.privacyPolicy.replace('{{CONTACT_EMAIL}}', settings.contactEmail);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-pink-100 pb-2">Privacy Policy</h2>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-pink-100 space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="whitespace-pre-wrap">{policyText}</div>
      </div>
    </main>
  );
};

export default PolicyPage;