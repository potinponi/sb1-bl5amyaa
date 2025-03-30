import React from 'react';
import { Message, Theme } from '../../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
  theme?: Theme;
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 rounded-full animate-bounce" />
  </div>
);

export function ChatMessage({ message, isTyping, theme }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  const textColor = isBot ? theme?.botTextColor || '#ffffff' : theme?.userTextColor || '#000000';

  return (
    <div
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}
    >
      {isBot && theme?.showMessageIcons && (
        <div className="flex-shrink-0 w-8 h-8 mr-2 rounded-full" style={{
          backgroundColor: theme?.botMessageColor || '#232323'
        }}>
          {theme.botIcon ? (
            <img
              src={theme.botIcon}
              alt="Bot"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" style={{ color: theme?.botTextColor || '#ffffff' }} />
            </div>
          )}
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 flex items-center
          ${isBot && !isTyping ? 'animate-slide-in' : ''}
          ${!isBot ? 'animate-slide-in-right' : ''}`}
        style={{
          backgroundColor: isBot ? theme?.botMessageColor : theme?.userMessageColor,
          color: textColor,
          '--tw-text-opacity': '1',
          '--dot-color': textColor
        }}
      >
        {isTyping ? (
          <div style={{ color: textColor }}>
            <style>{`
              .animate-bounce { background-color: ${textColor}; }
            `}</style>
            <TypingIndicator />
          </div>
        ) : message.content}
      </div>
      {!isBot && theme?.showMessageIcons && (
        <div className="flex-shrink-0 w-8 h-8 ml-2 rounded-full" style={{
          backgroundColor: theme?.userMessageColor || '#a7e154'
        }}>
          {theme.userIcon ? (
            <img
              src={theme.userIcon}
              alt="User"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <User className="w-5 h-5" style={{ color: theme?.userTextColor || '#000000' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}