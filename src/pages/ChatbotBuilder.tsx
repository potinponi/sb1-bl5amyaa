import React, { useState, useEffect } from 'react';
import { Code, Save, Loader2, Settings, MessageSquarePlus, BellRing } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSubscription } from '../lib/subscription';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { generateWidgetBundle } from '../lib/widget';
import type { Flow, Theme, Option } from '../types';
import { BasicSettings } from './ChatbotBuilder/BasicSettings';
import { FlowBuilder2 } from './ChatbotBuilder/FlowBuilder2';
import { ProactiveMessages } from './ChatbotBuilder/ProactiveMessages';

export default function ChatbotBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'flow' | 'proactive'>('basic');
  const [chatbotName, setChatbotName] = useState<string>('Default Chatbot');
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [proactiveMessages, setProactiveMessages] = useState<{
    enabled: boolean;
    messages: string[];
    delay: number;
    interval: number;
    maxMessages: number;
  }>({
    enabled: false,
    messages: ['👋 Need help? I\'m here to assist!', 'Have any questions? Feel free to ask!'],
    delay: 30,
    interval: 60,
    maxMessages: 3
  });
  const [welcomeMessage, setWelcomeMessage] = useState<string>('Hello! 👋 How can I help you today?');
  const [endMessage, setEndMessage] = useState<string>('Thank you for your responses! We\'ll be in touch soon.');
  const [options, setOptions] = useState<Option[]>([
    {
      id: '1',
      label: 'I want an offer',
      flow: [
        { id: '1', type: 'text', label: 'What is your name?', required: true },
        { id: '2', type: 'email', label: 'What is your email?', required: true },
        { id: '3', type: 'phone', label: 'What is your phone number?', required: true }
      ]
    },
    {
      id: '2',
      label: 'I want a call back',
      flow: [
        { id: '1', type: 'text', label: 'What is your name?', required: true },
        { id: '2', type: 'email', label: 'What is your email?', required: true },
        { id: '3', type: 'phone', label: 'What is your phone number?', required: true },
        { id: '4', type: 'text', label: 'What is the best time to call you?', required: true }
      ]
    }
  ]);
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#a7e154',
    backgroundColor: '#1a1a1a',
    headerColor: '#232323',
    botMessageColor: '#232323',
    userMessageColor: '#a7e154',
    messageColor: '#232323',
    botTextColor: '#ffffff',
    userTextColor: '#000000',
    headerTextColor: '#ffffff',
    inputColor: '#1a1a1a',
    fontFamily: 'system-ui',
    borderRadius: '0.5rem',
    showMessageIcons: true
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        if (!user?.uid) return;
        
        // First get the chatbot configuration
        const chatbotRef = doc(db, 'chatbots', user.uid);
        const chatbotSnap = await getDoc(chatbotRef);

        if (chatbotSnap.exists()) {
          const chatbotData = chatbotSnap.data();
          setChatbotName(chatbotData.name || 'Default Chatbot');
          if (chatbotData.settings?.theme) {
            setTheme(chatbotData.settings.theme);
          }
          if (chatbotData.settings?.welcomeMessage) {
            setWelcomeMessage(chatbotData.settings.welcomeMessage);
          }
          if (chatbotData.settings?.proactiveMessages) {
            setProactiveMessages(chatbotData.settings.proactiveMessages);
          }
        }

        // Then get the latest flow configuration
        const flowQuery = query(
          collection(db, 'flows'),
          where('user_id', '==', user.uid),
          limit(1)
        );
        
        const flowSnapshot = await getDocs(flowQuery);
        const flowData = flowSnapshot.docs[0]?.data();

        if (flowData) {
          setEndMessage(flowData.data.endMessage);
          setShowEndScreen(flowData.data.showEndScreen);
          setOptions(flowData.data.options);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadConfig();
    }
  }, [user?.uid]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Save chatbot configuration
      const chatbotRef = doc(db, 'chatbots', user.uid);
      await setDoc(chatbotRef, {
        id: user.uid,
        user_id: user.uid,
        name: chatbotName,
        settings: {
          theme,
          welcomeMessage,
          proactiveMessages
        }
      });

      // Save flow configuration
      const flowRef = doc(collection(db, 'flows'));
      await setDoc(flowRef, {
        id: flowRef.id, 
        user_id: user.uid,
        data: {
          welcomeMessage,
          endMessage,
          showEndScreen,
          proactiveMessages,
          options
        },
        created_at: new Date().toISOString()
      });

      // Save widget configuration
      const widgetConfigRef = doc(db, 'widget_configs', user.uid);
      await setDoc(widgetConfigRef, {
        chatbot_id: user.uid,
        theme,
        flow: {
          welcomeMessage,
          endMessage,
          showEndScreen,
          proactiveMessages,
          options
        }
      });

      setError(null);
      console.log('Chatbot configuration saved successfully');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Full error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
      {/* Fixed Top Nav */}
      <div className="fixed top-0 left-20 right-0 h-10 bg-dark-800 border-b border-gray-400/10 z-[45]">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex items-center space-x-2 px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-[1px]
                  ${activeTab === 'basic'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Chat Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={`flex items-center space-x-2 px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-[1px]
                  ${activeTab === 'flow'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Flow Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('proactive')}
                className={`flex items-center space-x-2 px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-[1px]
                  ${activeTab === 'proactive'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
              >
                <BellRing className="w-4 h-4" />
                <span>Proactive</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1.5 h-7 px-2.5 bg-brand text-black rounded-md text-sm
                hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/code', { 
                state: { 
                  flow: { welcomeMessage, endMessage, options },
                  theme
                } 
              })}
              className="flex items-center space-x-1.5 h-7 px-2.5 bg-dark-700 text-gray-300 rounded-md text-sm
                hover:bg-dark-600 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Install</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-[1600px] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-red-400/80 mt-1">
              Please make sure you're logged in and have the necessary permissions.
            </p>
          </div>
        )}

        {activeTab === 'basic' ? (
          <BasicSettings
            chatbotName={chatbotName}
            setChatbotName={setChatbotName}
            theme={theme}
            setTheme={setTheme}
            welcomeMessage={welcomeMessage}
            setWelcomeMessage={setWelcomeMessage}
            endMessage={endMessage}
            setEndMessage={setEndMessage}
            proactiveMessages={proactiveMessages}
            setProactiveMessages={setProactiveMessages}
            options={options}
            handleSave={handleSave}
            saving={saving}
          />
        ) : activeTab === 'flow' ? (
          <FlowBuilder2
            welcomeMessage={welcomeMessage}
            setWelcomeMessage={setWelcomeMessage}
            endMessage={endMessage}
            setEndMessage={setEndMessage}
            showEndScreen={showEndScreen}
            setShowEndScreen={setShowEndScreen}
            options={options}
            setOptions={setOptions}
            theme={theme}
            chatbotName={chatbotName}
          />
        ) : (
          <ProactiveMessages
            chatbotName={chatbotName}
            welcomeMessage={welcomeMessage}
            endMessage={endMessage}
            options={options}
            theme={theme}
            proactiveMessages={proactiveMessages}
            setProactiveMessages={setProactiveMessages}
          />
        )}
      </div>
    </>
  );
}