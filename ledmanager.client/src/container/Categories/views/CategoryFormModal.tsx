import {
  CoreButton,
  CoreInput,
  CoreModal,
  CoreSelect,
  CoreTextArea,
  CoreUpload,
  CoreCheckbox,
} from "@/components";
import { Form, Col, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createCategory, getCategories, updateCategory } from "../apis";
import { BASE_URL } from "@/configs/constants";
import type { UploadFile } from "antd/es/upload/interface";

interface ICategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: any;
  mode: "add" | "edit" | "view";
}

const CategoryFormModal = ({ open, onClose, onSuccess, category, mode }: ICategoryFormModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const buildTreeFromFlat = (items: any[]) => {
    const rootItems: any[] = [];
    const lookup: any = {};

    // Simplest heuristic: if we see children populated, assume it's a tree.
    const hasChildren = items.some(i => i.children && i.children.length > 0);
    if (hasChildren) return items; // Already a tree

    items.forEach(item => {
      lookup[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parentId && lookup[item.parentId]) {
        lookup[item.parentId].children.push(lookup[item.id]);
      } else {
        rootItems.push(lookup[item.id]);
      }
    });

    return rootItems;
  };

  const flattenCategories = (categories: any[], level = 0, result: any[] = []) => {
    categories.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, level + 1, result);
      }
    });
    return result;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories({ pageSize: 100 });

      const rawItems = data?.items || [];
      const treeItems = buildTreeFromFlat(rawItems);
      const flattenedItems = flattenCategories(treeItems);

      const options = flattenedItems
        .filter((item: any) => mode !== 'edit' || item.id !== category?.id)
        .map((cat: any) => ({
          label: cat.name,
          value: cat.id
        }));
      setCategories(options);
    };
    fetchCategories();
  }, [open, mode, category]);

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue(category);
        if (category.imageUrl) {
          setFileList([{
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: `${BASE_URL || ""}${category.imageUrl}`,
          }]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, category, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description || "");
      formData.append("parentId", values.parentId?.toString() || "");
      formData.append("isFeatured", values.isFeatured ? "true" : "false");

      if (mode === "add") {
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("imageFile", fileList[0].originFileObj);
        }
        const success = await createCategory(formData);
        if (success) {
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && category) {
        // Handle existing image
        if (fileList.length > 0 && !fileList[0].originFileObj && fileList[0].url) {
          const url = fileList[0].url.replace(BASE_URL || "", "");
          formData.append("existingImageUrl", url);
        }

        // Handle new image
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("newImageFile", fileList[0].originFileObj);
        }

        const success = await updateCategory(category.id, formData);
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
    add: t("category.add"),
    edit: t("category.edit"),
    view: t("category.view"),
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
            <Form.Item name="name" label={t("category.name")} rules={[{ required: true }]}>
              <CoreInput onChange={(e) => mode === "add" && form.setFieldsValue({ slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") })} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="slug" label={t("category.slug")} rules={[{ required: true }]}>
              <CoreInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="parentId" label={t("category.parent")}>
              <CoreSelect options={categories} allowClear placeholder={t("category.parentPlaceholder")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="isFeatured" valuePropName="checked">
              <CoreCheckbox>{t("category.featured")}</CoreCheckbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label={t("common.description")}>
              <CoreTextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={t("dataTable.image")}>
              <CoreUpload
                listType="picture-card"
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                disabled={mode === "view"}
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                  </div>
                )}
              </CoreUpload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </CoreModal>
  );
};

export default CategoryFormModal;
