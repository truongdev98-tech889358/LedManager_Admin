import {
    CoreButton,
    CoreInput,
    CoreSelect,
    CoreTextArea,
    CoreUpload,
    CoreSwitch,
    CoreInputNumber,
} from "@/components";
import { Form, Col, Row, Card, Breadcrumb } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProductFeature, updateProductFeature, getProductFeatureById } from "../apis";
import { BASE_URL, PageEnum } from "@/configs/constants";
import type { UploadFile } from "antd/es/upload/interface";

const ProductFeatureForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [iconFileList, setIconFileList] = useState<UploadFile[]>([]);

    const pathname = window.location.pathname;
    const mode: "add" | "edit" | "view" = pathname.includes("/add")
        ? "add"
        : pathname.includes("/edit")
            ? "edit"
            : "view";

    const blockTypeOptions = [
        { label: "Product Feature", value: "ProductFeature" },
        { label: "How It Works Step", value: "HowItWorksStep" },
    ];

    const positionOptions = [
        { label: "Product Detail", value: "ProductDetail" },
        { label: "Home Page - How It Works", value: "HomePage_HowItWorks" },
    ];

    useEffect(() => {
        if (id && (mode === "edit" || mode === "view")) {
            fetchFeature();
        }
    }, [id, mode]);

    const fetchFeature = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getProductFeatureById(parseInt(id));
            if (data) {
                form.setFieldsValue(data);
                if (data.iconUrl) {
                    setIconFileList([{
                        uid: '-1',
                        name: 'icon.png',
                        status: 'done',
                        url: `${BASE_URL || ""}${data.iconUrl}`,
                    }]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch feature:", error);
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
            formData.append("description", values.description || "");
            formData.append("blockType", values.blockType || "ProductFeature");
            formData.append("position", values.position || "ProductDetail");
            formData.append("displayOrder", values.displayOrder?.toString() || "0");
            formData.append("isActive", values.isActive?.toString() || "true");

            if (mode === "add") {
                if (iconFileList.length > 0 && iconFileList[0].originFileObj) {
                    formData.append("iconFile", iconFileList[0].originFileObj);
                }
                await createProductFeature(formData);
            } else {
                formData.append("iconUrl", values.iconUrl || "");
                if (iconFileList.length > 0 && iconFileList[0].originFileObj) {
                    formData.append("iconFile", iconFileList[0].originFileObj);
                }
                await updateProductFeature(parseInt(id!), formData);
            }

            navigate(`/${PageEnum.ProductFeatures}`);
        } catch (error) {
            console.error("Failed to save feature:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Breadcrumb
                items={[
                    { title: "Content Blocks" },
                    { title: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
                ]}
                className="mb-4"
            />

            <Card
                title={
                    <div className="flex items-center gap-2">
                        <CoreButton
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/${PageEnum.ProductFeatures}`)}
                            variant="text"
                        />
                        <span>{mode === "add" ? "Add Content Block" : mode === "edit" ? "Edit Content Block" : "View Content Block"}</span>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        blockType: "ProductFeature",
                        position: "ProductDetail",
                        displayOrder: 0,
                        isActive: true,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: "Please enter title" }]}
                            >
                                <CoreInput disabled={mode === "view"} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="blockType"
                                label="Block Type"
                                rules={[{ required: true }]}
                            >
                                <CoreSelect options={blockTypeOptions} disabled={mode === "view"} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="position"
                                label="Position"
                                rules={[{ required: true }]}
                            >
                                <CoreSelect options={positionOptions} disabled={mode === "view"} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="displayOrder" label="Display Order">
                                <CoreInputNumber min={0} disabled={mode === "view"} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: "Please enter description" }]}
                            >
                                <CoreTextArea rows={4} disabled={mode === "view"} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Icon" required>
                                <CoreUpload
                                    fileList={iconFileList}
                                    onChange={({ fileList }) => setIconFileList(fileList)}
                                    maxCount={1}
                                    accept="image/*"
                                    disabled={mode === "view"}
                                    listType="picture-card"
                                >
                                    {iconFileList.length === 0 && mode !== "view" && "+ Upload"}
                                </CoreUpload>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="isActive" label="Active" valuePropName="checked">
                                <CoreSwitch disabled={mode === "view"} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {mode !== "view" && (
                        <div className="flex justify-end gap-2 mt-4">
                            <CoreButton onClick={() => navigate(`/${PageEnum.ProductFeatures}`)}>
                                Cancel
                            </CoreButton>
                            <CoreButton type="primary" onClick={handleSubmit} loading={loading}>
                                {mode === "add" ? "Create" : "Update"}
                            </CoreButton>
                        </div>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default ProductFeatureForm;
