import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

export const supportedLanguages = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
};

const translations: Record<string, Record<string, any>> = {
  en: {
    rpg: 'RPG',
    vocabulary: 'Vocabulary',
    about: 'About',
    settings: 'Settings',
    closeSettings: 'Close settings',
    languageSettings: 'Language Settings',
    nativeLanguage: 'I speak (Native Language)',
    learningLanguage: 'I want to learn',
    speechSettings: 'Speech Settings',
    voice: 'Voice',
    speechRate: 'Speech Rate',
    loadingVoices: 'Loading voices...',
    footerText: 'Powered by AI. Learn languages in a fun and engaging way.',
    footerCopyright: 'Copyright (c) 2025 Cally Afiune',
    // About Page
    aboutTitle: 'About LingoRPG',
    aboutP1: 'LingoRPG is an interactive text-based adventure game designed to make learning languages fun and immersive. You\'ll embark on epic quests where the AI acts as your personal Dungeon Master, guiding you through a story that you shape with your decisions.',
    howItWorksTitle: 'How It Works',
    howItWorksP1: 'Simply start a new adventure by providing a theme. The AI will generate a world for you to explore. Respond to scenarios, solve puzzles, and overcome challenges by typing what you want to do. The AI will correct your grammar as you play, helping you improve naturally through conversation.',
    keyFeaturesTitle: 'Key Features',
    feature1Title: 'AI Dungeon Master',
    feature1Text: 'An AI guides your story, creating unique challenges and correcting your grammar in the language you are learning in real-time.',
    feature2Title: 'Text-to-Speech',
    feature2Text: 'Listen to the AI\'s narration. Click the play button on a message to hear it read aloud. You can also click any sentence to play it individually.',
    feature3Title: 'Vocabulary Builder',
    feature3Text: 'Double-click any single word in the story to automatically translate it to your native language and save it to your personal vocabulary list for later review.',
    feature4Title: 'On-the-Fly Translation',
    feature4Text: 'Select any phrase or sentence to see an instant translation to your native language.',
    // Story Generator
    storyGeneratorPlaceholder: 'Enter a theme for your story (e.g., a friendly dragon)',
    generateStory: 'Generate Story',
    storyGeneratorWillAppear: 'Your AI-generated story will appear here.',
    storyGeneratorHowToTranslate: 'Select any text in the story to translate it.',
    // Image To Story
    imageTooLargeError: 'Image is too large. Please select a file under 4MB.',
    storyGenerationError: 'Failed to generate story. Please try again.',
    imageUploadTitle: 'Upload an image',
    imageUploadSubtitle: 'PNG, JPG, GIF up to 4MB',
    chooseFile: 'Choose File',
    storyThemePlaceholder: 'Enter a theme for the story',
    imageStoryPlaceholder1: 'Your image-inspired story will appear here.',
    imageStoryPlaceholder2: 'Upload an image and provide a theme to begin.',
    // Dialogue Practice
    dialoguePickScenario: 'Choose a Scenario',
    'dialogueScenario_Orderingcoffeeatacafe': 'Ordering coffee at a cafe',
    'dialogueScenario_Checkinginatanaireport': 'Checking in at an airport',
    'dialogueScenario_Askingfordirections': 'Asking for directions',
    'dialogueScenario_Afriendlychatabouthobbies': 'A friendly chat about hobbies',
    'dialogueScenario_Makingarestaurantreservation': 'Making a restaurant reservation',
    dialogueChangeScenario: 'Change Scenario',
    dialoguePlaceholder: 'Type your message...',
    // RPG Mode
    welcomeBack: 'Welcome Back!',
    continueGamePrompt: 'You have a saved adventure for {{count}} {{count, plural, one{player} other{players}}}. Would you like to continue?',
    continueAdventure: 'Continue Adventure',
    startNewGame: 'Start New Game',
    rpgModeTitle: 'RPG Adventure Mode',
    rpgStep1: 'First, choose your skill level for the language you\'re learning.',
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    rpgStep2: 'Next, select the number of players.',
    playerCount: '{{count}} {{count, plural, one{Player} other{Players}}}',
    rpgStep3: 'Finally, enter a theme to begin your adventure.',
    rpgThemePlaceholder: 'e.g., a haunted forest',
    startAdventure: 'Start Adventure',
    adventureTitle: 'Adventure',
    newGame: 'New Game',
    correction: 'Correction',
    playerTurnLabel: 'Player {{player}}',
    playerActionPlaceholder: 'Player {{player}}, what do you do?',
    yourActionPlaceholder: 'What do you do?',
    sendAction: 'Send action',
    previousSentence: 'Previous Sentence',
    nextSentence: 'Next Sentence',
    play: 'Play',
    pause: 'Pause',
    // Vocab Review
    vocabEmptyTitle: 'Your Vocabulary List is Empty',
    vocabEmptyText: 'To add words, simply double-click any single word from the stories or chats. It will be automatically translated and saved here for you to review.',
    removeWord: 'Remove word',
    remove: 'Remove',
    nextWord: 'Next word',
    next: 'Next',
    // Translation Popup
    translation: 'Translation',
  },
  pt: {
    rpg: 'RPG',
    vocabulary: 'Vocabulário',
    about: 'Sobre',
    settings: 'Configurações',
    closeSettings: 'Fechar configurações',
    languageSettings: 'Configurações de Idioma',
    nativeLanguage: 'Eu falo (Idioma Nativo)',
    learningLanguage: 'Quero aprender',
    speechSettings: 'Configurações de Voz',
    voice: 'Voz',
    speechRate: 'Velocidade da Fala',
    loadingVoices: 'Carregando vozes...',
    footerText: 'Desenvolvido com IA. Aprenda idiomas de uma forma divertida e envolvente.',
    footerCopyright: 'Copyright (c) 2025 Cally Afiune',
    // About Page
    aboutTitle: 'Sobre o LingoRPG',
    aboutP1: 'LingoRPG é um jogo de aventura interativo baseado em texto, projetado para tornar o aprendizado de idiomas divertido e imersivo. Você embarcará em missões épicas onde a IA atua como seu Mestre de Jogo pessoal, guiando-o através de uma história que você molda com suas decisões.',
    howItWorksTitle: 'Como Funciona',
    howItWorksP1: 'Basta iniciar uma nova aventura fornecendo um tema. A IA irá gerar um mundo para você explorar. Responda a cenários, resolva quebra-cabeças e supere desafios digitando o que você quer fazer. A IA corrigirá sua gramática enquanto você joga, ajudando-o a melhorar naturalmente através da conversação.',
    keyFeaturesTitle: 'Principais Funcionalidades',
    feature1Title: 'Mestre de Jogo com IA',
    feature1Text: 'Uma IA guia sua história, criando desafios únicos e corrigindo sua gramática no idioma que você está aprendendo em tempo real.',
    feature2Title: 'Texto para Fala',
    feature2Text: 'Ouça a narração da IA. Clique no botão de play em uma mensagem para ouvi-la em voz alta. Você também pode clicar em qualquer frase para reproduzi-la individualmente.',
    feature3Title: 'Construtor de Vocabulário',
    feature3Text: 'Dê um duplo clique em qualquer palavra na história para traduzi-la automaticamente para o seu idioma nativo e salvá-la em sua lista de vocabulário pessoal para revisão posterior.',
    feature4Title: 'Tradução Instantânea',
    feature4Text: 'Selecione qualquer frase ou oração para ver uma tradução instantânea para o seu idioma nativo.',
    // Story Generator
    storyGeneratorPlaceholder: 'Digite um tema para sua história (ex: um dragão amigável)',
    generateStory: 'Gerar História',
    storyGeneratorWillAppear: 'Sua história gerada por IA aparecerá aqui.',
    storyGeneratorHowToTranslate: 'Selecione qualquer texto na história para traduzi-lo.',
    // Image To Story
    imageTooLargeError: 'A imagem é muito grande. Por favor, selecione um arquivo com menos de 4MB.',
    storyGenerationError: 'Falha ao gerar a história. Por favor, tente novamente.',
    imageUploadTitle: 'Carregar uma imagem',
    imageUploadSubtitle: 'PNG, JPG, GIF até 4MB',
    chooseFile: 'Escolher Arquivo',
    storyThemePlaceholder: 'Digite um tema para a história',
    imageStoryPlaceholder1: 'Sua história inspirada na imagem aparecerá aqui.',
    imageStoryPlaceholder2: 'Carregue uma imagem e forneça um tema para começar.',
    // Dialogue Practice
    dialoguePickScenario: 'Escolha um Cenário',
    'dialogueScenario_Orderingcoffeeatacafe': 'Pedindo café em uma cafeteria',
    'dialogueScenario_Checkinginatanaireport': 'Fazendo check-in em um aeroporto',
    'dialogueScenario_Askingfordirections': 'Pedindo informações de direção',
    'dialogueScenario_Afriendlychatabouthobbies': 'Uma conversa amigável sobre hobbies',
    'dialogueScenario_Makingarestaurantreservation': 'Fazendo uma reserva em um restaurante',
    dialogueChangeScenario: 'Mudar Cenário',
    dialoguePlaceholder: 'Digite sua mensagem...',
    // RPG Mode
    welcomeBack: 'Bem-vindo de volta!',
    continueGamePrompt: 'Você tem uma aventura salva para {{count}} {{count, plural, one{jogador} other{jogadores}}}. Deseja continuar?',
    continueAdventure: 'Continuar Aventura',
    startNewGame: 'Começar Novo Jogo',
    rpgModeTitle: 'Modo Aventura RPG',
    rpgStep1: 'Primeiro, escolha seu nível de habilidade para o idioma que está aprendendo.',
    basic: 'Básico',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    rpgStep2: 'Em seguida, selecione o número de jogadores.',
    playerCount: '{{count}} {{count, plural, one{Jogador} other{Jogadores}}}',
    rpgStep3: 'Finalmente, digite um tema para começar sua aventura.',
    rpgThemePlaceholder: 'ex: uma floresta assombrada',
    startAdventure: 'Começar Aventura',
    adventureTitle: 'Aventura',
    newGame: 'Novo Jogo',
    correction: 'Correção',
    playerTurnLabel: 'Jogador {{player}}',
    playerActionPlaceholder: 'Jogador {{player}}, o que você faz?',
    yourActionPlaceholder: 'O que você faz?',
    sendAction: 'Enviar ação',
    previousSentence: 'Frase Anterior',
    nextSentence: 'Próxima Frase',
    play: 'Play',
    pause: 'Pausar',
     // Vocab Review
    vocabEmptyTitle: 'Sua Lista de Vocabulário está Vazia',
    vocabEmptyText: 'Para adicionar palavras, basta dar um duplo clique em qualquer palavra das histórias ou chats. Ela será traduzida automaticamente e salva aqui para você revisar.',
    removeWord: 'Remover palavra',
    remove: 'Remover',
    nextWord: 'Próxima palavra',
    next: 'Próxima',
    // Translation Popup
    translation: 'Tradução',
  },
};

