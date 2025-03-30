import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useSubscription } from '../lib/subscription';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Zap, MessageSquare, Users, BarChart3, Bot } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const { daysRemaining, status } = useSubscription();
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    companyName: '',
    companySize: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || '',
          title: data.title || '',
          companyName: data.companyName || '',
          companySize: data.companySize || ''
        });
      }
    };

    fetchProfile();
  }, [user?.uid]);

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const features = [
    { icon: Bot, name: 'Custom Chatbot', description: 'Fully customizable chatbot with your branding' },
    { icon: MessageSquare, name: 'Unlimited Conversations', description: 'No limits on chat interactions' },
    { icon: Users, name: 'Lead Management', description: 'Collect and manage leads effectively' },
    { icon: BarChart3, name: 'Advanced Analytics', description: 'Detailed insights and reporting' },
    { icon: Shield, name: 'Data Security', description: 'Enterprise-grade security and encryption' },
    { icon: Zap, name: 'Real-time Updates', description: 'Instant lead notifications and updates' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-800 p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Name</label>
              <p className="text-gray-100">{profile.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Title</label>
              <p className="text-gray-100">{profile.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Company</label>
              <p className="text-gray-100">{profile.companyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Company Size</label>
              <p className="text-gray-100">{profile.companySize} employees</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <p className="text-gray-100">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Account Created</label>
              <p className="text-gray-100">{formatDate(user?.metadata.creationTime)}</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-800 p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Subscription Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Current Plan</label>
              <p className="text-gray-100">Trial Period</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Trial Status</label>
              <div className="mt-1">
                {daysRemaining > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand text-black">
                      Active
                    </span>
                    <span className="text-sm text-gray-400">
                      {daysRemaining} days remaining
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                    Expired
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="mt-8 bg-dark-800 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-100">Upgrade to Pro</h2>
            <p className="mt-2 text-gray-400">
              Get access to all features and premium support
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-extrabold text-gray-100">$29</span>
                <span className="ml-1 text-xl text-gray-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">Billed monthly</p>
            </div>
          </div>

          <button
            className="w-full bg-brand text-black py-3 px-6 rounded-lg font-medium hover:bg-brand/90 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={daysRemaining > 0}
          >
            {daysRemaining > 0 ? 'Currently in trial period' : 'Upgrade Now'}
          </button>
        </div>

        <div className="px-8 pb-8">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Everything you need to succeed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, name, description }) => (
              <div key={name} className="flex items-start space-x-3">
                <Icon className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-100">{name}</h4>
                  <p className="text-sm text-gray-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}