import React, { useRef, useState, useEffect } from 'react';
import type { Theme, Option, NodePosition } from '../../../types';
import { WelcomeNode } from './WelcomeNode';
import { EndNode } from './EndNode';
import { OptionNode } from './OptionNode';
import { ViewControls } from './ViewControls';
import { ZoomControls } from './ZoomControls';

interface NodeRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

interface FlowBuilder2Props {
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  endMessage: string;
  setEndMessage: (message: string) => void;
  showEndScreen: boolean;
  setShowEndScreen: (show: boolean) => void;
  options: Option[];
  setOptions: (options: Option[]) => void;
  theme: Theme;
  chatbotName: string;
}

const INITIAL_ZOOM = 0.6;

export function FlowBuilder2({
  welcomeMessage,
  setWelcomeMessage,
  endMessage,
  setEndMessage,
  showEndScreen,
  setShowEndScreen,
  options,
  setOptions,
  theme
}: FlowBuilder2Props) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEnd, setShowEnd] = useState(true);
  const [showOptions, setShowOptions] = useState(true);
  
  const nodeRefs = useRef<NodeRefs>({
    welcome: React.createRef(),
    end: React.createRef(),
    ...options.reduce((acc, option) => ({
      ...acc,
      [option.id]: React.createRef<HTMLDivElement>()
    }), {})
  });

  const [nodePositions, setNodePositions] = useState<NodePosition[]>([
    { id: 'welcome', x: 40, y: 40 },
    { id: 'end', x: 800, y: 40 },
    ...options.map((option, index) => ({
      id: option.id,
      x: 400,
      y: 40 + (index * 200)
    }))
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
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.flow-node')) return;
    
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

  const handleNodeDrag = (id: string, e: any, data: { x: number; y: number }) => {
    setNodePositions(prev => prev.map(pos => 
      pos.id === id ? { ...pos, x: data.x, y: data.y } : pos
    ));
  };

  const getNodePosition = (id: string) => {
    return nodePositions.find(pos => pos.id === id) || { x: 0, y: 0 };
  };

  const renderConnections = () => {
    const welcomePos = getNodePosition('welcome');
    const endPos = getNodePosition('end');
    const connections = [];

    options.forEach(option => {
      const optionPos = getNodePosition(option.id);
      connections.push(
        <path
          key={`welcome-${option.id}`}
          d={`M ${welcomePos.x + 256} ${welcomePos.y + 60} 
              C ${welcomePos.x + 356} ${welcomePos.y + 60},
                ${optionPos.x - 100} ${optionPos.y + 60},
                ${optionPos.x} ${optionPos.y + 60}`}
          stroke={theme.primaryColor}
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      );

      connections.push(
        <path
          key={`${option.id}-end`}
          d={`M ${optionPos.x + 320} ${optionPos.y + 60}
              C ${optionPos.x + 420} ${optionPos.y + 60},
                ${endPos.x - 100} ${endPos.y + 60},
                ${endPos.x} ${endPos.y + 60}`}
          stroke={theme.primaryColor}
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      );
    });

    return connections;
  };

  return (
    <div className="h-[calc(100vh-56px)] bg-dark-900 overflow-hidden relative">
      <ViewControls
        showWelcome={showWelcome}
        setShowWelcome={setShowWelcome}
        showEnd={showEnd}
        setShowEnd={setShowEnd}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
      />

      <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        <div 
          ref={contentRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE5MTkxOSIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTkxOTE5IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

          <div className="relative" style={{ width: '3000px', height: '2000px' }}>
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '3000px', height: '2000px' }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={theme.primaryColor}
                  />
                </marker>
              </defs>
              {renderConnections()}
            </svg>

            {showWelcome && (
              <WelcomeNode
                nodeRef={nodeRefs.current.welcome}
                position={getNodePosition('welcome')}
                onDrag={(e, data) => handleNodeDrag('welcome', e, data)}
                welcomeMessage={welcomeMessage}
                setWelcomeMessage={setWelcomeMessage}
                theme={theme}
              />
            )}

            {showOptions && options.map((option, index) => (
              <OptionNode
                key={option.id}
                nodeRef={nodeRefs.current[option.id]}
                position={getNodePosition(option.id)}
                onDrag={(e, data) => handleNodeDrag(option.id, e, data)}
                option={option}
                index={index}
                options={options}
                setOptions={setOptions}
                theme={theme}
              />
            ))}

            {showEnd && (
              <EndNode
                nodeRef={nodeRefs.current.end}
                position={getNodePosition('end')}
                onDrag={(e, data) => handleNodeDrag('end', e, data)}
                endMessage={endMessage}
                setEndMessage={setEndMessage}
                showEndScreen={showEndScreen}
                setShowEndScreen={setShowEndScreen}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>
      
      <ZoomControls
        setZoom={setZoom}
        setPosition={setPosition}
        initialZoom={INITIAL_ZOOM}
      />
    </div>
  );
}