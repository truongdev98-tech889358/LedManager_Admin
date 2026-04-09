import {
    CoreButton,
    CoreInput,
    CoreUpload,
} from "@/components";
import { Form, Col, Row, Card, Collapse, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { SaveOutlined, PlusOutlined, DeleteOutlined, MinusCircleOutlined } from "@ant-design/icons";
import JoditEditor from 'jodit-react';
import { useEffect, useState, useMemo } from "react";
import { getHomePageContents, updateHomePageContent, createHomePageContent } from "../apis";
import { getToken } from "@/utils/auth";
import { BASE_URL } from "@/configs/constants";

const { Panel } = Collapse;

const RichTextEditor = ({ value, onChange, placeholder }: any) => {
    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder || 'Nhập nội dung...',
        height: 300,
        uploader: {
            url: `${import.meta.env.VITE_BASE_URL}/api/files/upload?folder=content`,
            format: 'json',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            prepareData: function (formData: FormData) {
                return formData;
            },
            isSuccess: function (resp: any) {
                return resp && resp.url;
            },
            getMessage: function (resp: any) {
                return resp.message || '';
            },
            process: function (resp: any) {
                const baseUrl = import.meta.env.VITE_CONTENT_URL || '';
                return {
                    files: [baseUrl + resp.url],
                    path: '',
                    baseurl: baseUrl,
                    error: resp.error ? 1 : 0,
                    message: resp.message || ''
                };
            },
            defaultHandlerSuccess: function (this: any, data: any) {
                const files = data.files || [];
                if (files.length) {
                    this.selection.insertImage(files[0]);
                }
            },
            error: function (e: Error) {
                console.error('Upload error:', e);
            }
        },
        enableDragAndDropFileToEditor: true,
        buttons: [
            'bold', 'italic', 'underline', '|',
            'ul', 'ol', '|',
            'font', 'fontsize', '|',
            'image', 'link', '|',
            'align', 'undo', 'redo'
        ]
    }), [placeholder]);

    return (
        <JoditEditor
            value={value}
            config={config}
            onBlur={newContent => {
                if (onChange) onChange(newContent);
            }}
        />
    );
};



