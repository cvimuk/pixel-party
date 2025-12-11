import React, { useState, useEffect, useRef } from 'react';
import { Challenge } from '../types';
import { SPIN_DURATION_MS } from '../constants';

interface WheelComponentProps {
  items: Challenge[];
  isSpinning: boolean;
  onSpinComplete: (selectedItem: Challenge) => void;
}

const WheelComponent: React.FC<WheelComponentProps> = ({ items, isSpinning, onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Calculate segment size
  const segmentAngle = 360 / items.length;
  const radius = 150; // SVG radius
  const center = 150; // SVG center

  // Helper to calculate SVG path for a slice
  const getSectorPath = (index: number) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;

    // Convert degrees to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // SVG Path command
    return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
  };

  // Helper to calculate text position
  const getTextPosition = (index: number) => {
    const angle = (index * segmentAngle) + (segmentAngle / 2);
    const rad = (angle - 90) * (Math.PI / 180);
    // Place text at 70% of radius
    const x = center + (radius * 0.70) * Math.cos(rad);
    const y = center + (radius * 0.70) * Math.sin(rad);
    return { x, y, angle };
  };

  useEffect(() => {
    if (isSpinning) {
      // Calculate a new random rotation
      // Minimum 4 spins (1440 deg) + random segment
      const randomOffset = Math.floor(Math.random() * 360);
      const newRotation = rotation + 1440 + randomOffset;
      setRotation(newRotation);

      // Determine winner based on the final angle
      // The pointer is at the TOP (0 degrees visually). 
      // When the wheel rotates Clockwise by R degrees, the segment at the top is the one
      // that was originally at (360 - (R % 360)).
      
      const normalizedRotation = newRotation % 360;
      const effectiveAngle = (360 - normalizedRotation) % 360;
      const winningIndex = Math.floor(effectiveAngle / segmentAngle);
      
      // Safety check
      const actualIndex = winningIndex >= items.length ? 0 : winningIndex;
      
      const timeout = setTimeout(() => {
        onSpinComplete(items[actualIndex]);
      }, SPIN_DURATION_MS);

      return () => clearTimeout(timeout);
    }
  }, [isSpinning, items, onSpinComplete]);

  return (
    <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto">
      {/* Pointer / Marker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-white drop-shadow-md filter drop-shadow-[0_4px_0_rgba(0,0,0,1)]"></div>

      {/* The Wheel */}
      <div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-white shadow-[0_0_0_8px_black]"
        style={{
          transform: `rotate(${rotation}deg)`,
          // Cubic-bezier(0.1, 0, 0.1, 1) provides a fast start and a very smooth, long deceleration (realistic wheel physics)
          transition: isSpinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.1, 0, 0.1, 1)` : 'none',
        }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full rounded-full">
          {items.map((item, index) => {
            const { x, y, angle } = getTextPosition(index);
            return (
              <g key={item.id}>
                <path
                  d={getSectorPath(index)}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black z-10 flex items-center justify-center shadow-lg">
        <div className="w-4 h-4 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

export default WheelComponent;