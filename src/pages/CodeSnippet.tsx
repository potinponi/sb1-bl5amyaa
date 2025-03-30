import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

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
  const location = useLocation();
  const { flow } = location.state as LocationState || {};
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatbotId = 'a54a2bd1-cf6a-4af7-8435-c256c10794e7';
  const widgetUrl = `https://ziuyjhndicmqxhetyxux.supabase.co/storage/v1/object/public/widget-files/${chatbotId}/widget`;

  const snippet = `<!-- Add the chatbot widget -->
<script>
  window.chatdashSettings = {
    url: "https://ziuyjhndicmqxhetyxux.supabase.co",
    chatbot_id: "${chatbotId}"
  };
</script>

<script src="${widgetUrl}" async></script>`;


  useEffect(() => {
    if (!chatbotId || !location.state?.flow) {
      navigate('/builder');
    }
  }, [chatbotId, location.state, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.trim());
    setCopied('main');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Installation</h1>
      <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-100">Add to your website</h2>
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 bg-brand text-black rounded-md 
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
        
        <div className="p-4 bg-dark-900">
          <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {snippet}
          </pre>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-medium text-gray-100">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Copy the entire widget code snippet</li>
          <li>Add the stylesheet link to your HTML <code>&lt;head&gt;</code> section</li>
          <li>Add the initialization script just before the closing <code>&lt;/body&gt;</code> tag</li>
          <li>The script will automatically load required dependencies if they're not already present</li>
          <li>The chat widget will automatically appear in the bottom right corner</li>
          <li>Customize the theme settings to match your website's design</li>
        </ol>
        
        
        <div className="p-4 bg-dark-700 rounded-lg border border-gray-800 mt-4">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Important Notes</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Lightweight and optimized</li>
            <li>• Automatically handles dependencies</li>
            <li>• Smart proactive messages support built-in</li>
            <li>• Works with existing React installations</li>
            <li>• Automatically syncs with your chatbot configuration</li>
            <li>• Real-time lead capture</li>
            <li>• Feedback collection</li>
            <li>• Loads asynchronously</li>
            <li>• Works offline-first with data sync</li>
            <li>• Compatible with all modern browsers</li>
            <li>• No jQuery required</li>
            <li>• Served from Netlify's global CDN</li>
            <li>• Automatic error handling and retries</li>
            <li>• Customizable appearance and behavior</li>
            <li>• Mobile-responsive design</li>
          </ul>
        </div>
        
        <div className="p-4 bg-dark-700 rounded-lg border border-gray-800 mt-4">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Troubleshooting</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Make sure both the CSS and JS files are loading correctly (check browser console)</li>
            <li>• Verify the script is placed before the closing body tag</li>
            <li>• Ensure your theme configuration uses valid color values</li>
            <li>• Check that the chatbot ID matches your configuration</li>
            <li>• For CORS issues, ensure your domain is allowed to access the widget</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export { CodeSnippet };