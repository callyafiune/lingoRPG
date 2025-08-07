import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../contexts/VocabularyContext';
import { List, RefreshCw, Trash2, SkipForward } from './Icons';

export const VocabularyReview: React.FC = () => {
  const { vocabWords, removeVocabWord } = useVocabulary();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Adjust index if the current one becomes invalid (e.g., after deleting the last item)
  useEffect(() => {
    if (vocabWords.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= vocabWords.length) {
      setCurrentIndex(vocabWords.length - 1);
    }
  }, [vocabWords, currentIndex]);

  const handleNext = () => {
    if (vocabWords.length <= 1) return;

    const navigate = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % vocabWords.length);
    };

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(navigate, 250);
    } else {
      navigate();
    }
  };

  const handleRemove = () => {
    const wordToRemove = vocabWords[currentIndex];
    if (wordToRemove) {
      const cleanup = () => {
        removeVocabWord(wordToRemove.id);
      }
      if (isFlipped) {
        setIsFlipped(false);
        setTimeout(cleanup, 250);
      } else {
        cleanup();
      }
    }
  };

  if (vocabWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <List className="w-16 h-16 text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-300">Your Vocabulary List is Empty</h2>
        <p className="mt-2 max-w-md">
          To add words, simply select any single word from the stories or chats. It will be automatically translated and saved here for you to review.
        </p>
      </div>
    );
  }

  const currentWord = vocabWords[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Flashcard Area */}
      <div
        className="w-full max-w-xl h-64 sm:h-80 md:h-96 perspective-[1000px] cursor-pointer group mb-4"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front of Card */}
          <div className="absolute w-full h-full backface-hidden bg-slate-700 rounded-xl flex flex-col items-center p-6 border-2 border-slate-600 shadow-lg overflow-y-auto">
            <div className="my-auto w-full text-center">
                <p className="text-3xl sm:text-4xl font-bold text-slate-100 capitalize break-words">{currentWord.word}</p>
            </div>
            <RefreshCw className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>

          {/* Back of Card */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-700 rounded-xl flex flex-col items-center p-6 border-2 border-indigo-500 shadow-lg rotate-y-180 overflow-y-auto">
            <div className="my-auto w-full text-center">
              <p className="text-2xl sm:text-3xl font-semibold text-white break-words">{currentWord.translation}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <p className="text-slate-400 font-semibold text-lg mb-6">
        {currentIndex + 1} / {vocabWords.length}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-md">
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="flex flex-col items-center justify-center w-28 h-20 bg-slate-800 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          aria-label="Remove word"
        >
          <Trash2 className="w-6 h-6 mb-1" />
          <span>Remove</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={vocabWords.length <= 1}
          className="flex flex-col items-center justify-center w-28 h-20 bg-slate-800 text-indigo-400 font-semibold rounded-lg hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-indigo-400"
          aria-label="Next word"
        >
          <SkipForward className="w-6 h-6 mb-1" />
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

// This style block is kept for the 3D effect as it was in the previous version.
const style = document.createElement('style');
style.innerHTML = `
  .perspective-\\[1000px\\] { perspective: 1000px; }
  .transform-style-preserve-3d { transform-style: preserve-3d; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;
document.head.appendChild(style);