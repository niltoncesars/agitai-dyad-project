import { useState, useEffect, useCallback } from "react";

export interface TenantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  status: "active" | "inactive";
  plan: "Enterprise" | "Professional" | "Starter";
  personType?: "individual" | "legal"; // individual (CPF), legal (CNPJ)
  documentNumber?: string;
  logo?: string; // Base64 encoded image
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  updatedAt?: string; // ISO timestamp
}

const STORAGE_KEY = "agitai_tenants_data";
const STORAGE_VERSION = "1.0";

interface StorageData {
  version: string;
  tenants: Record<string, TenantData>;
  lastUpdated: string;
}

/**
 * Hook customizado para gerenciar a persistência de dados dos Tenants
 * Utiliza localStorage como armazenamento primário
 * Estruturado para migração futura para banco de dados
 */
export function useTenantStorage() {
  const [tenantData, setTenantData] = useState<Record<string, TenantData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData: StorageData = JSON.parse(stored);
          // Validar versão do storage
          if (parsedData.version === STORAGE_VERSION) {
            setTenantData(parsedData.tenants);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // Salvar dados no localStorage sempre que tenantData mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        const dataToStore: StorageData = {
          version: STORAGE_VERSION,
          tenants: tenantData,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
      }
    }
  }, [tenantData, isLoaded]);

  // Atualizar dados de um tenant específico
  const updateTenant = useCallback((tenantId: string, updates: Partial<TenantData>) => {
    setTenantData((prev) => ({
      ...prev,
      [tenantId]: {
        ...prev[tenantId],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  // Atualizar logo de um tenant
  const updateTenantLogo = useCallback((tenantId: string, logoBase64: string) => {
    updateTenant(tenantId, { logo: logoBase64 });
  }, [updateTenant]);

  // Obter dados de um tenant específico
  const getTenant = useCallback((tenantId: string): TenantData | undefined => {
    return tenantData[tenantId];
  }, [tenantData]);

  // Obter logo de um tenant
  const getTenantLogo = useCallback((tenantId: string): string | undefined => {
    return tenantData[tenantId]?.logo;
  }, [tenantData]);

  // Limpar dados (útil para logout ou reset)
  const clearStorage = useCallback(() => {
    setTenantData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Exportar dados para backup
  const exportData = useCallback(() => {
    const dataToExport: StorageData = {
      version: STORAGE_VERSION,
      tenants: tenantData,
      lastUpdated: new Date().toISOString(),
    };
    return JSON.stringify(dataToExport, null, 2);
  }, [tenantData]);

  // Importar dados de um backup
  const importData = useCallback((jsonData: string) => {
    try {
      const parsedData: StorageData = JSON.parse(jsonData);
      if (parsedData.version === STORAGE_VERSION) {
        setTenantData(parsedData.tenants);
        return true;
      } else {
        console.error("Versão de dados incompatível");
        return false;
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return false;
    }
  }, []);

  return {
    tenantData,
    isLoaded,
    updateTenant,
    updateTenantLogo,
    getTenant,
    getTenantLogo,
    clearStorage,
    exportData,
    importData,
  };
}
