import React from 'react';
import { ChatWidget } from '../ChatWidget/ChatWidget';
import { useEffect } from 'react';
import type { Theme, Option } from '../../types';

interface PreviewProps {
  chatbotId: string;
  chatbotName: string;
  previewFlow: {
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
    options: Option[];
  };
  theme: Theme;
}

export function Preview({
  chatbotId,
  chatbotName,
  previewFlow,
  theme,
  defaultOpen = true
}: PreviewProps) {
  // Load fonts when theme changes
  useEffect(() => {
    const loadFont = (fontFamily: string) => {
      const fonts: Record<string, string> = {
        'Anta': 'https://fonts.googleapis.com/css2?family=Anta&display=swap',
        'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
        'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap',
        'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap'
      };

      // Extract font name from fontFamily string
      const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      
      if (fonts[fontName]) {
        // Check if font is already loaded
        const existingLink = document.querySelector(`link[href="${fonts[fontName]}"]`);
        if (!existingLink) {
          const fontLink = document.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.href = fonts[fontName];
          document.head.appendChild(fontLink);
        }
      }
    };

    if (theme?.fontFamily) {
      loadFont(theme.fontFamily);
    }
  }, [theme?.fontFamily]);

  return (
    <div className="lg:sticky lg:top-8">
      <ChatWidget 
        chatbotId={chatbotId}
        chatbotName={chatbotName}
        previewFlow={{
          ...previewFlow,
          showEndScreen: previewFlow.showEndScreen
        }}
        theme={theme}
        defaultOpen={defaultOpen}
      />
    </div>
  );
}