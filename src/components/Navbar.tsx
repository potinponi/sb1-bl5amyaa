import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Users, 
  BarChart3,
  Bot,
  Code,
  LogOut,
  UserCircle
} from 'lucide-react';

const Navbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { signOut } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/builder', icon: MessageSquarePlus, label: 'Builder' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/code', icon: Code, label: 'Install' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-dark-transparent backdrop-blur-sm
        ${isExpanded ? 'w-64' : 'w-20'}
        z-50
        transition-all duration-300 ease-in-out
        border-r border-gray-400/10`}
    >
      <div className="flex flex-col items-center justify-start p-4 h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-12 w-12 mb-8 bg-brand text-black text-3xl rounded-lg" style={{ fontFamily: "'Anta', sans-serif" }}>
          ä
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center w-full space-y-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                relative flex items-center w-full px-3 py-3 rounded-lg transition-colors
                group
                ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
                ${isActive
                  ? 'bg-brand text-black'
                  : 'text-gray-400 hover:text-brand hover:bg-dark-700'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isExpanded ? 'mr-2' : ''}`} />
              {isExpanded && <span>{label}</span>}
              
              {!isExpanded && (
                <span className="absolute left-14 m-2 w-auto min-w-max p-2
                  rounded-md shadow-md text-white bg-dark-800 border border-gray-700
                  text-xs font-medium
                  transition-all duration-100 scale-0 origin-left
                  group-hover:scale-100">
                  {label}
                </span>
              )}
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={signOut}
            className={`
              relative flex items-center w-full px-3 py-3 rounded-lg transition-colors
              group mt-auto
              ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
              text-gray-400 hover:text-red-400 hover:bg-dark-700
            `}
          >
            <LogOut className={`w-6 h-6 ${isExpanded ? 'mr-2' : ''}`} />
            {isExpanded && <span>Log out</span>}
            
            {!isExpanded && (
              <span className="absolute left-14 m-2 w-auto min-w-max p-2
                rounded-md shadow-md text-white bg-dark-800 border border-gray-700
                text-xs font-medium
                transition-all duration-100 scale-0 origin-left
                group-hover:scale-100">
                Log out
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;