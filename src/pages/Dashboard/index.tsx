import React, { useEffect, useMemo, useState } from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Button, message } from 'antd';
import {
  fetchMaquinaria,
  fetchLecturas,
  MaquinaDTO,
  LecturaDTO,
} from '@/services/dashboardLocal';
//import '@/styles/global.css';

type Estado = 'OK' | 'ALERTA' | 'CRITICO';

type RowItem = MaquinaDTO & LecturaDTO & { id: string };

const tagEstado = (e?: Estado) => {
  switch (e) {
    case 'CRITICO':
      return <Tag color="red">CRÍTICO</Tag>;
    case 'ALERTA':
      return <Tag color="orange">ALERTA</Tag>;
    case 'OK':
    default:
      return <Tag color="green">OK</Tag>;
  }
};

const DashboardPage: React.FC = () => {
  const [maquinas, setMaquinas] = useState<MaquinaDTO[]>([]);
  const [lecturas, setLecturas] = useState<LecturaDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const rows: RowItem[] = useMemo(() => {
    const byId = new Map<string, LecturaDTO>();
    lecturas.forEach((l) => {
      if (l.maquinaria_id) byId.set(l.maquinaria_id, l);
    });

    return maquinas.map((m) => {
      const l = byId.get(m.id);
      return {
        ...m,
        ...l,
        id: m.id,
      } as RowItem;
    });
  }, [maquinas, lecturas]);

  useEffect(() => {
    let mounted = true;
    const url = new URL(window.location.href);
    const seed = url.searchParams.get('seed') ?? 'demo-1';
    const simulate = true;
    const simulateMissingOnly = false;

    async function load(tick?: number) {
      try {
        setLoading(true);
        const usedTick = typeof tick === 'number' ? tick : Math.floor(Date.now() / 5000);
        const [m, l] = await Promise.all([
          fetchMaquinaria(),
          fetchLecturas(simulate, simulateMissingOnly, seed, usedTick),
        ]);
        if (!mounted) return;
        setMaquinas(m);
        setLecturas(l);
      } catch (err: any) {
        console.error('Error cargando dashboard:', err);
        if (mounted) message.error('Error al cargar datos del dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const interval = setInterval(() => {
      const tick = Math.floor(Date.now() / 5000);
      load(tick);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const columns: ProColumns<RowItem>[] = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      width: 240,
      fixed: 'left',
      render: (_dom: React.ReactNode, record: RowItem) => <b>{record.nombre}</b>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      width: 160,
      render: (_dom: React.ReactNode, record: RowItem) => {
        const color =
          record.tipo === 'Excavadora'
            ? 'blue'
            : record.tipo === 'Bulldozer'
            ? 'red'
            : record.tipo === 'Cargador frontal'
            ? 'orange'
            : 'green';
        return <Tag color={color}>{record.tipo}</Tag>;
      },
    },
    {
      title: 'N° Serie',
      dataIndex: 'numero_serie',
      width: 180,
      render: (_dom: React.ReactNode, record: RowItem) => record.numero_serie ?? '—',
    },
    {
      title: 'Motor',
      dataIndex: 'motor',
      width: 180,
      render: (_dom: React.ReactNode, record: RowItem) => record.motor ?? '—',
    },
    {
      title: 'Temp (°C)',
      dataIndex: 'temperatura',
      width: 120,
      render: (_dom: React.ReactNode, record: RowItem) => (record.temperatura !== null ? record.temperatura : '—'),
    },
    {
      title: 'Vibración (mm/s)',
      dataIndex: 'vibracion',
      width: 150,
      render: (_dom: React.ReactNode, record: RowItem) => (record.vibracion !== null ? record.vibracion : '—'),
    },
    {
      title: 'Aceite (bar)',
      dataIndex: 'presion_aceite',
      width: 130,
      render: (_dom: React.ReactNode, record: RowItem) => (record.presion_aceite !== null ? record.presion_aceite : '—'),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 130,
      render: (_dom: React.ReactNode, record: RowItem) => tagEstado(record.estado as Estado),
      filters: true,
      onFilter: (value: any, record: RowItem) => record.estado === (value as Estado),
      valueEnum: {
        OK: { text: 'OK' },
        ALERTA: { text: 'ALERTA' },
        CRITICO: { text: 'CRÍTICO' },
      },
    },
    {
      title: 'Detalle',
      dataIndex: 'motivo',
      width: 320,
      render: (_dom: React.ReactNode, record: RowItem) => {
        const val = record.motivo ?? '';
        const short = val ? val.split(';')[0] : '—';
        return <span title={val}>{short}</span>;
      },
    },
    {
      title: 'Última lectura',
      dataIndex: 'ts',
      width: 180,
      render: (_dom: React.ReactNode, record: RowItem) => (record.ts ? new Date(record.ts).toLocaleString() : '—'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_dom: React.ReactNode, record: RowItem) => (
        <Space>
          <Button type="link" onClick={() => message.info(`Ver detalles ${record.nombre}`)}>
            Ver
          </Button>
          <Button type="link" onClick={() => message.info(`Historial ${record.nombre}`)}>
            Historial
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Dashboard de Maquinaria',
        subTitle: 'Estado en tiempo real (simulado determinista con seed)',
      }}
    >
      <ProTable<RowItem>
        columns={columns}
        dataSource={rows}
        rowKey="id"
        loading={loading}
        search={false}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1400 }}
        toolBarRender={() => [
          <Space key="legend">
            <Tag color="green">OK</Tag>
            <Tag color="orange">ALERTA</Tag>
            <Tag color="red">CRÍTICO</Tag>
            <Button
              key="refresh"
              onClick={async () => {
                setLoading(true);
                try {
                  const url = new URL(window.location.href);
                  const seed = url.searchParams.get('seed') ?? 'demo-1';
                  const simulate = true;
                  const simulateMissingOnly = false;
                  const tick = Math.floor(Date.now() / 5000);
                  const [m, l] = await Promise.all([
                    fetchMaquinaria(),
                    fetchLecturas(simulate, simulateMissingOnly, seed, tick),
                  ]);
                  setMaquinas(m);
                  setLecturas(l);
                } catch (err) {
                  message.error('Error al refrescar');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Forzar refresh
            </Button>
          </Space>,
        ]}
        rowClassName={(record: RowItem) => {
          switch (record.estado) {
            case 'CRITICO':
              return 'row-critical';
            case 'ALERTA':
              return 'row-alert';
            case 'OK':
            default:
              return '';
          }
        }}
      />
    </PageContainer>
  );
};

export default DashboardPage;