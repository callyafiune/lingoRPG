import React, { useState, useRef } from 'react';
import { generateStoryFromImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Feather, UploadCloud, X } from './Icons';
import { TranslationPopup } from './TranslationPopup';
import { useSelectionTranslation } from '../hooks/useSelectionTranslation';
import { useLanguage } from '../contexts/LanguageContext';

// A helper function to convert base64 string to a data URL
const toBase64DataUrl = (base64: string, mimeType: string) => `data:${mimeType};base64,${base64}`;

export const ImageToStory: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [story, setStory] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [image, setImage] = useState<{base64: string, mimeType: string} | null>(null);
    const [error, setError] = useState<string | null>(null);

    const storyContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { selection, closePopup } = useSelectionTranslation(storyContainerRef);
    const { learningLang, t } = useLanguage();

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError(t('imageTooLargeError'));
                return;
            }
            setError(null);
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
            setImage({ base64, mimeType: file.type });
        }
    };
    
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !image || isLoading) return;

        setIsLoading(true);
        setStory('');
        setError(null);
        closePopup();
        try {
            const generatedStory = await generateStoryFromImage(prompt, image.base64, image.mimeType, learningLang);
            setStory(generatedStory);
        } catch (err) {
            setError(t('storyGenerationError'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearImage = () => {
        setImage(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

          <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
            {/* Left side: Image upload & form */}
            <div className="md:w-1/2 flex flex-col gap-4">
                <div className="relative aspect-video w-full bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden">
                    {!image ? (
                        <div className="text-center text-slate-400 p-4">
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
                            <p className="mt-2 font-semibold">{t('imageUploadTitle')}</p>
                            <p className="text-xs text-slate-500">{t('imageUploadSubtitle')}</p>
                        </div>
                    ) : (
                        <>
                            <img src={toBase64DataUrl(image.base64, image.mimeType)} alt="Preview" className="object-contain h-full w-full" />
                            <button onClick={clearImage} className="absolute top-2 right-2 bg-slate-900/50 hover:bg-slate-900/80 rounded-full p-1.5 transition-colors z-10">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <UploadCloud className="w-5 h-5" /> {t('chooseFile')}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                
                <form onSubmit={handleGenerate} className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('storyThemePlaceholder')}
                        className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading || !image}
                    />
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        disabled={isLoading || !prompt.trim() || !image}
                    >
                        <Feather className="w-5 h-5 mr-2" />
                        {t('generateStory')}
                    </button>
                </form>
            </div>

            {/* Right side: Story output */}
            <div ref={storyContainerRef} className="md:w-1/2 relative flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-y-auto">
              {isLoading && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
              {!isLoading && !story && (
                <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full p-4">
                  <p className="mb-2">{t('imageStoryPlaceholder1')}</p>
                  <p className="text-sm">{t('imageStoryPlaceholder2')}</p>
                </div>
              )}
              {story && (
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed p-4">
                  {story}
                </div>
              )}
            </div>
          </div>
        </div>
    );
};
