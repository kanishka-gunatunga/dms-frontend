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
