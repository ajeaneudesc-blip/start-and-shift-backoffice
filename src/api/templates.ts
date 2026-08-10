import client from '@/api/client';
import type { TemplateState } from '@/types';

export interface TemplateRow {
  id: number;
  name: string;
  /** Métadonnées libres : « Vente · 3 formats ». */
  meta: string;
  state: TemplateState;
}

export async function listTemplates(): Promise<TemplateRow[]> {
  const { data } = await client.get<{ items: TemplateRow[] }>('/api/templates');
  return data.items;
}

export async function setTemplateState(id: number, state: TemplateState): Promise<TemplateRow> {
  const { data } = await client.patch<TemplateRow>(`/api/templates/${id}`, { state });
  return data;
}

export async function createTemplate(input: {
  name: string;
  meta: string;
  state?: TemplateState;
}): Promise<TemplateRow> {
  const { data } = await client.post<TemplateRow>('/api/templates', input);
  return data;
}

export async function deleteTemplate(id: number): Promise<void> {
  await client.delete(`/api/templates/${id}`);
}
