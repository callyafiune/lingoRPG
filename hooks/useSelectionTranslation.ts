import { useState, useCallback, useEffect, type RefObject } from 'react';
import { useVocabulary } from '../contexts/VocabularyContext';

interface SelectionInfo {
  text: string;
  position: { top: number; left: number };
}

export const useSelectionTranslation = (containerRef: RefObject<HTMLElement>) => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const { addVocabWord, isLoading } = useVocabulary();
  
  const handleMouseUp = useCallback((event: MouseEvent) => {
    setTimeout(() => {
        const currentSelection = window.getSelection();
        const selectedText = currentSelection?.toString().trim();

        if (selectedText && selectedText.length > 0 && !isLoading) {
            const popup = (event.target as HTMLElement)?.closest('.animate-fade-in-up');
            if (popup) return;
            
            if (containerRef.current && currentSelection && containerRef.current.contains(currentSelection.anchorNode)) {
                
                // If it's a single word, add to vocab. Otherwise, show popup.
                if (!selectedText.includes(' ') && !selectedText.includes('\n')) {
                    addVocabWord(selectedText);
                    window.getSelection()?.removeAllRanges(); // Deselect text
                } else {
                    const range = currentSelection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();

                    setSelection({
                        text: selectedText,
                        position: {
                            top: rect.bottom - containerRect.top + 10,
                            left: rect.left - containerRect.left,
                        },
                    });
                }
            }
        }
    }, 50);

  }, [containerRef, addVocabWord, isLoading]);

  const closePopup = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  },[]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      const eventListener = (e: Event) => handleMouseUp(e as MouseEvent);
      currentContainer.addEventListener('mouseup', eventListener);
      return () => {
        currentContainer.removeEventListener('mouseup', eventListener);
      };
    }
  }, [containerRef, handleMouseUp]);

  return { selection, closePopup };
};
