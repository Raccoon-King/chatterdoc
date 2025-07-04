import React, { useState, KeyboardEvent } from 'react';
import type { ProcessedFile } from '../types';
import { Tag } from './Tag';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, SparklesIcon } from './icons';

interface FileCardProps {
  file: ProcessedFile;
  isSelected: boolean;
  isEmbedding: boolean;
  onUpdateTags: (fileId: string, tags: string[]) => void;
  onSetPrimaryTag: (fileId: string, tag: string) => void;
  onToggleSelection: (fileId: string) => void;
}

const statusInfo = {
  uploading: { icon: <SpinnerIcon className="animate-spin" />, text: 'Uploading to locker...', color: 'text-brand-yellow' },
  analyzing: { icon: <SpinnerIcon className="animate-spin" />, text: 'Grabby is analyzing...', color: 'text-brand-yellow' },
  'awaiting-confirmation': { icon: <DocumentTextIcon />, text: 'Select a primary tag to choose workspace', color: 'text-blue-400' },
  embedding: { icon: <SparklesIcon className="animate-spin" />, text: 'Embedding in workspace...', color: 'text-brand-yellow' },
  complete: { icon: <CheckCircleIcon />, text: 'Embedding complete!', color: 'text-green-400' },
  error: { icon: <XCircleIcon />, text: 'An error occurred', color: 'text-red-400' },
};

export const FileCard: React.FC<FileCardProps> = ({ file, isSelected, isEmbedding, onUpdateTags, onSetPrimaryTag, onToggleSelection }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!file.tags.includes(newTag)) {
        onUpdateTags(file.id, [...file.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(file.id, file.tags.filter(t => t !== tagToRemove));
    if (file.primaryTag === tagToRemove) {
      onSetPrimaryTag(file.id, ''); // Clear primary tag if removed
    }
  };

  const currentStatus = statusInfo[file.status] || statusInfo.error;
  const isInteractive = file.status === 'awaiting-confirmation' && !isEmbedding;

  return (
    <div className={`relative bg-brand-mid-blue p-4 rounded-lg shadow-md border transition-all duration-300 ${isSelected ? 'border-brand-yellow' : 'border-brand-light-blue/20'}`}>
       {file.status === 'awaiting-confirmation' && (
         <div className="absolute top-4 right-4">
            <input
                type="checkbox"
                checked={isSelected}
                disabled={isEmbedding || !file.primaryTag}
                onChange={() => onToggleSelection(file.id)}
                className="h-6 w-6 rounded bg-brand-dark-blue border-brand-light-blue text-brand-yellow focus:ring-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                title={!file.primaryTag ? "Set a primary tag to select this file" : "Select for embedding"}
            />
         </div>
       )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pr-8">
        <div className="flex items-center min-w-0">
          <DocumentTextIcon className="w-6 h-6 mr-3 text-brand-light-blue flex-shrink-0" />
          <p className="font-mono text-sm text-slate-200 truncate" title={file.file.name}>{file.file.name}</p>
        </div>
        <div className={`flex items-center mt-2 sm:mt-0 sm:ml-4 ${currentStatus.color}`}>
          {React.cloneElement(currentStatus.icon, {className: `w-5 h-5 mr-2 ${currentStatus.icon.props.className || ''}`})}
          <span className="text-sm font-semibold">{file.status === 'error' ? file.error : currentStatus.text}</span>
        </div>
      </div>

      {(file.status === 'awaiting-confirmation' || file.status === 'complete' || file.status === 'embedding') && file.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-light-blue/20">
          <div className="flex flex-wrap gap-2 items-center">
            {file.tags.map(tag => (
              <Tag
                key={tag}
                label={tag}
                isPrimary={tag === file.primaryTag}
                onClick={isInteractive ? () => onSetPrimaryTag(file.id, tag) : undefined}
                onRemove={isInteractive ? () => handleRemoveTag(tag) : undefined}
              />
            ))}
            {isInteractive && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag..."
                className="bg-brand-dark-blue text-white placeholder-brand-gray text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            )}
          </div>
          {file.primaryTag && (
             <div className="mt-4 text-right">
                <p className="text-sm text-brand-gray">
                    Workspace Target: <span className="font-bold text-brand-yellow">{file.primaryTag}</span>
                </p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};
