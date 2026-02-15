
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum RepeatType {
  NONE = 'None',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
}

export type SyncStatus = 'synced' | 'pending';

export interface BaseEntity {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: SyncStatus;
}

export interface Project extends BaseEntity {
  name: string;
  github_url: string;
  live_url: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  notes: string;
}

export type FinanceType = 'income' | 'expense' | 'loan' | 'repayment' | 'business_delivery' | 'business_payment';

export interface FinanceEntry extends BaseEntity {
  type: FinanceType;
  amount: number;
  client_name: string;
  date: string;
  notes?: string;
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
  reminder_time: string | null;
  repeat_type: RepeatType;
  completed: boolean;
}

export interface APIKey extends BaseEntity {
  service_name: string;
  encrypted_key: string;
  expiry_date: string;
  project_id?: string;
}

export interface AppState {
  projects: Project[];
  finances: FinanceEntry[];
  tasks: Task[];
  vault: APIKey[];
}
