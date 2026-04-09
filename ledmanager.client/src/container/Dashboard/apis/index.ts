import api from "@/services";

export const getStatistics = async (apiUrl: string, params: any) => {
  try {
    const res = await api.get(apiUrl, { params });
    return res.data;
  } catch (error: any) {
    console.log({ error });
    return [];
  }
};

export interface IRevenueOverview {
  todayRevenue: number;
  yesterdayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  totalRevenue: number;
  todayOrderCount: number;
  thisMonthOrderCount: number;
  periodRevenue: number;
  periodOrderCount: number;
}

export interface IRevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface IRevenueChart {
  dataPoints: IRevenueDataPoint[];
}

export const getRevenueOverview = async (startDate?: string, endDate?: string) => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const res = await api.get("/api/statistics/revenue/overview", { params });
    return res.data as IRevenueOverview;
  } catch (error: any) {
    console.log({ error });
    return null;
  }
};

export const getRevenueChart = async (startDate?: string, endDate?: string) => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const res = await api.get("/api/statistics/revenue/chart", { params });
    return res.data as IRevenueChart;
  } catch (error: any) {
    console.log({ error });
    return { dataPoints: [] };
  }
};

export interface ITopSellingProduct {
  productId: number;
  productName: string;
  imageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export const getTopSellingProducts = async (count: number = 5, startDate?: string, endDate?: string) => {
  try {
    const params: any = { count };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const res = await api.get("/api/statistics/top-selling", { params });
    return res.data as ITopSellingProduct[];
  } catch (error: any) {
    console.log({ error });
    return [];
  }
};

export interface IOrderStatusCount {
  status: string;
  count: number;
}

export interface IOrderStatusStatistics {
  statusCounts: IOrderStatusCount[];
}

export const getOrderStatusStatistics = async (startDate?: string, endDate?: string) => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const res = await api.get("/api/statistics/orders/status", { params });
    return res.data as IOrderStatusStatistics;
  } catch (error: any) {
    console.log({ error });
    return { statusCounts: [] };
  }
};
