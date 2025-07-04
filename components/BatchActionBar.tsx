import React from 'react';
import { SparklesIcon, SpinnerIcon } from './icons';

interface BatchActionBarProps {
  selectedCount: number;
  onConfirm: () => void;
  isEmbedding: boolean;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({ selectedCount, onConfirm, isEmbedding }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-mid-blue/90 backdrop-blur-sm border-t-2 border-brand-light-blue/20 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <p className="font-semibold text-white">
          <span className="bg-brand-yellow text-brand-dark-blue rounded-full px-3 py-1 text-lg font-bold">{selectedCount}</span>
          {' '}file(s) selected for embedding.
        </p>
        <button
          onClick={onConfirm}
          disabled={isEmbedding}
          className="flex items-center justify-center px-6 py-3 bg-brand-yellow text-brand-dark-blue font-bold rounded-md hover:bg-yellow-300 transition-colors disabled:bg-brand-gray disabled:cursor-not-allowed"
        >
          {isEmbedding ? (
            <>
              <SpinnerIcon className="animate-spin w-5 h-5 mr-2" />
              Embedding...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Confirm & Embed
            </>
          )}
        </button>
      </div>
       <style>
        {`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};
