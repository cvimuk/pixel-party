import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BottleType, BottleGameMode, Challenge } from '../types';

// --- ASSETS ---

const TABLE_SVG = (
  <svg viewBox="0 0 400 400" className="w-full h-full opacity-100">
    <defs>
      <radialGradient id="woodGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="40%" stopColor="#5D4037" />
        <stop offset="85%" stopColor="#3E2723" />
        <stop offset="100%" stopColor="#281815" />
      </radialGradient>
      {/* Wood Grain Pattern */}
      <pattern id="woodPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
         <path d="M0 10 h 40" stroke="#3E2723" strokeWidth="4" strokeDasharray="10 10" opacity="0.3"/>
         <path d="M0 30 h 40" stroke="#3E2723" strokeWidth="4" strokeDasharray="20 5" opacity="0.3"/>
      </pattern>
    </defs>
    {/* Table Top */}
    <rect x="20" y="20" width="360" height="360" rx="180" fill="url(#woodGradient)" />
    <rect x="20" y="20" width="360" height="360" rx="180" fill="url(#woodPattern)" opacity="0.4" />
    
    {/* Pixelated Table Border */}
    <path d="M200,10 L220,10 L220,15 L240,15 L240,25 L260,25... " fill="none" /> 
    {/* Simplified Border for perf */}
    <circle cx="200" cy="200" r="180" stroke="#281815" strokeWidth="12" fill="none" strokeDasharray="8 4" />
  </svg>
);

const PIXEL_BOTTLES = {
  BROWN: (
    <svg viewBox="0 0 32 80" className="w-full h-full drop-shadow-xl" shapeRendering="crispEdges">
       {/* 8-bit Outline/Shadow */}
       <path d="M10,2 h12 v4 h2 v6 h2 v12 h2 v54 h-22 v-54 h2 v-12 h2 v-6 h2 v-4 z" fill="rgba(0,0,0,0.5)" transform="translate(2, 2)" />
       
       {/* Glass Body */}
       <rect x="10" y="2" width="12" height="4" fill="#E6C200" /> {/* Cap */}
       <rect x="12" y="6" width="8" height="6" fill="#DAA520" /> {/* Neck Foil */}
       <rect x="10" y="12" width="12" height="12" fill="#8B4513" /> {/* Neck */}
       <rect x="8" y="24" width="16" height="54" fill="#8B4513" /> {/* Body */}
       
       {/* Highlights (Pixelated) */}
       <rect x="22" y="26" width="2" height="50" fill="#A0522D" />
       <rect x="9" y="26" width="2" height="50" fill="#5D2E0E" />

       {/* Label Neck */}
       <rect x="13" y="16" width="6" height="4" fill="white" />
       <rect x="14" y="17" width="4" height="2" fill="red" />

       {/* Label Body */}
       <rect x="10" y="44" width="12" height="16" fill="white" />
       <rect x="11" y="45" width="10" height="14" fill="#F8F8F8" />
       <rect x="12" y="48" width="8" height="2" fill="#DAA520" /> {/* Logo */}
       <rect x="12" y="52" width="8" height="2" fill="black" /> {/* Text */}
    </svg>
  ),
  GREEN: (
    <svg viewBox="0 0 32 80" className="w-full h-full drop-shadow-xl" shapeRendering="crispEdges">
       {/* 8-bit Outline/Shadow */}
       <path d="M10,2 h12 v4 h2 v6 h2 v12 h2 v54 h-22 v-54 h2 v-12 h2 v-6 h2 v-4 z" fill="rgba(0,0,0,0.5)" transform="translate(2, 2)" />

       {/* Glass Body */}
       <rect x="10" y="2" width="12" height="4" fill="#C0C0C0" /> {/* Cap */}
       <rect x="12" y="6" width="8" height="6" fill="#006400" /> {/* Neck */}
       <rect x="10" y="12" width="12" height="12" fill="#006400" /> {/* Neck */}
       <rect x="8" y="24" width="16" height="54" fill="#006400" /> {/* Body */}
       
       {/* Highlights */}
       <rect x="22" y="26" width="2" height="50" fill="#008000" />
       <rect x="9" y="26" width="2" height="50" fill="#004d00" />

       {/* Label Neck */}
       <rect x="11" y="14" width="10" height="6" fill="#004d00" />
       <rect x="13" y="15" width="6" height="4" fill="white" />
       <rect x="15" y="16" width="2" height="2" fill="red" />

       {/* Label Body */}
       <rect x="9" y="48" width="14" height="10" fill="white" rx="0" />
       <rect x="9" y="48" width="14" height="2" fill="#004d00" />
       <rect x="9" y="56" width="14" height="2" fill="#004d00" />
       <rect x="10" y="52" width="12" height="2" fill="#004d00" /> {/* Text bar */}
       <rect x="15" y="50" width="2" height="2" fill="red" /> {/* Star */}
    </svg>
  )
};

interface BottleComponentProps {
  bottleType: BottleType;
  gameMode: BottleGameMode;
  isSpinning: boolean;
  onSpinComplete: (result?: Challenge) => void;
  onSpinStart: () => void;
  items?: Challenge[]; // Required for Dare mode
}

