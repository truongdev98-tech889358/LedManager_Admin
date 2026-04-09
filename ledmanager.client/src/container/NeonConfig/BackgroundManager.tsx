
import CoreButton from "@/components/CoreButton/CoreButton";
import CoreDataTable, { type IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { neonApi, type NeonBackground } from "@/services/apiNeon";
import { Edit, Trash, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, message, Form, Input, InputNumber, Switch, Upload, type UploadFile } from "antd";
import type { UploadChangeParam, UploadProps } from "antd/es/upload";

const BackgroundManager = () => {
    const { t } = useTranslation();
    const tableRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NeonBackground | null>(null);
    const [form] = Form.useForm();
    const [refetch, setRefetch] = useState({});
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setFileList([]);
        form.setFieldsValue({
            displayOrder: 0,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: NeonBackground) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        if (item.imageUrl) {
            setFileList([
                {
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: item.imageUrl,
                },
            ]);
        } else {
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleDelete = (item: NeonBackground) => {
        Modal.confirm({
            title: t("common.confirmDelete"),
            content: t("common.confirmDeleteMessage"),
            onOk: async () => {
                try {
                    await neonApi.deleteBackground(item.id);
                    message.success(t("common.deleteSuccess"));
                    setRefetch({});
                } catch (error) {
                    message.error(t("common.deleteFail"));
                }
            },
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            let imageUrl = editingItem?.imageUrl || "";

            if (fileList.length > 0) {
                const file = fileList[0];
                if (file.response && file.response.url) {
                    imageUrl = file.response.url;
                } else if (file.url) {
                    imageUrl = file.url;
                }
            }

            const payload: any = {
                name: values.name,
                imageUrl: imageUrl,
                displayOrder: values.displayOrder,
                isActive: values.isActive
            };

            if (editingItem) {
                await neonApi.updateBackground(editingItem.id, payload);
                message.success(t("common.updateSuccess"));
            } else {
                await neonApi.createBackground(payload);
                message.success(t("common.createSuccess"));
            }
            setIsModalOpen(false);
            setRefetch({});
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        let newFileList = [...info.fileList];

        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        newFileList = newFileList.slice(-1);

        // 2. Read from response and show file link
        newFileList = newFileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.url = file.response.url;
            }
            return file;
        });

        setFileList(newFileList);

        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const columnDefs: IColumnDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 80,
            filterType: "input",
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            filterType: "input",
            cellRenderer: (params: any) => (
                <div className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleEdit(params.data)}>
                    {params.value}
                </div>
            ),
        },
        {
            field: "imageUrl",
            headerName: "Image",
            flex: 1,
            cellRenderer: (params: any) => (
                <div className="flex items-center gap-2">
                    {params.value && (
                        <img src={params.value} alt="Preview" className="w-10 h-10 object-cover rounded border" />
                    )}
                </div>
            )
        },
        {
            field: "displayOrder",
            headerName: "Order",
            width: 100,
        },
        {
            field: "isActive",
            headerName: "Active",
            width: 100,
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
            <Plus />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <CoreDataTable
                ref={tableRef}
                title="Neon Backgrounds"
                fetchUrl="/api/admin/neon/backgrounds"
                columnDefs={columnDefs}
                columnStateName="neon-backgrounds-state"
                onAdd={handleAdd}
                refetchObject={refetch}
                isBookingApi={false}
            />

            <Modal
                title={editingItem ? "Edit Background" : "Add Background"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                forceRender
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: "Please enter name" }]}
                    >
                        <Input placeholder="e.g. Brick Wall" />
                    </Form.Item>

                    <Form.Item label="Image">
                        <Upload
                            action="/api/files/upload?folder=neon-backgrounds"
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleChange}
                            maxCount={1}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="displayOrder"
                        label="Display Order"
                        rules={[{ required: true }]}
                    >
                        <InputNumber className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BackgroundManager;
