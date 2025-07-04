import React from 'react';
import { XCircleIcon, StarIcon } from './icons';

interface TagProps {
  label: string;
  isPrimary?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, isPrimary, onClick, onRemove }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center rounded-full text-sm font-medium transition-all duration-200
        ${
          isPrimary
            ? 'bg-brand-yellow text-brand-dark-blue pl-2 pr-3 py-1 cursor-pointer'
            : 'bg-brand-light-blue text-white pl-3 pr-2 py-1'
        }
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
      `}
    >
      {isPrimary && <StarIcon className="w-4 h-4 mr-1" />}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent onClick on the div
            onRemove();
          }}
          className="ml-1.5 text-white/70 hover:text-white"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
