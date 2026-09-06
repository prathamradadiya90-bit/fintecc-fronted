export interface SearchClientItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  status?: string;
}

export interface SearchTaskItem {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface SearchDocumentItem {
  id: string;
  title: string;
  category?: string;
  fileType?: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface GlobalSearchResult {
  clients: SearchClientItem[];
  tasks: SearchTaskItem[];
  documents: SearchDocumentItem[];
}

export interface GlobalSearchResponse {
  success: boolean;
  data: GlobalSearchResult;
  message?: string;
}
