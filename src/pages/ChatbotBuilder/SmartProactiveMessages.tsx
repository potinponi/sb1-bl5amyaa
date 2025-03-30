import React, { useState } from 'react';
import { Bot, Globe, FileCode, AlertTriangle, ChevronDown, MessageSquare, Clock } from 'lucide-react';

interface SmartProactiveMessagesProps {
  enabled?: boolean;
  onEnable: (enabled: boolean) => void;
  templates?: {
    pageType: string;
    pattern: string;
    message: string;
  }[];
  onTemplatesChange?: (templates: { pageType: string; pattern: string; message: string; }[]) => void;
}

const defaultTemplates = [
  {
    pageType: 'product',
    pattern: '/inventory/*/|/vehicles/*/',
    message: 'Interested in {{product_name}}? Chat with us!'
  },
  {
    pageType: 'category',
    pattern: '/inventory/|/vehicles/',
    message: 'Looking for {{category_name}}? We can help!'
  },
  {
    pageType: 'search',
    pattern: '/search/',
    message: 'Need help finding the right car? Ask us!'
  }
];

export function SmartProactiveMessages({ 
  enabled = false,
  onEnable,
  templates = defaultTemplates,
  onTemplatesChange
}: SmartProactiveMessagesProps) {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const installCode = `
<!-- Add this script to your website -->
<script>
  window.addEventListener('load', function() {
    // Extract product information
    const productName = document.querySelector('h1')?.textContent
      || document.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || document.querySelector('meta[name="title"]')?.getAttribute('content');
    
    const categoryName = document.querySelector('meta[property="og:type"]')?.getAttribute('content')
      || document.querySelector('.category-name')?.textContent;

    // Send to chat widget
    window.ChatbotWidget?.setPageContext({
      url: window.location.pathname,
      productName,
      categoryName
    });
  });
</script>`;

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="group bg-dark-800/50 hover:bg-dark-800/70 rounded-lg border border-gray-800 transition-colors"
    >
      <div className="p-4 flex items-center justify-between cursor-move drag-handle">
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-brand" />
          <div>
            <h2 className="text-base font-medium text-gray-100">Smart Proactive Messages</h2>
            <p className="text-sm text-gray-400">Show different messages based on what page the visitor is viewing</p>
          </div>
        </div>
        
        <div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-800 mt-2 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-dark-900 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-brand" />
                    <h3 className="font-medium text-gray-200">Example: Product Pages</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    When someone views a Tesla Model 3, they'll see:
                    <span className="block mt-2 text-gray-200 bg-dark-800 p-2 rounded">
                      "Interested in Tesla Model 3? Chat with us!"
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-dark-900 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-brand" />
                    <h3 className="font-medium text-gray-200">Example: Category Pages</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    When browsing Electric Vehicles category:
                    <span className="block mt-2 text-gray-200 bg-dark-800 p-2 rounded">
                      "Looking for Electric Vehicles? We can help!"
                    </span>
                  </p>
                </div>
            </div>

            <div className="flex items-start space-x-2 p-4 bg-dark-900 rounded-lg border border-brand/20">
                <AlertTriangle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>
                    Smart messages require a small code snippet to detect page context. 
                    See the installation guide in the Install tab for setup instructions.
                  </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Message Templates</h3>
                  <div className="text-xs text-gray-500">
                    Variables: <code className="px-1 py-0.5 bg-dark-700 rounded">{'{{product_name}}'}</code>,{' '}
                    <code className="px-1 py-0.5 bg-dark-700 rounded">{'{{category_name}}'}</code>
                  </div>
                </div>
                {templates.map((template, index) => (
                  <div
                    key={index}
                    className="p-4 bg-dark-900 rounded-lg border border-gray-700 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-3">
                      <select
                        value={template.pageType}
                        onChange={(e) => {
                          const newTemplates = [...templates];
                          newTemplates[index] = {
                            ...template,
                            pageType: e.target.value
                          };
                          onTemplatesChange?.(newTemplates);
                        }}
                        className="px-3 py-1.5 bg-dark-800 border border-gray-700 rounded-md text-sm text-gray-300"
                      >
                        <option value="product">Product Page</option>
                        <option value="category">Category Page</option>
                        <option value="search">Search Page</option>
                      </select>
                      <div className="flex-1 flex items-center space-x-2 text-xs text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>Shows on:</span>
                        <select
                          value={template.pattern}
                          onChange={(e) => {
                            const newTemplates = [...templates];
                            newTemplates[index] = {
                              ...template,
                              pattern: e.target.value
                            };
                            onTemplatesChange?.(newTemplates);
                          }}
                          className="flex-1 px-2 py-1.5 bg-dark-800 border border-gray-700 rounded-md text-gray-300"
                        >
                          {template.pageType === 'product' && (
                            <>
                              <option value="/products/*/">Individual product pages</option>
                              <option value="/inventory/*/">Individual inventory items</option>
                              <option value="/items/*/">Individual item pages</option>
                            </>
                          )}
                          {template.pageType === 'category' && (
                            <>
                              <option value="/products/">Products listing page</option>
                              <option value="/categories/*/">Category pages</option>
                              <option value="/collections/*/">Collection pages</option>
                            </>
                          )}
                          {template.pageType === 'search' && (
                            <>
                              <option value="/search/">Search results page</option>
                              <option value="/find/">Find products page</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <textarea
                        value={template.message}
                        onChange={(e) => {
                          const newTemplates = [...templates];
                          newTemplates[index] = {
                            ...template,
                            message: e.target.value
                          };
                          onTemplatesChange?.(newTemplates);
                        }}
                        className="w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md text-gray-300 text-sm"
                        rows={2}
                        placeholder="Example: Interested in {{product_name}}? Chat with us!"
                      />
                    </div>
                  </div>
                ))}
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-100">Enable smart messages</span>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer
                    ${enabled ? 'bg-brand' : 'bg-dark-700'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnable(!enabled);
                  }}
                >
                  <div 
                    className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform
                      ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}