import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  setZoom: (fn: (z: number) => number) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  initialZoom: number;
}

export function ZoomControls({
  setZoom,
  setPosition,
  initialZoom
}: ZoomControlsProps) {
  return (
    <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 flex items-center space-x-2 
      bg-dark-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-800">
      <button
        onClick={() => setZoom(z => Math.min(2, z + 0.1))}
        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
          text-gray-200 hover:text-brand transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
          text-gray-200 hover:text-brand transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-700" />
      <button
        onClick={() => {
          setZoom(() => initialZoom);
          setPosition({ x: 0, y: 0 });
        }}
        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
          text-gray-200 hover:text-brand transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}