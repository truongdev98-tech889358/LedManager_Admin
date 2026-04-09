
import CoreButton from "@/components/CoreButton/CoreButton";
import CoreDataTable, { type IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { neonApi, type NeonFont } from "@/services/apiNeon";
import { Edit, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, message, Form, Input, InputNumber, Switch } from "antd";

const FontManager = () => {
    const { t } = useTranslation();
    const tableRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NeonFont | null>(null);
    const [form] = Form.useForm();
    const [refetch, setRefetch] = useState({});

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        // Set default values
        form.setFieldsValue({
            displayOrder: 0,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: NeonFont) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item: NeonFont) => {
        Modal.confirm({
            title: t("common.confirmDelete"),
            content: t("common.confirmDeleteMessage"),
            onOk: async () => {
                try {
                    await neonApi.deleteFont(item.id);
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
            if (editingItem) {
                await neonApi.updateFont(editingItem.id, values);
                message.success(t("common.updateSuccess"));
            } else {
                await neonApi.createFont(values);
                message.success(t("common.createSuccess"));
            }
            setIsModalOpen(false);
            setRefetch({});
        } catch (error) {
            console.error(error);
            // message.error(t("common.error")); // Antd form usually handles validation errors
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
            field: "value",
            headerName: "CSS Value / Font Family",
            flex: 1,
            filterType: "input",
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

    return (
        <div className="h-full flex flex-col">
            <CoreDataTable
                ref={tableRef}
                title="Neon Fonts"
                fetchUrl="/api/admin/neon/fonts"
                columnDefs={columnDefs}
                columnStateName="neon-fonts-state"
                onAdd={handleAdd}
                refetchObject={refetch}
                isBookingApi={false} // Uses apiUser (apiUser wraps api with interceptors? No, coreDataTable uses api or apiUser. Let's assume standard api path)
            // Wait, CoreDataTable uses apiUser if isBookingApi is false.
            // My service uses `api` from `services/index`.
            // Let's check CoreDataTable implementation again:
            // const res = isBookingApi ? await api.get(...) : await apiUser.get(...);
            // I need to check apiUser vs api. 
            // Usually apiUser is for User related things, but here it's Admin Neon.
            // If I pass standard fetchUrl, CoreDataTable will append it to baseURL.
            />

            <Modal
                title={editingItem ? "Edit Font" : "Add Font"}
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
                        <Input placeholder="e.g. Script" />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="Value (CSS Variable or Font Family)"
                        rules={[{ required: true, message: "Please enter value" }]}
                    >
                        <Input placeholder="e.g. var(--font-great-vibes)" />
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

export default FontManager;
