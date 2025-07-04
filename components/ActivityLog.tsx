import React from 'react';
import type { ActivityLogEntry } from '../types';
import { InfoCircleIcon, ExclamationTriangleIcon } from './icons';

interface ActivityLogProps {
  log: ActivityLogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ log }) => {
  return (
    <div className="bg-brand-mid-blue p-4 rounded-lg shadow-lg border border-brand-light-blue/20">
      <h3 className="text-lg font-semibold text-brand-yellow mb-4 border-b border-brand-light-blue/20 pb-2">
        Grabby's Log
      </h3>
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {log.length > 0 ? (
          log.map((entry, index) => (
            <div key={index} className="flex items-start text-sm">
              {entry.isError ? (
                <ExclamationTriangleIcon className="w-4 h-4 mr-2 mt-0.5 text-red-400 flex-shrink-0" />
              ) : (
                <InfoCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-brand-light-blue flex-shrink-0" />
              )}
              <p className={entry.isError ? 'text-red-300' : 'text-slate-300'}>
                {entry.message}
              </p>
            </div>
          ))
        ) : (
           <p className="text-sm text-brand-gray text-center py-4">No activity yet. Upload a file!</p>
        )}
      </div>
    </div>
  );
};
