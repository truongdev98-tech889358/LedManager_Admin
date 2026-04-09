import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Skeleton } from 'antd';
import { systemConfigApi, type SystemConfig } from '../../services/apiSystemConfig';
import { Save } from 'lucide-react';

interface Props {
    prefix: string; // e.g. "Neon_Feature"
    titleLabel?: string;
    subtitleLabel?: string;
}

export default function SectionHeaderConfig({ prefix, titleLabel = "Section Title", subtitleLabel = "Section Subtitle" }: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, [prefix]);

    const fetchConfig = async () => {
        setInitialLoading(true);
        try {
            // Fetch both keys
            const res = await systemConfigApi.getList({ Keyword: prefix, PageIndex: 1, PageSize: 20 });
            const titleConfig = res.items.find((c: SystemConfig) => c.configKey === `${prefix}_Title`);
            const subtitleConfig = res.items.find((c: SystemConfig) => c.configKey === `${prefix}_Subtitle`);

            form.setFieldsValue({
                title: titleConfig?.configValue || '',
                subtitle: subtitleConfig?.configValue || ''
            });

        } catch (error) {
            console.error("Failed to fetch section config", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            await Promise.all([
                systemConfigApi.updateByKey(`${prefix}_Title`, values.title, `${prefix} Title`),
                systemConfigApi.updateByKey(`${prefix}_Subtitle`, values.subtitle, `${prefix} Subtitle`)
            ]);
            message.success('Section header updated');
        } catch (error) {
            console.error(error);
            message.error('Failed to update section header');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Card className="mb-4"><Skeleton active paragraph={{ rows: 2 }} /></Card>;

    return (
        <Card className="mb-4 shadow-sm" size="small" title="Page Header Configuration">
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="title" label={titleLabel} className="mb-2">
                        <Input placeholder="Enter section title..." />
                    </Form.Item>
                    <Form.Item name="subtitle" label={subtitleLabel} className="mb-2">
                        <Input.TextArea placeholder="Enter section subtitle..." rows={1} style={{ resize: 'none' }} />
                    </Form.Item>
                </div>
                <div className="text-right">
                    <Button type="primary" htmlType="submit" icon={<Save size={16} />} loading={loading}>
                        Save Header
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
