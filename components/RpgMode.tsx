



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRpgChat } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SendHorizontal, Shield, Play, Pause, SkipBack, SkipForward, Users } from './Icons';
import { TranslationPopup } from './TranslationPopup';
import { SpeechHighlighting } from './SpeechHighlighting';
import { useVocabulary } from '../contexts/VocabularyContext';
import type { Chat } from '@google/genai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  correction?: string;
  playerIndex?: number;
}

type Difficulty = 'basic' | 'intermediate' | 'advanced';

interface SavedRpgState {
  theme: string;
  messages: Message[];
  difficulty: Difficulty;
  numberOfPlayers: number;
  currentPlayerIndex: number;
}

type SpeakingState = 'idle' | 'playing' | 'paused';
interface SelectionInfo {
  text: string;
  position: { top: number; left: number };
}

export const RpgMode: React.FC = () => {
  const [theme, setTheme] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  
  // Game persistence state
  const [savedGameState, setSavedGameState] = useState<SavedRpgState | null>(null);
  const [showContinueScreen, setShowContinueScreen] = useState<boolean>(false);

  // Audio state
  const [speakingState, setSpeakingState] = useState<SpeakingState>('idle');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [playedMessageIds, setPlayedMessageIds] = useState<Set<string>>(new Set());
  const [pausedForTranslation, setPausedForTranslation] = useState<boolean>(false);
  
  // Selection and popup state
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const { addVocabWord } = useVocabulary();

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const closePopup = useCallback(() => {
    if (pausedForTranslation) {
        if (typeof window.speechSynthesis !== 'undefined') {
            speechSynthesis.resume();
        }
        setSpeakingState('playing');
        setPausedForTranslation(false);
    }
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [pausedForTranslation]);

  // Check for saved game on mount
  useEffect(() => {
    const savedData = localStorage.getItem('rpgGameState');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData) as SavedRpgState;
            if (parsedData.messages.length > 0 && parsedData.difficulty && parsedData.numberOfPlayers) {
                setSavedGameState(parsedData);
                setShowContinueScreen(true);
            } else {
                localStorage.removeItem('rpgGameState');
            }
        } catch (error) {
            console.error("Failed to parse saved game state:", error);
            localStorage.removeItem('rpgGameState');
        }
    }
  }, []);

  // Save game state whenever messages change
  useEffect(() => {
    if (isGameStarted && messages.length > 0 && theme && difficulty && numberOfPlayers !== null) {
        const stateToSave: SavedRpgState = { 
            theme, 
            messages, 
            difficulty,
            numberOfPlayers,
            currentPlayerIndex
        };
        localStorage.setItem('rpgGameState', JSON.stringify(stateToSave));
    }
  }, [messages, theme, difficulty, isGameStarted, numberOfPlayers, currentPlayerIndex]);

  // Handle drag-to-select for translation
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
        const currentSelection = window.getSelection();
        const selectedText = currentSelection?.toString().trim() ?? '';

        if (selectedText.length > 0 && selectedText.includes(' ')) {
            const popup = document.querySelector('.translation-popup');
            if (popup && popup.contains(event.target as Node)) {
                return;
            }
            
            if (chatContainerRef.current && currentSelection.anchorNode && chatContainerRef.current.contains(currentSelection.anchorNode)) {
                if (speakingState === 'playing') {
                    if (typeof window.speechSynthesis !== 'undefined') {
                        speechSynthesis.pause();
                    }
                    setSpeakingState('paused');
                    setPausedForTranslation(true);
                }
                const range = currentSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const containerRect = chatContainerRef.current.getBoundingClientRect();
                setSelection({
                    text: selectedText,
                    position: {
                        top: rect.bottom - containerRect.top + 10,
                        left: rect.left - containerRect.left,
                    },
                });
            }
        }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [speakingState]);

  const getSentences = useCallback((text: string): { text: string; start: number; end: number }[] => {
    if (!text) return [];
    const sentenceRegex = /[^.!?]+(?:[.!?]+["']?|$)/g;
    const matches = text.match(sentenceRegex) || [];
    let charCounter = 0;
    return matches.map(s => {
        const sentenceData = { text: s.trim(), start: charCounter, end: charCounter + s.length };
        charCounter += s.length;
        return sentenceData;
    }).filter(s => s.text.length > 0);
  }, []);

  const stopPlayback = useCallback(() => {
    if (typeof window.speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
    }
    setSpeakingState('idle');
    if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
    }
  }, []);
  
  const playFromSentence = useCallback((message: Message, fromIndex: number) => {
    if (typeof window.speechSynthesis === 'undefined' || !message.text) return;

    if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
    }
    speechSynthesis.cancel();

    const sentences = getSentences(message.text);
    if (fromIndex < 0 || fromIndex >= sentences.length) {
        stopPlayback();
        return;
    }

    setSpeakingMessageId(message.id);
    setSpeakingState('playing');
    setCurrentSentenceIndex(fromIndex);

    const playQueue = (sentenceIndex: number) => {
        if (sentenceIndex >= sentences.length) {
            stopPlayback();
            return;
        }

        setCurrentSentenceIndex(sentenceIndex);
        
        const utterance = new SpeechSynthesisUtterance(sentences[sentenceIndex].text);
        
        const savedVoiceURI = localStorage.getItem('speechSettings_voiceURI');
        const savedRate = localStorage.getItem('speechSettings_rate');
        const allVoices = window.speechSynthesis.getVoices();

        if (savedVoiceURI && allVoices.length > 0) {
            const selectedVoice = allVoices.find(v => v.voiceURI === savedVoiceURI);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        if (!utterance.voice) {
            utterance.lang = 'en-US';
        }

        utterance.rate = savedRate ? parseFloat(savedRate) : 0.8;
        
        utteranceRef.current = utterance;
        
        utterance.onend = () => {
            if (utteranceRef.current === utterance) {
                playQueue(sentenceIndex + 1);
            }
        };

        utterance.onerror = (event) => {
            if (event.error !== 'interrupted') {
                console.error("Speech synthesis error:", event.error);
                stopPlayback();
            }
        };
        
        speechSynthesis.speak(utterance);
    };
    setTimeout(() => playQueue(fromIndex), 50);
  }, [getSentences, stopPlayback]);

  useEffect(() => {
    return () => {
      if (typeof window.speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    };
  }, [isGameStarted]);
  
  const handlePlayPauseClick = useCallback((msg: Message) => {
    const isThisMessageActive = speakingMessageId === msg.id;

    if (isThisMessageActive) {
        if (speakingState === 'playing') {
            speechSynthesis.pause();
            setSpeakingState('paused');
        } else if (speakingState === 'paused') {
            speechSynthesis.resume();
            setSpeakingState('playing');
        } else {
            playFromSentence(msg, 0);
        }
    } else { 
        playFromSentence(msg, 0);
    }
  }, [speakingMessageId, speakingState, playFromSentence]);

  const handleSentenceClick = (message: Message, charIndex: number) => {
    const sentences = getSentences(message.text);
    const sentenceIndex = sentences.findIndex(s => charIndex >= s.start && charIndex < s.end);
    if (sentenceIndex !== -1) {
        playFromSentence(message, sentenceIndex);
    }
  };

  const handleWordDoubleClick = (word: string, event: React.MouseEvent) => {
    if (speakingState === 'playing') {
        if (typeof window.speechSynthesis !== 'undefined') {
            speechSynthesis.pause();
        }
        setSpeakingState('paused');
        setPausedForTranslation(true);
    }

    addVocabWord(word);

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = chatContainerRef.current!.getBoundingClientRect();
    
    setSelection({
        text: word,
        position: {
            top: rect.bottom - containerRect.top + 10,
            left: rect.left - containerRect.left,
        },
    });
};

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai' && !isLoading && !playedMessageIds.has(lastMessage.id)) {
        playFromSentence(lastMessage, 0);
        setPlayedMessageIds(prev => new Set(prev).add(lastMessage.id));
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, playedMessageIds, playFromSentence]);

  const handleStartAdventure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || !difficulty || !numberOfPlayers) return;

    setIsLoading(true);
    setIsGameStarted(true);
    closePopup();

    const newChat = createRpgChat(difficulty, numberOfPlayers);
    setChat(newChat);
    setMessages([]);

    const response = await newChat.sendMessage({ message: `Start the adventure with the theme: "${theme}".` });
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      text: response.text,
    };
    setMessages([aiMessage]);
    setIsLoading(false);
  };
  
  const parseResponse = (responseText: string): { correction?: string, story: string } => {
      const correctionPrefix = "Correction: ";
      const lines = responseText.split('\n');
      if (lines.length > 0 && lines[0].startsWith(correctionPrefix)) {
          const correction = lines[0].substring(correctionPrefix.length).trim().slice(1, -1);
          const story = lines.slice(1).join('\n').trim();
          return { correction, story };
      }
      return { story: responseText };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;
    stopPlayback();

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: userInput, playerIndex: currentPlayerIndex };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    closePopup();

    const response = await chat.sendMessage({ message: userInput });
    const { correction, story } = parseResponse(response.text);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: story,
      correction: correction,
    };
    setMessages(prev => [...prev, aiMessage]);

    if (numberOfPlayers && numberOfPlayers > 1) {
        setCurrentPlayerIndex(prev => (prev + 1) % numberOfPlayers);
    }
    
    setIsLoading(false);
  };
  
  const startNewGame = () => {
      stopPlayback();
      localStorage.removeItem('rpgGameState');
      setSpeakingMessageId(null);
      setCurrentSentenceIndex(null);
      setIsGameStarted(false);
      setTheme('');
      setDifficulty(null);
      setNumberOfPlayers(null);
      setCurrentPlayerIndex(0);
      setChat(null);
      setMessages([]);
      setPlayedMessageIds(new Set());
      setSavedGameState(null);
      setShowContinueScreen(false);
  };

  const handleContinueGame = () => {
    if (!savedGameState || !savedGameState.difficulty) return;

    const history = savedGameState.messages.map(msg => {
      if (msg.sender === 'user') {
          return { role: 'user' as const, parts: [{ text: msg.text }] };
      } else { 
          const fullText = msg.correction ? `Correction: "${msg.correction}"\n${msg.text}` : msg.text;
          return { role: 'model' as const, parts: [{ text: fullText }] };
      }
    });

    const newChat = createRpgChat(savedGameState.difficulty, savedGameState.numberOfPlayers, history);
    setChat(newChat);
    setTheme(savedGameState.theme);
    setDifficulty(savedGameState.difficulty);
    setNumberOfPlayers(savedGameState.numberOfPlayers);
    setCurrentPlayerIndex(savedGameState.currentPlayerIndex);
    setMessages(savedGameState.messages);
    setIsGameStarted(true);
    setShowContinueScreen(false);
    setSpeakingMessageId(null); // Ensure no audio plays automatically
    setCurrentSentenceIndex(null); // Reset highlight
  };

  const renderAudioControls = (msg: Message) => {
    if (msg.sender !== 'ai' || !msg.text) return null;
    
    const isThisMessageActive = speakingMessageId === msg.id;
    const isPlaying = isThisMessageActive && speakingState === 'playing';
    const isPaused = isThisMessageActive && speakingState === 'paused';

    const sentences = getSentences(msg.text);
    const isFirstSentence = currentSentenceIndex === 0;
    const isLastSentence = currentSentenceIndex === sentences.length - 1;
    const canSkip = (isPlaying || isPaused) && currentSentenceIndex !== null;
    
    const controlButtonClass = "text-slate-300 hover:text-indigo-400 transition-colors p-1.5 rounded-full hover:bg-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent disabled:cursor-not-allowed";

    return (
        <div className="flex items-center self-end mb-1 bg-slate-800/80 rounded-full px-2 py-0.5 border border-slate-700">
            <button onClick={() => playFromSentence(msg, currentSentenceIndex! - 1)} disabled={!canSkip || isFirstSentence} className={controlButtonClass} aria-label="Previous Sentence">
                <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={() => handlePlayPauseClick(msg)} className={controlButtonClass} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={() => playFromSentence(msg, currentSentenceIndex! + 1)} disabled={!canSkip || isLastSentence} className={controlButtonClass} aria-label="Next Sentence">
                <SkipForward className="w-5 h-5" />
            </button>
        </div>
    );
  }
  
  if (showContinueScreen && !isGameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
        <Shield className="w-16 h-16 text-indigo-400 mb-4"/>
        <h2 className="text-xl font-semibold mb-2 text-slate-200">Welcome Back!</h2>
        <p className="text-slate-400 mb-6 text-center max-w-md">You have a saved adventure for {savedGameState?.numberOfPlayers} {savedGameState?.numberOfPlayers === 1 ? 'player' : 'players'}. Would you like to continue?</p>
        <div className="w-full max-w-sm flex flex-col gap-3">
            <button
                onClick={handleContinueGame}
                className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
            >
                Continue Adventure
            </button>
            <button
                onClick={startNewGame}
                className="w-full flex items-center justify-center bg-slate-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-slate-500 transition-colors"
            >
                Start New Game
            </button>
        </div>
      </div>
    );
  }

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
        <Shield className="w-16 h-16 text-indigo-400 mb-4"/>
        <h2 className="text-xl font-semibold mb-2 text-slate-200">RPG Adventure Mode</h2>
        
        {/* Step 1: Difficulty */}
        <p className="text-slate-400 mb-6 text-center max-w-md">First, choose your English level.</p>
        <div className="flex justify-center gap-3 mb-6">
            {(['basic', 'intermediate', 'advanced'] as const).map(level => (
                <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                        difficulty === level
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {level}
                </button>
            ))}
        </div>

        {/* Step 2: Number of Players */}
        {difficulty && (
            <div className="w-full max-w-md animate-fade-in-up text-center">
                <p className="text-slate-400 mb-4">Next, select the number of players.</p>
                <div className="flex justify-center gap-4 mb-6">
                    {[1, 2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => setNumberOfPlayers(num)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg font-semibold transition-all w-24 h-24 text-center ${
                                numberOfPlayers === num
                                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            <Users className="w-8 h-8 mb-1" />
                            <span className="text-sm">{num} Player{num > 1 ? 's' : ''}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Step 3: Theme and Start */}
        {difficulty && numberOfPlayers && (
            <form onSubmit={handleStartAdventure} className="w-full max-w-md flex flex-col gap-3 animate-fade-in-up">
                <p className="text-slate-400 mb-2 text-center">Finally, enter a theme to begin your adventure.</p>
                <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., a haunted forest"
                    className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    disabled={!theme.trim()}
                >
                    Start Adventure
                </button>
            </form>
        )}
    </div>
  );

  const renderGameScreen = () => (
     <>
        <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-200 truncate pr-4">Adventure: {theme}</h3>
            <button onClick={startNewGame} className="text-sm bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-1 px-3 rounded-lg transition-colors flex-shrink-0">
                New Game
            </button>
        </div>
        <div ref={chatContainerRef} className="relative flex-grow bg-slate-900/50 rounded-lg p-4 border border-slate-700 overflow-y-auto mb-4">
            <div className="space-y-4">
                {messages.map((msg) => {
                  const isSpeakingThisMessage = speakingMessageId === msg.id;
                  const sentences = getSentences(msg.text);
                  const activeSentence = isSpeakingThisMessage && currentSentenceIndex !== null ? sentences[currentSentenceIndex] : null;
                  const highlightRange = activeSentence ? { start: activeSentence.start, end: activeSentence.end } : null;
                  const cursorPosition = activeSentence && speakingState === 'playing' ? activeSentence.start : null;

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && renderAudioControls(msg)}
                        <div className={`rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white max-w-lg' : 'bg-slate-700 text-slate-200 max-w-prose'}`}>
                            {msg.sender === 'user' && typeof msg.playerIndex === 'number' && (
                                <div className="px-4 pt-2 pb-1 font-bold text-indigo-200 border-b border-indigo-500/50">Player {msg.playerIndex + 1}</div>
                            )}
                            <div className="px-4 py-2">
                                {msg.sender === 'ai' && msg.correction && (
                                    <div className="mb-2 p-2 bg-slate-800/70 border-l-4 border-green-400 rounded">
                                        <p className="text-xs text-slate-400 font-semibold">Correction:</p>
                                        <p className="text-sm text-green-300 italic">"{msg.correction}"</p>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {msg.sender === 'ai' 
                                    ? <SpeechHighlighting 
                                        text={msg.text} 
                                        highlightRange={highlightRange}
                                        cursorPosition={cursorPosition}
                                        onSentenceClick={(charIndex) => handleSentenceClick(msg, charIndex)}
                                        onWordDoubleClick={handleWordDoubleClick}
                                      /> 
                                    : msg.text
                                  }
                                </div>
                            </div>
                        </div>
                    </div>
                  )
                })}
                {isLoading && !messages.length && (
                     <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>
                )}
                {isLoading && messages.length > 0 && (
                    <div className="flex justify-start">
                         <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-slate-700 text-slate-200">
                            <LoadingSpinner />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
            {numberOfPlayers && numberOfPlayers > 1 && (
                <div className="text-center text-sm font-semibold text-indigo-300 animate-fade-in-up">Player {currentPlayerIndex + 1}'s Turn</div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={numberOfPlayers && numberOfPlayers > 1 ? `Player ${currentPlayerIndex + 1}, what do you do?` : "What do you do?"}
                    className="flex-grow bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    disabled={isLoading || !userInput.trim()}
                    aria-label="Send action"
                >
                    <SendHorizontal className="w-5 h-5" />
                </button>
            </div>
        </form>
    </>
  );

  return (
    <div className="h-full flex flex-col relative">
      {selection && (
        <TranslationPopup 
          text={selection.text}
          position={selection.position}
          onClose={closePopup}
        />
      )}
      {!isGameStarted ? renderStartScreen() : renderGameScreen()}
    </div>
  );
};