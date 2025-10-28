// src/services/auth.ts
import { UsuariosStore } from '@/services/usuariosLocal';
import type { Usuario } from '@/constants/usuarios';

export type Rol = 'Administrador' | 'Operador';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  rol: Rol;
  token?: string;
}

const LS_KEY = 'currentUser_v1';       // persistente (localStorage) con expiración
const SS_KEY = 'currentUser_session';  // por pestaña (sessionStorage), sin expiración

// TTL por defecto para localStorage (24 horas)
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

type StoredSession = {
  session: UserSession;
  expiresAt: number;
};

export async function loginByUsuarioCode(
  code: string,
  name: string,
  remember = false, // si true -> localStorage (persistente). si false -> sessionStorage (solo pestaña)
  ttlMs = DEFAULT_TTL_MS,
): Promise<UserSession> {
  const codeTrim = (code ?? '').trim();
  const nameTrim = (name ?? '').trim();

  if (!codeTrim) throw new Error('El código es requerido');
  if (!nameTrim) throw new Error('El nombre es requerido');

  await new Promise((r) => setTimeout(r, 200));
  const usuarios: Usuario[] = await UsuariosStore.list();

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    throw new Error('No hay usuarios registrados');
  }

  const usuario = usuarios.find(
    (u) => (u.code ?? '').trim().toLowerCase() === codeTrim.toLowerCase(),
  );

  if (!usuario) {
    const available = usuarios.map((u) => u.code).join(', ');
    throw new Error(`Código inválido. Disponibles: ${available}`);
  }

  if ((usuario.name ?? '').trim().toLowerCase() !== nameTrim.toLowerCase()) {
    throw new Error('El nombre no coincide con el código');
  }

  const session: UserSession = {
    id: usuario.id,
    name: usuario.name,
    email: '',
    rol: usuario.rol as Rol,
    token: `local-${usuario.id}-${Date.now()}`,
  };

  if (remember) {
    // guardar en localStorage con expiración
    const stored: StoredSession = {
      session,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(stored));
    // limpiar cualquier sessionStorage anterior
    try { sessionStorage.removeItem(SS_KEY); } catch {}
  } else {
    // guardar en sessionStorage (persistirá solo al refrescar la misma pestaña)
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(session));
    } catch {}
    // limpiar cualquier localStorage previa
    localStorage.removeItem(LS_KEY);
  }

  return session;
}

export function getCurrentUser(): UserSession | null {
  // 1) Primero intentar sessionStorage (pestaña actual)
  try {
    const ssRaw = sessionStorage.getItem(SS_KEY);
    if (ssRaw) {
      const sess = JSON.parse(ssRaw) as UserSession;
      if (sess && sess.id) return sess;
      // si está corrupto, limpiar
      sessionStorage.removeItem(SS_KEY);
    }
  } catch {
    try { sessionStorage.removeItem(SS_KEY); } catch {}
  }

  // 2) Luego intentar localStorage (persistente)
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredSession;
    if (!stored || !stored.session || !stored.expiresAt) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    if (Date.now() > stored.expiresAt) {
      // expiró -> limpiar
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return stored.session as UserSession;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}

export function logoutLocal() {
  try { sessionStorage.removeItem(SS_KEY); } catch {}
  localStorage.removeItem(LS_KEY);
}