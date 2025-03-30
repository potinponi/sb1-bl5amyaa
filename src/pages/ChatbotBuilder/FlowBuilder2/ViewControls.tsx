import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ViewControlsProps {
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  showEnd: boolean;
  setShowEnd: (show: boolean) => void;
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
}

export function ViewControls({
  showWelcome,
  setShowWelcome,
  showEnd,
  setShowEnd,
  showOptions,
  setShowOptions
}: ViewControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex items-center space-x-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-800">
      <button
        onClick={() => setShowWelcome(!showWelcome)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors
          ${showWelcome ? 'bg-brand text-black' : 'bg-dark-700 text-gray-400 hover:text-brand'}`}
      >
        {showWelcome ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span>Welcome</span>
      </button>
      
      <button
        onClick={() => setShowEnd(!showEnd)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors
          ${showEnd ? 'bg-brand text-black' : 'bg-dark-700 text-gray-400 hover:text-brand'}`}
      >
        {showEnd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span>End</span>
      </button>
      
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors
          ${showOptions ? 'bg-brand text-black' : 'bg-dark-700 text-gray-400 hover:text-brand'}`}
      >
        {showOptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span>Options</span>
      </button>
    </div>
  );
}