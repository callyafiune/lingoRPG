

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabButton } from './components/TabButton';
import { RpgMode } from './components/RpgMode';
import { VocabularyReview } from './components/VocabularyReview';
import { AboutInfo } from './components/AboutInfo';
import { SettingsModal } from './components/SettingsModal';
import { Shield, List, Info, Settings } from './components/Icons';

type Tab = 'rpg' | 'vocabulary' | 'about';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rpg');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'rpg':
        return <RpgMode />;
      case 'vocabulary':
        return <VocabularyReview />;
      case 'about':
        return <AboutInfo />;
      default:
        return <RpgMode />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-xl shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-700">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2">
                   <TabButton
                    label="RPG"
                    icon={<Shield />}
                    isActive={activeTab === 'rpg'}
                    onClick={() => setActiveTab('rpg')}
                  />
                  <TabButton
                    label="Vocabulary"
                    icon={<List />}
                    isActive={activeTab === 'vocabulary'}
                    onClick={() => setActiveTab('vocabulary')}
                  />
                  <TabButton
                    label="About"
                    icon={<Info />}
                    isActive={activeTab === 'about'}
                    onClick={() => setActiveTab('about')}
                  />
              </div>
            </div>
            <div className="p-4 sm:p-6 h-[650px] rounded-b-xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;