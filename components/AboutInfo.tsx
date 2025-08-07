import React from 'react';
import { Shield, Volume2, List, Languages } from './Icons';

export const AboutInfo: React.FC = () => {
  return (
    <div className="h-full flex flex-col text-slate-300 overflow-y-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="max-w-2xl mx-auto pt-4">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4">About LingoRPG</h2>
        <p className="text-lg leading-relaxed mb-6">
          LingoRPG is an interactive text-based adventure game designed to make learning English fun and immersive. You'll embark on epic quests where the AI acts as your personal Dungeon Master, guiding you through a story that you shape with your decisions.
        </p>

        <h3 className="text-2xl font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">How It Works</h3>
        <p className="leading-relaxed mb-6">
          Simply start a new adventure by providing a theme. The AI will generate a world for you to explore. Respond to scenarios, solve puzzles, and overcome challenges by typing what you want to do. The AI will correct your grammar as you play, helping you improve naturally through conversation.
        </p>
        
        <h3 className="text-2xl font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Key Features</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <Shield className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">AI Dungeon Master</h4>
              <p className="text-slate-400">An AI guides your story, creating unique challenges and correcting your English in real-time.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Volume2 className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">Text-to-Speech</h4>
              <p className="text-slate-400">Listen to the AI's narration. Click the play button on a message to hear it read aloud. You can also click any sentence to play it individually.</p>
            </div>
          </li>
          <li className="flex items-start">
            <List className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">Vocabulary Builder</h4>
              <p className="text-slate-400">Double-click any single word in the story to automatically translate it and save it to your personal vocabulary list for later review.</p>
            </div>
          </li>
          <li className="flex items-start">
            <Languages className="w-6 h-6 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-200">On-the-Fly Translation</h4>
              <p className="text-slate-400">Select any phrase or sentence to see an instant translation to Portuguese.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
