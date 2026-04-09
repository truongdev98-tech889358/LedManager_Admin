
import CoreButton from "@/components/CoreButton/CoreButton";
import CoreDataTable, { type IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { neonApi, type NeonColor } from "@/services/apiNeon";
import { Edit, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, message, Form, Input, InputNumber, Switch, ColorPicker } from "antd";

const ColorManager = () => {
    const { t } = useTranslation();
    const tableRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NeonColor | null>(null);
    const [form] = Form.useForm();
    const [refetch, setRefetch] = useState({});

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        form.setFieldsValue({
            displayOrder: 0,
            isActive: true,
            hexCode: "#000000",
            glowCode: "#000000"
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: NeonColor) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item: NeonColor) => {
        Modal.confirm({
            title: t("common.confirmDelete"),
            content: t("common.confirmDeleteMessage"),
            onOk: async () => {
                try {
                    await neonApi.deleteColor(item.id);
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

            // Transform color objects to hex string if needed (Antd ColorPicker)
            const processColor = (val: any) => {
                if (!val) return val;
                if (typeof val === 'string') return val;
                if (typeof val.toHexString === 'function') return val.toHexString();
                return val;
            };

            values.hexCode = processColor(values.hexCode);
            values.glowCode = processColor(values.glowCode);

            if (editingItem) {
                await neonApi.updateColor(editingItem.id, values);
                message.success(t("common.updateSuccess"));
            } else {
                await neonApi.createColor(values);
                message.success(t("common.createSuccess"));
            }
            setIsModalOpen(false);
            setRefetch({});
        } catch (error) {
            console.error(error);
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
            field: "hexCode",
            headerName: "Hex Code",
            width: 150,
            cellRenderer: (params: any) => (
                <div className="flex items-center gap-2">
                    <div style={{ width: 20, height: 20, backgroundColor: params.value, border: '1px solid #ccc', borderRadius: 4 }}></div>
                    {params.value}
                </div>
            )
        },
        {
            field: "glowCode",
            headerName: "Glow Code",
            width: 150,
            cellRenderer: (params: any) => (
                <div className="flex items-center gap-2">
                    <div style={{ width: 20, height: 20, backgroundColor: params.value, border: '1px solid #ccc', borderRadius: 4 }}></div>
                    {params.value}
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

    return (
        <div className="h-full flex flex-col">
            <CoreDataTable
                ref={tableRef}
                title="Neon Colors"
                fetchUrl="/api/admin/neon/colors"
                columnDefs={columnDefs}
                columnStateName="neon-colors-state"
                onAdd={handleAdd}
                refetchObject={refetch}
                isBookingApi={false}
            />

            <Modal
                title={editingItem ? "Edit Color" : "Add Color"}
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
                        <Input placeholder="e.g. Warm White" />
                    </Form.Item>
                    <Form.Item
                        name="hexCode"
                        label="Hex Code"
                        rules={[{ required: true, message: "Please enter hex code" }]}
                    >
                        <ColorPicker showText format="hex" />
                    </Form.Item>
                    <Form.Item
                        name="glowCode"
                        label="Glow Code"
                        rules={[{ required: true, message: "Please enter glow code" }]}
                    >
                        <ColorPicker showText format="hex" />
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

export default ColorManager;
