// components/PageLoader.tsx

import React from 'react';

const PageLoader: React.FC = () => (
  // Changed min-h-[50vh] to min-h-screen to ensure vertical centering relative to full viewport
  <div className="flex items-center justify-center min-h-screen w-full bg-white/50 backdrop-blur-sm fixed inset-0 z-50">
    <div className="relative">
      <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
      <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-pink-600 border-t-transparent"></div>
    </div>
  </div>
);

export default PageLoader;
