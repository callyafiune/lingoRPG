import React, { useState, useEffect, useRef } from 'react';
import { createDialogueChat } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SendHorizontal } from './Icons';
import { TranslationPopup } from './TranslationPopup';
import { useSelectionTranslation } from '../hooks/useSelectionTranslation';
import type { Chat } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const scenarios = [
  "Ordering coffee at a cafe",
  "Checking in at an airport",
  "Asking for directions",
  "A friendly chat about hobbies",
  "Making a restaurant reservation",
];

export const DialoguePractice: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selection, closePopup } = useSelectionTranslation(chatContainerRef);
  const { learningLang, t } = useLanguage();

  useEffect(() => {
    if (selectedScenario && !chat) {
      const newChat = createDialogueChat(learningLang);
      setChat(newChat);
      setMessages([]);
      setIsLoading(true);
      closePopup();
      
      newChat.sendMessage({ message: `Let's start our conversation. The scenario is: "${selectedScenario}". You can start.` }).then(response => {
        setMessages([{ sender: 'ai', text: response.text }]);
        setIsLoading(false);
      });
    }
  }, [selectedScenario, chat, closePopup, learningLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const newUserMessage: Message = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    closePopup();

    const response = await chat.sendMessage({ message: userInput });
    const aiMessage: Message = { sender: 'ai', text: response.text };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };
  
  const startNewConversation = (scenario: string) => {
      setSelectedScenario(scenario);
      setChat(null); // This will trigger the useEffect to create a new chat
  }

  return (
    <div className="h-full flex flex-col relative">
      {selection && (
        <TranslationPopup 
          text={selection.text}
          position={selection.position}
          onClose={closePopup}
        />
      )}
      {!selectedScenario ? (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">{t('dialoguePickScenario')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                {scenarios.map(s => (
                    <button key={s} onClick={() => startNewConversation(s)} className="p-4 bg-slate-700 rounded-lg hover:bg-indigo-600 transition-colors text-slate-300 hover:text-white font-medium text-center">
                        {t(`dialogueScenario_${s.replace(/\s+/g, '')}` as any)}
                    </button>
                ))}
            </div>
        </div>
      ) : (
        <>
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200">{t(`dialogueScenario_${selectedScenario.replace(/\s+/g, '')}` as any)}</h3>
                <button onClick={() => setSelectedScenario('')} className="text-sm bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-1 px-3 rounded-lg transition-colors">
                    {t('dialogueChangeScenario')}
                </button>
            </div>
            <div ref={chatContainerRef} className="relative flex-grow bg-slate-900/50 rounded-lg p-4 border border-slate-700 overflow-y-auto mb-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-slate-700 text-slate-200">
                                <LoadingSpinner />
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t('dialoguePlaceholder')}
                className="flex-grow bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
                />
                <button
                type="submit"
                className="flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                disabled={isLoading || !userInput.trim()}
                >
                <SendHorizontal className="w-5 h-5" />
                </button>
            </form>
        </>
      )}
    </div>
  );
};
