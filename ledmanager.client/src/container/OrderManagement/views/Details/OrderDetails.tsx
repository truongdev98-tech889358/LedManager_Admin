import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from "ag-grid-react";
import { formatNumber } from "@/utils/helper";
import api from "@/services";
import { Card, Col, Descriptions, Row, Spin, Select, Button, message, Tag, Typography, Divider, Input } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import type { IOrder } from "../../configs/types";
import { ORDER_STATUS_OPTIONS } from "../../configs/constants";
import dayjs from "dayjs";
import { DATE_TIME_DISPLAY2 } from "@/configs/constants";
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, Calendar, CreditCard, ShoppingCart, History } from "lucide-react";
import CoreHistory from "../CoreHistory";
import { HistoryTypeEnum } from "../../configs/constants";

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isRefetchHistory, setIsRefetchHistory] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${id}`);
      if (response.data) {
        setOrder(response.data);
        setNewStatus(response.data.status);
        setNewNote(response.data.note || "");
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === null) return;

    try {
      setUpdating(true);
      await api.put(`/api/orders/${id}`, {
        ...order,
        status: newStatus,
        note: newNote
      });
      message.success(t("toast.success.update"));
      await fetchOrderDetails();
      setIsRefetchHistory(prev => !prev);
    } catch (error) {
      console.error("Failed to update order", error);
      message.error(t("toast.error.update"));
    } finally {
      setUpdating(false);
    }
  };

  const itemColumnDefs: ColDef[] = [
    { field: "productName", headerName: t("dataTable.productName"), flex: 1 },
    {
      field: "price",
      headerName: t("dataTable.unitPrice"),
      cellStyle: { textAlign: "end" },
      valueFormatter: (params) => `${formatNumber(params.value, true)} VND`,
    },
    {
      field: "quantity",
      headerName: t("dataTable.quantity"),
      cellStyle: { textAlign: "end" },
    },
    {
      field: "total",
      headerName: t("dataTable.totalPrice"),
      cellStyle: { textAlign: "end" },
      valueGetter: (params) => (params.data ? params.data.price * params.data.quantity : 0),
      valueFormatter: (params) => `${formatNumber(params.value, true)} VND`,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return <div>{t("common.error")}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex items-center justify-between">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          {t("common.backHome")}
        </Button>
        <Title level={3} style={{ margin: 0 }}>{t("bookingDetails.orderInformation")} #{order.orderCode}</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-sm rounded-lg"
            title={
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                <span>{t("bookingDetails.orderInformation")}</span>
              </div>
            }
          >
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
              <Descriptions.Item label={<div className="flex items-center gap-2"><User size={16} /> {t("dataTable.customerName")}</div>}>
                <Text strong>{order.customerName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<div className="flex items-center gap-2"><Phone size={16} /> {t("dataTable.phoneNumber")}</div>}>
                {order.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label={<div className="flex items-center gap-2"><Mail size={16} /> {t("dataTable.email")}</div>}>
                {order.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label={<div className="flex items-center gap-2"><Calendar size={16} /> {t("dataTable.date")}</div>}>
                {dayjs(order.createdDate).format(DATE_TIME_DISPLAY2)}
              </Descriptions.Item>
              <Descriptions.Item label={<div className="flex items-center gap-2"><MapPin size={16} /> {t("dataTable.address")}</div>} span={2}>
                {order.customerAddress}
              </Descriptions.Item>
              <Descriptions.Item label={<div className="flex items-center gap-2"><CreditCard size={16} /> {t("dataTable.totalPrice")}</div>} span={2}>
                <Text type="danger" strong style={{ fontSize: 18 }}>
                  {formatNumber(order.totalAmount, true)} VND
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t("dataTable.note")} span={2}>
                <TextArea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("common.noData")}
                  rows={3}
                  className="rounded-md"
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            className="mt-6 shadow-sm rounded-lg"
            bordered={false}
            title={
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-orange-500" />
                <span>{t("bookingDetails.orderItems")}</span>
              </div>
            }
          >
            <div className="ag-theme-quartz rounded-md overflow-hidden">
              <AgGridReact
                rowData={order.orderItems}
                columnDefs={itemColumnDefs}
                domLayout="autoHeight"
              />
            </div>
          </Card>

          <Card
            className="mt-6 shadow-sm rounded-lg"
            bordered={false}
            title={
              <div className="flex items-center gap-2">
                <History size={20} className="text-purple-500" />
                <span>{t("common.history")}</span>
              </div>
            }
          >
            <CoreHistory
              id={Number(id)}
              type={HistoryTypeEnum.Order}
              isRefetchHistory={isRefetchHistory}
              isShowAdd={false}
            />
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card
            title={t("dataTable.status")}
            bordered={false}
            className="shadow-sm rounded-lg sticky top-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
                <Text>{t("common.status")}:</Text>
                <Tag color={ORDER_STATUS_OPTIONS().find(opt => opt.value === order.status + "")?.color} className="m-0 uppercase font-bold px-3 py-1">
                  {ORDER_STATUS_OPTIONS().find(opt => opt.value === order.status + "")?.data}
                </Tag>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div className="flex flex-col gap-2">
                <Text strong>{t("common.quickUpdate")}</Text>
                <Select
                  value={newStatus + ""}
                  onChange={(val) => setNewStatus(Number(val))}
                  className="w-full"
                  size="large"
                  options={ORDER_STATUS_OPTIONS().slice(1).map(opt => ({
                    label: opt.data,
                    value: opt.value
                  }))}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleUpdateStatus}
                  loading={updating}
                  disabled={newStatus === order.status && newNote === order.note}
                  className="mt-2"
                >
                  {t("common.save")}
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetails;
