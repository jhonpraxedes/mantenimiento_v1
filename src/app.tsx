import { logoutLocal } from '@/services/auth';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Button, Space, Tag } from 'antd';

export async function getInitialState() {
  const raw = localStorage.getItem('currentUser');
  const currentUser = raw ? JSON.parse(raw) : undefined;
  return { currentUser };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => ({
  title: 'Mantenimiento Predictivo',
  onPageChange: () => {
    const { location } = history;
    const isLogin = location.pathname === '/login';
    // Ajuste: permitir /inicio (y /) sin login si quieres que Inicio sea pública
    const isInicio =
      location.pathname === '/inicio' || location.pathname === '/';
    const logged = !!initialState?.currentUser;

    if (!logged && !isLogin && !isInicio) {
      history.push('/login');
    }
  },
  headerRender: (headerProps, defaultDom) => {
    const user = initialState?.currentUser;
    if (!user) return defaultDom; // deja el header por defecto sin botón

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {/* Izquierda: DOM por defecto (logo, título, breadcrumb) */}
        <div style={{ flex: 1 }}>{defaultDom}</div>

        {/* Derecha: usuario + botón logout */}
        <Space style={{ marginRight: 16 }}>
          <Tag color="blue">
            {user.name} · {user.rol}
          </Tag>
          <Button
            size="small"
            onClick={async () => {
              logoutLocal();
              await setInitialState?.((s: any) => ({
                ...s,
                currentUser: undefined,
              }));
              history.push('/login');
            }}
          >
            Cerrar sesión
          </Button>
        </Space>
      </div>
    );
  },
});
