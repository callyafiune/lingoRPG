import React from 'react';
import { Sword, Settings } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { t } = useLanguage();
  return (
    <header className="p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <Sword className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-100">LingoRPG English AI</h1>
        </div>
        <button 
          onClick={onSettingsClick} 
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label={t('settings')}
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
