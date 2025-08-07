import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { translateText } from '../services/geminiService';

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
}

interface VocabularyContextType {
  vocabWords: VocabWord[];
  addVocabWord: (word: string) => Promise<void>;
  removeVocabWord: (id: string) => void;
  isLoading: boolean;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider = ({ children }: { children: ReactNode }) => {
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load words from localStorage on initial render
  useEffect(() => {
    try {
      const storedWords = localStorage.getItem('vocabWords');
      if (storedWords) {
        setVocabWords(JSON.parse(storedWords));
      }
    } catch (error) {
      console.error("Failed to parse vocab words from localStorage", error);
      setVocabWords([]);
    }
  }, []);

  // Save words to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('vocabWords', JSON.stringify(vocabWords));
  }, [vocabWords]);

  const addVocabWord = useCallback(async (word: string) => {
    const cleanedWord = word.toLowerCase().trim().replace(/[.,!?;:"']$/, '');
    if (!cleanedWord || vocabWords.some(v => v.word === cleanedWord)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const translation = await translateText(cleanedWord);
      // Ensure translation is meaningful before adding
      if (translation && translation.toLowerCase() !== cleanedWord.toLowerCase()) {
        const newWord: VocabWord = { id: Date.now().toString(), word: cleanedWord, translation };
        setVocabWords(prev => [newWord, ...prev]);
      }
    } catch (error) {
      console.error("Failed to add vocab word", error);
    } finally {
      setIsLoading(false);
    }
  }, [vocabWords]);

  const removeVocabWord = (id: string) => {
    setVocabWords(prev => prev.filter(word => word.id !== id));
  };

  return (
    <VocabularyContext.Provider value={{ vocabWords, addVocabWord, removeVocabWord, isLoading }}>
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};
