import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'es-ES',
    antd: true,
    baseSeparator: '-',
  },
  layout: {
    title: 'Mantenimiento Predictivo',
    locale: true,
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: '@/pages/Login',
    },
    {
      name: 'Inicio',
      path: '/inicio',
      component: './Inicio',
    },

    {
      name: 'Ingreso',
      path: '/ingreso',
      component: './Ingreso',
      access: 'canSeeAdmin', // Solo admin
    },
    {
      name: 'Usuarios',
      path: '/usuarios',
      component: './Usuarios',
      access: 'canSeeAdmin',
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      component: './Dashboard',
      access: 'isLoggedIn',
    },

    {
      name: 'Reportes',
      path: '/reportes',
      component: './Reportes',
      access: 'isLoggedIn',
    },
    { path: '/', redirect: '/inicio' },
  ],
  npmClient: 'pnpm',
});