interface LanguageContextType {
  nativeLang: string;
  learningLang: string;
  setNativeLang: (lang: string) => void;
  setLearningLang: (lang: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [nativeLang, setNativeLangState] = useState<string>(() => localStorage.getItem('nativeLang') || 'pt');
  const [learningLang, setLearningLangState] = useState<string>(() => localStorage.getItem('learningLang') || 'en');

  useEffect(() => {
    localStorage.setItem('nativeLang', nativeLang);
  }, [nativeLang]);

  useEffect(() => {
    localStorage.setItem('learningLang', learningLang);
    // Force voice list to repopulate when learning language changes
    if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
      setTimeout(() => {
        window.speechSynthesis.getVoices();
      }, 50)
    }
  }, [learningLang]);
  
  const setNativeLang = (lang: string) => {
    if (lang === learningLang) { // Swap languages
        setLearningLangState(nativeLang);
    }
    setNativeLangState(lang);
  }

  const setLearningLang = (lang: string) => {
    if (lang === nativeLang) { // Swap languages
        setNativeLangState(learningLang);
    }
    setLearningLangState(lang);
  }

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const langTranslations = translations[nativeLang] || translations.en;
    let translation = langTranslations[key] || key;

    if (options && typeof translation === 'string') {
      if (options.count !== undefined) {
        const pluralKey = options.count === 1 ? 'one' : 'other';
        const pluralRegex = new RegExp(`{{count, plural, one{([^}]+)} other{([^}]+)}}}`, 'g');
        translation = translation.replace(pluralRegex, (_match: any, one: string, other: string) => (options.count === 1 ? one : other));
      }
      translation = translation.replace(/{{(\w+)}}/g, (_match: any, k: string) => String(options[k] || k));
    }
    
    return translation;
  }, [nativeLang]);

  return (
    <LanguageContext.Provider value={{ nativeLang, learningLang, setNativeLang, setLearningLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
