import { useEffect, useState, useMemo } from "react";
import { Avatar, Table, Col, Row, Card, Statistic, Spin, Select, DatePicker } from "antd";
import { DollarOutlined, ShoppingCartOutlined, FireOutlined } from "@ant-design/icons";
import Chart from "react-apexcharts";
import dayjs, { Dayjs } from "dayjs";
import {
  getRevenueOverview,
  getRevenueChart,
  getTopSellingProducts,
  getOrderStatusStatistics,
  type IRevenueOverview,
  type IRevenueChart,
  type ITopSellingProduct,
  type IOrderStatusStatistics
} from "../apis";
import { formatCurrencyVND } from "@/utils/helper";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

type DateFilterType = "today" | "week" | "month" | "year" | "custom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<IRevenueOverview | null>(null);
  const [chartData, setChartData] = useState<IRevenueChart>({ dataPoints: [] });
  const [topProducts, setTopProducts] = useState<ITopSellingProduct[]>([]);
  const [orderStatusStats, setOrderStatusStats] = useState<IOrderStatusStatistics>({ statusCounts: [] });
  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, [dateFilter, customDateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const now = dayjs();

      switch (dateFilter) {
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
          if (customDateRange) {
            startDate = customDateRange[0].startOf("day").toISOString();
            endDate = customDateRange[1].endOf("day").toISOString();
          }
          break;
      }

      const [overviewRes, chartRes, topProductsRes, statusRes] = await Promise.all([
        getRevenueOverview(startDate, endDate),
        getRevenueChart(startDate, endDate),
        getTopSellingProducts(5, startDate, endDate),
        getOrderStatusStatistics(startDate, endDate)
      ]);
      setOverview(overviewRes);
      setChartData(chartRes);
      setTopProducts(topProductsRes);
      setOrderStatusStats(statusRes);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = useMemo(() => {
    return {
      chart: {
        id: "revenue-chart",
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      xaxis: {
        categories: chartData.dataPoints.map(d => {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        })
      },
      colors: ["#1890ff"],
      stroke: { curve: "smooth", width: 3 },
      markers: { size: 4 },
      yaxis: {
        labels: {
          formatter: (val: number) => {
            return (val / 1000000).toFixed(1) + "M";
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => formatCurrencyVND(val)
        }
      }
    } as ApexCharts.ApexOptions;
  }, [chartData]);

  const chartSeries = useMemo(() => {
    return [
      {
        name: "Doanh thu",
        data: chartData.dataPoints.map(d => d.revenue)
      }
    ];
  }, [chartData]);

  const orderStatusOptions = useMemo(() => {
    return {
      chart: {
        type: 'donut',
      },
      labels: orderStatusStats.statusCounts.map(s => {
        // Translate status if possible
        return t(`dataTable.orderStatus.${s.status.toLowerCase()}`, s.status);
      }),
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: t("common.total", "Tổng")
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    } as ApexCharts.ApexOptions;
  }, [orderStatusStats, t]);

  const orderStatusSeries = useMemo(() => {
    return orderStatusStats.statusCounts.map(s => s.count);
  }, [orderStatusStats]);

  const topProductColumns = [
    {
      title: t("dashboard.product") || "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: ITopSellingProduct) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={record.imageUrl}
            shape="square"
            size="large"
            icon={<ShoppingCartOutlined />}
            className="flex-shrink-0"
          />
          <span className="font-medium line-clamp-2 text-xs">{text}</span>
        </div>
      )
    },
    {
      title: t("dashboard.sold") || "Đã bán",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
      align: "center" as const,
      width: 80,
      render: (val: number) => <span className="font-bold text-orange-500">{val}</span>
    },
    {
      title: t("dashboard.revenue") || "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right" as const,
      width: 120,
      render: (val: number) => <span className="text-gray-600">{val.toLocaleString()}</span>,
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Spin size="large" tip={t("dashboard.loading") || "Đang tải dữ liệu thống kê..."} />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Date Filter Controls */}
      <Card className="mb-4">
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

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={
                dateFilter === "today" ? t("dashboard.todayRevenue") :
                  dateFilter === "week" ? t("dashboard.weekRevenue") :
                    dateFilter === "month" ? t("dashboard.monthRevenue") :
                      dateFilter === "year" ? t("dashboard.yearRevenue") :
                        t("dashboard.periodRevenue")
              }
              value={overview?.periodRevenue || 0}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={
                dateFilter === "today" ? t("dashboard.todayOrders") :
                  dateFilter === "week" ? t("dashboard.weekOrders") :
                    dateFilter === "month" ? t("dashboard.monthOrders") :
                      dateFilter === "year" ? t("dashboard.yearOrders") :
                        t("dashboard.periodOrders")
              }
              value={overview?.periodOrderCount || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={t("dashboard.totalRevenue")}
              value={overview?.totalRevenue || 0}
              prefix={<DollarOutlined />}
            />
            <div className="text-xs text-gray-400 mt-2">
              {t("dashboard.allTime")}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={t("dashboard.todayRevenue")}
              value={overview?.todayRevenue || 0}
              valueStyle={{ color: overview?.todayRevenue ? "#3f8600" : undefined }}
              prefix={<DollarOutlined />}
            />
            <div className="text-xs text-gray-400 mt-2">
              {t("dashboard.yesterday")}: {(overview?.yesterdayRevenue || 0).toLocaleString()}
            </div>
          </Card>
        </Col>


        <Col xs={24} lg={16}>
          <Card
            title={
              dateFilter === "custom" && customDateRange
                ? `${t("dashboard.revenueChart")} (${customDateRange[0].format("DD/MM/YYYY")} - ${customDateRange[1].format("DD/MM/YYYY")})`
                : t("dashboard.revenueChart")
            }
            bordered={false}
            className="shadow-sm"
          >
            <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t("dashboard.orderStatus")} bordered={false} className="shadow-sm h-full">
            <div className="flex items-center justify-center h-full min-h-[350px]">
              {orderStatusSeries.length > 0 ? (
                <Chart options={orderStatusOptions} series={orderStatusSeries} type="donut" width="100%" />
              ) : (
                <div className="text-gray-400">{t("dashboard.noOrderData")}</div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<div className="flex items-center gap-2"><FireOutlined className="text-red-500" /> {t("dashboard.topProducts")}</div>}
            bordered={false}
            className="shadow-sm h-full"
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={topProducts}
              columns={topProductColumns}
              pagination={false}
              rowKey="productId"
              size="small"
              className="border-t border-gray-100"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
