export type FermentationStage = '1F' | '2F' | 'KEGGED';

export interface Measurement {
  timestamp: number;
  value: number;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  completedAt?: number;
}

export interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
  completed: boolean;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  stage: FermentationStage;
  
  // Stage timing
  startTime: number;
  secondaryStartTime?: number;
  
  // Measurements
  measurements: {
    ph: Measurement[];
    temperature: Measurement[];
    gravity?: Measurement[];
  };
  
  // Tasks and checklists
  checklists: Checklist[];
  
  // Flavoring details
  flavoring?: {
    ingredients: string[];
    addedAt: number;
    notes?: string;
  };
  
  // Batch details
  volume: number;
  teaType: string;
  sugarAmount: number;
  starterAmount: number;
  
  // Metadata
  createdBy: string;
  lastModifiedBy: string;
  notes?: string;
}

export interface FirebaseBatchData {
  [userId: string]: {
    batches: {
      [batchId: string]: Batch;
    };
  };
} 