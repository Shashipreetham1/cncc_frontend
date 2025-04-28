// src/types/shared.ts
export type Role = 'ADMIN' | 'USER';

export interface UserInfo {
  id: string;
  username: string;
  role?: Role;
}

export interface SelectOption {
  value: string | number;
  label: string;
}