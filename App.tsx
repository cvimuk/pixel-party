import React, { useState, useCallback } from 'react';
import { Challenge, GameState } from './types';
import { DEFAULT_CHALLENGES } from './constants';
import { generateChallenges } from './services/geminiService';
import WheelComponent from './components/WheelComponent';
import RetroButton from './components/RetroButton';
import ResultModal from './components/ResultModal';
import SetupScreen from './components/SetupScreen';

const App: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [lastResult, setLastResult] = useState<Challenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Player State
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // --- Setup Handlers ---
  const handleStartGame = (newChallenges: Challenge[], newPlayers: string[]) => {
    setChallenges(newChallenges);
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameState(GameState.IDLE);
  };

  const handleGenerate = async (theme: string, playerNames: string[]) => {
    setIsGenerating(true);
    try {
      return await generateChallenges(theme, playerNames);
    } catch (error) {
      console.error('Failed to generate challenges');
      alert('AI connection failed. Using default.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToSetup = () => {
    setGameState(GameState.SETUP);
  };

  // --- Game Handlers ---
  const handleSpinClick = useCallback(() => {
    if (gameState !== GameState.IDLE) return;
    setGameState(GameState.SPINNING);
    setShowResultModal(false);
  }, [gameState]);

  const handleSpinComplete = useCallback((result: Challenge) => {
    setLastResult(result);
    setGameState(GameState.SHOW_RESULT);
    
    setTimeout(() => {
      setShowResultModal(true);
      setGameState(GameState.IDLE);
      
      // Rotate player turn if players exist
      if (players.length > 0) {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }
    }, 500);
  }, [players.length]);

  const closeModal = () => {
    setShowResultModal(false);
  };

  // Regenerate IN-GAME (keeps current players)
  const handleInGameRegenerate = async (theme: 'fun' | 'spicy' | 'hardcore') => {
    if (isGenerating || gameState === GameState.SPINNING) return;
    
    const promptTheme = theme === 'fun' ? 'ตลกเฮฮา' : theme === 'spicy' ? '18+ ทะลึ่ง' : 'โหด ดื่มหนัก';
    const newChallenges = await handleGenerate(promptTheme, players);
    if (newChallenges) {
      setChallenges(newChallenges);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden font-retro">
      
      {/* Title / H1 for SEO */}
      <header className={`text-center relative z-10 transition-all duration-500 ${gameState === GameState.SETUP ? 'mt-8 mb-8' : 'mt-2 mb-4'}`}>
        <h1 className="flex flex-col items-center gap-2">
          <span className="font-pixel text-3xl sm:text-4xl text-[#FFCC00] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-stroke">
            PIXEL PARTY
          </span>
          {/* Always render H1 content for SEO, but style it based on state if needed. 
              Here we keep the subtitle always visible but styled retro. */}
          <span className={`font-thai text-white opacity-90 tracking-widest bg-black px-2 shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-all ${gameState === GameState.SETUP ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
            วงล้อแห่งความเมา
          </span>
        </h1>
      </header>

      {/* SETUP SCREEN */}
      {gameState === GameState.SETUP && (
        <main className="z-10 w-full flex justify-center">
          <SetupScreen 
            onStartGame={handleStartGame} 
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </main>
      )}

      {/* GAME SCREEN */}
      {gameState !== GameState.SETUP && (
        <main className="flex-grow flex flex-col items-center justify-start w-full max-w-2xl z-10">
          
          {/* Player Turn Banner */}
          {players.length > 0 && (
            <div className="mb-4 bg-black border-2 border-white px-6 py-2 shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] transform -rotate-1">
              <span className="font-pixel text-xs text-[#4ECDC4] mr-2">TURN:</span>
              <span className="font-thai text-xl text-white font-bold">{players[currentPlayerIndex]}</span>
            </div>
          )}

          <div className="mb-6 relative">
             {/* CRT Scanline effect overlay */}
             <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-b from-transparent to-black/10 z-0"></div>
             
             <WheelComponent 
               items={challenges} 
               isSpinning={gameState === GameState.SPINNING}
               onSpinComplete={handleSpinComplete}
             />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-md items-center">
            
            <RetroButton 
              onClick={handleSpinClick} 
              disabled={gameState !== GameState.IDLE || isGenerating}
              className="w-full text-lg sm:text-xl py-4 sm:py-6 animate-pulse hover:animate-none"
            >
              {gameState === GameState.SPINNING ? 'SPINNING...' : 'หมุนเลย! (SPIN)'}
            </RetroButton>

            {/* In-Game AI Remix (Smaller) */}
            <div className="w-full flex justify-between gap-2 mt-4">
               <button 
                  onClick={() => handleInGameRegenerate('fun')} 
                  className="bg-black/40 hover:bg-black/60 text-white font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
                  disabled={isGenerating}
               >
                 🔄 Remix: Fun
               </button>
               <button 
                  onClick={() => handleInGameRegenerate('spicy')} 
                  className="bg-black/40 hover:bg-black/60 text-pink-300 font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
                  disabled={isGenerating}
               >
                 🔄 Remix: 18+
               </button>
               <button 
                 onClick={handleBackToSetup}
                 className="bg-red-900/40 hover:bg-red-900/60 text-white font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
               >
                 🛑 EXIT
               </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-8 mb-4 text-white/30 text-[10px] font-pixel text-center z-10">
        POWERED BY GEMINI AI
      </footer>

      {/* Result Modal */}
      <ResultModal 
        result={lastResult} 
        isOpen={showResultModal} 
        onClose={closeModal} 
      />

    </div>
  );
};

export default App;