const HomePageContent = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [ogImageFileList, setOgImageFileList] = useState<UploadFile[]>([]);
    const [aboutImageFileList, setAboutImageFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const data = await getHomePageContents({ pageSize: 10, sort: "UpdatedAt desc" });
            if (data && data.items && data.items.length > 0) {
                const content = data.items[0];
                setCurrentId(content.id);

                // Parse JSON fields
                const values = {
                    ...content,
                    featuresJson: content.featuresJson ? JSON.parse(content.featuresJson) : [],
                    faqPart1Json: content.faqPart1Json ? JSON.parse(content.faqPart1Json) : [],
                    faqPart2Json: content.faqPart2Json ? JSON.parse(content.faqPart2Json) : [],
                    trustBrandsJson: content.trustBrandsJson ? JSON.parse(content.trustBrandsJson) : [],
                    howItWorksStepsJson: content.howItWorksStepsJson ? JSON.parse(content.howItWorksStepsJson) : [],
                };

                form.setFieldsValue(values);

                // Set OG Image file list if exists
                if (content.ogImage) {
                    setOgImageFileList([{
                        uid: '-1',
                        name: 'og-image.png',
                        status: 'done',
                        url: `${BASE_URL || ""}${content.ogImage}`,
                    }]);
                }

                // Set About Image file list if exists
                if (content.aboutImage) {
                    setAboutImageFileList([{
                        uid: '-2',
                        name: 'about-image.png',
                        status: 'done',
                        url: `${BASE_URL || ""}${content.aboutImage}`,
                    }]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch content:", error);
            message.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Upload OG Image if new file is selected
            let ogImageUrl = values.ogImage;
            if (ogImageFileList.length > 0 && ogImageFileList[0].originFileObj) {
                const formData = new FormData();
                formData.append('file', ogImageFileList[0].originFileObj);

                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/files/upload?folder=content`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    ogImageUrl = data.url;
                } else {
                    message.error('Upload ảnh thất bại');
                    setLoading(false);
                    return;
                }
            } else if (ogImageFileList.length > 0 && ogImageFileList[0].url) {
                // Keep existing image URL
                ogImageUrl = ogImageFileList[0].url.replace(BASE_URL || "", "");
            }

            // Upload About Image if new file is selected
            let aboutImageUrl = values.aboutImage;
            if (aboutImageFileList.length > 0 && aboutImageFileList[0].originFileObj) {
                const formData = new FormData();
                formData.append('file', aboutImageFileList[0].originFileObj);

                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/files/upload?folder=content`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    aboutImageUrl = data.url;
                } else {
                    message.error('Upload About Image thất bại');
                    setLoading(false);
                    return;
                }
            } else if (aboutImageFileList.length > 0 && aboutImageFileList[0].url) {
                // Keep existing image URL
                aboutImageUrl = aboutImageFileList[0].url.replace(BASE_URL || "", "");
            }

            // Stringify JSON fields
            const submitData = {
                ...values,
                ogImage: ogImageUrl,
                aboutImage: aboutImageUrl,
                featuresJson: JSON.stringify(values.featuresJson || []),
                faqPart1Json: JSON.stringify(values.faqPart1Json || []),
                faqPart2Json: JSON.stringify(values.faqPart2Json || []),
                trustBrandsJson: JSON.stringify(values.trustBrandsJson || []),
                howItWorksStepsJson: JSON.stringify(values.howItWorksStepsJson || []),
                isActive: true
            };

            if (currentId) {
                await updateHomePageContent(currentId, submitData);
                message.success("Lưu thành công");
            } else {
                await createHomePageContent(submitData);
                message.success("Tạo mới thành công");
                fetchContent(); // Refresh to get ID
            }
        } catch (error) {
            console.error("Failed to save content:", error);
            message.error("Lưu dữ liệu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Card title="Quản lý nội dung trang chủ (SEO & Sections)">
                <Form form={form} layout="vertical" onFinish={onFinish}>

                    <div className="flex justify-end mb-4 sticky top-0 z-10 bg-white p-2 shadow-sm">
                        <CoreButton type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                            Lưu thay đổi
                        </CoreButton>
                    </div>

                    <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']} destroyInactivePanel={false} style={{ background: 'white' }}>

                        {/* SEO Metadata */}
                        <Panel header="1. SEO Metadata" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="metaTitle" label="Meta Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="metaKeywords" label="Meta Keywords">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="metaDescription" label="Meta Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="OG Image (Share Image)">
                                        <CoreUpload
                                            listType="picture-card"
                                            maxCount={1}
                                            fileList={ogImageFileList}
                                            onChange={({ fileList }) => setOgImageFileList(fileList)}
                                            beforeUpload={() => false}
                                        >
                                            {ogImageFileList.length < 1 && (
                                                <div>
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            )}
                                        </CoreUpload>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>

                        {/* Hero Section */}
                        <Panel header="2. Hero Section" key="2">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="heroTitle" label="Hero Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="heroSubtitle" label="Hero Subtitle">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="heroDescription" label="Hero Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>

                        {/* About Section */}
                        <Panel header="3. About Section" key="3">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="aboutTitle" label="About Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="About Image">
                                        <CoreUpload
                                            listType="picture-card"
                                            maxCount={1}
                                            fileList={aboutImageFileList}
                                            onChange={({ fileList }) => setAboutImageFileList(fileList)}
                                            beforeUpload={() => false}
                                        >
                                            {aboutImageFileList.length < 1 && (
                                                <div>
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            )}
                                        </CoreUpload>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="aboutDescription" label="About Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>

                        {/* Features Section */}
                        <Panel header="4. Features Section (JSON)" key="4">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="featuresTitle" label="Section Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="featuresDescription" label="Section Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.List name="featuresJson">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex gap-2 mb-2 items-start border p-2 rounded bg-gray-50">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'title']}
                                                    className="mb-0 flex-1"
                                                    rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                                                >
                                                    <CoreInput placeholder="Feature Title" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'description']}
                                                    className="mb-0 flex-1"
                                                >
                                                    <CoreInput placeholder="Description" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'icon']}
                                                    className="mb-0 w-24"
                                                >
                                                    <CoreInput placeholder="Icon/Emoji" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} className="mt-2 text-red-500 cursor-pointer" />
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <CoreButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm Feature
                                            </CoreButton>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Panel>

                        {/* FAQ Section Part 1 */}
                        <Panel header="5. FAQ Section - Part 1 (General)" key="5">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="faqPart1Title" label="Part 1 Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="faqPart1Description" label="Part 1 Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.List name="faqPart1Json">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex flex-col gap-2 mb-4 border p-3 rounded bg-gray-50 relative">
                                                <div className="absolute top-2 right-2">
                                                    <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer" />
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'question']}
                                                    className="mb-0"
                                                    label="Question"
                                                >
                                                    <CoreInput placeholder="Question" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'answer']}
                                                    className="mb-0"
                                                    label="Answer"
                                                    trigger="onBlur"
                                                    valuePropName="value"
                                                >
                                                    <RichTextEditor />
                                                </Form.Item>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <CoreButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm câu hỏi (Part 1)
                                            </CoreButton>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Panel>

                        {/* FAQ Section Part 2 */}
                        <Panel header="6. FAQ Section - Part 2 (Technical)" key="6">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="faqPart2Title" label="Part 2 Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="faqPart2Description" label="Part 2 Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.List name="faqPart2Json">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex flex-col gap-2 mb-4 border p-3 rounded bg-gray-50 relative">
                                                <div className="absolute top-2 right-2">
                                                    <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer" />
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'question']}
                                                    className="mb-0"
                                                    label="Question"
                                                >
                                                    <CoreInput placeholder="Question" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'answer']}
                                                    className="mb-0"
                                                    label="Answer"
                                                    trigger="onBlur"
                                                    valuePropName="value"
                                                >
                                                    <RichTextEditor />
                                                </Form.Item>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <CoreButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm câu hỏi (Part 2)
                                            </CoreButton>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Panel>

                        {/* Trust Brands */}
                        <Panel header="7. Trust Brands" key="7">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="trustBrandsTitle" label="Section Title">
                                        <CoreInput />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="trustBrandsDescription" label="Section Description" trigger="onBlur" valuePropName="value">
                                        <RichTextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.List name="trustBrandsJson">
                                {(fields, { add, remove }) => (
                                    <div className="grid grid-cols-2 gap-4">
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
                                                <div className="flex justify-between">
                                                    <span>Logo #{key + 1}</span>
                                                    <DeleteOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer" />
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    className="mb-0"
                                                >
                                                    <CoreInput placeholder="Brand Name" />
                                                </Form.Item>

                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'logo']}
                                                    className="hidden"
                                                >
                                                    <CoreInput />
                                                </Form.Item>

                                                <Form.Item shouldUpdate>
                                                    {() => {
                                                        const logoUrl = form.getFieldValue(['trustBrandsJson', name, 'logo']);
                                                        const baseUrl = import.meta.env.VITE_BASE_URL || '';
                                                        const displayUrl = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`) : '';

                                                        return (
                                                            <div className="flex justify-center">
                                                                <Upload
                                                                    listType="picture-card"
                                                                    showUploadList={false}
                                                                    customRequest={async (options) => {
                                                                        const { file, onSuccess } = options;
                                                                        const formData = new FormData();
                                                                        formData.append('file', file as any);
                                                                        try {
                                                                            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/files/upload?folder=content`, {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Authorization': `Bearer ${getToken()}`
                                                                                },
                                                                                body: formData
                                                                            });
                                                                            if (response.ok) {
                                                                                const data = await response.json();
                                                                                // Store RELATIVE URL in form/database
                                                                                form.setFieldValue(['trustBrandsJson', name, 'logo'], data.url);

                                                                                if (onSuccess) onSuccess("Ok");
                                                                                message.success("Upload thành công");
                                                                            }
                                                                        } catch (e) {
                                                                            message.error("Lỗi upload");
                                                                        }
                                                                    }}
                                                                >
                                                                    {displayUrl ? (
                                                                        <img src={displayUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                    ) : (
                                                                        <div>
                                                                            <PlusOutlined />
                                                                            <div style={{ marginTop: 8 }}>Upload</div>
                                                                        </div>
                                                                    )}
                                                                </Upload>
                                                            </div>
                                                        );
                                                    }}
                                                </Form.Item>

                                            </div>
                                        ))}
                                        <CoreButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="h-full min-h-[100px]">
                                            Thêm Brand
                                        </CoreButton>
                                    </div>
                                )}
                            </Form.List>
                        </Panel>



                    </Collapse>
                </Form>
            </Card>
        </div>
    );
};

export default HomePageContent;
