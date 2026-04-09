import {
  CoreButton,
  CoreInput,
  CoreUpload,
} from "@/components";
import { Form, Col, Row, Card, Divider, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getSystemConfigs, updateSystemConfig, createSystemConfig } from "../apis";
import type { ISystemConfig } from "../apis";
import { BASE_URL } from "@/configs/constants";
import { uploadFile } from "@/services/apiFile";
import type { UploadFile } from "antd/es/upload/interface";

const SystemSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<ISystemConfig[]>([]);
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);

  const LOGO_KEY = "SiteLogo";

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await getSystemConfigs({ pageSize: 100 });
      const items = data?.items || [];
      setConfigs(items);

      const logoConfig = items?.find((x: ISystemConfig) => x.configKey === LOGO_KEY);
      if (logoConfig) {
        form.setFieldValue(LOGO_KEY, logoConfig.configValue);
        if (logoConfig.configValue) {
          setLogoFileList([{
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: logoConfig.configValue.startsWith('http') ? logoConfig.configValue : `${BASE_URL || ""}${logoConfig.configValue}`,
          }]);
        }
      }

      // Load other configs into form
      items.forEach((item: ISystemConfig) => {
        if (item.configKey !== LOGO_KEY) {
          form.setFieldValue(item.configKey, item.configValue);
        }
      });
    } catch (error) {
      console.error("Failed to fetch configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogo = async () => {
    try {
      setLoading(true);
      let logoValue = form.getFieldValue(LOGO_KEY);

      // Handle file upload if there's a new file in logoFileList
      if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
        const uploadedUrl = await uploadFile(logoFileList[0].originFileObj as File, "system");
        if (uploadedUrl) {
          logoValue = uploadedUrl;
        } else {
          message.error("Không thể tải lên logo.");
          return;
        }
      }

      let logoConfig = configs.find(x => x.configKey === LOGO_KEY);

      if (logoConfig) {
        await updateSystemConfig(logoConfig.id, { ...logoConfig, configValue: logoValue });
      } else {
        await createSystemConfig({ configKey: LOGO_KEY, configValue: logoValue, description: "Site Logo" });
      }
      message.success("Đã lưu logo thành công.");
      fetchConfigs();
    } catch (error) {
      console.error("Failed to save logo:", error);
      message.error("Lỗi khi lưu logo.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      for (const key in values) {
        const config = configs.find(x => x.configKey === key);
        if (config) {
          if (config.configValue !== values[key]) {
            await updateSystemConfig(config.id, { ...config, configValue: values[key] });
          }
        } else {
          await createSystemConfig({ configKey: key, configValue: values[key] });
        }
      }
      fetchConfigs();
    } catch (error) {
      console.error("Failed to save configs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Cấu hình hệ thống">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Logo trang web</h4>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item name={LOGO_KEY} label="Đường dẫn Logo (URL) hoặc Tải lên">
                  <CoreInput placeholder="https://example.com/logo.png hoặc /uploads/logo.png" />
                </Form.Item>
                <div className="mt-2">
                  <CoreUpload
                    fileList={logoFileList}
                    onChange={({ fileList }) => setLogoFileList(fileList)}
                    maxCount={1}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex items-center gap-4">
                  {logoFileList.length > 0 && (
                    <div className="border p-2 rounded bg-slate-100">
                      <img
                        src={logoFileList[0].url || (logoFileList[0].originFileObj ? URL.createObjectURL(logoFileList[0].originFileObj as any) : "")}
                        alt="Logo Preview"
                        style={{ maxHeight: 64 }}
                      />
                    </div>
                  )}
                  <CoreButton
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveLogo}
                    loading={loading}
                  >
                    Lưu Logo
                  </CoreButton>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          <h4 className="text-lg font-semibold mb-4">Thông tin liên hệ & SEO</h4>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="SiteName" label="Tên trang web">
                <CoreInput />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="SiteEmail" label="Email liên hệ">
                <CoreInput />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="SitePhone" label="Số điện thoại">
                <CoreInput />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="SiteAddress" label="Địa chỉ">
                <CoreInput />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <h4 className="text-lg font-semibold mb-4">Cấu hình Footer</h4>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="FooterCopyright" label="Bản quyền (Copyright)">
                <CoreInput placeholder="Kings Of Neon® USA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="FooterWebsiteBy" label="Thiết kế bởi (Website By)">
                <CoreInput placeholder="Kings Of Neon" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="FooterPaymentIcons" label="Payment Icons (Ngăn cách bởi dấu phẩy)">
                <CoreInput placeholder="pi-amazon,pi-american_express,pi-apple_pay,..." />
                <div className="text-xs text-slate-500 mt-1 italic">Danh sách các icon thanh toán (ví dụ: pi-visa, pi-master, pi-google_pay)</div>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="FooterReviewBadges" label="Review Badges (Đường dẫn ảnh, ngăn cách bởi dấu phẩy)">
                <CoreInput placeholder="/google-reviews.avif,/product-reviews.avif" />
                <div className="text-xs text-slate-500 mt-1 italic">Đường dẫn tới các logo đánh giá (ví dụ: /google-reviews.avif)</div>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-4">
            <CoreButton type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Lưu tất cả cấu hình
            </CoreButton>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;
