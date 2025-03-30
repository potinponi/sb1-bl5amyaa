import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Bot, Mail, Sparkles, X, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatForm } from './ChatForm';
import { EndScreen } from './EndScreen';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { useLocation } from './hooks/useLocation';
import { useProactiveMessages } from './hooks/useProactiveMessages';
import { useChat } from './hooks/useChat';
import type { Flow, Message, Lead, Theme, Question } from '../../types';

/**
 * Props for the ChatWidget component
 */
interface ChatWidgetProps {
  /** Unique identifier for the chatbot instance */
  chatbotId: string;
  /** Display name shown in the widget header */
  chatbotName: string;
  /** Optional flow configuration for preview mode */
  previewFlow?: {
    id?: string;
    showEndScreen?: boolean;
    welcomeMessage: string;
    endMessage: string;
    proactiveMessages?: {
      enabled: boolean;
      messages: string[];
      delay: number;
      interval: number;
      maxMessages: number;
    };
    options: {
      id: string;
      label: string;
      flow: Question[];
    }[];
  };
  /** Theme configuration for customizing appearance */
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    headerColor?: string;
    messageColor?: string;
    inputColor?: string;
    botMessageColor?: string;
    userMessageColor?: string;
    gradient?: {
      from: string;
      to: string;
    };
    fontFamily?: string;
    borderRadius?: string;
    showMessageIcons?: boolean;
  };
}

/**
 * Main chat widget component
 * Handles the complete chat interaction flow including:
 * - Displaying messages
 * - Collecting user responses
 * - Validating inputs
 * - Submitting leads to the database
 */
