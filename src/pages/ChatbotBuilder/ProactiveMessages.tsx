import React from 'react';
import { useState } from 'react';
import { ProactiveMessagesSection } from '../../components/ChatbotBuilder/FlowEditor/ProactiveMessagesSection';
import { SmartProactiveMessages } from './SmartProactiveMessages';
import { Preview } from '../../components/ChatbotBuilder/Preview';
import { storage } from '../../lib/firebase';
import { Info, Lightbulb } from 'lucide-react';
import { ProactiveMessagesSidebar } from './ProactiveMessagesSidebar';
import { useRef, useEffect, useCallback } from 'react';
import type { DraggableEventHandler } from 'react-draggable';

interface ProactiveMessagesProps {
  chatbotName: string;
  welcomeMessage: string;
  endMessage: string;
  options: Option[];
  theme: Theme;
  proactiveMessages: {
    enabled: boolean;
    messages: string[];
    delay: number;
    interval: number;
    maxMessages: number;
  };
  setProactiveMessages: (messages: {
    enabled: boolean;
    messages: string[];
    delay: number;
    interval: number;
    maxMessages: number;
  }) => void;
}

export function ProactiveMessages({
  chatbotName,
  welcomeMessage,
  endMessage,
  options,
  theme,
  proactiveMessages,
  setProactiveMessages
}: ProactiveMessagesProps) {
  const [smartEnabled, setSmartEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const smartMessagesRef = useRef<HTMLDivElement>(null);
  const proactiveMessagesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [templates, setTemplates] = useState([
    {
      pageType: 'product',
      pattern: '/products/*/',
      message: 'Interested in {{product_name}}? Chat with us!'
    },
    {
      pageType: 'category',
      pattern: '/category/*/',
      message: 'Looking for {{category_name}}? We can help!'
    }
  ]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.min(Math.max(0.5, z * delta), 2));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if ((e.target as HTMLElement).closest('.drag-handle')) return;
    
    e.preventDefault();
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPosition.x,
      y: e.clientY - startPosition.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex h-[calc(100vh-96px)]">
      <div className="w-64 flex-shrink-0">
        <ProactiveMessagesSidebar />
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        <div 
          ref={contentRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <div className="flex flex-col items-center gap-8 -mt-32">
            <div ref={smartMessagesRef} className="w-[480px]">
              <SmartProactiveMessages
                enabled={smartEnabled}
                onEnable={setSmartEnabled}
                templates={templates}
                onTemplatesChange={setTemplates}
              />
            </div>

            <div ref={proactiveMessagesRef} className="w-[480px]">
              <ProactiveMessagesSection
                proactiveMessages={{
                  ...proactiveMessages,
                  enabled: !smartEnabled && proactiveMessages.enabled
                }}
                setProactiveMessages={(messages) => {
                  if (messages.enabled) {
                    setSmartEnabled(false);
                  }
                  setProactiveMessages(messages);
                }}
              />
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 flex items-center space-x-2 
          bg-dark-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-800 z-50">
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
              text-gray-200 hover:text-brand transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
              text-gray-200 hover:text-brand transition-colors"
          >
            -
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="px-4 py-2 hover:bg-dark-700 rounded text-sm text-gray-200 
              hover:text-brand transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}