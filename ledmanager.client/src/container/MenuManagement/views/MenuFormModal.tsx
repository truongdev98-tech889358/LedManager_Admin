import {
  CoreButton,
  CoreInput,
  CoreModal,
  CoreSelect,
  CoreInputNumber,
} from "@/components";
import { Form, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createMenu, getMenus, updateMenu, MenuType } from "../apis";

interface IMenuFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menu?: any;
  mode: "add" | "edit" | "view";
  defaultType?: MenuType;
}

const MenuFormModal = ({ open, onClose, onSuccess, menu, mode, defaultType }: IMenuFormModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parentMenus, setParentMenus] = useState<{ label: string; value: number }[]>([]);
  const selectedType = Form.useWatch("type", form);
  const [allMenus, setAllMenus] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      const data = await getMenus({ pageSize: 100 });
      setAllMenus(data?.items || []);
    };
    if (open) fetchMenus();
  }, [open]);

  useEffect(() => {
    const options = allMenus
      .filter((item: any) => item.type === selectedType)
      .filter((item: any) => mode !== 'edit' || item.id !== menu?.id)
      .map((m: any) => ({
        label: m.name,
        value: m.id
      }));
    setParentMenus(options);
  }, [allMenus, selectedType, mode, menu]);

  useEffect(() => {
    if (open) {
      if (menu) {
        form.setFieldsValue(menu);
      } else {
        form.resetFields();
        form.setFieldsValue({
          sortOrder: 0,
          type: defaultType !== undefined ? defaultType : MenuType.HeaderHorizontal
        });
      }
    }
  }, [open, menu, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (mode === "add") {
        const success = await createMenu(values);
        if (success) {
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && menu) {
        const success = await updateMenu(menu.id, values);
        if (success) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    add: t("common.add") + " Menu",
    edit: t("common.edit") + " Menu",
    view: t("common.view") + " Menu",
  };

  return (
    <CoreModal
      title={titleMap[mode]}
      open={open}
      onCancel={onClose}
      width={600}
      footer={
        mode === "view" ? (
          <CoreButton onClick={onClose}>{t("common.close")}</CoreButton>
        ) : (
          <div className="flex justify-end gap-2">
            <CoreButton onClick={onClose} variant="outlined">
              {t("common.cancel")}
            </CoreButton>
            <CoreButton onClick={handleSubmit} type="primary" loading={loading}>
              {mode === "add" ? t("common.add") : t("common.save")}
            </CoreButton>
          </div>
        )
      }
    >
      <Form form={form} layout="vertical" disabled={mode === "view"}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item name="name" label={t("menu.name")} rules={[{ required: true }]}>
              <CoreInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="link" label={t("menu.link")}>
              <CoreInput placeholder="/laptop-gaming" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label={t("menu.type")} rules={[{ required: true }]}>
              <CoreSelect
                options={[
                  { label: t("menu.headerVertical"), value: MenuType.HeaderVertical },
                  { label: t("menu.headerHorizontal"), value: MenuType.HeaderHorizontal },
                  { label: t("menu.footer"), value: MenuType.Footer },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sortOrder" label={t("menu.sortOrder")}>
              <CoreInputNumber className="w-full" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="parentId" label={t("menu.parent")}>
              <CoreSelect options={parentMenus} allowClear placeholder={t("menu.placeholderParent")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="icon" label={t("menu.icon")}>
              <CoreInput placeholder="Home, Settings, etc." />
            </Form.Item>
          </Col>
          {selectedType === MenuType.Footer && (
            <>
              <Col span={24}>
                <Form.Item name="address" label={t("menu.address")}>
                  <CoreInput placeholder="400 S. 4th Street..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="phoneNumber" label={t("menu.phone")}>
                  <CoreInput placeholder="+1 234 567 890" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="email" label={t("menu.email")}>
                  <CoreInput placeholder="support@example.com" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>
    </CoreModal>
  );
};

export default MenuFormModal;
