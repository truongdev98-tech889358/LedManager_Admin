import { Card, Col, DatePicker, Row, Select, Statistic, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CalendarFold, CheckCircle, FileCheck, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/services";

const { RangePicker } = DatePicker;

interface OrderStatusDetail {
  status: string;
  count: number;
  revenue: number;
}

interface OrderStatusReportViewModel {
  startDate?: string;
  endDate?: string;
  statusDetails: OrderStatusDetail[];
  totalOrders: number;
  totalRevenue: number;
}

type DateFilterType = "today" | "week" | "month" | "year" | "custom";

const Statistics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<OrderStatusReportViewModel | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      Pending: { icon: ShoppingCart, color: "purple", label: t("dataTable.orderStatus.pending") },
      Processing: { icon: CalendarFold, color: "orange", label: t("dataTable.orderStatus.processing") },
      Shipped: { icon: FileCheck, color: "blue", label: t("dataTable.orderStatus.shipped") },
      Delivered: { icon: CheckCircle, color: "green", label: t("dataTable.orderStatus.delivered") },
      Cancelled: { icon: XCircle, color: "red", label: t("dataTable.orderStatus.cancelled") },
    };
    return configs[status] || { icon: ShoppingCart, color: "gray", label: status };
  };

  const fetchReport = async (filter: DateFilterType, customRange?: [Dayjs, Dayjs] | null) => {
    setLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const now = dayjs();

      switch (filter) {
        case "today":
          startDate = now.startOf("day").toISOString();
          endDate = now.endOf("day").toISOString();
          break;
        case "week":
          startDate = now.startOf("week").toISOString();
          endDate = now.endOf("week").toISOString();
          break;
        case "month":
          startDate = now.startOf("month").toISOString();
          endDate = now.endOf("month").toISOString();
          break;
        case "year":
          startDate = now.startOf("year").toISOString();
          endDate = now.endOf("year").toISOString();
          break;
        case "custom":
          if (customRange) {
            startDate = customRange[0].startOf("day").toISOString();
            endDate = customRange[1].endOf("day").toISOString();
          }
          break;
      }

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get<OrderStatusReportViewModel>(
        `/api/statistics/orders/status-report?${params.toString()}`
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching order status report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateFilter, customDateRange);
  }, [dateFilter, customDateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("statisticsReports.title") || "Thống kê & Báo cáo"}</h1>
        <p className="text-gray-600">{t("statisticsReports.subtitle") || "Báo cáo trạng thái đơn hàng"}</p>
      </div>

      {/* Date Filter Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">
              {t("statisticsReports.selectPeriod") || "Chọn khoảng thời gian"}
            </label>
            <Select
              value={dateFilter}
              onChange={(value) => setDateFilter(value)}
              className="w-full"
              options={[
                { label: t("statisticsReports.today") || "Hôm nay", value: "today" },
                { label: t("statisticsReports.thisWeek") || "Tuần này", value: "week" },
                { label: t("statisticsReports.thisMonth") || "Tháng này", value: "month" },
                { label: t("statisticsReports.thisYear") || "Năm này", value: "year" },
                { label: t("statisticsReports.custom") || "Tùy chỉnh", value: "custom" },
              ]}
            />
          </div>

          {dateFilter === "custom" && (
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium mb-2">
                {t("statisticsReports.customRange") || "Chọn khoảng ngày"}
              </label>
              <RangePicker
                value={customDateRange}
                onChange={(dates) => setCustomDateRange(dates as [Dayjs, Dayjs] | null)}
                className="w-full"
                format="DD/MM/YYYY"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t("statisticsReports.totalOrders") || "Tổng đơn hàng"}
              value={reportData?.totalOrders || 0}
              prefix={<ShoppingCart className="text-blue-500" size={24} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t("statisticsReports.totalRevenue") || "Tổng doanh thu"}
              value={reportData?.totalRevenue || 0}
              prefix={<TrendingUp className="text-green-500" size={24} />}
              formatter={(value) => formatCurrency(Number(value))}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t("statisticsReports.averageOrderValue") || "Giá trị TB/đơn"}
              value={
                reportData?.totalOrders && reportData.totalOrders > 0
                  ? reportData.totalRevenue / reportData.totalOrders
                  : 0
              }
              prefix={<TrendingUp className="text-purple-500" size={24} />}
              formatter={(value) => formatCurrency(Number(value))}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown */}
      <Card title={t("statisticsReports.orderStatusBreakdown") || "Phân loại theo trạng thái"} loading={loading}>
        <Row gutter={[16, 16]}>
          {reportData?.statusDetails.map((detail) => {
            const config = getStatusConfig(detail.status);
            const Icon = config.icon;
            const percentage =
              reportData.totalOrders > 0 ? ((detail.count / reportData.totalOrders) * 100).toFixed(1) : "0";

            return (
              <Col xs={24} sm={12} lg={8} key={detail.status}>
                <Card className="h-full border-l-4" style={{ borderLeftColor: `var(--ant-${config.color}-6)` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={`text-${config.color}-500`} />
                      <Tag color={config.color} className="m-0">
                        {config.label}
                      </Tag>
                    </div>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-600">
                        {t("statisticsReports.orderCount") || "Số đơn hàng"}
                      </div>
                      <div className="text-2xl font-bold">{detail.count}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">
                        {t("statisticsReports.revenue") || "Doanh thu"}
                      </div>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(detail.revenue)}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {(!reportData || reportData.statusDetails.length === 0) && !loading && (
          <div className="text-center py-12 text-gray-500">
            {t("statisticsReports.noData") || "Không có dữ liệu trong khoảng thời gian này"}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Statistics;
