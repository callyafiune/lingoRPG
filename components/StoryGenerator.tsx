import React, { useState, useRef } from 'react';
import { generateStory } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Feather } from './Icons';
import { TranslationPopup } from './TranslationPopup';
import { useSelectionTranslation } from '../hooks/useSelectionTranslation';

export const StoryGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const { selection, closePopup } = useSelectionTranslation(storyContainerRef);


  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setStory('');
    closePopup();
    const generatedStory = await generateStory(prompt);
    setStory(generatedStory);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      {selection && (
        <TranslationPopup 
          text={selection.text}
          position={selection.position}
          onClose={closePopup}
        />
      )}
      <form onSubmit={handleGenerateStory} className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a theme for your story (e.g., a friendly dragon)"
          className="flex-grow bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          disabled={isLoading || !prompt.trim()}
        >
          <Feather className="w-5 h-5 mr-2" />
          Generate Story
        </button>
      </form>

      <div ref={storyContainerRef} className="relative flex-grow bg-slate-900/50 rounded-lg p-4 border border-slate-700 overflow-y-auto">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
        {!isLoading && !story && (
          <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <p className="mb-2">Your AI-generated story will appear here.</p>
            <p className="text-sm">Select any text in the story to translate it.</p>
          </div>
        )}
        {story && (
          <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
            {story}
          </div>
        )}
      </div>
    </div>
  );
};