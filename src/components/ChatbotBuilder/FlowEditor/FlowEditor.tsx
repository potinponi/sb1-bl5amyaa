import React from 'react';
import { ProactiveMessagesSection } from './ProactiveMessagesSection';
import { WelcomeSection } from './WelcomeSection';
import { EndMessageSection } from './EndMessageSection';
import { OptionsSection } from './OptionsSection';
import type { Option, Question } from '../../../types';

interface ProactiveMessages {
  enabled: boolean;
  messages: string[];
  delay: number;
  interval: number;
  maxMessages: number;
}

interface FlowEditorProps {
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  endMessage: string;
  setEndMessage: (message: string) => void;
  showEndScreen: boolean;
  setShowEndScreen: (show: boolean) => void;
  proactiveMessages: ProactiveMessages;
  setProactiveMessages: (messages: ProactiveMessages) => void;
  options: Option[];
  setOptions: (options: Option[]) => void;
}

export function FlowEditor({
  welcomeMessage,
  setWelcomeMessage,
  endMessage,
  setEndMessage,
  showEndScreen,
  setShowEndScreen,
  options,
  setOptions
}: FlowEditorProps) {
  return (
    <div className="bg-dark-800/50 rounded-lg shadow-lg border border-gray-400/10 space-y-6">
      <WelcomeSection
        welcomeMessage={welcomeMessage}
        setWelcomeMessage={setWelcomeMessage}
      />

      <EndMessageSection
        endMessage={endMessage}
        setEndMessage={setEndMessage}
        showEndScreen={showEndScreen}
        setShowEndScreen={setShowEndScreen}
      />

      <OptionsSection
        options={options}
        setOptions={setOptions}
      />
    </div>
  );
}