import type { ReactNode } from "react";

export interface IOption<T = undefined> {
  label: ReactNode;
  value: string;
  data?: T;
  color?: string;
}

export interface IMenuPermission {
  id: number;
  name: string;
  permissionValue: string;
}

export interface ICustomerFinance {
  customerId: number;
  topUpAmount: number;
  remainingTopUpAmount: number;
  debtLimitAmount: number;
  remainingDebtAmount: number;
  issueDate: string;
  durationDays: number;
  expiryDate: string;
  gracePeriodDays: number;
}

export interface IUserInfo {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bookerCode: string;
  currency: string;
  customerCode: string;
  customerId: number;
  groupId: number | null;
  groupName: string;
  identity: number;
  isDeleted: boolean;
  isRootCustomer: boolean;
  language: string;
  ownerCustomerId: number;
  password: string | null;
  permissions: string;
  roles: string[];
  role: string;
  groupPermissionResponse: IMenuPermission[];
  customerPermission: string;
  isAdminCustomer: boolean;
  customerFinanceBooking: ICustomerFinance;
}

export interface PagingRequest {
  Keyword?: string;
  PageIndex?: number;
  PageSize?: number;
  SortLabel?: string;
  IsAscending?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}
