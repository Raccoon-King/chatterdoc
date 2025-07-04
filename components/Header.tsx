

import React from 'react';
import { BookOpenIcon } from './icons';

const RaccoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M78 90C78 81.1634 70.8366 74 62 74H38C29.1634 74 22 81.1634 22 90" fill="#345A7D"/>
    <path d="M85 60C85 51.1634 77.8366 44 69 44H31C22.1634 44 15 51.1634 15 60V80H85V60Z" fill="#333"/>
    <path d="M85 60V80H60C60 68.9543 51.0457 60 40 60H31C22.1634 60 15 51.1634 15 60V80H15V60C15 51.1634 22.1634 44 31 44H69C77.8366 44 85 51.1634 85 60Z" fill="#A0AEC0"/>
    <path d="M50 20L56 10H44L50 20Z" fill="#333"/>
    <path d="M68 22L78 15L70 30L68 22Z" fill="white"/>
    <path d="M32 22L22 15L30 30L32 22Z" fill="white"/>
    <path d="M75 40C75 48.2843 68.2843 55 60 55C51.7157 55 45 48.2843 45 40C45 31.7157 51.7157 25 60 25C68.2843 25 75 31.7157 75 40Z" fill="white"/>
    <path d="M55 40C55 48.2843 48.2843 55 40 55C31.7157 55 25 48.2843 25 40C25 31.7157 31.7157 25 40 25C48.2843 25 55 31.7157 55 40Z" fill="white"/>
    <path d="M68 40C68 44.4183 64.4183 48 60 48C55.5817 48 52 44.4183 52 40C52 35.5817 55.5817 32 60 32C64.4183 32 68 35.5817 68 40Z" fill="#333"/>
    <path d="M48 40C48 44.4183 44.4183 48 40 48C35.5817 48 32 44.4183 32 40C32 35.5817 35.5817 32 40 32C44.4183 32 48 35.5817 48 40Z" fill="#333"/>
    <circle cx="50" cy="40" r="5" fill="white"/>
    <circle cx="50" cy="40" r="2" fill="#333"/>
    <path d="M88 45C92.4183 45 96 48.5817 96 53V78C96 82.4183 92.4183 86 88 86H80L88 45Z" fill="#A0AEC0"/>
    <path d="M92 55H84V60H92V55Z" fill="white" />
    <path d="M92 65H84V70H92V65Z" fill="white" />
    <path d="M92 75H84V80H92V75Z" fill="white" />
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-brand-mid-blue/50 p-4 shadow-lg border-b-2 border-brand-light-blue/20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RaccoonIcon className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-white tracking-wider">
            Bandit<span className="text-brand-yellow">Box</span>
          </h1>
        </div>
        <div className="flex items-center space-x-6">
            <a 
              href="/swagger/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm font-semibold text-brand-gray hover:text-brand-yellow transition-colors"
            >
              <BookOpenIcon className="w-5 h-5" />
              <span>API Docs</span>
            </a>
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-semibold text-brand-yellow">Grabby is Online</span>
            </div>
        </div>
      </div>
    </header>
  );
};