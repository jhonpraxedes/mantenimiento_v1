// src/services/dashboardLocal.ts
import { MaquinariaStore } from '@/services/maquinariaLocal'; // ajusta ruta si es necesario

export type Estado = 'OK' | 'ALERTA' | 'CRITICO';

export interface MaquinaDTO {
  id: string;
  nombre: string;
  tipo: string;
  numero_serie: string;
  motor?: string;
}

export interface LecturaDTO {
  maquinaria_id?: string;
  numero_serie?: string;
  temperatura?: number; // °C
  vibracion?: number; // mm/s RMS
  presion_aceite?: number; // bar
  ts?: string; // ISO
  estado?: Estado;
  motivo?: string;
}

export interface ResumenDTO {
  total_maquinas: number;
  ok: number;
  alerta: number;
  critico: number;
  por_tipo: Record<string, number>;
}

/* Umbrales y evaluadores (igual que antes) */
export const VIBRATION_THRESHOLDS = { OK_MAX: 4.5, ALERTA_MAX: 7.1 };
export const TEMPERATURE_THRESHOLDS = { OK_MAX: 90, ALERTA_MAX: 115 };
export const PRESSURE_THRESHOLDS = {
  OK_MIN: 120,
  OK_MAX: 300,
  ALERTA_RANGES: [
    [100, 120],
    [300, 350],
  ],
  CRITICO_LOW: 100,
  CRITICO_HIGH: 350,
};

function evalVibracion(v: number): Estado {
  if (v > VIBRATION_THRESHOLDS.ALERTA_MAX) return 'CRITICO';
  if (v >= VIBRATION_THRESHOLDS.OK_MAX) return 'ALERTA';
  return 'OK';
}
function evalTemperatura(t: number): Estado {
  if (t > TEMPERATURE_THRESHOLDS.ALERTA_MAX) return 'CRITICO';
  if (t >= TEMPERATURE_THRESHOLDS.OK_MAX) return 'ALERTA';
  return 'OK';
}
function evalPresion(p: number): Estado {
  if (p < PRESSURE_THRESHOLDS.CRITICO_LOW || p > PRESSURE_THRESHOLDS.CRITICO_HIGH) return 'CRITICO';
  for (const [min, max] of PRESSURE_THRESHOLDS.ALERTA_RANGES) {
    if (p >= min && p <= max) return 'ALERTA';
  }
  if (p >= PRESSURE_THRESHOLDS.OK_MIN && p <= PRESSURE_THRESHOLDS.OK_MAX) return 'OK';
  return 'ALERTA';
}
export function estadoFromLecturaCombined(
  vibracion: number,
  temperatura: number,
  presion: number,
): { estado: Estado; motivos: string[] } {
  const resV = evalVibracion(vibracion);
  const resT = evalTemperatura(temperatura);
  const resP = evalPresion(presion);
  const motivos: string[] = [];
  if (resV === 'CRITICO') motivos.push(`Vibración CRÍTICO (${vibracion})`);
  else if (resV === 'ALERTA') motivos.push(`Vibración ALERTA (${vibracion})`);
  if (resT === 'CRITICO') motivos.push(`Temperatura CRÍTICO (${temperatura}°C)`);
  else if (resT === 'ALERTA') motivos.push(`Temperatura ALERTA (${temperatura}°C)`);
  if (resP === 'CRITICO') motivos.push(`Presión CRÍTICO (${presion} bar)`);
  else if (resP === 'ALERTA') motivos.push(`Presión ALERTA (${presion} bar)`);
  if (resV === 'CRITICO' || resT === 'CRITICO' || resP === 'CRITICO') {
    return { estado: 'CRITICO', motivos: motivos.length ? motivos : ['Métrica crítica'] };
  }
  if (resV === 'ALERTA' || resT === 'ALERTA' || resP === 'ALERTA') {
    return { estado: 'ALERTA', motivos: motivos.length ? motivos : ['Métrica en rango de alerta'] };
  }
  return { estado: 'OK', motivos: ['Todas las métricas en rango OK'] };
}

