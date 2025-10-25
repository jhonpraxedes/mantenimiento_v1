import { DATOS_INICIALES, Maquinaria } from '@/constants/maquinaria';

const STORAGE_KEY = 'maquinaria_data';

export const MaquinariaStore = {
  // Inicializar datos si no existen
  init: (): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DATOS_INICIALES));
    }
  },

  // Listar todas las máquinas
  list: (): Promise<Maquinaria[]> => {
    MaquinariaStore.init();
    const data = localStorage.getItem(STORAGE_KEY);
    return Promise.resolve(data ? JSON.parse(data) : []);
  },

  // Obtener una máquina por ID
  get: (id: string): Promise<Maquinaria | null> => {
    return MaquinariaStore.list().then((maquinas) => {
      return maquinas.find((m) => m.id === id) || null;
    });
  },

  // Crear nueva máquina
  create: (
    maquina: Omit<Maquinaria, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Maquinaria> => {
    return MaquinariaStore.list().then((maquinas) => {
      const nueva: Maquinaria = {
        ...maquina,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      maquinas.push(nueva);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maquinas));
      return nueva;
    });
  },

  // Actualizar máquina existente
  update: (id: string, datos: Partial<Maquinaria>): Promise<Maquinaria> => {
    return MaquinariaStore.list().then((maquinas) => {
      const index = maquinas.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Máquina no encontrada');
      }
      maquinas[index] = {
        ...maquinas[index],
        ...datos,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maquinas));
      return maquinas[index];
    });
  },

  // Eliminar máquina
  delete: (id: string): Promise<void> => {
    return MaquinariaStore.list().then((maquinas) => {
      const filtradas = maquinas.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
    });
  },

  // Filtrar por tipo
  filterByTipo: (tipo: string): Promise<Maquinaria[]> => {
    return MaquinariaStore.list().then((maquinas) => {
      return maquinas.filter((m) => m.tipo === tipo);
    });
  },
};