const BottleComponent: React.FC<BottleComponentProps> = ({ 
  bottleType, 
  gameMode,
  isSpinning: triggerSpin, 
  onSpinComplete,
  onSpinStart,
  items = []
}) => {
  const bottleRef = useRef<HTMLDivElement>(null);
  
  // Physics State
  const rotation = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  
  const friction = 0.992;
  const stopThreshold = 0.05; 

  // Helper: Draw Static Wheel Sector
  const getSectorPath = (index: number, total: number) => {
    const segmentAngle = 360 / total;
    const radius = 170; // Slightly smaller than table
    const center = 200;
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    
    // WheelComponent starts sector 0 at 12 o'clock (-90deg).
    // We match this.
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
  };

  const calculateWinner = () => {
      if (gameMode !== 'DARE' || items.length === 0) return undefined;
      
      const segmentAngle = 360 / items.length;
      // Normalize rotation to 0-360 positive
      let normalizedRotation = rotation.current % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      
      // Bottle points UP at 0 deg.
      // Wheel Sector 0 starts at UP (0 deg in our bottle-relative-to-wheel logic).
      // So if bottle is at 10 deg, it points to Sector 0 (0-45 deg).
      // If bottle is at 350 deg, it points to Sector N-1.
      
      const winningIndex = Math.floor(normalizedRotation / segmentAngle);
      return items[winningIndex % items.length];
  };

  const getAngle = (clientX: number, clientY: number) => {
    if (!bottleRef.current) return 0;
    const rect = bottleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    return Math.atan2(y, x) * (180 / Math.PI) + 90; 
  };

  const animate = useCallback(() => {
    if (!bottleRef.current) return;

    if (!isDragging.current && Math.abs(velocity.current) > 0) {
      rotation.current += velocity.current;
      velocity.current *= friction;

      bottleRef.current.style.transform = `rotate(${rotation.current}deg)`;

      if (Math.abs(velocity.current) < stopThreshold) {
        velocity.current = 0;
        const winner = calculateWinner();
        onSpinComplete(winner);
      } else {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    } else if (isDragging.current) {
        bottleRef.current.style.transform = `rotate(${rotation.current}deg)`;
    }
  }, [onSpinComplete, gameMode, items]);

  useEffect(() => {
    if (triggerSpin) {
      const randomSpeed = 40 + Math.random() * 40;
      const direction = Math.random() > 0.5 ? 1 : -1;
      velocity.current = randomSpeed * direction;
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [triggerSpin, animate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    velocity.current = 0;
    cancelAnimationFrame(animationFrameId.current);
    onSpinStart();
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const currentAngle = getAngle(e.clientX, e.clientY);
    const prevAngle = getAngle(lastPointerPos.current.x, lastPointerPos.current.y);
    let delta = currentAngle - prevAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotation.current += delta;
    velocity.current = delta;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    if (bottleRef.current) {
        bottleRef.current.style.transform = `rotate(${rotation.current}deg)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const THROW_MULTIPLIER = 1.5;
    if (Math.abs(velocity.current) > 0.5) {
        velocity.current = velocity.current * THROW_MULTIPLIER;
        velocity.current = Math.min(Math.max(velocity.current, -80), 80);
    }
    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <div className="relative w-[340px] h-[340px] flex items-center justify-center select-none touch-none">
      
      {/* 1. WOODEN TABLE BACKGROUND */}
      <div className="absolute inset-0 z-0 drop-shadow-2xl">
        {TABLE_SVG}
      </div>

      {/* 1.5 STATIC WHEEL (Only in Dare Mode) */}
      {gameMode === 'DARE' && items.length > 0 && (
          <div className="absolute inset-0 z-10 opacity-90 pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                  {items.map((item, index) => {
                      const segmentAngle = 360 / items.length;
                      const angle = (index * segmentAngle) + (segmentAngle / 2);
                      const radius = 170;
                      // Text position
                      const rad = (angle - 90) * (Math.PI / 180);
                      const x = 200 + (radius * 0.75) * Math.cos(rad);
                      const y = 200 + (radius * 0.75) * Math.sin(rad);

                      return (
                          <g key={item.id}>
                              <path 
                                d={getSectorPath(index, items.length)} 
                                fill={item.color} 
                                stroke="rgba(0,0,0,0.5)" 
                                strokeWidth="2"
                              />
                              <g transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                                <text 
                                    x="0" y="0" 
                                    textAnchor="middle" 
                                    fill="black" 
                                    fontSize="16" 
                                    className="font-retro"
                                >
                                    {item.emoji}
                                </text>
                              </g>
                          </g>
                      );
                  })}
              </svg>
          </div>
      )}

      {/* 2. ROTATING BOTTLE CONTAINER */}
      <div 
        ref={bottleRef}
        className="relative z-20 cursor-grab active:cursor-grabbing will-change-transform origin-center flex justify-center items-center"
        style={{ width: '80px', height: '240px', transform: `rotate(${rotation.current}deg)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* The 8-bit Bottle SVG */}
        <div className="w-full h-full transform scale-110 drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
             {PIXEL_BOTTLES[bottleType]}
        </div>

        {/* 3. POINTER / LASER (Attached to bottle) */}
        {/* Extends from Top (-Y) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[120px] w-[20px] h-[120px] pointer-events-none flex flex-col justify-end items-center opacity-80">
            <div className="w-[4px] h-[4px] bg-red-600 mb-1 animate-pulse"></div> {/* Pixel Tip */}
            <div className="w-[2px] h-full bg-gradient-to-t from-red-600 to-transparent"></div>
        </div>
      </div>
      
    </div>
  );
};

export default BottleComponent;