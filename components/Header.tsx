
import React from 'react';
import { Sword } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
            <Sword className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-100">LingoRPG English AI</h1>
        </div>
      </div>
    </header>
  );
};