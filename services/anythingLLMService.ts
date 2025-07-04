
import type { Workspace, AnythingLLMWorkspace } from '../types';

// --- API Configuration ---
// All requests are sent to a relative path. The Nginx reverse proxy running in
// the Docker container will intercept these, add the Authorization header,
// and forward them to the actual AnythingLLM backend.
const API_BASE_URL = '/api/v1'; 

// --- Type definitions for API responses from swagger.json ---
interface VectorStore {
  id: string; // This is the workspace slug
  name: string;
  file_counts: {
    total: number;
  };
}

interface VectorStoresResponse {
  data: VectorStore[];
}

interface NewWorkspaceResponse {
    workspace: AnythingLLMWorkspace;
    message: string;
}

interface UploadResponse {
    success: boolean;
    error: string | null;
    documents: { location: string; [key: string]: any }[]; 
}

// --- Helper Functions ---
const getHeaders = (isJson: boolean = true) => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  // NO Authorization header here. Nginx handles it.
  return headers;
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Could not parse error response.' }));
    const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
}


// --- Exported API Functions ---

/**
 * Fetches all available workspaces using the vector_stores endpoint for doc counts.
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/openai/vector_stores`, {
      method: 'GET',
      headers: getHeaders(false),
    });
    const data: VectorStoresResponse = await handleApiResponse(response);
    
    return data.data.map(vs => ({
      slug: vs.id,
      name: vs.name,
      documents: vs.file_counts.total,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching workspaces from AnythingLLM:", error);
    throw error;
  }
};

/**
 * Creates a new workspace.
 * @param name The name for the new workspace.
 * @returns The newly created workspace object from the API.
 */
export const createWorkspace = async (name: string): Promise<AnythingLLMWorkspace> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspace/new`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    const data: NewWorkspaceResponse = await handleApiResponse(response);

    if (!data.workspace) {
        throw new Error("Workspace creation response did not contain workspace data.");
    }
    return data.workspace;
  } catch (error) {
    console.error(`Error creating workspace "${name}":`, error);
    throw error;
  }
};

/**
 * Uploads a single file to the AnythingLLM document locker without assigning to a workspace.
 * @param file The file to upload.
 * @returns The document path required for embedding later.
 */
export const uploadFileToLocker = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/document/upload`, {
        method: 'POST',
        headers: getHeaders(false), // FormData sets its own Content-Type
        body: formData,
    });
    
    const data: UploadResponse = await handleApiResponse(response);
    if(!data.success || !data.documents || data.documents.length === 0) {
      throw new Error(data.error || "Unknown error during file upload.");
    }
    return data.documents[0].location;
  } catch (error) {
    console.error(`Error uploading document "${file.name}" to locker:`, error);
    throw error;
  }
};

/**
 * Adds existing documents to a workspace, effectively embedding them.
 * @param workspaceSlug The slug of the target workspace.
 * @param docPaths An array of document paths to add.
 */
export const addDocumentsToWorkspace = async (workspaceSlug: string, docPaths: string[]): Promise<void> => {
    if (docPaths.length === 0) return;

    try {
        const response = await fetch(`${API_BASE_URL}/workspace/${workspaceSlug}/update-embeddings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                adds: docPaths,
                deletes: []
            }),
        });
        await handleApiResponse(response);
    } catch (error) {
        console.error(`Error adding documents to workspace "${workspaceSlug}":`, error);
        throw error;
    }
};
