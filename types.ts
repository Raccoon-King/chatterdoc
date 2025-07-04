export type FileStatus = 'uploading' | 'analyzing' | 'awaiting-confirmation' | 'embedding' | 'complete' | 'error';

export interface ProcessedFile {
  id: string;
  file: File;
  status: FileStatus;
  tags: string[];
  docPath?: string; // path returned by AnythingLLM after upload
  primaryTag?: string; // workspace choice by user
  error?: string;
}

export interface Workspace {
  slug: string;
  name: string;
  documents: number;
}

export interface ActivityLogEntry {
  message: string;
  timestamp: Date;
  isError?: boolean;
}

export interface AnythingLLMWorkspace {
    id: number;
    name: string;
    slug: string;
}
