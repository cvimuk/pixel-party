import React, { useState, useCallback } from 'react';
import { Challenge, GameState, AppMode, BottleType, BottleGameMode } from './types';
import { DEFAULT_CHALLENGES } from './constants';
import { generateChallenges } from './services/geminiService';
import WheelComponent from './components/WheelComponent';
import BottleComponent from './components/BottleComponent';
import RetroButton from './components/RetroButton';
import ResultModal from './components/ResultModal';
import SetupScreen from './components/SetupScreen';

const App: React.FC = () => {
  // App Mode State
  const [appMode, setAppMode] = useState<AppMode>('WHEEL');

  // Game Data State
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [lastResult, setLastResult] = useState<Challenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Physics trigger state
  const [triggerSpin, setTriggerSpin] = useState(false);
  
  // Player State
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Bottle Settings
  const [bottleType, setBottleType] = useState<BottleType>('BROWN');
  const [bottleGameMode, setBottleGameMode] = useState<BottleGameMode>('CLASSIC');

  // --- Setup Handlers ---
  const handleStartGame = (newChallenges: Challenge[], newPlayers: string[]) => {
    setChallenges(newChallenges);
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameState(GameState.IDLE);
  };

  const handleGenerate = async (theme: string, playerNames: string[], count: number = 8) => {
    setIsGenerating(true);
    try {
      return await generateChallenges(theme, playerNames, count);
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

  const handleSwitchMode = (mode: AppMode) => {
    if (gameState === GameState.IDLE || gameState === GameState.SETUP) {
      setAppMode(mode);
      setGameState(GameState.SETUP); // Always reset to setup when switching
    }
  };

  // --- Game Handlers ---
  const handleSpinClick = useCallback(() => {
    if (gameState !== GameState.IDLE) return;
    setGameState(GameState.SPINNING);
    setShowResultModal(false);
    setTriggerSpin(true);
    setTimeout(() => setTriggerSpin(false), 100);
  }, [gameState]);
  
  const handleManualSpinStart = useCallback(() => {
    if (gameState === GameState.IDLE || gameState === GameState.SHOW_RESULT) {
        setGameState(GameState.SPINNING);
        setShowResultModal(false);
    }
  }, [gameState]);

  // WHEEL Complete
  const handleWheelComplete = useCallback((result: Challenge) => {
    setLastResult(result);
    setGameState(GameState.SHOW_RESULT);
    setTriggerSpin(false);
    
    setTimeout(() => {
      setShowResultModal(true);
      setGameState(GameState.IDLE);
      rotatePlayer();
    }, 500);
  }, [players.length]);

  // BOTTLE Complete
  const handleBottleComplete = useCallback((result?: Challenge) => {
    setTriggerSpin(false);
    
    if (bottleGameMode === 'DARE' && result) {
        setLastResult(result);
        setGameState(GameState.SHOW_RESULT);
        
        setTimeout(() => {
            setShowResultModal(true);
            setGameState(GameState.IDLE);
            rotatePlayer();
        }, 500);
    } else {
        // Just spin (Classic) - No result modal, just rotates player
        setGameState(GameState.IDLE);
        rotatePlayer();
    }
  }, [bottleGameMode, players.length]);

  const rotatePlayer = () => {
    if (players.length > 0) {
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }
  };

  const closeModal = () => {
    setShowResultModal(false);
  };

  const handleInGameRegenerate = async (theme: 'fun' | 'spicy' | 'hardcore') => {
    if (isGenerating || gameState === GameState.SPINNING) return;
    const promptTheme = theme === 'fun' ? 'ตลกเฮฮา' : theme === 'spicy' ? '18+ ทะลึ่ง' : 'โหด ดื่มหนัก';
    const newChallenges = await handleGenerate(promptTheme, players, challenges.length);
    if (newChallenges) {
      setChallenges(newChallenges);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-start relative overflow-hidden font-retro bg-black">
      
      {/* Top Menu Tab System */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-center bg-black/90 backdrop-blur border-b-4 border-white/20 p-2 gap-4">
        <button 
           onClick={() => handleSwitchMode('WHEEL')}
           className={`px-4 py-2 font-pixel text-xs sm:text-sm transition-all border-b-4 ${appMode === 'WHEEL' ? 'text-[#FFCC00] border-[#FFCC00]' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          🎡 WHEEL
        </button>
        <button 
           onClick={() => handleSwitchMode('BOTTLE')}
           className={`px-4 py-2 font-pixel text-xs sm:text-sm transition-all border-b-4 ${appMode === 'BOTTLE' ? 'text-[#4ECDC4] border-[#4ECDC4]' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          🍾 BOTTLE
        </button>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16"></div>

      {/* Header */}
      <header className={`text-center relative z-10 transition-all duration-500 ${gameState === GameState.SETUP ? 'mt-4 mb-4' : 'mt-0 mb-4'}`}>
        <h1 className="flex flex-col items-center gap-2">
          <span className="font-pixel text-3xl sm:text-4xl text-[#FFCC00] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-stroke">
            PIXEL PARTY
          </span>
          <span className={`font-thai text-white opacity-90 tracking-widest bg-black px-2 shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-all ${gameState === GameState.SETUP ? 'text-lg' : 'text-sm'}`}>
            {appMode === 'WHEEL' ? 'วงล้อแห่งความเมา' : 'เกมหมุนขวด'}
          </span>
        </h1>
      </header>

      {/* SETUP SCREEN */}
      {gameState === GameState.SETUP && (
        <main className="z-10 w-full flex flex-col items-center gap-6">
          {/* Bottle Settings (Only visible in Bottle Mode) */}
          {appMode === 'BOTTLE' && (
             <div className="w-full max-w-md bg-[#FFFBF0] border-4 border-black p-4 flex flex-col gap-4 animate-bounce-pixel text-black shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center">
                   <label className="font-pixel text-xs font-bold">BOTTLE STYLE:</label>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setBottleType('BROWN')}
                        className={`w-10 h-10 border-2 ${bottleType === 'BROWN' ? 'border-black bg-yellow-600' : 'border-gray-300 bg-white'}`}
                      >🍺</button>
                      <button 
                        onClick={() => setBottleType('GREEN')}
                        className={`w-10 h-10 border-2 ${bottleType === 'GREEN' ? 'border-black bg-green-600' : 'border-gray-300 bg-white'}`}
                      >🍾</button>
                   </div>
                </div>
                
                <div className="flex justify-between items-center">
                   <label className="font-pixel text-xs font-bold">GAME TYPE:</label>
                   <select 
                      value={bottleGameMode}
                      onChange={(e) => setBottleGameMode(e.target.value as BottleGameMode)}
                      className="border-2 border-black p-1 font-thai text-sm bg-white"
                   >
                      <option value="CLASSIC">Classic (ชี้คน)</option>
                      <option value="DARE">Dare (สุ่มโจทย์)</option>
                   </select>
                </div>
             </div>
          )}

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

          <div className="mb-6 relative min-h-[350px] flex items-center justify-center">
             {/* Hint text */}
             <div className="absolute top-0 left-0 right-0 text-center pointer-events-none opacity-60 animate-pulse z-20">
                <span className="font-pixel text-[10px] text-white bg-black/50 px-2 rounded">
                    👆 SWIPE TO SPIN
                </span>
             </div>

             {appMode === 'WHEEL' ? (
                <WheelComponent 
                   items={challenges} 
                   isSpinning={triggerSpin}
                   onSpinComplete={handleWheelComplete}
                   onSpinStart={handleManualSpinStart}
                />
             ) : (
                <BottleComponent
                   bottleType={bottleType}
                   gameMode={bottleGameMode}
                   isSpinning={triggerSpin}
                   onSpinComplete={handleBottleComplete}
                   onSpinStart={handleManualSpinStart}
                   items={challenges}
                />
             )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-md items-center">
            
            <RetroButton 
              onClick={handleSpinClick} 
              disabled={gameState === GameState.SPINNING || isGenerating}
              className="w-full text-lg sm:text-xl py-4 sm:py-6 hover:scale-[1.02] active:scale-95 transition-transform"
            >
              {gameState === GameState.SPINNING ? 'SPINNING...' : (appMode === 'WHEEL' || bottleGameMode === 'DARE' ? 'หมุนเลย! (SPIN)' : 'หมุนขวด (SPIN)')}
            </RetroButton>

            {/* In-Game AI Remix (Only for Wheel or Bottle Dare mode) */}
            {(appMode === 'WHEEL' || bottleGameMode === 'DARE') && (
                <div className="w-full flex justify-between gap-2 mt-4">
                   <button 
                      onClick={() => handleInGameRegenerate('fun')} 
                      className="bg-black/40 hover:bg-black/60 text-white font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
                      disabled={isGenerating || gameState === GameState.SPINNING}
                   >
                     🔄 Remix: Fun
                   </button>
                   <button 
                      onClick={() => handleInGameRegenerate('spicy')} 
                      className="bg-black/40 hover:bg-black/60 text-pink-300 font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
                      disabled={isGenerating || gameState === GameState.SPINNING}
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
            )}
             {/* Exit button for Classic Bottle mode */}
            {appMode === 'BOTTLE' && bottleGameMode === 'CLASSIC' && (
                <button 
                    onClick={handleBackToSetup}
                    className="w-full mt-4 bg-red-900/40 hover:bg-red-900/60 text-white font-pixel text-[10px] p-2 border border-white/20 rounded backdrop-blur-sm"
                >
                    🛑 EXIT GAME
                </button>
            )}
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