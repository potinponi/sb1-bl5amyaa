/**
 * Represents a chatbot configuration
 */
export interface Chatbot {
  id?: string;
  name: string;
  settings: {
    theme: {
      /** Primary color used for buttons and accents */
      primaryColor: string;
      /** Background color of the chat window */
      backgroundColor: string;
      /** Header section background color */
      headerColor: string;
      /** Message section background color */
      messageColor: string;
      /** Input field background color */
      inputColor: string;
      /** Optional gradient configuration */
      gradient?: {
        from: string;
        to: string;
      };
    };
    /** Initial greeting message */
    welcomeMessage: string;
    /** Proactive message settings */
    proactiveMessages?: {
      enabled: boolean;
      messages: string[];
      delay: number;
      interval: number;
      maxMessages: number;
    };
  };
  created_at: string;
  user_id: string;
}

/**
 * Represents a lead captured through the chatbot
 */
export interface Lead {
  id?: string;
  chatbot_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
    ip?: string;
  };
  /** Key-value pairs of question labels and user answers */
  answers: Record<string, string>;
  created_at: string;
}

/**
 * Represents a chat interaction event
 */
export interface ChatInteraction {
  id?: string;
  chatbot_id: string;
  type: 'open' | 'close' | 'start_flow';
  session_id: string;
  converted: boolean;
  created_at: string;
}

/**
 * Represents a node position in the flow builder
 */
export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Represents user feedback collected through the end screen
 */
export interface Feedback {
  id?: string;
  chatbot_id: string;
  satisfied: boolean;
  created_at: string;
}

/**
 * Theme configuration for the chat widget
 */
export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  headerColor: string;
  messageColor: string;
  inputColor: string;
  gradient?: {
    from: string;
    to: string;
  };
  buttonIcon?: 'message-square' | 'bot' | 'mail' | 'sparkles';
  fontFamily: string;
  borderRadius: string;
  botMessageColor: string;
  userMessageColor: string;
  botTextColor: string;
  userTextColor: string;
  headerTextColor: string;
  botTextColor: string;
  userTextColor: string;
  headerTextColor: string;
  showMessageIcons: boolean;
  botIcon?: string; // URL for custom bot icon
  userIcon?: string; // URL for custom user icon
}

/**
 * Represents a question in the chatbot flow
 */
export interface Question {
  id: string;
  /** Type of input field to display */
  type: 'text' | 'email' | 'phone' | 'option' | 'name' | 'calendar';
  /** Purpose of the question for categorization */
  purpose?: 'name' | 'contact' | 'additional';
  /** Question text shown to the user */
  label: string;
  /** Whether the question must be answered */
  required: boolean;
  /** Available options for 'option' type questions */
  options?: string[];
  /** Calendar integration settings */
  calendar?: {
    provider: 'google' | 'outlook' | 'calendly';
    duration: number; // Meeting duration in minutes
    availableDays: string[]; // Array of days like ['monday', 'tuesday']
    availableHours: {
      start: string; // Format: "HH:mm"
      end: string; // Format: "HH:mm"
    };
  };
}

/**
 * Represents a conversation flow option
 */
export interface Option {
  id: string;
  /** Text shown in the option button */
  label: string;
  /** Sequence of questions to ask when this option is selected */
  flow: Question[];
}

/**
 * Represents a single message in the chat
 */
export interface Message {
  id: string;
  content: string;
  /** Who sent the message - bot or user */
  sender: 'bot' | 'user';
}

/**
 * Represents a complete conversation flow configuration
 */
export interface Flow {
  id?: string;
  chatbot_id: string;
  data: {
    /** Initial greeting message */
    welcomeMessage: string;
    /** Message shown after completing the flow */
    endMessage: string;
    /** Show end screen with feedback */
    showEndScreen?: boolean;
    /** Proactive message configuration */
    proactiveMessages?: {
      enabled: boolean;
      messages: string[];
      delay: number;
      interval: number;
      maxMessages: number;
    };
    /** Available conversation paths */
    options: Option[];
  };
  created_at: string;
  user_id: string;
}