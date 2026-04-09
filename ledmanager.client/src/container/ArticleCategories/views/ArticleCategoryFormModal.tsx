import {
    CoreButton,
    CoreInput,
    CoreModal,
    CoreTextArea,
} from "@/components";
import { Form, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createArticleCategory, updateArticleCategory } from "../../Articles/apis";

interface ICategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category?: any;
    mode: "add" | "edit" | "view";
}

const ArticleCategoryFormModal = ({ open, onClose, onSuccess, category, mode }: ICategoryFormModalProps) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (category) {
                form.setFieldsValue(category);
            } else {
                form.resetFields();
            }
        }
    }, [open, category, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (mode === "add") {
                const success = await createArticleCategory(values);
                if (success) {
                    onSuccess();
                    onClose();
                }
            } else if (mode === "edit" && category) {
                const success = await updateArticleCategory(category.id, { ...category, ...values });
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
        add: t("article.add") + " " + t("article.category"),
        edit: t("article.edit") + " " + t("article.category"),
        view: t("article.view") + " " + t("article.category"),
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
                        <Form.Item name="description" label={t("common.description")}>
                            <CoreTextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </CoreModal>
    );
};

export default ArticleCategoryFormModal;
