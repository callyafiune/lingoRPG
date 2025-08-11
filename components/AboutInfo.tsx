import React from 'react';
import { Shield, Volume2, List, Languages } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

export const AboutInfo: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col text-slate-300 overflow-y-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="max-w-2xl mx-auto pt-4">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4">{t('aboutTitle')}</h2>
        <p className="text-lg leading-relaxed mb-6">
          {t('aboutP1')}
        </p>

        <h3 className="text-2xl font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">{t('howItWorksTitle')}</h3>
        <p className="leading-relaxed mb-6">
          {t('howItWorksP1')}
        </p>
        
        <h3 className="text-2xl font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">{t('keyFeaturesTitle')}</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <Shield className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">{t('feature1Title')}</h4>
              <p className="text-slate-400">{t('feature1Text')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <Volume2 className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">{t('feature2Title')}</h4>
              <p className="text-slate-400">{t('feature2Text')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <List className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">{t('feature3Title')}</h4>
              <p className="text-slate-400">{t('feature3Text')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <Languages className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">{t('feature4Title')}</h4>
              <p className="text-slate-400">{t('feature4Text')}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
