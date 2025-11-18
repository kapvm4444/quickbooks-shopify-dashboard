import { useCallback } from 'react';

export type SourceType = 'google_sheet' | 'google_workbook' | 'excel_upload' | 'quickbooks';

export interface ColumnMapping {
  amount?: string;
  description?: string;
  account_name?: string;
  transaction_date?: string;
}

export interface RememberedSource {
  sourceType: SourceType;
  config: any;
  mapping?: ColumnMapping;
}

const LS_PREFIX = 'sync_source:';
const MAP_PREFIX = 'sync_mapping:';

export function useSyncPreferences(pageKey: string) {
  const saveSource = useCallback((source: RememberedSource) => {
    try {
      localStorage.setItem(`${LS_PREFIX}${pageKey}`, JSON.stringify(source));
    } catch {}
  }, [pageKey]);

  const loadSource = useCallback((): RememberedSource | null => {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${pageKey}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [pageKey]);

  const saveMappingTemplate = useCallback((name: string, mapping: ColumnMapping) => {
    try {
      localStorage.setItem(`${MAP_PREFIX}${pageKey}:${name}`, JSON.stringify(mapping));
    } catch {}
  }, [pageKey]);

  const listMappingTemplates = useCallback((): string[] => {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith(`${MAP_PREFIX}${pageKey}:`)) {
          keys.push(k.split(':').slice(-1)[0]);
        }
      }
    } catch {}
    return keys;
  }, [pageKey]);

  const loadMappingTemplate = useCallback((name: string): ColumnMapping | null => {
    try {
      const raw = localStorage.getItem(`${MAP_PREFIX}${pageKey}:${name}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [pageKey]);

  return { saveSource, loadSource, saveMappingTemplate, listMappingTemplates, loadMappingTemplate };
}
