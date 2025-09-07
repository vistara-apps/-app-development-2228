import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Brain, TrendingUp } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-dark-surface border-b border-dark-border">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-purple rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-text">BetWiseAI</h1>
              <p className="text-sm text-dark-textSecondary">Smarter Football Bets with AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-dark-textSecondary">
              <TrendingUp className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;