import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, RotateCcw, MessageCircle, Settings, ArrowRight, Eye, EyeOff, Calendar, X } from 'lucide-react';
import type { Flow, Theme, Option, NodePosition } from '../../types';

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

const INITIAL_ZOOM = 0.6; // More zoomed out for better overview

function FlowBuilder2({
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
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [editingOption, setEditingOption] = useState<string | null>(null);
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

    // Welcome to Options connections
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

      // Options to End connections
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
    <div className="h-[calc(100vh-96px)] bg-dark-900 overflow-hidden">
      {/* Controls */}
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

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
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
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE5MTkxOSIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTkxOTE5IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

          {/* Flow Nodes */}
          <div className="relative" style={{ width: '3000px', height: '2000px' }}>
            {/* Connection Lines */}
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

            {/* Welcome Message Node - Only show if enabled */}
            {showWelcome && (
            <Draggable
              position={getNodePosition('welcome')}
              nodeRef={nodeRefs.current.welcome}
              onDrag={(e, data) => handleNodeDrag('welcome', e, data)}
              bounds="parent"
              handle=".drag-handle"
            >
              <div
                ref={nodeRefs.current.welcome}
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
            )}

            {/* Options - Only show if enabled */}
            {showOptions && (
            options.map((option, index) => (
              <Draggable
                key={option.id}
                nodeRef={nodeRefs.current[option.id]}
                position={getNodePosition(option.id)}
                onDrag={(e, data) => handleNodeDrag(option.id, e, data)}
                bounds="parent"
                handle=".drag-handle"
              >
                <div
                  ref={nodeRefs.current[option.id]}
                  className="flow-node absolute w-80 bg-dark-800 rounded-lg shadow-lg border border-gray-800"
                >
                  <div className="p-4 flex items-center justify-between drag-handle cursor-move">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-brand" />
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = {
                            ...option,
                            label: e.target.value
                          };
                          setOptions(newOptions);
                        }}
                        className="font-medium text-gray-100 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-brand rounded px-1"
                      />
                    </div>
                    <span className="text-xs text-gray-500">Option {index + 1}</span>
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <div className="space-y-2">
                      {option.flow.map((question, qIndex) => (
                        <div 
                          key={question.id}
                          className="relative flex items-start space-x-2 p-3 bg-dark-700 rounded-lg border border-gray-700"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-dark-600 text-xs text-gray-400">
                            {qIndex + 1}
                          </span>
                          <div className="flex-1 space-y-2 min-w-0">
                            <input
                              type="text"
                              value={question.label}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index].flow[qIndex] = {
                                  ...question,
                                  label: e.target.value
                                };
                                setOptions(newOptions);
                              }}
                              className="w-full bg-transparent border-none text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand rounded px-1"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[index].flow[qIndex] = {
                                    ...question,
                                    type: e.target.value as 'text' | 'email' | 'phone'
                                  };
                                  setOptions(newOptions);
                                }}
                                className="text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:border-brand focus:ring-brand"
                                style={{
                                  backgroundColor: '#121212',
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  appearance: 'none',
                                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 0.5rem center',
                                  paddingRight: '2rem'
                                }}
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="calendar">Calendar Integration</option>
                              </select>
                              
                              {question.type === 'calendar' && (
                                <div className="w-full space-y-3 mt-3 p-3 bg-dark-800 rounded-lg border border-gray-700">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Calendar Provider</label>
                                    <select
                                      value={question.calendar?.provider || 'google'}
                                      onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index].flow[qIndex] = {
                                          ...question,
                                          calendar: {
                                            ...question.calendar,
                                            provider: e.target.value as 'google' | 'outlook' | 'calendly'
                                          }
                                        };
                                        setOptions(newOptions);
                                      }}
                                      className="w-full text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
                                        text-gray-300 focus:border-brand focus:ring-brand"
                                    >
                                      <option value="google">Google Calendar</option>
                                      <option value="outlook">Outlook Calendar</option>
                                      <option value="calendly">Calendly</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Meeting Duration (minutes)</label>
                                    <input
                                      type="number"
                                      min="15"
                                      step="15"
                                      value={question.calendar?.duration || 30}
                                      onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index].flow[qIndex] = {
                                          ...question,
                                          calendar: {
                                            ...question.calendar,
                                            duration: parseInt(e.target.value)
                                          }
                                        };
                                        setOptions(newOptions);
                                      }}
                                      className="w-full text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
                                        text-gray-300 focus:border-brand focus:ring-brand"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Available Hours</label>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <input
                                        type="time"
                                        value={question.calendar?.availableHours?.start || "09:00"}
                                        onChange={(e) => {
                                          const newOptions = [...options];
                                          newOptions[index].flow[qIndex] = {
                                            ...question,
                                            calendar: {
                                              ...question.calendar,
                                              availableHours: {
                                                ...question.calendar?.availableHours,
                                                start: e.target.value
                                              }
                                            }
                                          };
                                          setOptions(newOptions);
                                        }}
                                        className="w-28 text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
                                          text-gray-300 focus:border-brand focus:ring-brand"
                                      />
                                      <span className="text-xs text-gray-400">to</span>
                                      <input
                                        type="time"
                                        value={question.calendar?.availableHours?.end || "17:00"}
                                        onChange={(e) => {
                                          const newOptions = [...options];
                                          newOptions[index].flow[qIndex] = {
                                            ...question,
                                            calendar: {
                                              ...question.calendar,
                                              availableHours: {
                                                ...question.calendar?.availableHours,
                                                end: e.target.value
                                              }
                                            }
                                          };
                                          setOptions(newOptions);
                                        }}
                                        className="w-28 text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
                                          text-gray-300 focus:border-brand focus:ring-brand"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-2">Available Days</label>
                                    <div className="grid grid-cols-4 gap-2">
                                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                        <label key={day} className="flex items-center space-x-1">
                                          <input
                                            type="checkbox"
                                            checked={question.calendar?.availableDays?.includes(day) ?? false}
                                            onChange={(e) => {
                                              const newOptions = [...options];
                                              const currentDays = question.calendar?.availableDays || [];
                                              const updatedDays = e.target.checked
                                                ? [...currentDays, day]
                                                : currentDays.filter(d => d !== day);
                                              
                                              newOptions[index].flow[qIndex] = {
                                                ...question,
                                                calendar: {
                                                  ...question.calendar,
                                                  availableDays: updatedDays
                                                }
                                              };
                                              setOptions(newOptions);
                                            }}
                                            className="rounded border-gray-600 bg-dark-600 text-brand focus:ring-brand"
                                          />
                                          <span className="text-xs text-gray-400 capitalize">{day.slice(0,3)}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <button
                              onClick={() => {
                                const newOptions = [...options];
                                newOptions[index].flow = option.flow.filter(
                                  (_, i) => i !== qIndex
                                );
                                setOptions(newOptions);
                              }}
                              className="p-1 hover:bg-dark-600 rounded text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[index].flow[qIndex] = {
                                    ...question,
                                    required: e.target.checked
                                  };
                                  setOptions(newOptions);
                                }}
                                className="rounded border-gray-600 bg-dark-600 text-brand focus:ring-brand"
                              />
                              <span className="text-xs text-gray-400">Required</span>
                            </label>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOptions = [...options];
                          newOptions[index].flow.push({
                            id: String(Date.now()),
                            type: 'text',
                            label: 'New Question',
                            required: false
                          });
                          setOptions(newOptions);
                        }}
                        className="w-full py-2 px-3 bg-dark-700 hover:bg-dark-600 border border-gray-700 
                          hover:border-gray-600 rounded-lg text-sm text-gray-400 hover:text-gray-300 
                          transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              </Draggable>
            ))
            )}

            {/* End Message Node - Only show if enabled */}
            {showEnd && (
            <Draggable
              position={getNodePosition('end')}
              nodeRef={nodeRefs.current.end}
              onDrag={(e, data) => handleNodeDrag('end', e, data)}
              bounds="parent"
              handle=".drag-handle"
            >
              <div 
                ref={nodeRefs.current.end}
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
                  <p className="text-xs text-gray-500">
                    This message will be shown after all questions are answered
                  </p>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={showEndScreen}
                      onChange={(e) => setShowEndScreen(e.target.checked)}
                      className="rounded border-gray-600 bg-dark-600 text-brand focus:ring-brand"
                    />
                    <span className="text-xs text-gray-400">Show end screen</span>
                  </div>
                </div>
              </div>
            </Draggable>
            )}
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
            setZoom(INITIAL_ZOOM);
            setPosition({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded 
            text-gray-200 hover:text-brand transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { FlowBuilder2 }