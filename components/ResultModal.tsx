import React, { useEffect, useState } from 'react';
import { Challenge } from '../types';
import RetroButton from './RetroButton';

interface ResultModalProps {
  result: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, isOpen, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 200);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-90'}`}>
        {/* Header Bar */}
        <div className="bg-blue-600 p-2 flex justify-between items-center border-b-4 border-black">
          <span className="font-pixel text-white text-xs">RESULT.EXE</span>
          <div className="flex gap-1">
            <button onClick={onClose} className="w-4 h-4 bg-red-500 border-2 border-white hover:bg-red-400"></button>
          </div>
        </div>

        {/* Content */}
        {result && (
          <div className="p-8 flex flex-col items-center text-center bg-[#f0f0f0]">
             <div className="text-6xl mb-6 animate-bounce-pixel filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
              {result.emoji}
             </div>
             
             <h2 className="font-thai text-3xl font-bold mb-4 text-black leading-tight">
               {result.text}
             </h2>

             <div className="w-full h-1 bg-black/10 my-6"></div>

             <RetroButton onClick={onClose} variant="primary" className="w-full">
               OKAY!
             </RetroButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultModal;