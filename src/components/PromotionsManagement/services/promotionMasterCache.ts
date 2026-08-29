import api from '../../../api/axios';

export interface MasterEntity {
  id: string;
  name: string;
}

export interface PromotionMasterData {
  services: MasterEntity[];
  brands: MasterEntity[];
  models: MasterEntity[];
  vehicleTypes: MasterEntity[];
  fuelTypes: MasterEntity[];
  cities: MasterEntity[];
  emirates: MasterEntity[];
  customers: MasterEntity[];
}

let cachedMasterData: PromotionMasterData | null = null;
let masterDataPromise: Promise<PromotionMasterData> | null = null;

export const getPromotionMasterData = async (forceRefresh = false): Promise<PromotionMasterData> => {
  if (cachedMasterData && !forceRefresh) {
    return cachedMasterData;
  }

  if (masterDataPromise && !forceRefresh) {
    return masterDataPromise;
  }

  masterDataPromise = (async () => {
    try {
      const [
        servicesRes,
        brandsRes,
        modelsRes,
        vehicleTypesRes,
        fuelTypesRes,
        citiesRes,
        emiratesRes,
        customersRes,
      ] = await Promise.allSettled([
        api.get('/master/service/admin').catch(() => api.get('/master/service')),
        api.get('/master/make/admin').catch(() => api.get('/master/make')),
        api.get('/master/model/admin').catch(() => api.get('/master/model')),
        api.get('/master/vehicletype/admin').catch(() => api.get('/master/vehicletype')),
        api.get('/master/fueltype/admin').catch(() => api.get('/master/fueltype')),
        api.get('/master/city/admin').catch(() => api.get('/master/city')),
        api.get('/master/state/admin').catch(() => api.get('/master/state')),
        api.get('/customer/customer?limit=10000').catch(() => api.get('/customer/customer')),
      ]);

      const mapList = (res: PromiseSettledResult<any>, keys: string[], nameKeys: string[]): MasterEntity[] => {
        if (res.status !== 'fulfilled' || !res.value) return [];
        const raw = res.value.data?.data || res.value.data || [];
        let list: any[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else {
          for (const k of keys) {
            if (Array.isArray(raw[k])) {
              list = raw[k];
              break;
            }
          }
        }
        return list.map((item: any) => {
          if (typeof item === 'string') return { id: item, name: item };
          const id = String(item._id || item.id || '');
          let name = '';
          for (const nk of nameKeys) {
            if (item[nk]) {
              name = String(item[nk]);
              break;
            }
          }
          if (!name && item.fullName) name = String(item.fullName);
          if (!name && (item.firstName || item.lastName)) name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
          return { id: id || name, name: name || id };
        }).filter(item => item.id && item.name);
      };

      const result: PromotionMasterData = {
        services: mapList(servicesRes, ['services', 'list'], ['name', 'title']),
        brands: mapList(brandsRes, ['makes', 'brands', 'list'], ['name', 'title', 'make']),
        models: mapList(modelsRes, ['models', 'list'], ['name', 'title']),
        vehicleTypes: mapList(vehicleTypesRes, ['vehicleTypes', 'list'], ['name', 'type']),
        fuelTypes: mapList(fuelTypesRes, ['fuelTypes', 'list'], ['name', 'type']),
        cities: mapList(citiesRes, ['cities', 'list'], ['name']),
        emirates: mapList(emiratesRes, ['states', 'emirates', 'list'], ['name']),
        customers: mapList(customersRes, ['customers', 'users', 'list'], ['fullName', 'name', 'email']),
      };

      cachedMasterData = result;
      return result;
    } catch (err) {
      console.warn('Failed to load promotion master data:', err);
      return {
        services: [],
        brands: [],
        models: [],
        vehicleTypes: [],
        fuelTypes: [],
        cities: [],
        emirates: [],
        customers: [],
      };
    } finally {
      masterDataPromise = null;
    }
  })();

  return masterDataPromise;
};

export const getCachedMasterDataSync = (): PromotionMasterData | null => {
  return cachedMasterData;
};
