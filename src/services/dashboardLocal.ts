//import { request } from '@umijs/max';

export type Estado = 'OK' | 'ALERTA' | 'CRITICO';

export interface MaquinaDTO {
  id: string;
  nombre: string;
  tipo: string;
  numero_serie: string;
  motor?: string;
}

export interface LecturaDTO {
  maquinaria_id: string;
  temperatura: number;
  vibracion: number;
  presion_aceite: number;
  ts: string; // ISO
  estado: Estado;
}

export interface ResumenDTO {
  total_maquinas: number;
  ok: number;
  alerta: number;
  critico: number;
  por_tipo: Record<string, number>;
}

// Cuando tengas backend real (Kaggle detrás), descomenta las llamadas a request()
// y apunta a tus endpoints. Mientras, usamos fallback local.

export async function fetchMaquinaria(): Promise<MaquinaDTO[]> {
  // Backend real:
  // return request<MaquinaDTO[]>('/api/maquinaria', { method: 'GET' });

  // Fallback: desde tu módulo Ingreso (LocalStorage)
  try {
    const raw = localStorage.getItem('maquinaria');
    if (raw) {
      const arr = JSON.parse(raw);
      return arr;
    }
  } catch {}
  // Fallback mínimo (por si no hay nada en LocalStorage)
  return [
    {
      id: '1',
      nombre: 'Excavadora CAT 320D',
      tipo: 'Excavadora',
      numero_serie: 'CAT320D-001',
      motor: 'Caterpillar C6.4',
    },
    {
      id: '2',
      nombre: 'Bulldozer Komatsu D85EX',
      tipo: 'Bulldozer',
      numero_serie: 'KOMD85-045',
      motor: 'Komatsu SAA6D125E-3',
    },
  ];
}

export async function fetchLecturas(): Promise<LecturaDTO[]> {
  // Backend real:
  // return request<LecturaDTO[]>('/api/sensores/ultimas', { method: 'GET' });

  // Fallback: JSON público en /public/data/lecturas.json
  const res = await fetch('/data/lecturas.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo cargar lecturas');
  return (await res.json()) as LecturaDTO[];
}

export async function fetchResumen(): Promise<ResumenDTO> {
  // Backend real:
  // return request<ResumenDTO>('/api/dashboard/resumen', { method: 'GET' });

  // Fallback: calcular KPIs con maquinaria + lecturas
  const [maqs, lecs] = await Promise.all([fetchMaquinaria(), fetchLecturas()]);
  const por_tipo: Record<string, number> = {};
  maqs.forEach((m) => {
    por_tipo[m.tipo] = (por_tipo[m.tipo] || 0) + 1;
  });
  let ok = 0,
    alerta = 0,
    critico = 0;
  lecs.forEach((l) => {
    if (l.estado === 'OK') ok++;
    else if (l.estado === 'ALERTA') alerta++;
    else if (l.estado === 'CRITICO') critico++;
  });
  return { total_maquinas: maqs.length, ok, alerta, critico, por_tipo };
}
