export interface IUserInformationRespones {
  image?: string;
  fullName: string;
  phoneNumber: string;
  groupId: number;
  language?: string;
  bookerCode?: string;
  userGroup: string;
  email: string;
  groupName?: string;
  currency?: string;
  company?: string;
  userName?: string;
  permissions?: string[];
}
export interface IUserInformationValues {
  image?: string;
  firstName: string;
  lastName: string;
  fullName?: string; 
  phoneNumber: string;
  language?: string;
  bookerCode?: string;
  groupId: number;
  groupName?: string;
  email: string;
  currency?: string;
  company?: string;
  userName?: string;
  permissions?: string[];
  createUser?: number;
  ownerId?: number;
  ownerCustomerId?: number;
  ownerCustomer: boolean;
}
export interface IPasswordChangeValue{
  identityId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}