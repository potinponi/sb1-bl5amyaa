import React from 'react';
import { BotNameEditor } from '../../components/ChatbotBuilder/BotNameEditor';
import { ThemeCustomizer } from '../../components/ChatbotBuilder/ThemeCustomizer';
import { Preview } from '../../components/ChatbotBuilder/Preview';
import type { Theme } from '../../types';

interface BasicSettingsProps {
  chatbotName: string;
  setChatbotName: (name: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  endMessage: string;
  setEndMessage: (message: string) => void;
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
  options: {
    id: string;
    label: string;
    flow: Question[];
  }[];
  handleSave: () => void;
  saving: boolean;
}

export function BasicSettings({
  chatbotName,
  setChatbotName,
  theme,
  setTheme,
  welcomeMessage,
  setWelcomeMessage,
  endMessage,
  setEndMessage,
  proactiveMessages,
  setProactiveMessages,
  options,
  handleSave,
  saving
}: BasicSettingsProps) {
  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden pt-4">
      <div className="h-full flex gap-8">
        <div className="w-[320px] flex-shrink-0">
          <ThemeCustomizer 
            theme={theme} 
            setTheme={setTheme}
            chatbotName={chatbotName}
            setChatbotName={setChatbotName}
            welcomeMessage={welcomeMessage}
            endMessage={endMessage}
            options={options}
            handleSave={handleSave}
            saving={saving}
          />
        </div>
        
        <div className="flex-1 flex justify-center items-start overflow-y-auto">
          <Preview
            chatbotId="00000000-0000-0000-0000-000000000000"
            chatbotName={chatbotName}
            previewFlow={{
              welcomeMessage,
              endMessage,
              proactiveMessages,
              options
            }}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}