import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-white/95 flex items-center justify-center overflow-hidden shadow-lg">
          <img src="/Logo.svg" alt="Milkman Diary Logo" className="h-14 w-14 object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-wide">Milkman Diary</h1>
          <p className="text-blue-100">Loading your data...</p>
        </div>
      </div>
      <div className="w-12 h-12 border-4 border-blue-200 border-t-white rounded-full animate-spin" />
    </div>
  );
};