export function ChatWidget({ chatbotId, chatbotName, previewFlow, theme, defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const isPreview = chatbotId === '00000000-0000-0000-0000-000000000000';
  
  const defaultTheme = {
    primaryColor: '#a7e154',
    backgroundColor: '#1a1a1a',
    headerColor: '#232323',
    messageColor: '#232323',
    inputColor: '#1a1a1a',
    fontFamily: 'system-ui',
    borderRadius: '0.5rem',
    showMessageIcons: true
  };

  // Validate theme to ensure it has default values
  const validatedTheme = {
    ...defaultTheme,
    ...theme
  };
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // For widget, always allow access since it's public-facing
        setSubscriptionActive(true);
        return;
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionActive(false);
      }
    };

    checkSubscription();
  }, []);

  const trackInteraction = async (type: 'open' | 'close' | 'start_flow') => {
    try {
      // Don't track interactions for preview chatbot
      if (isPreview) return;
      
      const sessionId = Math.random().toString(36).substring(2);
      await addDoc(collection(db, 'chat_interactions'), {
        chatbot_id: chatbotId,
        type,
        session_id: sessionId,
        converted: completed,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  if (!subscriptionActive) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-red-500/10 border border-red-500/50 
        rounded-lg text-red-400 text-sm">
        This chatbot is currently inactive. The trial period has expired.
      </div>
    );
  }
  const {
    messages,
    setMessages,
    selectedOption,
    setSelectedOption,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    flow,
    setFlow,
    loading,
    setLoading,
    submitting,
    completed,
    setCompleted,
    showEndScreen,
    setShowEndScreen,
    isTyping,
    answers,
    setAnswers,
    validateFlow,
    simulateTyping,
    submitLead
  } = useChat(chatbotId);

  const { fetchLocation } = useLocation();

  const {
    showProactiveBubble,
    setShowProactiveBubble,
    currentProactiveMessage
  } = useProactiveMessages(flow, isOpen);

  /**
   * Initialize the chat widget
   * Loads flow configuration from preview or database
   */
  useEffect(() => {
    if (previewFlow) {
      const flowData = {
        id: previewFlow.id || 'preview',
        chatbot_id: chatbotId,
        data: {
          welcomeMessage: previewFlow.welcomeMessage,
          endMessage: previewFlow.endMessage,
          showEndScreen: previewFlow.showEndScreen,
          options: previewFlow.options,
          proactiveMessages: previewFlow.proactiveMessages
        },
        created_at: new Date().toISOString()
      };

      setFlow({
        ...flowData
      });
      
      if (!validateFlow(flowData)) {
        console.error('Invalid preview flow data:', previewFlow);
        setMessages([
          {
            id: 'error',
            content: 'Chat configuration is incomplete. Please check your settings.',
            sender: 'bot'
          }
        ]);
        return;
      }

      setMessages([
        {
          id: 'welcome',
          content: previewFlow.welcomeMessage,
          sender: 'bot'
        }
      ]);
      setLoading(false);
    } else {
      fetchFlow();
    }
  }, [chatbotId, previewFlow]);

  /**
   * Auto-scroll to the latest message
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Fetches the conversation flow configuration from the database
   */
  const fetchFlow = async () => {
    try {
      const q = query(
        collection(db, 'flows'),
        where('chatbot_id', '==', chatbotId),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      const latestFlow = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      
      
      if (!validateFlow(latestFlow)) {
        throw new Error('Invalid flow configuration');
      }

      setFlow(latestFlow);
      // Show welcome message and initial options prompt
      setMessages([
        {
          id: 'welcome',
          content: latestFlow?.data.welcomeMessage || 'Hello! 👋 How can I help you today?',
          sender: 'bot'
        }
      ]);
    } catch (error) {
      console.error('Error fetching flow:', error);
      setMessages([
        {
          id: 'error',
          content: 'Sorry, something went wrong. Please try again later.',
          sender: 'bot'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnswer = async (answer: string) => {
    if (!flow) return;

    // For initial option selection
    if (currentQuestionIndex === -1) {
      const selectedOptionData = flow.data.options?.find(opt => opt.label === answer);
      if (selectedOptionData) {
        setSelectedOption(selectedOptionData.id);
        setCurrentQuestionIndex(0);
        trackInteraction('start_flow');
        
        // Initialize answers with the selected option
        setAnswers({ 'Flow Option': selectedOptionData.label });
        
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), content: answer, sender: 'user' }
        ]);
        
        await simulateTyping();
        
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '1',
          content: selectedOptionData.flow[0].label,
          sender: 'bot'
        }]);
        return;
      }
    }

    const option = flow.data.options?.find(opt => opt.id === selectedOption);
    if (!option) return;

    // Get current question and store answer
    const currentQuestion = option.flow[currentQuestionIndex];
    const updatedAnswers = { ...answers, [currentQuestion.label]: answer };
    setAnswers(updatedAnswers);

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), content: answer, sender: 'user' }
    ]);

    if (currentQuestionIndex < option.flow.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      await simulateTyping();
      
      const nextQuestion = option.flow[currentQuestionIndex + 1];
      // Add next question to messages
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), content: nextQuestion.label, sender: 'bot' }
      ]);
    } else {
      // Submit with the complete set of answers
      await submitLead(updatedAnswers, fetchLocation);
      
      // Show end screen if enabled
      if (flow.data.showEndScreen) {
        setShowEndScreen(true);
      }
    }
  };

  const handleSkip = () => {
    if (!flow) return;
    
    const option = flow.data.options?.find(opt => opt.id === selectedOption);
    if (!option) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), content: 'Skipped', sender: 'user' }
    ]);

    if (currentQuestionIndex < option.flow.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = option.flow[currentQuestionIndex + 1];
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), content: nextQuestion.label, sender: 'bot' }
      ]);
    }
  };

  const handleEndScreenClose = () => {
    // First, hide the end screen
    setShowEndScreen(false);
    setCompleted(false);
    
    // Then reset all states in the correct order
    setTimeout(() => {
      setIsOpen(false);
      setCurrentQuestionIndex(-1);
      setSelectedOption(null);
      setAnswers({});
      setMessages([{
        id: 'welcome',
        content: flow?.data.welcomeMessage || 'Hello! 👋 How can I help you today?',
        sender: 'bot'
      }]);
    }, 0);
  };

  const handleFeedback = async (satisfied: boolean) => {
    try {
      // Don't save feedback for preview chatbot
      if (isPreview) return;
      
      // Save feedback to database
      await addDoc(collection(db, 'feedback'), {
        chatbot_id: chatbotId,
        satisfied,
        created_at: new Date().toISOString()
      });
      
      // Don't close automatically, let the user close when ready
      // The EndScreen component will show a thank you message and close button
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  if (loading) return null;

  const widgetStyles = {
    '--primary-color': validatedTheme.primaryColor || '#a7e154',
    '--bg-color': validatedTheme.backgroundColor || '#1a1a1a',
    '--header-color': validatedTheme.headerColor || '#232323',
    '--message-color': validatedTheme.messageColor || '#232323',
    '--input-color': validatedTheme.inputColor || validatedTheme.backgroundColor || '#1a1a1a',
    '--border-radius': validatedTheme.borderRadius || '0.5rem',
    fontFamily: validatedTheme.fontFamily || 'system-ui, -apple-system, sans-serif'
  } as React.CSSProperties;

  const getButtonIcon = () => {
    if (isOpen) return <X className="w-7 h-7" />;
    
    switch (theme?.buttonIcon) {
      case 'bot':
        return <Bot className="w-7 h-7" />;
      case 'mail':
        return <Mail className="w-7 h-7" />;
      case 'sparkles':
        return <Sparkles className="w-7 h-7" />;
      default:
        return <MessageSquare className="w-7 h-7" />;
    }
  };

  return (
    <div style={widgetStyles}>
      <div className="fixed bottom-4 right-4 z-50">
        {/* Proactive Message Bubble */}
        {showProactiveBubble && !isOpen && (
          <div
            onClick={() => {
              setIsOpen(true);
              setShowProactiveBubble(false);
              setMessages(prev => [
                ...prev,
                { id: `proactive-${Date.now()}`, content: currentProactiveMessage, sender: 'bot' }
              ]);
            }}
            className="absolute bottom-[calc(100%+1rem)] right-[-8px] p-4 bg-white
              rounded-lg shadow-lg border border-gray-100 cursor-pointer whitespace-nowrap
              transform transition-all duration-300 hover:scale-105 animate-bounce-gentle
              flex items-center min-w-[280px] translate-x-[-90%]"
          >
            <p className="text-sm text-gray-800">{currentProactiveMessage}</p>
            <div className="absolute bottom-[-8px] right-[12px] w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45" />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => {
            if (isOpen) {
              setIsSpinning(true);
              trackInteraction('close');
              setIsClosing(true);
              setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
                setIsSpinning(false);
              }, 800);
            } else {
              setIsOpen(true);
              trackInteraction('open');
            }
            if (!isOpen && showProactiveBubble) {
              setShowProactiveBubble(false);
              setMessages(prev => [
                ...prev,
                { id: `proactive-${Date.now()}`, content: currentProactiveMessage, sender: 'bot' }
              ]);
            }
          }}
          className={`p-4 rounded-full bg-brand text-black shadow-lg hover:bg-brand/90
            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/50
            hover:scale-110 active:scale-95 transform
            hover:shadow-xl ${isSpinning ? 'animate-spin' : ''}`}
          style={{
            background: theme?.gradient 
              ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
              : theme?.primaryColor,
            borderRadius: theme?.borderRadius === '9999px' ? '9999px' : 'var(--border-radius)',
            '--ring-offset-color': 'var(--bg-color)'
          }}
        >
          {getButtonIcon()}
        </button>
      </div>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-4 w-[90vw] max-w-[360px] h-[500px] max-h-[80vh] rounded-lg shadow-xl 
          border border-gray-800 flex flex-col transition-all duration-300
          ${isOpen && !isClosing ? 'opacity-100 animate-slide-in-up' : isClosing ? 'animate-slide-out-down opacity-100' : 'opacity-0 pointer-events-none scale-0'}`}
        style={{ 
          backgroundColor: theme?.backgroundColor,
          borderRadius: '1rem',
          zIndex: 45,
          transformOrigin: 'bottom right'
        }}
      >
        {/* Header */}
        <div
          className="p-4 rounded-t-lg"
          style={{ 
            background: theme?.gradient 
              ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
              : 'var(--header-color)'
        }}>
          <div className="flex items-center justify-between" style={{ color: theme?.headerTextColor }}>
            <h2 className="text-lg font-medium">{chatbotName}</h2>
            <button
              onClick={() => {
                setIsSpinning(true);
                setIsClosing(true);
                setTimeout(() => {
                  setIsOpen(false);
                  setIsClosing(false);
                  setIsSpinning(false);
                }, 800);
              }}
              className="p-1.5 hover:bg-black/10 active:bg-black/20 rounded-lg transition-all duration-150
              hover:scale-110 active:scale-95 transform"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message}
                theme={validatedTheme}
                isTyping={isTyping && message.sender === 'bot' && messages[messages.length - 1].id === message.id}
              />
            ))}
            {isTyping && (
              <ChatMessage
                message={{ id: 'typing', content: '', sender: 'bot' }}
                isTyping={true}
                theme={validatedTheme}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* End Screen Overlay */}
          {showEndScreen && (
            <EndScreen
              endMessage={flow?.data.endMessage || 'Thank you for your responses! We\'ll be in touch soon.'}
              theme={validatedTheme}
              onClose={handleEndScreenClose}
              onFeedback={handleFeedback}
            />
          )}

          {/* Input Form */}
          <div className="p-4 rounded-b-lg" style={{ backgroundColor: theme?.backgroundColor || 'var(--bg-color)' }}>
            {submitting ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : !completed && flow ? (
              currentQuestionIndex === -1 ? (
                // Show options buttons
                <div className="space-y-2">
                  {flow.data.options?.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.label)}
                      className="w-full px-4 py-2.5 text-black rounded-md hover:opacity-90 transition-colors"
                      style={{
                        background: theme?.gradient 
                          ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
                          : theme?.primaryColor
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                // Show question form
                flow.data.options?.find(opt => opt.id === selectedOption)?.flow[currentQuestionIndex] && (
                  <ChatForm
                    question={flow.data.options.find(opt => opt.id === selectedOption)!.flow[currentQuestionIndex]}
                    onSubmit={handleAnswer}
                    theme={theme}
                    onSkip={!flow.data.options.find(opt => opt.id === selectedOption)!.flow[currentQuestionIndex].required ? handleSkip : undefined}
                  />
                )
              )
            ) : null}
          </div>
        </div>
    </div>
  );
}