/* PRNG determinista */
function mulberry32(a: number) {
  let x = a | 0;
  return function () {
    x = (x + 0x6D2B79F5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function stringToUint32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* Generadores utilitarios */
function randWithRng(rng: () => number, min: number, max: number, decimals = 2) {
  const v = rng() * (max - min) + min;
  return Number(v.toFixed(decimals));
}

/* Generador de lectura determinista */
export function generateRandomLecturaForMachineSeeded(
  maquina: MaquinaDTO,
  seed?: string | number,
  tick = 0,
  opts?: { forceCritical?: boolean; base?: { temperatura?: number; vibracion?: number; presion?: number } },
): LecturaDTO {
  const seedStr = (seed === undefined || seed === null) ? String(Math.floor(Math.random() * 1e9)) : String(seed);
  const mix = `${seedStr}::${maquina.id}::${tick}`;
  const u = stringToUint32(mix);
  const rng = mulberry32(u);

  const baseTemp = opts?.base?.temperatura ?? randWithRng(rng, 60, 95, 1);
  const baseVib = opts?.base?.vibracion ?? randWithRng(rng, 1, 6, 2);
  const basePres = opts?.base?.presion ?? randWithRng(rng, 150, 320, 1);

  let temperatura = Number((baseTemp + (rng() - 0.5) * 6).toFixed(1));
  let vibracion = Number((Math.max(0, baseVib + (rng() - 0.5) * 2)).toFixed(2));
  let presion_aceite = Number((basePres + (rng() - 0.5) * 30).toFixed(1));

  if (opts?.forceCritical) {
    const r = rng();
    if (r < 0.33) vibracion = VIBRATION_THRESHOLDS.ALERTA_MAX + 2;
    else if (r < 0.66) presion_aceite = PRESSURE_THRESHOLDS.CRITICO_HIGH + 10;
    else temperatura = TEMPERATURE_THRESHOLDS.ALERTA_MAX + 20;
  }

  const ts = new Date().toISOString();
  const { estado, motivos } = estadoFromLecturaCombined(vibracion, temperatura, presion_aceite);

  return {
    maquinaria_id: maquina.id,
    numero_serie: maquina.numero_serie,
    temperatura,
    vibracion,
    presion_aceite,
    ts,
    estado,
    motivo: motivos.join('; '),
  };
}

/* Normalización existente */
async function normalizeLecturas(maqs: MaquinaDTO[], rawLecturas: any[]): Promise<LecturaDTO[]> {
  const bySerie = new Map<string, MaquinaDTO>();
  maqs.forEach((m) => bySerie.set((m.numero_serie || '').trim().toLowerCase(), m));

  const lecturas: LecturaDTO[] = (rawLecturas || []).map((r: any) => {
    const temperatura = Number(r.temperatura ?? r.temp ?? r.temp_c ?? null);
    const vibracion = Number(r.vibracion ?? r.vibration ?? null);
    let presion_raw = Number(r.presion_aceite ?? r.aceite ?? r.pressure ?? null);
    if (!isNaN(presion_raw) && presion_raw > 1000) {
      presion_raw = Number((presion_raw * 0.0689475729).toFixed(1)); // psi->bar heurística
    }
    const l: LecturaDTO = {
      maquinaria_id: r.maquinaria_id,
      numero_serie: r.numero_serie,
      temperatura: isNaN(temperatura) ? undefined : temperatura,
      vibracion: isNaN(vibracion) ? undefined : vibracion,
      presion_aceite: isNaN(presion_raw) ? undefined : presion_raw,
      ts: r.ts ?? r.timestamp ?? new Date().toISOString(),
    };

    if (!l.maquinaria_id && l.numero_serie) {
      const m = bySerie.get(l.numero_serie.trim().toLowerCase());
      if (m) l.maquinaria_id = m.id;
    }

    if (l.vibracion != null && l.temperatura != null && l.presion_aceite != null) {
      const { estado, motivos } = estadoFromLecturaCombined(l.vibracion, l.temperatura, l.presion_aceite);
      l.estado = estado;
      l.motivo = motivos.join('; ');
    }
    return l;
  });

  const latestByMaquina = new Map<string, LecturaDTO>();
  lecturas.forEach((lec) => {
    if (!lec.maquinaria_id) return;
    const prev = latestByMaquina.get(lec.maquinaria_id);
    if (!prev || (lec.ts && new Date(lec.ts).getTime() > (prev.ts ? new Date(prev.ts).getTime() : 0))) {
      latestByMaquina.set(lec.maquinaria_id, lec);
    }
  });

  return Array.from(latestByMaquina.values());
}

/* Fetchers principales */
export async function fetchMaquinaria(): Promise<MaquinaDTO[]> {
  try {
    const maqs = await MaquinariaStore.list();
    return maqs.map((m: any) => ({
      id: String(m.id),
      nombre: m.nombre,
      tipo: m.tipo,
      numero_serie: m.numero_serie,
      motor: m.motor,
    }));
  } catch (err) {
    console.warn('[dashboardLocal] Error leyendo MaquinariaStore, fallback:', err);
  }
  return [
    { id: '1', nombre: 'Excavadora CAT 320D', tipo: 'Excavadora', numero_serie: 'CAT320D-001', motor: 'Caterpillar C6.4' },
    { id: '2', nombre: 'Bulldozer Komatsu D85EX', tipo: 'Bulldozer', numero_serie: 'KOMD85-045', motor: 'Komatsu SAA6D125E-3' },
  ];
}

export async function fetchLecturas(simulate = false, simulateMissingOnly = true, seed?: string | number, tick?: number): Promise<LecturaDTO[]> {
  try {
    const res = await fetch('/data/lecturas.json', { cache: 'no-store' });
    const raw = res.ok ? await res.json() : [];
    const maqs = await fetchMaquinaria();
    const normalized = await normalizeLecturas(maqs, raw);

    const defaultTick = Math.floor(Date.now() / 5000);
    const usedTick = tick ?? defaultTick;

    if (!simulate) {
      const byId = new Map(normalized.map((l) => [String(l.maquinaria_id), l]));
      return maqs.map((m) => byId.get(String(m.id)) ?? { maquinaria_id: m.id, numero_serie: m.numero_serie, motivo: 'Sin lecturas' } as LecturaDTO);
    }

    const byId = new Map(normalized.map((l) => [String(l.maquinaria_id), l]));
    const result: LecturaDTO[] = maqs.map((m) => {
      const existing = byId.get(String(m.id));
      if (existing && simulateMissingOnly) {
        return existing;
      }
      return generateRandomLecturaForMachineSeeded(m, seed, usedTick);
    });

    return result;
  } catch (err) {
    console.warn('[dashboardLocal] Error fetchLecturas (simulada):', err);
    try {
      const maqs = await fetchMaquinaria();
      const defaultTick = Math.floor(Date.now() / 5000);
      return maqs.map((m) => generateRandomLecturaForMachineSeeded(m, seed, defaultTick));
    } catch {
      return [];
    }
  }
}

export async function fetchResumen(simulate = false, simulateMissingOnly = true, seed?: string | number, tick?: number): Promise<ResumenDTO> {
  const [maqs, lecs] = await Promise.all([fetchMaquinaria(), fetchLecturas(simulate, simulateMissingOnly, seed, tick)]);
  const por_tipo: Record<string, number> = {};
  maqs.forEach((m) => { por_tipo[m.tipo] = (por_tipo[m.tipo] || 0) + 1; });
  let ok = 0, alerta = 0, critico = 0;
  lecs.forEach((l) => {
    if (l.estado === 'OK') ok++;
    else if (l.estado === 'ALERTA') alerta++;
    else if (l.estado === 'CRITICO') critico++;
  });
  return { total_maquinas: maqs.length, ok, alerta, critico, por_tipo };
}