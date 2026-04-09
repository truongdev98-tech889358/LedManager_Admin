export interface IStatisticsRequest {
  startDate: string;
  endDate: string;
  currency: string;
}

export interface IStatisticsResponse {
  date: string;
  count: number;
  finalPrice: number;
}
