import React from 'react';
import Draggable from 'react-draggable';
import { MessageCircle } from 'lucide-react';
import type { Theme } from '../../../types';

interface EndNodeProps {
  nodeRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  onDrag: (e: any, data: { x: number; y: number }) => void;
  endMessage: string;
  setEndMessage: (message: string) => void;
  showEndScreen: boolean;
  setShowEndScreen: (show: boolean) => void;
  showEndScreen: boolean;
  setShowEndScreen: (show: boolean) => void;
  theme: Theme;
}

export function EndNode({
  nodeRef,
  position,
  onDrag,
  endMessage,
  setEndMessage,
  showEndScreen,
  setShowEndScreen,
  showEndScreen,
  setShowEndScreen,
  theme
}: EndNodeProps) {
  return (
    <Draggable
      position={position}
      nodeRef={nodeRef}
      onDrag={onDrag}
      bounds="parent"
      handle=".drag-handle"
    >
      <div 
        ref={nodeRef}
        className="flow-node absolute w-64 bg-dark-800 rounded-lg shadow-lg border border-gray-800"
        style={{ 
          background: theme.gradient 
            ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
            : theme.primaryColor
        }}
      >
        <div className="p-4 flex items-center space-x-3 drag-handle cursor-move">
          <MessageCircle className="w-5 h-5 text-black" />
          <h3 className="font-medium text-black">End Message</h3>
        </div>
        <div className="p-4 bg-dark-800 rounded-b-lg space-y-2">
          <textarea
            value={endMessage}
            onChange={(e) => setEndMessage(e.target.value)}
            className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
              text-gray-100 text-sm min-h-[60px] resize-none"
            placeholder="Enter end message..."
          />
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showEndScreen}
                onChange={(e) => setShowEndScreen(e.target.checked)}
                className="rounded border-gray-700 bg-dark-900 text-brand"
              />
              <span className="text-sm text-gray-400">Show end screen with feedback</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showEndScreen}
                onChange={(e) => setShowEndScreen(e.target.checked)}
                className="rounded border-gray-700 bg-dark-900 text-brand"
              />
              <span className="text-sm text-gray-400">Show end screen with feedback</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            This message will be shown after all questions are answered
          </p>
        </div>
      </div>
    </Draggable>
  );
}