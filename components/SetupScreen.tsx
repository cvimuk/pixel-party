import React, { useState } from 'react';
import { Challenge } from '../types';
import { DEFAULT_CHALLENGES, PIXEL_COLORS } from '../constants';
import RetroButton from './RetroButton';

interface SetupScreenProps {
  onStartGame: (challenges: Challenge[], players: string[]) => void;
  isGenerating: boolean;
  onGenerate: (theme: string, players: string[]) => Promise<Challenge[] | null>;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, isGenerating, onGenerate }) => {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  
  // Shared State
  const [playerInput, setPlayerInput] = useState('');

  // Manual State
  const [manualChallenges, setManualChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);

  // Helper to parse players
  const getPlayers = () => {
    return playerInput.split(/[\n,]/).map(p => p.trim()).filter(p => p.length > 0);
  };

  const handleManualStart = () => {
    const players = getPlayers();
    onStartGame(manualChallenges, players);
  };

  const handleAutoStart = async (theme: 'fun' | 'spicy' | 'hardcore') => {
    const players = getPlayers();
    const promptTheme = theme === 'fun' ? 'ตลกเฮฮา' : theme === 'spicy' ? '18+ ทะลึ่ง' : 'โหด ดื่มหนัก';
    
    const generated = await onGenerate(promptTheme, players);
    if (generated) {
      onStartGame(generated, players);
    }
  };

  const updateChallengeText = (id: string, text: string) => {
    setManualChallenges(prev => prev.map(c => c.id === id ? { ...c, text } : c));
  };

  return (
    <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] p-4 sm:p-6 animate-bounce-pixel">
      
      {/* Mode Switcher */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 font-pixel text-xs sm:text-sm border-4 border-black transition-all ${mode === 'manual' ? 'bg-[#FFCC00] shadow-retro' : 'bg-gray-200 opacity-60'}`}
        >
          MANUAL
        </button>
        <button 
          onClick={() => setMode('auto')}
          className={`flex-1 py-3 font-pixel text-xs sm:text-sm border-4 border-black transition-all ${mode === 'auto' ? 'bg-[#4ECDC4] shadow-retro' : 'bg-gray-200 opacity-60'}`}
        >
          AUTO (AI)
        </button>
      </div>

      {/* Players Input (Shared) */}
      <div className="mb-6">
        <label className="block font-pixel text-xs mb-2">PLAYERS (Optional)</label>
        <textarea
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          placeholder="Enter names separated by comma...&#10;Ex: Somchai, John, Nanny"
          className="w-full h-20 p-2 border-4 border-black font-thai text-sm resize-none bg-gray-100 text-black placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
        />
        <p className="text-[10px] text-gray-500 mt-1 font-pixel">* Used for turns & AI tasks</p>
      </div>

      <div className="w-full h-1 bg-black/10 mb-6"></div>

      {mode === 'manual' ? (
        // MANUAL MODE UI
        <div className="space-y-4">
           <div className="flex justify-between items-center mb-2">
             <label className="font-pixel text-xs">WHEEL SLICES</label>
             <span className="text-[10px] font-pixel text-gray-400">{manualChallenges.length} ITEMS</span>
           </div>
           
           <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {manualChallenges.map((challenge, idx) => (
               <div key={challenge.id} className="flex gap-2 items-center">
                 <span className="font-retro text-xl w-6">{challenge.emoji}</span>
                 <input
                   type="text"
                   value={challenge.text}
                   onChange={(e) => updateChallengeText(challenge.id, e.target.value)}
                   className="flex-1 p-2 border-2 border-black font-thai text-sm bg-gray-100 text-black focus:bg-white focus:outline-none"
                 />
                 <div className="w-4 h-4 border-2 border-black" style={{ background: challenge.color }}></div>
               </div>
             ))}
           </div>

           <RetroButton onClick={handleManualStart} className="w-full mt-4">
             START GAME
           </RetroButton>
        </div>
      ) : (
        // AUTO MODE UI
        <div className="space-y-4 text-center">
          <p className="font-thai text-sm mb-4">
            ใส่ชื่อเพื่อนด้านบน แล้วเลือกโหมด <br/> AI จะคิดเกมให้เอง!
          </p>
          
          <div className="grid grid-cols-1 gap-3">
             <RetroButton 
                onClick={() => handleAutoStart('fun')} 
                isLoading={isGenerating}
                className="bg-[#FFCC00] hover:bg-[#FFE066]"
             >
               😄 Fun / เฮฮา
             </RetroButton>
             <RetroButton 
                onClick={() => handleAutoStart('spicy')} 
                isLoading={isGenerating}
                variant="secondary"
                className="bg-pink-400 hover:bg-pink-300 border-black"
             >
               🌶️ Spicy / 18+
             </RetroButton>
             <RetroButton 
                onClick={() => handleAutoStart('hardcore')} 
                isLoading={isGenerating}
                variant="danger"
             >
               💀 Hardcore / สายแข็ง
             </RetroButton>
          </div>
        </div>
      )}

    </div>
  );
};

export default SetupScreen;