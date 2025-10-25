export type Rol = 'Administrador' | 'Operador';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  rol: Rol;
  token?: string;
}

const LS_KEY = 'currentUser';

export async function loginLocal(
  email: string,
  password: string,
): Promise<UserSession> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 400);
  });

  if (email === 'admin@demo.com' && password === '123456') {
    const u: UserSession = {
      id: '1',
      name: 'Admin',
      email,
      rol: 'Administrador',
      token: 'demo-admin',
    };
    localStorage.setItem(LS_KEY, JSON.stringify(u));
    return u;
  }
  if (email === 'user@demo.com' && password === '123456') {
    const u: UserSession = {
      id: '2',
      name: 'Operador',
      email,
      rol: 'Operador',
      token: 'demo-user',
    };
    localStorage.setItem(LS_KEY, JSON.stringify(u));
    return u;
  }
  throw new Error('Credenciales inválidas');
}

export function getCurrentUser(): UserSession | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function logoutLocal() {
  localStorage.removeItem(LS_KEY);
}
