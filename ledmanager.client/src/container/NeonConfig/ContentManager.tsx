import { useState, useRef, useMemo } from 'react';
import { Form, Input, InputNumber, Switch, message, Modal, Tabs, Upload } from 'antd';
import CoreDataTable, { type IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { neonApi, NeonContentType, type NeonContent } from '../../services/apiNeon';
import { Upload as UploadIcon, Edit, Trash } from "lucide-react";
import type { UploadFile, UploadProps, UploadChangeParam } from 'antd/es/upload';
import CoreButton from "@/components/CoreButton/CoreButton";
import JoditEditor from 'jodit-react';
import SectionHeaderConfig from './SectionHeaderConfig';

export default function ContentManager() {
    return (
        <div className="h-full">
            <Tabs
                defaultActiveKey="Intro"
                items={[
                    {
                        key: 'Intro',
                        label: 'Intro Text',
                        children: <ListContentManager type={NeonContentType.Intro} titleLabel="Heading" contentLabel="Body Text" hasImage={false} />
                    },
                    {
                        key: 'Feature',
                        label: 'Features',
                        children: <ListContentManager type={NeonContentType.Feature} titleLabel="Title" contentLabel="Description" hasImage={false} />
                    },
                    {
                        key: 'Faq',
                        label: 'FAQ',
                        children: <ListContentManager type={NeonContentType.Faq} titleLabel="Question" contentLabel="Answer" hasImage={false} />
                    }
                ]}
            />
        </div>
    );
}

// Component for List-based content (Features, FAQ)
const ListContentManager = ({ type, titleLabel, contentLabel, hasImage }: { type: NeonContentType, titleLabel: string, contentLabel: string, hasImage: boolean }) => {
    const tableRef = useRef<any>(null);
    const editor = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<NeonContent | null>(null);
    const [form] = Form.useForm();
    const [refetch, setRefetch] = useState({});
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Start typings...',
            height: 300,
        }),
        []
    );

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setFileList([]);
        form.setFieldsValue({ isActive: true, displayOrder: 0, type: type });
        setIsModalVisible(true);
    };

    const handleEdit = (item: NeonContent) => {
        setEditingItem(item);
        form.setFieldsValue({
            ...item,
            type: type // Ensure type is correct enum int
        });

        if (item.imageUrl) {
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: item.imageUrl,
            }]);
        } else {
            setFileList([]);
        }

        setIsModalVisible(true);
    };

    const handleDelete = async (item: NeonContent) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this item?',
            onOk: async () => {
                try {
                    await neonApi.deleteContent(item.id);
                    message.success('Content deleted');
                    setRefetch({});
                } catch (error) {
                    message.error('Failed to delete content');
                }
            }
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            // Ensure type is int
            values.type = type;

            let imageUrl = editingItem?.imageUrl || "";

            if (fileList.length > 0) {
                const file = fileList[0];
                if (file.response && file.response.url) {
                    imageUrl = file.response.url;
                } else if (file.url) {
                    imageUrl = file.url;
                }
            } else {
                imageUrl = ""; // Clear image if list empty? Or keep old? No, if empty it means deleted/cleared.
                // But wait, if user doesn't touch upload, fileList has 1 item.
                // If user removes, fileList empty.
            }
            if (!hasImage) imageUrl = ""; // Force clear if type doesn't support image
            values.imageUrl = imageUrl;

            if (editingItem) {
                await neonApi.updateContent(editingItem.id, values);
                message.success('Content updated');
            } else {
                await neonApi.createContent(values);
                message.success('Content created');
            }
            setIsModalVisible(false);
            setRefetch({});
        } catch (error) {
            console.error(error);
            // message.error('Failed to save content'); // Form handles required errors
        }
    };

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        let newFileList = [...info.fileList];
        newFileList = newFileList.slice(-1);
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });
        setFileList(newFileList);
    };

    const columnDefs: IColumnDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 80,
            filterType: "input",
        },
        {
            field: "title",
            headerName: titleLabel,
            flex: 1,
            filterType: "input",
            cellRenderer: (params: any) => (
                <div className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleEdit(params.data)}>
                    {params.value}
                </div>
            ),
        },
        {
            field: "content",
            headerName: contentLabel,
            flex: 2,
            cellRenderer: (params: any) => (
                <div className="truncate max-w-md" title={params.value}>
                    <div dangerouslySetInnerHTML={{ __html: params.value }} className="line-clamp-2" />
                </div>
            )
        },
        {
            field: "displayOrder",
            headerName: "Order",
            width: 80,
        },
        {
            field: "isActive",
            headerName: "Active",
            width: 80,
            cellRenderer: (params: any) => (
                <Switch checked={params.value} disabled size="small" />
            ),
        },
        {
            field: "action",
            headerName: "",
            width: 100,
            pinned: "right",
            cellRenderer: (params: any) => (
                <div className="flex gap-2">
                    <CoreButton
                        size="small"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(params.data)}
                    />
                    <CoreButton
                        size="small"
                        color="red"
                        icon={<Trash size={16} />}
                        onClick={() => handleDelete(params.data)}
                    />
                </div>
            ),
        },
    ];

    const uploadButton = (
        <div>
            <UploadIcon />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <SectionHeaderConfig prefix={`Neon_${NeonContentType[type]}`} />
            <CoreDataTable
                ref={tableRef}
                title={`${NeonContentType[type]} List`} // e.g. "Intro List", "Feature List"
                fetchUrl={`/api/admin/neon/content?type=${type}`}
                columnDefs={columnDefs}
                columnStateName={`neon-content-${NeonContentType[type]}-state-v3`} // Changed v3 to force reset columns with new ID field
                onAdd={handleAdd}
                refetchObject={refetch}
                isBookingApi={false}
            />
            <Modal
                title={editingItem ? `Edit ${titleLabel}` : `Add ${titleLabel}`}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
                forceRender
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label={titleLabel} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="content" label={contentLabel} rules={[{ required: true }]} trigger="onBlur" valuePropName="value">
                        <JoditEditor
                            ref={editor}
                            config={config}
                        />
                    </Form.Item>
                    {hasImage && (
                        <Form.Item label="Image">
                            <Upload
                                action="/api/files/upload?folder=neon-content"
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleChange}
                                maxCount={1}
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                        </Form.Item>
                    )}
                    <Form.Item name="displayOrder" label="Display Order">
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                    <Form.Item name="isActive" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
