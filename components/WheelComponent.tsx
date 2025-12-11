import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Challenge } from '../types';

interface WheelComponentProps {
  items: Challenge[];
  isSpinning: boolean; // Keep for button trigger compatibility
  onSpinComplete: (selectedItem: Challenge) => void;
  onSpinStart: () => void; // Notify parent that manual spin started
}

const WheelComponent: React.FC<WheelComponentProps> = ({ 
  items, 
  isSpinning: triggerSpin, // We use this prop as a trigger now
  onSpinComplete,
  onSpinStart
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics State Refs (using refs for high-performance animation loop)
  const rotation = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const lastTimestamp = useRef(0);
  const animationFrameId = useRef<number>(0);
  const friction = 0.985; // Air resistance (0.99 = slippery, 0.90 = heavy)
  const stopThreshold = 0.05; // Speed to snap/stop

  // Helper to get angle from center
  const getAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    // atan2 returns radians, convert to degrees
    return Math.atan2(y, x) * (180 / Math.PI) + 90; 
  };

  // Helper: Draw Sector
  const getSectorPath = (index: number, total: number) => {
    const segmentAngle = 360 / total;
    const radius = 150;
    const center = 150;
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
  };

  // Physics Loop
  const animate = useCallback((timestamp: number) => {
    if (!wheelRef.current) return;

    if (!isDragging.current && Math.abs(velocity.current) > 0) {
      // Apply Velocity
      rotation.current += velocity.current;
      
      // Apply Friction
      velocity.current *= friction;

      // Update DOM directly for 60fps performance
      wheelRef.current.style.transform = `rotate(${rotation.current}deg)`;

      // Check if stopped
      if (Math.abs(velocity.current) < stopThreshold) {
        velocity.current = 0;
        
        // Calculate Winner
        const segmentAngle = 360 / items.length;
        const normalizedRotation = rotation.current % 360;
        const effectiveAngle = (360 - normalizedRotation) % 360;
        const winningIndex = Math.floor(effectiveAngle / segmentAngle);
        const actualIndex = winningIndex >= items.length ? 0 : winningIndex;
        
        onSpinComplete(items[actualIndex]);
      } else {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    } else if (isDragging.current) {
        // Just update visual if dragging (logic handled in pointer move)
        wheelRef.current.style.transform = `rotate(${rotation.current}deg)`;
    }
  }, [items, onSpinComplete]);

  // Handle external trigger (Button Press)
  useEffect(() => {
    if (triggerSpin && Math.abs(velocity.current) < 1) {
      // "Kick" the wheel with random high velocity
      const randomSpeed = 25 + Math.random() * 15; // Speed between 25-40
      velocity.current = randomSpeed;
      lastTimestamp.current = performance.now();
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [triggerSpin, animate]);

  // Pointer Events (Touch/Mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scrolling
    isDragging.current = true;
    velocity.current = 0;
    cancelAnimationFrame(animationFrameId.current);
    
    // Notify parent that interaction started
    onSpinStart();

    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    lastTimestamp.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();

    const currentAngle = getAngle(e.clientX, e.clientY);
    const prevAngle = getAngle(lastPointerPos.current.x, lastPointerPos.current.y);
    let delta = currentAngle - prevAngle;

    // Handle wrap-around (e.g. 359 -> 1)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    rotation.current += delta;
    
    // Calculate instantaneous velocity for "throw"
    const now = performance.now();
    const dt = now - lastTimestamp.current;
    if (dt > 0) {
       // Simple moving average for velocity to smooth out jitter
       const newVel = delta; // Velocity per frame-ish
       velocity.current = newVel; 
    }

    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    lastTimestamp.current = now;
    
    // Force update visual
    if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${rotation.current}deg)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // If velocity is high enough, let it spin. If too low, it's just a drag.
    // Boost the throw velocity slightly to feel better
    if (Math.abs(velocity.current) > 10) {
        velocity.current = Math.min(Math.max(velocity.current, -45), 45); // Cap max speed
    } 

    animationFrameId.current = requestAnimationFrame(animate);
  };

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <div 
      className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto select-none touch-none"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'none' }} // Crucial for mobile swipe
    >
      {/* Pointer / Marker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-white drop-shadow-md filter drop-shadow-[0_4px_0_rgba(0,0,0,1)] pointer-events-none"></div>

      {/* The Wheel */}
      <div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-white shadow-[0_0_0_8px_black] cursor-grab active:cursor-grabbing will-change-transform"
        style={{
            transform: `rotate(${rotation.current}deg)`,
            // No CSS transition! We use JS physics now.
        }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full rounded-full pointer-events-none">
          {items.map((item, index) => {
            const segmentAngle = 360 / items.length;
            const angle = (index * segmentAngle) + (segmentAngle / 2);
            const rad = (angle - 90) * (Math.PI / 180);
            const radius = 150;
            const x = 150 + (radius * 0.70) * Math.cos(rad);
            const y = 150 + (radius * 0.70) * Math.sin(rad);

            return (
              <g key={item.id}>
                <path
                  d={getSectorPath(index, items.length)}
                  fill={item.color}
                  stroke="black"
                  strokeWidth="2"
                />
                <g transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                   <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="black"
                    className="font-thai text-[14px] font-bold"
                    style={{ fontSize: items.length > 8 ? '10px' : '14px' }}
                  >
                    {item.emoji}
                  </text>
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill="black"
                    className="font-thai text-[10px] sm:text-[12px] font-bold tracking-tighter"
                    style={{ 
                      fontSize: items.length > 8 ? '8px' : '11px',
                      textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
                    }}
                  >
                    {item.text.length > 8 ? item.text.substring(0, 8) + '..' : item.text}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black z-10 flex items-center justify-center shadow-lg pointer-events-none">
        <div className="w-4 h-4 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

export default WheelComponent;