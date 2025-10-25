import { Usuario, USUARIOS_INICIALES } from '@/constants/usuarios';

const STORAGE_KEY = 'usuarios';

export const UsuariosStore = {
  // Inicializar datos
  init: (): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_INICIALES));
    }
  },

  // Listar todos los usuarios
  list: (): Promise<Usuario[]> => {
    UsuariosStore.init();
    const data = localStorage.getItem(STORAGE_KEY);
    return Promise.resolve(data ? JSON.parse(data) : []);
  },

  // Obtener un usuario por ID
  get: (id: string): Promise<Usuario | null> => {
    return UsuariosStore.list().then((usuarios) => {
      return usuarios.find((u) => u.id === id) || null;
    });
  },

  // Crear nuevo usuario
  create: (
    usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Usuario> => {
    return UsuariosStore.list().then((usuarios) => {
      // Verificar si el código ya existe
      const codeExiste = usuarios.some((u) => u.code === usuario.code);
      if (codeExiste) {
        throw new Error('El código ya está registrado');
      }

      const nuevo: Usuario = {
        ...usuario,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      usuarios.push(nuevo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
      return nuevo;
    });
  },

  // Actualizar usuario
  update: (id: string, datos: Partial<Usuario>): Promise<Usuario> => {
    return UsuariosStore.list().then((usuarios) => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está cambiando el código, verificar que no exista
      if (datos.code && datos.code !== usuarios[index].code) {
        const codeExiste = usuarios.some(
          (u) => u.code === datos.code && u.id !== id,
        );
        if (codeExiste) {
          throw new Error('El código ya está registrado');
        }
      }

      usuarios[index] = {
        ...usuarios[index],
        ...datos,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
      return usuarios[index];
    });
  },

  // Eliminar usuario
  delete: (id: string): Promise<void> => {
    return UsuariosStore.list().then((usuarios) => {
      const filtrados = usuarios.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
    });
  },

  // Buscar por código
  getByCode: (code: string): Promise<Usuario | null> => {
    return UsuariosStore.list().then((usuarios) => {
      return usuarios.find((u) => u.code === code) || null;
    });
  },
};
