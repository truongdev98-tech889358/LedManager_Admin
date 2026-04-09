import {
  CoreButton,
  CoreInput,
  CoreInputNumber,
  CoreModal,
  CoreSelect,
  CoreUpload,
} from "@/components";
import { Form, Row, Col, Tabs, Divider, Space, Tag } from "antd";
import { formatNumber } from "@/utils/helper";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import JoditEditor from 'jodit-react';
import type { IProduct } from "../configs/types";
import { BASE_URL } from "@/configs/constants";
import { getCategories } from "@/container/Categories/apis";
import { createProduct, updateProduct } from "../apis";
import type { UploadFile } from "antd/es/upload/interface";

interface IProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: IProduct;
  mode: "add" | "edit" | "view";
}

const ProductFormModal = ({ open, onClose, onSuccess, product, mode }: IProductFormModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Start typings...',
      height: 400,
    }),
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories({ pageSize: 100 });
      setCategories((data?.items || []).map((cat: any) => ({ label: cat.name, value: cat.id })));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue({
          ...product,
        });
        if (product.images) {
          setFileList(
            product.images.map((img) => ({
              uid: img.id.toString(),
              name: img.url?.split("/").pop() || "image.png",
              status: "done",
              url: `${BASE_URL || ""}${img.url}`,
            }))
          );
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description || "");
      formData.append("content", values.content || "");
      formData.append("price", values.price?.toString() || "0");
      formData.append("originalPrice", (values.originalPrice || 0).toString());
      formData.append("stockQuantity", values.stockQuantity?.toString() || "0");
      formData.append("categoryId", values.categoryId?.toString() || "0");
      formData.append("usageSupport", values.usageSupport || "");
      formData.append("outdoorPriceUpgrade", (values.outdoorPriceUpgrade || 0).toString());

      // Serialize complex lists to JSON
      if (values.specifications) formData.append("specificationsJson", JSON.stringify(values.specifications));
      if (values.variants) formData.append("variantsJson", JSON.stringify(values.variants));
      if (values.packageIncludes) formData.append("packageIncludesJson", JSON.stringify(values.packageIncludes));

      // Add variant images
      if (values.variants) {
        values.variants.forEach((v: any, index: number) => {
          // Handle different possible structures from CoreUpload
          let fileObj = null;

          console.log(`Variant ${index} imageFile structure:`, v.imageFile);

          if (v.imageFile) {
            // Check if it's a fileList array (from Upload component)
            if (v.imageFile.fileList && v.imageFile.fileList.length > 0) {
              fileObj = v.imageFile.fileList[0].originFileObj;
              console.log(`Found file via fileList[0].originFileObj for variant ${index}`);
            }
            // Check if it's a single file object
            else if (v.imageFile.file?.originFileObj) {
              fileObj = v.imageFile.file.originFileObj;
              console.log(`Found file via file.originFileObj for variant ${index}`);
            }
            // Check if originFileObj is directly accessible
            else if (v.imageFile.originFileObj) {
              fileObj = v.imageFile.originFileObj;
              console.log(`Found file via originFileObj for variant ${index}`);
            }
          }

          if (fileObj) {
            console.log(`Appending variantImage_${index}:`, (fileObj as File).name);
            formData.append(`variantImage_${index}`, fileObj);
          } else {
            console.log(`No file found for variant ${index}`);
          }
        });
      }

      // Debug: Log all FormData entries
      console.log("=== FormData Contents ===");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log("========================");

      if (mode === "add") {
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("imageFiles", file.originFileObj);
          }
        });
        const success = await createProduct(formData);
        if (success) {
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && product) {
        // Handle existing images
        const existingImages = fileList
          .filter((file) => !file.originFileObj && file.url)
          .map((file) => file.url as string);

        existingImages.forEach(url => {
          formData.append("existingImages", url);
        });

        // Handle new images
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("newImageFiles", file.originFileObj);
          }
        });

        if (product.id) {
          const success = await updateProduct(product.id, formData);
          if (success) {
            onSuccess();
            onClose();
          }
        }
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    add: t("common.add") + " sản phẩm",
    edit: t("common.edit") + " sản phẩm",
    view: t("common.view") + " sản phẩm",
  };

  return (
    <CoreModal
      title={titleMap[mode]}
      open={open}
      onCancel={onClose}
      width={800}
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
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Thông tin cơ bản",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item name="name" label={t("dataTable.productName")} rules={[{ required: true }]}>
                      <CoreInput onChange={(e) => mode === "add" && form.setFieldsValue({ slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") })} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                      <CoreInput />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="categoryId" label={t("dataTable.category")} rules={[{ required: true }]}>
                      <CoreSelect options={categories} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="stockQuantity" label={t("dataTable.stockQuantity")} rules={[{ required: true }]}>
                      <CoreInputNumber className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="price" label={t("dataTable.unitPrice")} rules={[{ required: true }]}>
                      <CoreInputNumber className="w-full" suffix="VND" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="originalPrice" label="Giá gốc">
                      <CoreInputNumber className="w-full" suffix="VND" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="usageSupport" label="Môi trường sử dụng">
                      <CoreSelect
                        options={[
                          { label: "Trong nhà", value: "Indoor" },
                          { label: "Ngoài trời", value: "Outdoor" },
                          { label: "Cả hai", value: "Both" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="outdoorPriceUpgrade" label="Phí nâng cấp ngoài trời">
                      <CoreInputNumber className="w-full" suffix="VND" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="description" label={t("common.description")} trigger="onBlur" valuePropName="value">
                      <JoditEditor config={config} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="content" label="Nội dung chi tiết" trigger="onBlur" valuePropName="value">
                      <JoditEditor config={config} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t("dataTable.image")}>
                      <CoreUpload multiple fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} disabled={mode === "view"} />
                    </Form.Item>
                  </Col>
                  {product && product.variants && product.variants.length > 0 && (
                    <Col span={24}>
                      <Divider orientation="left" plain>
                        <span className="text-xs text-gray-400">Tóm tắt biến thể hiện có</span>
                      </Divider>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v, i) => (
                          <Tag key={i} color={v.type === 'Color' ? 'blue' : 'orange'}>
                            {v.type}: {v.label} - {formatNumber(v.price)}đ
                          </Tag>
                        ))}
                      </div>
                    </Col>
                  )}
                </Row>
              ),
            },
            {
              key: "2",
              label: "Biến thể & Thuộc tính",
              children: (
                <div>
                  <Divider orientation="left">Thông số kỹ thuật</Divider>
                  <Form.List name="specifications">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                            <Form.Item {...restField} name={[name, "key"]} rules={[{ required: true, message: "Nhập tiêu đề" }]}>
                              <CoreInput placeholder="Tiêu đề (v.d: Tuổi thọ)" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "value"]} rules={[{ required: true, message: "Nhập giá trị" }]}>
                              <CoreInput placeholder="Giá trị (v.d: 10 năm)" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "displayOrder"]}>
                              <CoreInputNumber placeholder="Thứ tự" style={{ width: 80 }} />
                            </Form.Item>
                            <CoreButton icon={<DeleteOutlined />} onClick={() => remove(name)} variant="text" color="danger" />
                          </Space>
                        ))}
                        <Form.Item>
                          <CoreButton type="dashed" onClick={() => add()} icon={<PlusOutlined />} className="w-full"> Thêm thông số </CoreButton>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Divider orientation="left">Biến thể (Kích thước / Màu sắc /...)</Divider>
                  <Form.List name="variants">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: "flex", marginBottom: 8, flexWrap: 'wrap' }} align="baseline">
                            <Form.Item {...restField} name={[name, "type"]} rules={[{ required: true }]}>
                              <CoreSelect placeholder="Loại" options={[{ label: 'Size', value: 'Size' }, { label: 'Color', value: 'Color' }]} style={{ width: 100 }} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "label"]} rules={[{ required: true }]}>
                              <CoreInput placeholder="Nhãn (v.d: Small)" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "value"]}>
                              <CoreInput placeholder="Giá trị (v.d: 30x20cm)" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "price"]} rules={[{ required: true, message: "Nhập giá" }]}>
                              <CoreInputNumber placeholder="Giá" suffix="VND" style={{ width: 150 }} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "originalPrice"]}>
                              <CoreInputNumber placeholder="Giá gốc" suffix="VND" style={{ width: 150 }} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "stockQuantity"]}>
                              <CoreInputNumber placeholder="Tồn kho" style={{ width: 100 }} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "imageFile"]}>
                              <CoreUpload
                                listType="picture-card"
                                maxCount={1}
                                showUploadList={true}
                                beforeUpload={() => false}
                                className="variant-upload"
                              >
                                {mode !== 'view' && (
                                  <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Ảnh</div>
                                  </div>
                                )}
                              </CoreUpload>
                            </Form.Item>
                            {form.getFieldValue(['variants', name, 'imageUrl']) && (
                              <div className="ml-2">
                                <img src={`${BASE_URL || ""}${form.getFieldValue(['variants', name, 'imageUrl'])}`} className="w-10 h-10 object-cover rounded" />
                              </div>
                            )}
                            <CoreButton icon={<DeleteOutlined />} onClick={() => remove(name)} variant="text" color="danger" />
                          </Space>
                        ))}
                        <Form.Item>
                          <CoreButton type="dashed" onClick={() => add()} icon={<PlusOutlined />} className="w-full"> Thêm biến thể </CoreButton>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Divider orientation="left">Bộ sản phẩm gồm</Divider>
                  <Form.List name="packageIncludes">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                            <Form.Item {...restField} name={[name, "itemName"]} rules={[{ required: true }]}>
                              <CoreInput placeholder="Tên phụ kiện" style={{ width: 300 }} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "quantity"]} rules={[{ required: true }]}>
                              <CoreInputNumber placeholder="Số lượng" style={{ width: 100 }} />
                            </Form.Item>
                            <CoreButton icon={<DeleteOutlined />} onClick={() => remove(name)} variant="text" color="danger" />
                          </Space>
                        ))}
                        <Form.Item>
                          <CoreButton type="dashed" onClick={() => add()} icon={<PlusOutlined />} className="w-full"> Thêm phụ kiện </CoreButton>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </CoreModal>
  );
};

export default ProductFormModal;
