import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../services/geminiService';
import { Languages, X } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslationPopupProps {
  text: string;
  position: { top: number; left: number };
  onClose: () => void;
}

export const TranslationPopup: React.FC<TranslationPopupProps> = ({ text, position, onClose }) => {
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const { learningLang, nativeLang, t } = useLanguage();

  useEffect(() => {
    const getTranslation = async () => {
      setIsLoading(true);
      const result = await translateText(text, learningLang, nativeLang);
      setTranslation(result);
      setIsLoading(false);
    };

    getTranslation();
  }, [text, learningLang, nativeLang]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      style={{ top: position.top, left: position.left }}
      className="translation-popup absolute z-[100] bg-slate-700 rounded-lg shadow-2xl border border-slate-600 p-4 max-w-sm w-full animate-fade-in-up"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">{t('translation')}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="text-sm text-slate-300 italic mb-2 p-2 bg-slate-800 rounded-md">
        "{text}"
      </div>
      <div className="bg-slate-800 p-3 rounded-md min-h-[50px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <p className="text-slate-200">{translation}</p>
        )}
      </div>
    </div>
  );
};
