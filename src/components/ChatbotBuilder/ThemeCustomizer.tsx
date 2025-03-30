import { useState } from 'react';
import { Palette, Upload, X, Bot, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Theme } from '../../types';

interface ThemeCustomizerProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  chatbotName: string;
  setChatbotName: (name: string) => void;
  welcomeMessage: string;
  endMessage: string;
  options: any[];
  handleSave: () => void;
  saving: boolean;
}

const defaultGradient = {
  from: '#a7e154',
  to: '#4F46E5'
};

const defaultTheme = {
  primaryColor: '#a7e154',
  backgroundColor: '#1a1a1a',
  headerColor: '#232323',
  messageColor: '#232323',
  botMessageColor: '#232323',
  userMessageColor: '#a7e154',
  inputColor: '#1a1a1a',
  botTextColor: '#ffffff',
  userTextColor: '#000000',
  headerTextColor: '#ffffff',
  fontFamily: 'system-ui',
  borderRadius: '0.5rem',
  showMessageIcons: true
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const buttonIcons = [
  { value: 'message-square', label: 'Square Message' },
  { value: 'bot', label: 'Robot Assistant' },
  { value: 'mail', label: 'Envelope' },
  { value: 'sparkles', label: 'Magic Chat' }
] as const;

export function ThemeCustomizer({ 
  theme, 
  setTheme, 
  chatbotName, 
  setChatbotName,
  welcomeMessage,
  endMessage,
  options,
  handleSave,
  saving
}: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'colors' | 'typography' | 'interface'>('basic');
  const [uploading, setUploading] = useState<'bot' | 'user' | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file: File, type: 'bot' | 'user') => {
    if (!file) return;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 1MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, GIF and WebP images are allowed');
      return;
    }

    try {
      setUploading(type);

      // Upload file to Firebase Storage
      const fileName = `${type}-icon-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const storageRef = ref(storage, `chatbot-icons/${fileName}`);
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update theme with new icon URL
      setTheme(prev => ({
        ...prev,
        [type === 'bot' ? 'botIcon' : 'userIcon']: downloadURL
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const removeIcon = async (type: 'bot' | 'user') => {
    try {
      const iconUrl = type === 'bot' ? theme.botIcon : theme.userIcon;
      
      // If there's an existing icon, delete it from storage
      if (iconUrl) {
        const iconRef = ref(storage, iconUrl);
        await deleteObject(iconRef);
      }

      // Update theme to remove icon
      setTheme(prev => ({
        ...prev,
        [type === 'bot' ? 'botIcon' : 'userIcon']: undefined
      }));
    } catch (error) {
      console.error('Error removing icon:', error);
      alert('Failed to remove icon. Please try again.');
    }
  };

  return (
    <div className="h-full">
      <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 h-full flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-400/10 min-w-[280px]">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'basic'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'colors'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
          >
            Colors
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'typography'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
          >
            Typography
          </button>
          <button
            onClick={() => setActiveTab('interface')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'interface'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
          >
            Interface
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 placeholder-gray-500
                    focus:border-brand focus:ring-brand"
                  placeholder="Enter a name for your chatbot"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This name will appear in the chat widget header
                </p>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Use Gradient
                </label>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!theme.gradient}
                      onChange={(e) => {
                        setTheme(prev => {
                          if (e.target.checked) {
                            return {
                              ...prev,
                              showMessageIcons: prev.showMessageIcons,
                              gradient: defaultGradient
                            };
                          } else {
                            const { gradient, ...rest } = prev;
                            return { ...rest, showMessageIcons: prev.showMessageIcons };
                          }
                        });
                      }}
                      className="rounded border-gray-700 bg-dark-900 text-brand"
                    />
                    <span className="text-sm text-gray-400">Enable gradient</span>
                  </label>
                </div>
              </div>
            
              {theme.gradient && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Gradient From
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={theme.gradient?.from || defaultGradient.from}
                        onChange={(e) => setTheme(prev => ({
                          ...prev,
                          gradient: {
                            ...prev.gradient!,
                            from: e.target.value
                          }
                        }))}
                        className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.gradient?.from || defaultGradient.from}
                        onChange={(e) => setTheme(prev => ({
                          ...prev,
                          gradient: {
                            ...prev.gradient!,
                            from: e.target.value
                          }
                        }))}
                        className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                          text-gray-100 font-mono text-sm
                          focus:border-brand focus:ring-brand"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Gradient To
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={theme.gradient?.to || defaultGradient.to}
                        onChange={(e) => setTheme(prev => ({
                          ...prev,
                          gradient: {
                            ...prev.gradient!,
                            to: e.target.value
                          }
                        }))}
                        className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.gradient?.to || defaultGradient.to}
                        onChange={(e) => setTheme(prev => ({
                          ...prev,
                          gradient: {
                            ...prev.gradient!,
                            to: e.target.value
                          }
                        }))}
                        className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                          text-gray-100 font-mono text-sm
                          focus:border-brand focus:ring-brand"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Bot Message Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.botMessageColor || defaultTheme.botMessageColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, botMessageColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.botMessageColor || defaultTheme.botMessageColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, botMessageColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  User Message Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.userMessageColor || defaultTheme.userMessageColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, userMessageColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.userMessageColor || defaultTheme.userMessageColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, userMessageColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.backgroundColor || defaultTheme.backgroundColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor || defaultTheme.backgroundColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Header Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.headerColor || defaultTheme.headerColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.headerColor || defaultTheme.headerColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Input Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.inputColor || defaultTheme.inputColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, inputColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.inputColor || defaultTheme.inputColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, inputColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 font-mono text-sm
                      focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Font Family
              </label>
              <select
                value={theme.fontFamily}
                onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                  text-gray-100 focus:border-brand focus:ring-brand"
              >
                <option value="system-ui">System Default</option>
                <option value="'Anta', sans-serif">Anta</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
              </select>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-medium text-gray-300">Text Colors</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Bot Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.botTextColor || defaultTheme.botTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, botTextColor: e.target.value }))}
                      className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.botTextColor || defaultTheme.botTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, botTextColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                        text-gray-100 font-mono text-sm
                        focus:border-brand focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    User Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.userTextColor || defaultTheme.userTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, userTextColor: e.target.value }))}
                      className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.userTextColor || defaultTheme.userTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, userTextColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                        text-gray-100 font-mono text-sm
                        focus:border-brand focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Header Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.headerTextColor || defaultTheme.headerTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, headerTextColor: e.target.value }))}
                      className="h-10 w-20 rounded border border-gray-700 bg-dark-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.headerTextColor || defaultTheme.headerTextColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, headerTextColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                        text-gray-100 font-mono text-sm
                        focus:border-brand focus:ring-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interface' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Message Icons
                </label>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={theme.showMessageIcons ?? true}
                      onChange={(e) => setTheme(prev => ({
                        ...prev,
                        showMessageIcons: e.target.checked
                      }))}
                      className="rounded border-gray-700 bg-dark-900 text-brand"
                    />
                    <span className="text-sm text-gray-400">Show message icons</span>
                  </label>
                </div>
              </div>
              
              {theme.showMessageIcons && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bot Icon
                    </label>
                    <div className="flex items-center space-x-4">
                      {theme.botIcon ? (
                        <div className="relative w-12 h-12">
                          <img
                            src={theme.botIcon}
                            alt="Bot Icon"
                            className="w-full h-full rounded-full object-cover"
                          />
                          <button
                            onClick={() => removeIcon('bot')}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full 
                              text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="relative flex items-center justify-center px-4 py-2 
                          bg-dark-700 border border-gray-600 rounded-lg cursor-pointer
                          hover:bg-dark-600 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'bot');
                            }}
                          />
                          {uploading === 'bot' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">Upload Icon</span>
                            </>
                          )}
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          Max size: 1MB. Supported formats: JPG, PNG, GIF, WebP
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Icon
                    </label>
                    <div className="flex items-center space-x-4">
                      {theme.userIcon ? (
                        <div className="relative w-12 h-12">
                          <img
                            src={theme.userIcon}
                            alt="User Icon"
                            className="w-full h-full rounded-full object-cover"
                          />
                          <button
                            onClick={() => removeIcon('user')}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full 
                              text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="relative flex items-center justify-center px-4 py-2 
                          bg-dark-700 border border-gray-600 rounded-lg cursor-pointer
                          hover:bg-dark-600 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'user');
                            }}
                          />
                          {uploading === 'user' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">Upload Icon</span>
                            </>
                          )}
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          Max size: 1MB. Supported formats: JPG, PNG, GIF, WebP
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Button Icon
                </label>
                <select
                  value={theme.buttonIcon || 'message-square'}
                  onChange={(e) => setTheme(prev => ({
                    ...prev,
                    buttonIcon: e.target.value as Theme['buttonIcon']
                  }))}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 focus:border-brand focus:ring-brand"
                >
                  {buttonIcons.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Border Radius
                </label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 focus:border-brand focus:ring-brand"
                >
                  <option value="0">Square</option>
                  <option value="0.25rem">Small</option>
                  <option value="0.5rem">Medium</option>
                  <option value="1rem">Large</option>
                  <option value="9999px">Rounded</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-400/10 bg-dark-800 sticky bottom-0">
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-brand text-black rounded-md 
                hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

          <button
            onClick={() => setTheme({
              ...defaultTheme,
              gradient: undefined
            })}
            className="w-full px-4 py-2 bg-dark-700 text-gray-300 rounded-md 
              hover:bg-dark-600 transition-colors"
          >
            Reset to Default
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}