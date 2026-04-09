import api from './index';
import type { PagingRequest, PagedResult } from '@/configs/types';

export interface SystemConfig {
    id: number;
    configKey: string;
    configValue: string;
    description?: string;
}

export interface SystemConfigListRequest extends PagingRequest {
}

export const systemConfigApi = {
    getList: async (params: SystemConfigListRequest) => {
        const { data } = await api.get<PagedResult<SystemConfig>>('/api/SystemConfigs', { params });
        return data;
    },
    getById: async (id: number) => {
        const { data } = await api.get<SystemConfig>(`/api/SystemConfigs/${id}`);
        return data;
    },
    create: async (data: any) => {
        const { data: res } = await api.post('/api/SystemConfigs', data);
        return res;
    },
    update: async (id: number, data: any) => {
        const { data: res } = await api.put(`/api/SystemConfigs/${id}`, data);
        return res;
    },
    delete: async (id: number) => {
        await api.delete(`/api/SystemConfigs/${id}`);
    },
    // Helper to get or create a config by key
    updateByKey: async (key: string, value: string, description?: string) => {
        // First, check if exist
        const list = await systemConfigApi.getList({ Keyword: key, PageIndex: 1, PageSize: 10 });
        const existing = list.items.find((c: SystemConfig) => c.configKey === key);
        
        if (existing) {
            return await systemConfigApi.update(existing.id, { ...existing, configValue: value });
        } else {
            return await systemConfigApi.create({ configKey: key, configValue: value, description });
        }
    }
};
