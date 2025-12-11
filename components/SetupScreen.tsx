import React, { useState } from 'react';
import { Challenge } from '../types';
import { DEFAULT_CHALLENGES, PIXEL_COLORS } from '../constants';
import RetroButton from './RetroButton';

interface SetupScreenProps {
  onStartGame: (challenges: Challenge[], players: string[]) => void;
  isGenerating: boolean;
  onGenerate: (theme: string, players: string[], count: number) => Promise<Challenge[] | null>;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, isGenerating, onGenerate }) => {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  
  // Shared State
  const [playerInput, setPlayerInput] = useState('');

  // Manual State
  const [manualChallenges, setManualChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);

  // Auto State
  const [autoCount, setAutoCount] = useState(8);

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
    
    const generated = await onGenerate(promptTheme, players, autoCount);
    if (generated) {
      onStartGame(generated, players);
    }
  };

  const updateChallengeText = (id: string, text: string) => {
    setManualChallenges(prev => prev.map(c => c.id === id ? { ...c, text } : c));
  };

  const handleAddChallenge = () => {
    if (manualChallenges.length >= 14) return;
    
    const newId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const nextColorIndex = manualChallenges.length % PIXEL_COLORS.length;
    
    const newChallenge: Challenge = {
        id: newId,
        text: 'ใส่ข้อความ...',
        emoji: '🎲',
        color: PIXEL_COLORS[nextColorIndex]
    };
    
    setManualChallenges([...manualChallenges, newChallenge]);
  };

  const handleRemoveChallenge = (id: string) => {
    if (manualChallenges.length <= 2) return;
    setManualChallenges(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="w-full max-w-md bg-[#FFFBF0] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] p-4 sm:p-6 animate-bounce-pixel text-black">
      
      {/* Mode Switcher */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 font-pixel text-xs sm:text-sm border-4 border-black transition-all ${mode === 'manual' ? 'bg-[#FFCC00] shadow-retro text-black' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
        >
          MANUAL
        </button>
        <button 
          onClick={() => setMode('auto')}
          className={`flex-1 py-3 font-pixel text-xs sm:text-sm border-4 border-black transition-all ${mode === 'auto' ? 'bg-[#4ECDC4] shadow-retro text-black' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
        >
          AUTO (AI)
        </button>
      </div>

      {/* Players Input (Shared) */}
      <div className="mb-6">
        <label className="block font-pixel text-xs mb-2 font-bold text-black tracking-wide">
            PLAYERS (Optional)
        </label>
        <textarea
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          placeholder="Enter names separated by comma...&#10;Ex: Somchai, John, Nanny"
          className="w-full h-20 p-2 border-4 border-black font-thai text-sm resize-none bg-white text-black placeholder-gray-400 focus:bg-yellow-50 focus:outline-none focus:ring-0"
        />
        <p className="text-[10px] text-gray-600 mt-1 font-pixel">* Used for turns & AI tasks</p>
      </div>

      <div className="w-full h-1 bg-black/10 mb-6"></div>

      {mode === 'manual' ? (
        // MANUAL MODE UI
        <div className="space-y-4">
           <div className="flex justify-between items-center mb-2">
             <label className="font-pixel text-xs font-bold text-black">WHEEL SLICES</label>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel text-gray-600 font-bold">
                    {manualChallenges.length} / 14
                </span>
             </div>
           </div>
           
           <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {manualChallenges.map((challenge, idx) => (
               <div key={challenge.id} className="flex gap-2 items-center bg-white p-1 border-2 border-transparent hover:border-gray-200 rounded">
                 <span className="font-retro text-xl w-6 shrink-0 text-center">{challenge.emoji}</span>
                 <input
                   type="text"
                   value={challenge.text}
                   onChange={(e) => updateChallengeText(challenge.id, e.target.value)}
                   className="flex-1 p-2 border-2 border-gray-300 font-thai text-sm bg-white text-black focus:border-black focus:outline-none min-w-0"
                 />
                 <div className="w-4 h-4 border-2 border-black shrink-0" style={{ background: challenge.color }}></div>
                 
                 <button 
                   onClick={() => handleRemoveChallenge(challenge.id)}
                   disabled={manualChallenges.length <= 2}
                   className="w-8 h-8 flex items-center justify-center bg-red-100 border-2 border-black text-red-600 hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 font-pixel text-xs"
                 >
                   -
                 </button>
               </div>
             ))}
           </div>
           
           {/* Add Button */}
           <button
             onClick={handleAddChallenge}
             disabled={manualChallenges.length >= 14}
             className="w-full py-2 border-2 border-dashed border-gray-400 text-gray-600 font-pixel text-[10px] hover:bg-black/5 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
           >
             + ADD SLOT
           </button>

           <RetroButton onClick={handleManualStart} className="w-full mt-4">
             START GAME
           </RetroButton>
        </div>
      ) : (
        // AUTO MODE UI
        <div className="space-y-4 text-center">
          <p className="font-thai text-sm mb-2 text-black font-medium">
            ใส่ชื่อเพื่อนด้านบน แล้วเลือกโหมด <br/> AI จะคิดเกมให้เอง!
          </p>
          
          {/* Auto Count Controls */}
          <div className="flex items-center justify-between bg-white p-2 border-2 border-black mb-4">
             <span className="font-pixel text-xs font-bold">AMOUNT:</span>
             <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setAutoCount(Math.max(2, autoCount - 1))}
                    disabled={autoCount <= 2}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 border-2 border-black hover:bg-gray-200 disabled:opacity-30 font-pixel text-black"
                 >-</button>
                 <span className="font-pixel text-sm w-4 font-bold">{autoCount}</span>
                 <button 
                    onClick={() => setAutoCount(Math.min(14, autoCount + 1))}
                    disabled={autoCount >= 14}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 border-2 border-black hover:bg-gray-200 disabled:opacity-30 font-pixel text-black"
                 >+</button>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <RetroButton 
                onClick={() => handleAutoStart('fun')} 
                isLoading={isGenerating}
                className="bg-[#FFCC00] hover:bg-[#FFE066] text-black"
             >
               😄 Fun / เฮฮา
             </RetroButton>
             <RetroButton 
                onClick={() => handleAutoStart('spicy')} 
                isLoading={isGenerating}
                variant="secondary"
                className="bg-pink-400 hover:bg-pink-300 border-black text-black"
             >
               🌶️ Spicy / 18+
             </RetroButton>
             <RetroButton 
                onClick={() => handleAutoStart('hardcore')} 
                isLoading={isGenerating}
                variant="danger"
                className="bg-red-500 hover:bg-red-400 text-white"
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