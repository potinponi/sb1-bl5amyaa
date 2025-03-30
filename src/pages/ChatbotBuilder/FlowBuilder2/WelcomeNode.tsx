import React from 'react';
import Draggable from 'react-draggable';
import { MessageCircle } from 'lucide-react';
import type { Theme } from '../../../types';

interface WelcomeNodeProps {
  nodeRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  onDrag: (e: any, data: { x: number; y: number }) => void;
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  theme: Theme;
}

export function WelcomeNode({
  nodeRef,
  position,
  onDrag,
  welcomeMessage,
  setWelcomeMessage,
  theme
}: WelcomeNodeProps) {
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
          <h3 className="font-medium text-black">Welcome Message</h3>
        </div>
        <div className="p-4 bg-dark-800 rounded-b-lg space-y-2">
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
              text-gray-100 text-sm min-h-[60px] resize-none"
            placeholder="Enter welcome message..."
          />
          <p className="text-xs text-gray-500">
            This message will be shown when the chat starts
          </p>
        </div>
      </div>
    </Draggable>
  );
}