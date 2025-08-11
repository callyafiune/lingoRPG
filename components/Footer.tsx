import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="p-4 text-center text-sm text-slate-500">
      <p>{t('footerText')}</p>
      <p className="mt-1">{t('footerCopyright')}</p>
    </footer>
  );
};
