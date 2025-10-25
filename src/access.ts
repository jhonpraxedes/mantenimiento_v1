type Rol = 'Administrador' | 'Operador';

export default function access(initialState: any) {
  const rol = initialState?.currentUser?.rol as Rol | undefined;

  return {
    // Sesión iniciada
    isLoggedIn: !!rol,

    // Solo administradores
    canAdmin: rol === 'Administrador',

    // Operadores y administradores
    canOperator: rol === 'Operador' || rol === 'Administrador',

    // Compatibilidad con rutas antiguas que usaban canSeeAdmin
    canSeeAdmin: rol === 'Administrador',
  };
}
