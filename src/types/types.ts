export interface UserDropdownItem {
  id: number;
  user_name: string;
}

export interface RoleDropdownItem {
  id: number;
  role_name: string;
  permissions: string;
}

export interface CategoryDropdownItem {
  id: number;
  parent_category: string;
  category_name: string;
}

export interface Category {
  id: number;
  parent_category: string;
  category_name: string;
}

export interface TableItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface CommentItem {
  id: string;
  comment: string;
  date_time: string;
  user: string;
  commented_by: string;
}

export interface VersionHistoryItem {
  id: string;
  type: string;
  date_time: string;
  user: string;
  created_by: string;
}

export interface BulkUploadItem {
  id: string;
  type: string;
  name: string;
}
export interface AttributeUploadItem {
  id: string;
  category: {
    category_name: string;
  };
  attributes: string;
}


export interface ReminderItem {
  id: number;
  document_id: number;
  date_time: string;
  subject: string;
  message: string;
  is_repeat: string;
  send_email: string;
  frequency: string;
  end_date_time: string;
  start_date_time: string;
  frequency_details: string;
  users: string;
  document?: {
    id: number;
    name: string;
  };
}

export interface FrequencyDetail {
  period?: string;
  month?: string;
  date?: string;
}
export interface ReminderViewItem {
  id: number;
  document_id: number;
  subject: string;
  message: string;
  is_repeat: string;
  send_email: string;
  frequency: string;
  end_date_time: string;
  date_time: string;
  start_date_time: string;
  frequency_details: (FrequencyDetail | string)[]; 
  users: string;
}
export interface SMTPUploadItem {
  id: string;
  host: string;
  user_name: string;
  password: string;
  from_name: string;
  encryption: string;
  port: string;
  is_default: string;
}

export interface AuditTrialItem {
  id: number;
  operation: string;
  category: string;
  user: string;
  document: string;
  date_time: string;
  document_name: string;
  asigned_users: string;
  asigned_roles: string;
}

export const ItemTypes = {
  USER: "user",
};


export interface RoleUserItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SectorDropdownItem {
  id: number;
  parent_sector: string;
  sector_name: string;
}

export interface FtpAccDropdownItem {
  id: number;
  name: string;
}

export interface DocumentData {
  id: number;
  name: string;
  storage: string;
  type: string;
  document?: {
    id: number;
    category_name: string;
  };
}