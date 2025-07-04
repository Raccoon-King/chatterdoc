import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { FileCard } from './components/FileCard';
import { WorkspacePanel } from './components/WorkspacePanel';
import { ActivityLog } from './components/ActivityLog';
import { BatchActionBar } from './components/BatchActionBar'; // New Component
import { getWorkspaces as fetchWorkspaces, createWorkspace, uploadFileToLocker, addDocumentsToWorkspace } from './services/anythingLLMService';
import { generateTags } from './services/grabbyService';
import type { ProcessedFile, Workspace, ActivityLogEntry, FileStatus } from './types';
import { PlusIcon } from './components/icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isEmbedding, setIsEmbedding] = useState(false);

  const addLog = useCallback((message: string, isError: boolean = false) => {
    setActivityLog(prev => [{ message, timestamp: new Date(), isError }, ...prev]);
  }, []);

  useEffect(() => {
    const loadWorkspaces = async () => {
      addLog("Fetching workspaces from AnythingLLM...");
      try {
        const fetchedWorkspaces = await fetchWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        addLog(`Successfully fetched ${fetchedWorkspaces.length} workspaces.`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Failed to fetch workspaces: ${errorMessage}`, true);
        console.error(error);
      }
    };
    loadWorkspaces();
  }, [addLog]);

  const updateFileState = useCallback((id: string, updates: Partial<ProcessedFile>) => {
    setFiles(prevFiles =>
      prevFiles.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);
  
  const handleFileUpload = useCallback(
    async (uploadedFiles: File[]) => {
      const newProcessedFiles: ProcessedFile[] = uploadedFiles.map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'uploading',
        tags: [],
      }));

      setFiles(prev => [...newProcessedFiles, ...prev]);
      addLog(`Uploaded ${uploadedFiles.length} new file(s). Starting processing...`);

      for (const processedFile of newProcessedFiles) {
        try {
          // 1. Upload to locker
          addLog(`Uploading "${processedFile.file.name}" to AnythingLLM locker...`);
          const docPath = await uploadFileToLocker(processedFile.file);
          updateFileState(processedFile.id, { status: 'analyzing', docPath });
          addLog(`"${processedFile.file.name}" is in the locker. Path: ${docPath}`);

          // 2. Generate tags
          addLog(`Grabby is analyzing "${processedFile.file.name}" for tags...`);
          const tags = await generateTags(processedFile.file.name);
          updateFileState(processedFile.id, { status: 'awaiting-confirmation', tags });
          addLog(`Grabby suggested tags for "${processedFile.file.name}". Ready for embedding.`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Error processing file:', error);
          addLog(`Failed to process "${processedFile.file.name}": ${errorMessage}`, true);
          updateFileState(processedFile.id, { status: 'error', error: errorMessage });
        }
      }
    },
    [addLog, updateFileState]
  );
  
  const handleConfirmAndEmbed = useCallback(async () => {
    setIsEmbedding(true);
    addLog(`Starting batch embedding for ${selectedFileIds.size} files.`);

    const filesToEmbed = files.filter(f => selectedFileIds.has(f.id) && f.primaryTag && f.docPath);
    if (filesToEmbed.length === 0) {
        addLog("No valid files selected for embedding.", true);
        setIsEmbedding(false);
        return;
    }

    // Group files by their target workspace (primaryTag)
    const groupedByWorkspace = filesToEmbed.reduce((acc, file) => {
        const key = file.primaryTag!;
        if (!acc[key]) acc[key] = [];
        acc[key].push(file);
        return acc;
    }, {} as Record<string, ProcessedFile[]>);

    // Identify and create any new workspaces needed
    const existingWorkspaceNames = new Set(workspaces.map(ws => ws.name.toLowerCase()));
    const newWorkspaceNames = Object.keys(groupedByWorkspace).filter(name => !existingWorkspaceNames.has(name.toLowerCase()));

    if (newWorkspaceNames.length > 0) {
        addLog(`Creating ${newWorkspaceNames.length} new workspace(s): ${newWorkspaceNames.join(', ')}`);
        await Promise.all(
            newWorkspaceNames.map(name => createWorkspace(name).catch(e => {
                addLog(`Failed to create workspace "${name}": ${e.message}`, true);
                // Mark files for this workspace as errored
                groupedByWorkspace[name].forEach(f => updateFileState(f.id, { status: 'error', error: 'Workspace creation failed.'}));
                delete groupedByWorkspace[name]; // Remove from processing
            }))
        );
        // Refresh workspace list to get new slugs
        addLog("Refreshing workspace list after creations...");
        const refreshedWorkspaces = await fetchWorkspaces();
        setWorkspaces(refreshedWorkspaces);
    }
    
    // Process embeddings for each workspace
    for (const workspaceName of Object.keys(groupedByWorkspace)) {
      const currentFiles = groupedByWorkspace[workspaceName];
      const workspace = workspaces.find(ws => ws.name.toLowerCase() === workspaceName.toLowerCase());

      if (!workspace) {
        addLog(`Could not find workspace "${workspaceName}" for embedding. Skipping ${currentFiles.length} file(s).`, true);
        currentFiles.forEach(f => updateFileState(f.id, {status: 'error', error: 'Workspace not found.'}))
        continue;
      }

      const docPaths = currentFiles.map(f => f.docPath!);
      try {
        addLog(`Embedding ${docPaths.length} file(s) into "${workspace.name}"...`);
        currentFiles.forEach(f => updateFileState(f.id, { status: 'embedding' }));
        await addDocumentsToWorkspace(workspace.slug, docPaths);
        addLog(`Successfully embedded files into "${workspace.name}".`);
        currentFiles.forEach(f => updateFileState(f.id, { status: 'complete' }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Failed to embed files into "${workspace.name}": ${errorMessage}`, true);
        currentFiles.forEach(f => updateFileState(f.id, { status: 'error', error: 'Embedding failed.' }));
      }
    }

    setSelectedFileIds(new Set());
    setIsEmbedding(false);
    addLog("Batch embedding process finished. Refreshing workspaces...");
    const finalList = await fetchWorkspaces(); // Final refresh
    setWorkspaces(finalList);
    addLog("Workspaces updated.");

  }, [files, workspaces, selectedFileIds, addLog, updateFileState]);

  const handleUpdateTags = useCallback((fileId: string, newTags: string[]) => {
    updateFileState(fileId, { tags: newTags });
  }, [updateFileState]);

  const handleSetPrimaryTag = useCallback((fileId: string, primaryTag: string) => {
    updateFileState(fileId, { primaryTag });
  }, [updateFileState]);

  const handleToggleSelection = useCallback((fileId: string) => {
    setSelectedFileIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(fileId)) {
            newSet.delete(fileId);
        } else {
            newSet.add(fileId);
        }
        return newSet;
    });
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-24">
      <Header />
      <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <FileUpload onFileUpload={handleFileUpload} />
          {files.length === 0 ? (
            <div className="text-center py-16 px-6 bg-brand-mid-blue rounded-lg border border-dashed border-brand-light-blue">
              <div className="w-16 h-16 mx-auto text-brand-light-blue bg-brand-dark-blue rounded-full flex items-center justify-center">
                <PlusIcon className="w-8 h-8"/>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">No files processed yet</h3>
              <p className="mt-2 text-brand-gray">Upload some files to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFileIds.has(file.id)}
                  isEmbedding={isEmbedding}
                  onUpdateTags={handleUpdateTags}
                  onSetPrimaryTag={handleSetPrimaryTag}
                  onToggleSelection={handleToggleSelection}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <WorkspacePanel workspaces={workspaces} />
          <ActivityLog log={activityLog} />
        </aside>
      </main>
      <BatchActionBar 
        selectedCount={selectedFileIds.size}
        onConfirm={handleConfirmAndEmbed}
        isEmbedding={isEmbedding}
      />
    </div>
  );
};

export default App;
