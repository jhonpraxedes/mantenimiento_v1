export const TIPOS_MAQUINARIA = [
  'Retroexcavadora',
  'Bulldozer',
  'Excavadora',
  'Perfiladora',
  'Cargador frontal',
  'Camión',
] as const;

export type TipoMaquinaria = (typeof TIPOS_MAQUINARIA)[number];

export interface Maquinaria {
  id: string;
  nombre: string;
  descripcion?: string;
  numero_serie: string;
  motor?: string;
  tipo: TipoMaquinaria;
  created_at?: string;
  updated_at?: string;
}

export const DATOS_INICIALES: Maquinaria[] = [
  {
    id: '1',
    nombre: 'Excavadora CAT 320D',
    descripcion: 'Maquinaria de excavación de uso pesado',
    numero_serie: 'CAT320D-001',
    motor: 'Caterpillar C6.4',
    tipo: 'Excavadora',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Bulldozer Komatsu D85EX',
    descripcion: 'Tractor para nivelación de terreno',
    numero_serie: 'KOMD85-045',
    motor: 'Komatsu SAA6D125E-3',
    tipo: 'Bulldozer',
    created_at: '2024-02-14T09:30:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'Cargador Frontal Volvo L120F',
    descripcion: 'Cargador frontal para movimiento de agregados',
    numero_serie: 'VOL120F-076',
    motor: 'Volvo D7E',
    tipo: 'Cargador frontal',
    created_at: '2024-03-18T08:45:00Z',
    updated_at: new Date().toISOString(),
  },
];
