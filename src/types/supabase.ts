export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          project_name: string
          project_code: string
          description: string | null
          project_type: string | null
          owner: string | null
          status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
          health: 'NOT_STARTED' | 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL'
          current_phase: string | null
          current_sprint: string | null
          current_version: string | null
          start_date: string | null
          target_date: string | null
          last_updated_at: string
          repository_url: string | null
          live_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
          last_updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }
    }
  }
}
