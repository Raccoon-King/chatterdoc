import React from 'react';
import type { Workspace } from '../types';
import { FolderIcon } from './icons';

interface WorkspacePanelProps {
  workspaces: Workspace[];
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ workspaces }) => {
  return (
    <div className="bg-brand-mid-blue p-4 rounded-lg shadow-lg border border-brand-light-blue/20">
      <h3 className="text-lg font-semibold text-brand-yellow mb-4 border-b border-brand-light-blue/20 pb-2">
        AnythingLLM Workspaces
      </h3>
      {workspaces.length > 0 ? (
        <ul className="space-y-3">
          {workspaces.map(ws => (
            <li key={ws.slug} className="flex items-center justify-between text-slate-200">
              <div className="flex items-center">
                <FolderIcon className="w-5 h-5 mr-3 text-brand-light-blue"/>
                <span className="font-medium">{ws.name}</span>
              </div>
              <span className="bg-brand-dark-blue text-brand-yellow text-xs font-bold px-2 py-1 rounded-full">
                {ws.documents}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-brand-gray text-center py-4">No workspaces found.</p>
      )}
    </div>
  );
};
