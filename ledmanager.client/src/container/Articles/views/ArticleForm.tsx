import {
    CoreButton,
    CoreInput,
    CoreSelect,
    CoreTextArea,
    CoreUpload,
} from "@/components";
import { Form, Row, Col, Card, Breadcrumb, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import JoditEditor from 'jodit-react';
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL, PageEnum } from "@/configs/constants";
import { createArticle, updateArticle, getArticleById, getArticleCategories } from "../apis";
import type { UploadFile } from "antd/es/upload/interface";

const ArticleForm = () => {
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

    // Determine mode from URL path
    const pathname = window.location.pathname;
    const mode: "add" | "edit" | "view" = pathname.includes("/add")
        ? "add"
        : pathname.includes("/edit")
            ? "edit"
            : "view";

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getArticleCategories();
            const options = (data?.items || []).map((cat: any) => ({
                label: cat.name,
                value: cat.id
            }));
            setCategories(options);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (id && (mode === "edit" || mode === "view")) {
            fetchArticle();
        }
    }, [id, mode]);

    const fetchArticle = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getArticleById(parseInt(id));
            form.setFieldsValue(data);

            if (data.imageUrl) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: `${BASE_URL || ""}${data.imageUrl}`,
                }]);
            }
        } catch (error) {
            console.error("Failed to fetch article:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("slug", values.slug || "");
            formData.append("summary", values.summary || "");
            formData.append("content", values.content || "");
            formData.append("categoryId", values.categoryId.toString());

            // Handle existing image
            if (fileList.length > 0 && !fileList[0].originFileObj && fileList[0].url) {
                const url = fileList[0].url.replace(BASE_URL || "", "");
                formData.append("imageUrl", url);
            }

            // Handle new image
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("imageFile", fileList[0].originFileObj);
            }

            // Handle Sections
            if (values.sections && Array.isArray(values.sections)) {
                // Remove internal file objects from JSON logic to avoid circular refs or unnecessary data,
                // and handle files separately.
                const sectionsData = values.sections.map((s: any) => ({
                    ...s,
                    imageFile: undefined, // Don't send file object in JSON
                    imageUrl: s.imageUrl // Keep existing URL if any
                }));
                formData.append("sectionsJson", JSON.stringify(sectionsData));

                // Append files
                values.sections.forEach((section: any, index: number) => {
                    let fileObj = null;
                    if (section.imageFile) {
                        if (section.imageFile.fileList && section.imageFile.fileList.length > 0) {
                            fileObj = section.imageFile.fileList[0].originFileObj;
                        } else if (section.imageFile.file?.originFileObj) {
                            fileObj = section.imageFile.file.originFileObj;
                        } else if (section.imageFile.originFileObj) {
                            fileObj = section.imageFile.originFileObj;
                        }
                    }

                    if (fileObj) {
                        formData.append(`sectionImage_${index}`, fileObj);
                    }
                });
            }

            if (mode === "add") {
                await createArticle(formData);
            } else {
                await updateArticle(parseInt(id!), formData);
            }

            navigate("/" + PageEnum.Articles);
        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 md:p-4 lg:p-6">
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <a onClick={() => navigate("/" + PageEnum.Articles)}>{t("menu.articleManagement")}</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {mode === "add" ? t("article.add") : mode === "edit" ? t("article.edit") : t("article.view")}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Card>
                <Form form={form} layout="vertical" disabled={mode === "view"}>
                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab={t("article.generalInfo")} key="1">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="title" label={t("article.title")} rules={[{ required: true }]}>
                                        <CoreInput onChange={(e) => mode === "add" && form.setFieldsValue({ slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") })} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="slug" label={t("article.slug")} rules={[{ required: true }]}>
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="categoryId" label={t("article.category")} rules={[{ required: true }]}>
                                        <CoreSelect options={categories} placeholder={t("article.categoryPlaceholder")} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="summary" label={t("article.summary")}>
                                        <CoreTextArea rows={3} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="content" label={t("article.mainContent")} trigger="onBlur" valuePropName="value">
                                        <JoditEditor
                                            ref={editor}
                                            config={config}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={t("article.featureImage")}>
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
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={t("article.contentSections")} key="2">
                            <Form.List name="sections">
                                {(fields, { add, remove }) => (
                                    <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                        {fields.map((field) => (
                                            <Card
                                                size="small"
                                                title={t("article.sectionNum", { num: field.name + 1 })}
                                                key={field.key}
                                                extra={<PlusOutlined onClick={() => remove(field.name)} style={{ transform: 'rotate(45deg)', color: 'red', cursor: 'pointer' }} />}
                                            >
                                                <Row gutter={[16, 16]}>
                                                    <Form.Item name={[field.name, "id"]} hidden><CoreInput /></Form.Item>
                                                    <Form.Item name={[field.name, "imageUrl"]} hidden><CoreInput /></Form.Item>

                                                    <Col xs={24} sm={12} md={8}>
                                                        <Form.Item label={t("article.sectionType")} name={[field.name, 'sectionType']} initialValue="Text">
                                                            <CoreSelect options={[
                                                                { label: t("article.standardText"), value: 'Text' },
                                                                { label: t("article.imageLeft"), value: 'ImageLeft' },
                                                                { label: t("article.imageRight"), value: 'ImageRight' },
                                                                { label: t("article.fullWidthImage"), value: 'FullWidthImage' },
                                                                { label: t("article.imageTextOverlay"), value: 'ImageTextOverlay' },
                                                                { label: t("article.gallery"), value: 'Gallery' },
                                                                { label: t("article.cta"), value: 'CTA' },
                                                            ]} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Form.Item label={t("article.sectionTitle")} name={[field.name, 'title']}>
                                                            <CoreInput />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={8}>
                                                        <Form.Item label={t("article.order")} name={[field.name, 'displayOrder']} initialValue={field.name}>
                                                            <CoreInput type="number" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item label={t("article.content")} name={[field.name, 'content']}>
                                                            <CoreTextArea rows={4} />
                                                        </Form.Item>
                                                    </Col>
                                                    {/* Image Upload for Section */}
                                                    <Col span={24}>
                                                        {/* Note: We need to manually handle initialValue for fileList if modifying existing. 
                                                           However, Form.List with nested Upload binding is tricky for initial values. 
                                                           The simplest way in Antd Form List w/ Upload is to rely on 'normFile' or component handling.
                                                           We will reuse the CoreUpload but we might need to display existing image if not changed. 
                                                           Since 'CoreUpload' is controlled by 'fileList', passing it via Form props is hard.
                                                           We will try to let CoreUpload handle it if we pass 'defaultFileList' or bind properly.
                                                           Actually 'CoreUpload' expects 'fileList' prop. 
                                                           Inside Form.List, accessing the specific file list state is hard. 
                                                           Alternative: Use a simple message "Re-upload to change" and show existing URL as text/image below?
                                                           Or try to bind valuePropName="fileList".
                                                       */}
                                                        <Form.Item
                                                            label={t("article.sectionImage")}
                                                            name={[field.name, 'imageFile']}
                                                        // valuePropName="fileList" // CoreUpload might not be 100% compatible with direct form binding without adapter
                                                        >
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
                                                        {/* Show existing image if available (and not replaced? handling that is complex, just show helper) */}
                                                        <Form.Item shouldUpdate={(prev, curr) => prev.sections?.[field.name]?.imageUrl !== curr.sections?.[field.name]?.imageUrl}>
                                                            {({ getFieldValue }) => {
                                                                const imgUrl = getFieldValue(['sections', field.name, 'imageUrl']);
                                                                return imgUrl ? <div style={{ marginBottom: 10 }}><p>{t("article.currentImage")}:</p><img src={`${BASE_URL}${imgUrl}`} style={{ maxWidth: 100 }} /></div> : null;
                                                            }}
                                                        </Form.Item>
                                                    </Col>

                                                    {/* Button Fields */}
                                                    <Col xs={24} md={12}>
                                                        <Form.Item label={t("article.btnText")} name={[field.name, 'buttonText']}>
                                                            <CoreInput placeholder={t("article.learnMore")} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item label={t("article.btnLink")} name={[field.name, 'buttonLink']}>
                                                            <CoreInput placeholder={t("article.contactLink")} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                        <CoreButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            {t("article.add")}
                                        </CoreButton>
                                    </div>
                                )}
                            </Form.List>
                        </Tabs.TabPane>
                    </Tabs>

                    {mode !== "view" && (
                        <Row justify="end" gutter={16}>
                            <Col>
                                <CoreButton onClick={() => navigate("/" + PageEnum.Articles)}>
                                    {t("common.cancel")}
                                </CoreButton>
                            </Col>
                            <Col>
                                <CoreButton type="primary" onClick={handleSubmit} loading={loading}>
                                    {t("common.save")}
                                </CoreButton>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default ArticleForm;
