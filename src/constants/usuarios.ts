export const ROLES_USUARIO = ['Administrador', 'Operador'] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

export interface Usuario {
  id: string;
  name: string;
  code: string;
  rol: RolUsuario;
  created_at?: string;
  updated_at?: string;
}

// Datos iniciales de ejemplo
export const USUARIOS_INICIALES: Usuario[] = [
  {
    id: '1',
    name: 'Juan',
    code: 'ADM001',
    rol: 'Administrador',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria',
    code: 'OPR001',
    rol: 'Operador',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Carlos',
    code: 'OPR002',
    rol: 'Operador',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Ana',
    code: 'ADM002',
    rol: 'Administrador',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-09-15T10:00:00Z',
  },
];
