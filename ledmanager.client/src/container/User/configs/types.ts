export interface IAccountResponse {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  createUser: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  ownerCustomerId: number;
  permissions: string[];
  userGroup: string;
  ownerCustomer: number;
  roles: string[];
}
export interface IAccountFormValues {
  userName: string;
  email: string;
  dateOfBirth?: string;
  createUser?: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  ownerCustomerId?: number;
  roles: string[];
  groupId: number;
  staffLevel?: string;
  note: string;
  bookingAccount?: string;
  branch?: string;
  bookerCode?: string;
  isActive?: boolean;
  password?: string;
}
