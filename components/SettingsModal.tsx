import React, { useState, useEffect } from 'react';
import { X } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // State for speech settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.8);
  
  // New state for AI model
  const [aiModel, setAiModel] = useState<string>('gemini');

  // Load saved settings
  useEffect(() => {
    if (isOpen) {
        // AI Model Setting
        const savedModel = localStorage.getItem('ai_model');
        if (savedModel) {
            setAiModel(savedModel);
        }

        // Speech Synthesis settings
        const populateVoiceList = () => {
            if (typeof window.speechSynthesis === 'undefined') return;
            const voices = window.speechSynthesis.getVoices();
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
            setAvailableVoices(englishVoices);
            
            const savedVoiceURI = localStorage.getItem('speechSettings_voiceURI');
            if (savedVoiceURI && englishVoices.some(v => v.voiceURI === savedVoiceURI)) {
                setSelectedVoiceURI(savedVoiceURI);
            } else if (englishVoices.length > 0) {
                const defaultVoice = englishVoices.find(v => v.name.includes('Google') && v.name.includes('US English')) || englishVoices[0];
                if(defaultVoice) {
                    setSelectedVoiceURI(defaultVoice.voiceURI);
                }
            }
        };

        populateVoiceList();
        if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
        
        const savedRate = localStorage.getItem('speechSettings_rate');
        setSpeechRate(savedRate ? parseFloat(savedRate) : 0.8);
    }
  }, [isOpen]);
  
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    localStorage.setItem('speechSettings_voiceURI', uri);
  };
  
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    localStorage.setItem('speechSettings_rate', rate.toString());
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setAiModel(model);
    localStorage.setItem('ai_model', model);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Close settings">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
            {/* AI Settings */}
            <div>
                <h3 className="text-md font-semibold text-slate-200 mb-3">AI Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-slate-400 mb-1">
                            AI Provider
                        </label>
                        <select
                            id="model-select"
                            value={aiModel}
                            onChange={handleModelChange}
                            className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="gemini">Gemini</option>
                            <option value="chatgpt">ChatGPT</option>
                        </select>
                         <p className="text-xs text-slate-500 mt-2">Note: The API key is securely managed. Model selection will be functional in a future update.</p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700"></div>

            {/* Speech Settings */}
            <div>
                <h3 className="text-md font-semibold text-slate-200 mb-3">Speech Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-slate-400 mb-1">
                            Voice
                        </label>
                        <select
                            id="voice-select"
                            value={selectedVoiceURI}
                            onChange={handleVoiceChange}
                            disabled={availableVoices.length === 0}
                            className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {availableVoices.length > 0 ? (
                                availableVoices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))
                            ) : (
                                <option>Loading voices...</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="rate-slider" className="block text-sm font-medium text-slate-400 mb-1">
                            Speech Rate: <span className="font-bold text-slate-200">{speechRate.toFixed(1)}x</span>
                        </label>
                        <input
                            id="rate-slider"
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speechRate}
                            onChange={handleRateChange}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
