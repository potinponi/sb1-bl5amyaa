import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

type InstallMethod = 'javascript' | 'npm' | 'react';

interface LocationState {
  flow?: {
    welcomeMessage: string;
    endMessage: string;
    options: any[];
  };
  theme?: any;
}

export default function CodeSnippet() {
  const [copied, setCopied] = useState<'main' | 'smart' | 'theme' | null>(null);
  const [activeMethod, setActiveMethod] = useState<InstallMethod>('javascript');
  const location = useLocation();
  const { flow } = location.state as LocationState || {};
  const instructions = {
    javascript: 'Add this script to your HTML file just before the closing </body> tag.',
    npm: 'Install the package and initialize it in your Node.js application.',
    react: 'Install the package and add the component to your React application.'
  };
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatbotId = 'a54a2bd1-cf6a-4af7-8435-c256c10794e7';
  const widgetUrl = `https://ziuyjhndicmqxhetyxux.supabase.co/storage/v1/object/public/widget-files/${chatbotId}/widget`;

  const snippets = {
    javascript: `<!-- Add the chatbot widget -->
<script>
  window.chatdashSettings = {
    url: "https://ziuyjhndicmqxhetyxux.supabase.co",
    chatbot_id: "${chatbotId}"
  };
</script>

<script src="${widgetUrl}" async></script>`,
    npm: `// Install the package
npm install @chattibot/widget

// Initialize in your app
import { ChatWidget } from '@chattibot/widget';

ChatWidget.init({
  url: "https://ziuyjhndicmqxhetyxux.supabase.co",
  chatbotId: "${chatbotId}"
});`,
    react: `// Install the package
npm install @chattibot/react

// Add to your React app
import { ChatWidget } from '@chattibot/react';

function App() {
  return (
    <ChatWidget
      url="https://ziuyjhndicmqxhetyxux.supabase.co"
      chatbotId="${chatbotId}"
    />
  );
}`
  };


  useEffect(() => {
    if (!chatbotId || !location.state?.flow) {
      navigate('/builder');
    }
  }, [chatbotId, location.state, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeMethod].trim());
    setCopied('main');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Installation</h1>
      <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        <div className="border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveMethod('javascript')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeMethod === 'javascript'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => setActiveMethod('npm')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeMethod === 'npm'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
            >
              NPM Package
            </button>
            <button
              onClick={() => setActiveMethod('react')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeMethod === 'react'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
            >
              React
            </button>
          </div>
        </div>
        <div className="p-4 border-b border-gray-800 bg-dark-900/50">
          <p className="text-sm text-gray-400 mb-2">{instructions[activeMethod]}</p>
        </div>
        
        <div className="p-4 bg-dark-900">
          <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto mb-4 p-4 bg-dark-800 rounded-lg border border-gray-700">
            {snippets[activeMethod]}
          </pre>
          
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 bg-brand text-black rounded-md w-full justify-center
              hover:bg-brand/90 transition-colors"
          >
            {copied === 'main' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CodeSnippet };