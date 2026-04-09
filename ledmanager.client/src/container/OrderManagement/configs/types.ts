import type { HistoryTypeEnum } from "./constants";

export interface IOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string;
  note: string;
  totalAmount: number;
  status: number;
  createdDate: string;
  orderItems: IOrderItem[];
}

export interface IGetHistoryRequest {
  id: number;
  type: HistoryTypeEnum;
}

export interface IHistoryRequest {
  entityType: HistoryTypeEnum;
  entityId: number;
  description: string;
  metadata: string;
  level: number;
  actionType: string;
}

export interface IHistory {
  id: number;
  entityId: number;
  entityType: string;
  description: string;
  metadata: string;
  level: number;
  actionType: string;
  performedBy: string;
  createdAt: string;
}

export interface IHistoryResponse {
  histories: IHistory[];
}
