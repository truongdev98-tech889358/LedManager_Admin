import {
  CoreButton,
  CoreInput,
  CoreInputNumber,
  CoreSelect,
  CoreSwitch,
  CoreUpload,
} from "@/components";
import { Form, Row, Col, Tabs, Divider, Space, Tag, Card, Breadcrumb, ColorPicker } from "antd";

import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import JoditEditor from 'jodit-react';

import { useNavigate, useParams } from "react-router-dom";

import { BASE_URL, PageEnum } from "@/configs/constants";
import { getCategories } from "@/container/Categories/apis";
import { createProduct, updateProduct, getProductById } from "../apis";
import { toSlug } from "@/utils/helper";
import type { UploadFile } from "antd/es/upload/interface";

const ProductForm = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Start typings...',
      height: 400,
    }),
    []
  );

  const [primaryImageIdentifier, setPrimaryImageIdentifier] = useState<string>("");

  // Determine mode from URL path
  const pathname = window.location.pathname;
  const mode: "add" | "edit" | "view" = pathname.includes("/add")
    ? "add"
    : pathname.includes("/edit")
      ? "edit"
      : "view";

  const buildTreeFromFlat = (items: any[]) => {
    const rootItems: any[] = [];
    const lookup: any = {};

    const hasChildren = items.some(i => i.children && i.children.length > 0);
    if (hasChildren) return items;

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

      setCategories(flattenedItems.map((cat: any) => ({
        label: (cat.level > 0 ? '\u00A0\u00A0'.repeat(cat.level) + '└─ ' : '') + cat.name,
        value: cat.id
      })));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id && (mode === "edit" || mode === "view")) {
      fetchProduct();
    }
  }, [id, mode]);

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getProductById(parseInt(id));

      form.setFieldsValue({
        ...data,
        accordions: data.accordions || [],
        contentBlocks: data.contentBlocks || [],
        packageIncludes: data.packageIncludes || [],
        specifications: data.specifications || [],
        variants: data.variants || [],
      });
      if (data.images) {
        const mappedFiles = data.images.map((img) => ({
          uid: img.id!.toString(),
          name: img.url?.split("/").pop() || "image.png",
          status: "done" as const,
          url: `${BASE_URL || ""}${img.url}`,
          originalUrl: img.url,
        }));
        setFileList(mappedFiles);

        const primary = data.images.find((img: any) => img.isPrimary);
        if (primary) {
          setPrimaryImageIdentifier(primary.url!);
        } else if (data.images.length > 0) {
          setPrimaryImageIdentifier(data.images[0].url!);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form Values:', values);
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug || "");
      formData.append("description", values.description || "");
      formData.append("content", values.content || "");
      // Note: stockQuantity is auto-calculated, don't send it
      formData.append("usageSupport", values.usageSupport || "");
      formData.append("outdoorPriceUpgrade", (values.outdoorPriceUpgrade || 0).toString());
      formData.append("isFeatured", values.isFeatured ? "true" : "false");
      formData.append("primaryImageIdentifier", primaryImageIdentifier);

      // Multi-category support
      const categoryIds = values.categoryIds || [];
      if (categoryIds.length > 0) {
        formData.append("categoryIdsJson", JSON.stringify(categoryIds));
      } else {
        formData.append("categoryIdsJson", "[]");
      }

      // Serialize complex lists to JSON - Default to [] if null to ensure backend receives it
      formData.append("specificationsJson", JSON.stringify(values.specifications || []));
      formData.append("variantsJson", JSON.stringify(values.variants || []));
      formData.append("packageIncludesJson", JSON.stringify(values.packageIncludes || []));
      formData.append("contentBlocksJson", JSON.stringify(values.contentBlocks || []));
      formData.append("accordionsJson", JSON.stringify(values.accordions || []));

      // Add variant images
      if (values.variants) {
        values.variants.forEach((v: any, index: number) => {
          let fileObj = null;

          if (v.imageFile) {
            if (v.imageFile.fileList && v.imageFile.fileList.length > 0) {
              fileObj = v.imageFile.fileList[0].originFileObj;
            } else if (v.imageFile.file?.originFileObj) {
              fileObj = v.imageFile.file.originFileObj;
            } else if (v.imageFile.originFileObj) {
              fileObj = v.imageFile.originFileObj;
            }
          }

          if (fileObj) {
            formData.append(`variantImage_${index}`, fileObj);
          }
        });
      }

      // Add content block images
      if (values.contentBlocks) {
        values.contentBlocks.forEach((cb: any, index: number) => {
          let fileObj = null;

          if (cb.imageFile) {
            if (cb.imageFile.fileList && cb.imageFile.fileList.length > 0) {
              fileObj = cb.imageFile.fileList[0].originFileObj;
            } else if (cb.imageFile.file?.originFileObj) {
              fileObj = cb.imageFile.file.originFileObj;
            } else if (cb.imageFile.originFileObj) {
              fileObj = cb.imageFile.originFileObj;
            }
          }

          if (fileObj) {
            formData.append(`contentBlockImage_${index}`, fileObj);
          }
        });
      }

      // Image handling
      const existingImageUrls = fileList
        .filter(f => !f.originFileObj && (f.url || (f as any).originalUrl))
        .map(f => (f as any).originalUrl || f.url);

      if (existingImageUrls.length > 0) {
        existingImageUrls.forEach(url => {
          formData.append("existingImages", url);
        });
      }

      // Add NEW product images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          if (mode === "add") {
            formData.append("imageFiles", file.originFileObj);
          } else {
            formData.append("newImageFiles", file.originFileObj);
          }
        }
      });

      if (mode === "add") {
        await createProduct(formData);
      } else {
        formData.append("id", id!);
        await updateProduct(parseInt(id!), formData);
      }

      navigate("/" + PageEnum.Products);
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && !primaryImageIdentifier) {
      const firstFile = newFileList[0];
      setPrimaryImageIdentifier(firstFile.originalUrl || firstFile.name);
    }
  };

  const handleSetPrimary = (file: UploadFile) => {
    const identifier = (file as any).originalUrl || file.name;
    setPrimaryImageIdentifier(identifier);
  };

  return (
    <div className="p-2 md:p-4 lg:p-6">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate("/" + PageEnum.Products)}>{t("menu.productManagement")}</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {mode === "add" ? t("product.add") : mode === "edit" ? t("product.edit") : t("product.view")}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Form form={form} layout="vertical" disabled={mode === "view"}>
          <Tabs defaultActiveKey="1">
            {/* Basic Info Tab */}
            <Tabs.TabPane tab={t("product.basicInfo")} key="1" forceRender={true}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label={t("product.name")}
                    rules={[{ required: true, message: t("product.nameRequired") }]}
                  >
                    <CoreInput
                      placeholder={t("product.namePlaceholder")}
                      onChange={(e) => {
                        const name = e.target.value;
                        const currentSlug = form.getFieldValue("slug");
                        // Only auto-generate slug if it was empty or matches previous auto-gen
                        // For simplicity, we'll just always update if it's "add" mode or if slug is empty
                        if (mode === "add" || !currentSlug) {
                          form.setFieldsValue({ slug: toSlug(name) });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="slug" label={t("product.slug")}>
                    <CoreInput placeholder={t("product.slugPlaceholder")} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="categoryIds"
                    label={t("product.categories")}
                    rules={[{ required: true, message: t("product.categoriesRequired") }]}
                  >
                    <CoreSelect
                      mode="multiple"
                      options={categories}
                      placeholder={t("product.categoriesPlaceholder")}
                    />
                  </Form.Item>
                </Col>
              </Row>



              <Form.Item name="description" label={t("product.shortDescription")} trigger="onBlur" valuePropName="value">
                <JoditEditor config={config} />
              </Form.Item>

              <Form.Item name="content" label={t("product.fullDescription")} trigger="onBlur" valuePropName="value">
                <JoditEditor
                  ref={editor}
                  config={config}
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="usageSupport" label={t("product.usageSupport")}>
                    <CoreSelect
                      options={[
                        { label: t("product.indoor"), value: "Indoor" },
                        { label: t("product.outdoor"), value: "Outdoor" },
                        { label: t("product.both"), value: "Both" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="outdoorPriceUpgrade" label={t("product.outdoorPriceUpgrade")}>
                    <CoreInputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="isFeatured" label={t("product.featured")} valuePropName="checked">
                    <CoreSwitch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{t("product.images")}</Divider>
              <Form.Item label={t("product.images")}>
                <CoreUpload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  multiple
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                  </div>
                </CoreUpload>
                {fileList.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p>{t("product.setPrimary")}:</p>
                    <Space wrap>
                      {fileList.map((file) => {
                        const identifier = (file as any).originalUrl || file.name;
                        const isPrimary = identifier === primaryImageIdentifier;
                        return (
                          <Tag
                            key={file.uid}
                            color={isPrimary ? "blue" : "default"}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSetPrimary(file)}
                          >
                            {file.name} {isPrimary && "✓"}
                          </Tag>
                        );
                      })}
                    </Space>
                  </div>
                )}
              </Form.Item>
            </Tabs.TabPane>

            {/* Variants Tab */}
            <Tabs.TabPane tab={t("product.variantsTab")} key="2" forceRender={true}>
              <p style={{ marginBottom: 16, color: "#666" }}>
                {t("product.variantsNote")}
              </p>

              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={t("product.variantNum", { num: field.name + 1 })}
                        extra={
                          <CoreButton
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          >
                            {t("common.delete")}
                          </CoreButton>
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Form.Item name={[field.name, "id"]} hidden>
                          <CoreInput />
                        </Form.Item>
                        <Form.Item name={[field.name, "imageUrl"]} hidden>
                          <CoreInput />
                        </Form.Item>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              name={[field.name, "type"]}
                              label={t("product.variantType")}
                              rules={[{ required: true, message: t("product.variantTypeRequired") }]}
                            >
                              <CoreSelect
                                options={[
                                  { label: t("product.size"), value: "Size" },
                                  { label: t("product.color"), value: "Color" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              name={[field.name, "label"]}
                              label={t("product.variantLabel")}
                              rules={[{ required: true, message: t("product.variantLabelRequired") }]}
                            >
                              <CoreInput placeholder={t("product.variantLabelPlaceholder")} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              name={[field.name, "price"]}
                              label={t("product.variantPrice")}
                              rules={[{ required: true, message: t("product.priceRequired") }]}
                            >
                              <CoreInputNumber
                                min={0}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              name={[field.name, "originalPrice"]}
                              label={t("product.variantOriginalPrice")}
                            >
                              <CoreInputNumber
                                min={0}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) =>
                                prevValues.variants?.[field.name]?.type !== currentValues.variants?.[field.name]?.type
                              }
                            >
                              {({ getFieldValue }) => {
                                const variantType = getFieldValue(["variants", field.name, "type"]);
                                return (
                                  <Form.Item name={[field.name, "value"]} label={t("product.variantValue")}>
                                    {variantType === "Color" ? (
                                      <ColorPicker
                                        showText
                                        format="hex"
                                        onChange={(_, hex) => {
                                          const variants = form.getFieldValue("variants");
                                          variants[field.name].value = hex;
                                          form.setFieldsValue({ variants });
                                        }}
                                        value={getFieldValue(["variants", field.name, "value"]) || "#1677ff"}
                                      />
                                    ) : (
                                      <CoreInput placeholder={t("product.variantValuePlaceholder")} />
                                    )}
                                  </Form.Item>
                                );
                              }}
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item
                              name={[field.name, "stockQuantity"]}
                              label={t("product.variantStock")}
                              rules={[{ required: true, message: t("product.stockRequired") }]}
                            >
                              <CoreInputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item name={[field.name, "imageFile"]} label={t("product.variantImage")}>
                              <CoreUpload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false}
                              >
                                <div>
                                  <PlusOutlined />
                                  <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                                </div>
                              </CoreUpload>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <CoreButton
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("product.addVariant")}
                    </CoreButton>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>

            {/* Specifications Tab */}
            <Tabs.TabPane tab={t("product.specificationsTab")} key="3" forceRender={true}>
              <Form.List name="specifications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Row key={field.key} gutter={[16, 8]} align="middle">
                        <Form.Item name={[field.name, "id"]} hidden>
                          <CoreInput />
                        </Form.Item>
                        <Col xs={24} sm={10}>
                          <Form.Item
                            name={[field.name, "key"]}
                            rules={[{ required: true, message: t("product.specKeyRequired") }]}
                          >
                            <CoreInput placeholder={t("product.specKey")} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={10}>
                          <Form.Item
                            name={[field.name, "value"]}
                            rules={[{ required: true, message: t("product.specValueRequired") }]}
                          >
                            <CoreInput placeholder={t("product.specValue")} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={3}>
                          <Form.Item name={[field.name, "displayOrder"]}>
                            <CoreInputNumber placeholder={t("product.specOrder")} min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={1}>
                          <CoreButton
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <CoreButton
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("product.addSpec")}
                    </CoreButton>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>

            {/* Package Includes Tab */}
            <Tabs.TabPane tab={t("product.packageTab")} key="4" forceRender={true}>
              <Form.List name="packageIncludes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Row key={field.key} gutter={16} align="middle">
                        <Form.Item name={[field.name, "id"]} hidden>
                          <CoreInput />
                        </Form.Item>
                        <Col span={18}>
                          <Form.Item
                            name={[field.name, "itemName"]}
                            rules={[{ required: true, message: t("product.itemNameRequired") }]}
                          >
                            <CoreInput placeholder={t("product.itemName")} />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name={[field.name, "quantity"]}
                            rules={[{ required: true, message: t("product.itemQtyRequired") }]}
                          >
                            <CoreInputNumber placeholder={t("product.itemQty")} min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <CoreButton
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <CoreButton
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("product.addPackageItem")}
                    </CoreButton>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>

            {/* Content Blocks Tab */}
            <Tabs.TabPane tab={t("product.contentBlocksTab")} key="5" forceRender={true}>
              <p style={{ marginBottom: 16, color: "#666" }}>
                {t("product.contentBlocksNote")}
              </p>
              <Form.List name="contentBlocks">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={t("product.blockNum", { num: field.name + 1 })}
                        extra={
                          <CoreButton
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          >
                            {t("common.delete")}
                          </CoreButton>
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={[16, 16]}>
                          <Form.Item name={[field.name, "id"]} hidden>
                            <CoreInput />
                          </Form.Item>
                          <Form.Item name={[field.name, "imageUrl"]} hidden>
                            <CoreInput />
                          </Form.Item>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[field.name, "title"]}
                              label={t("product.title")}
                              rules={[{ required: true, message: t("product.titleRequired") }]}
                            >
                              <CoreInput placeholder={t("product.titlePlaceholder")} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[field.name, "textPosition"]}
                              label={t("product.textPosition")}
                              initialValue="Left"
                            >
                              <CoreSelect
                                options={[
                                  { label: t("product.left"), value: "Left" },
                                  { label: t("product.right"), value: "Right" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          name={[field.name, "description"]}
                          label={t("common.description")}
                          trigger="onBlur"
                          valuePropName="value"
                        >
                          <JoditEditor config={config} />
                        </Form.Item>
                        <Form.Item name={[field.name, "imageFile"]} label={t("product.blockImage")}>
                          <CoreUpload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                          >
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
                            </div>
                          </CoreUpload>
                        </Form.Item>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item
                              name={[field.name, "buttonText"]}
                              label={t("product.btnText")}
                            >
                              <CoreInput placeholder={t("product.btnTextPlaceholder")} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item
                              name={[field.name, "buttonLink"]}
                              label={t("product.btnLink")}
                            >
                              <CoreInput placeholder="/comparison" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              name={[field.name, "displayOrder"]}
                              label={t("product.displayOrder")}
                              initialValue={field.key}
                            >
                              <CoreInputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <CoreButton
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("product.addContentBlock")}
                    </CoreButton>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>

            {/* Accordions Tab */}
            <Tabs.TabPane tab={t("product.accordionsTab")} key="6" forceRender={true}>
              <p style={{ marginBottom: 16, color: "#666" }}>
                {t("product.accordionsNote")}
              </p>
              <Form.List name="accordions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={t("product.accordionNum", { num: field.name + 1 })}
                        extra={
                          <CoreButton
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          >
                            {t("common.delete")}
                          </CoreButton>
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={[16, 16]}>
                          <Form.Item name={[field.name, "id"]} hidden>
                            <CoreInput />
                          </Form.Item>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name={[field.name, "title"]}
                              label={t("product.title")}
                              rules={[{ required: true, message: t("product.titleRequired") }]}
                            >
                              <CoreInput placeholder={t("product.titlePlaceholder")} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Item
                              name={[field.name, "displayOrder"]}
                              label={t("product.displayOrder")}
                              initialValue={field.key}
                            >
                              <CoreInputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Item
                              name={[field.name, "isExpanded"]}
                              label={t("product.expanded")}
                              valuePropName="checked"
                            >
                              <CoreSwitch />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          name={[field.name, "content"]}
                          label={t("product.content")}
                          trigger="onBlur"
                          valuePropName="value"
                        >
                          <JoditEditor config={config} />
                        </Form.Item>
                      </Card>
                    ))}
                    <CoreButton
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("product.addAccordion")}
                    </CoreButton>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>
          </Tabs>

          <Divider />

          <Space>
            <CoreButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(PageEnum.Products)}
            >
              {t("common.back")}
            </CoreButton>
            {mode !== "view" && (
              <CoreButton type="primary" onClick={handleSubmit} loading={loading}>
                {mode === "add" ? t("product.add") : t("product.edit")}
              </CoreButton>
            )}
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ProductForm;
