// src/app.tsx
import React from 'react';
import { getCurrentUser, logoutLocal } from '@/services/auth';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Button, Space, Tag } from 'antd';

export async function getInitialState() {
  try {
    const currentUser = getCurrentUser();
    return { currentUser };
  } catch (err) {
    console.error('Error al cargar initialState', err);
    return { currentUser: undefined };
  }
}

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const publicPaths = ['/login', '/inicio', '/'];

  return {
    title: 'Mantenimiento Predictivo',

    onPageChange: () => {
      if (initialState === undefined) return;
      const pathname = history.location.pathname;
      const isPublic = publicPaths.includes(pathname);
      const logged = !!initialState?.currentUser;
      if (!logged && !isPublic) {
        history.replace('/login');
      }
    },

    headerRender: (headerProps, defaultDom) => {
      // DEBUG: descomenta si quieres ver el estado en consola
      // console.log('headerRender initialState:', initialState);

      const user = initialState?.currentUser;
      if (!user) return defaultDom;

      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: 1 }}>{defaultDom}</div>
          <Space style={{ marginRight: 16 }}>
            <Tag color="blue">
              {user.name} · {user.rol}
            </Tag>
            <Button
              size="small"
              onClick={async () => {
                logoutLocal();
                await setInitialState?.((s: any) => ({ ...s, currentUser: undefined }));
                history.replace('/login');
              }}
            >
              Cerrar sesión
            </Button>
          </Space>
        </div>
      );
    },
  };
};