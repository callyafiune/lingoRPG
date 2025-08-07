import React, { useMemo, useRef } from 'react';

interface SpeechHighlightingProps {
  text: string;
  highlightRange: { start: number; end: number } | null;
  cursorPosition: number | null;
  onSentenceClick: (charIndex: number) => void;
  onWordDoubleClick: (word: string, event: React.MouseEvent) => void;
}

const getWordAt = (str: string, pos: number): string | null => {
    if (typeof str !== 'string' || pos < 0 || pos >= str.length || /\s/.test(str[pos])) {
        return null;
    }

    let start = pos;
    while (start > 0 && !/\s/.test(str[start - 1])) {
        start--;
    }

    let end = pos;
    while (end < str.length - 1 && !/\s/.test(str[end + 1])) {
        end++;
    }

    let word = str.substring(start, end + 1);
    word = word.replace(/^[.,!?;:"'()[\]{}]+|[.,!?;:"'()[\]{}]+$/g, '');
    
    return word || null;
}


export const SpeechHighlighting: React.FC<SpeechHighlightingProps> = ({
  text,
  highlightRange,
  cursorPosition,
  onSentenceClick,
  onWordDoubleClick
}) => {
  const renderedText = useMemo(() => {
    if (!text) return null;
    
    return text.split('').map((char, i) => {
      const isHighlighted = highlightRange && i >= highlightRange.start && i < highlightRange.end;
      const showCursor = cursorPosition === i;
      
      return (
        <React.Fragment key={i}>
          {showCursor && (
            <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-blink-cursor -mb-1" />
          )}
          <span
            data-index={i}
            className={`${
              isHighlighted ? 'bg-indigo-500/30 rounded' : ''
            } transition-colors duration-200`}
          >
            {char}
          </span>
        </React.Fragment>
      );
    });
  }, [text, highlightRange, cursorPosition]);

  // Use a ref for the click timer to persist across renders
  const clickTimer = useRef<number | null>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a timer is already set, this is a double-click
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      
      // Double-click logic
      const target = e.target as HTMLElement;
      const indexStr = target.dataset.index;
      if (!indexStr) return;
      const index = parseInt(indexStr, 10);
      if (isNaN(index)) return;
      const word = getWordAt(text, index);
      if (word) {
        onWordDoubleClick(word, e);
      }
    } else {
      // First click, set a timer
      clickTimer.current = window.setTimeout(() => {
        // Timer finished, it was a single click
        const target = e.target as HTMLElement;
        const indexStr = target.dataset.index;
        if (!indexStr) return;
        const index = parseInt(indexStr, 10);
        if (!isNaN(index)) {
          onSentenceClick(index);
        }
        clickTimer.current = null; // Clear timer ref
      }, 250); // Standard dbl-click delay
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default browser word selection on double-click, which can interfere
    if (e.detail > 1) {
      e.preventDefault();
    }
  };

  return (
    <div onClick={handleContainerClick} onMouseDown={handleMouseDown} className="cursor-pointer">
      {renderedText}
    </div>
  );
};
