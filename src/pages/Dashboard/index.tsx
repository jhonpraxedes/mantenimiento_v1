import {
  fetchLecturas,
  fetchMaquinaria,
  fetchResumen,
  type LecturaDTO,
  type MaquinaDTO,
  type ResumenDTO,
} from '@/services/dashboardLocal';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Card, Col, message, Row, Space, Statistic, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type RowItem = {
  id: string;
  nombre: string;
  tipo: string;
  numero_serie: string;
  motor?: string;
  temperatura?: number;
  vibracion?: number;
  presion_aceite?: number;
  estado?: 'OK' | 'ALERTA' | 'CRITICO';
  ts?: string;
};

const COLORS = [
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#d0ed57',
];

const tagEstado = (estado?: RowItem['estado']) => {
  switch (estado) {
    case 'OK':
      return <Tag color="green">OK</Tag>;
    case 'ALERTA':
      return <Tag color="orange">ALERTA</Tag>;
    case 'CRITICO':
      return <Tag color="red">CRÍTICO</Tag>;
    default:
      return <Tag>—</Tag>;
  }
};

const Dashboard: React.FC = () => {
  const [maquinas, setMaquinas] = useState<MaquinaDTO[]>([]);
  const [lecturas, setLecturas] = useState<LecturaDTO[]>([]);
  const [resumen, setResumen] = useState<ResumenDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [m, l, r] = await Promise.all([
        fetchMaquinaria(),
        fetchLecturas(),
        fetchResumen(),
      ]);
      setMaquinas(m);
      setLecturas(l);
      setResumen(r);
    } catch (e) {
      console.error(e);
      message.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // Simulación de tiempo real: refresca lecturas y resumen cada 10s
    const id = setInterval(() => {
      Promise.all([fetchLecturas(), fetchResumen()])
        .then(([l, r]) => {
          setLecturas(l);
          setResumen(r);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const rows: RowItem[] = useMemo(() => {
    const byId = new Map(lecturas.map((l) => [l.maquinaria_id, l]));
    return maquinas.map((m) => {
      const lec = byId.get(m.id);
      return {
        id: m.id,
        nombre: m.nombre,
        tipo: m.tipo,
        numero_serie: m.numero_serie,
        motor: m.motor,
        temperatura: lec?.temperatura,
        vibracion: lec?.vibracion,
        presion_aceite: lec?.presion_aceite,
        estado: lec?.estado,
        ts: lec?.ts,
      };
    });
  }, [maquinas, lecturas]);

  const columns: ProColumns<RowItem>[] = [
    { title: 'Nombre', dataIndex: 'nombre', width: 220, fixed: 'left' },
    { title: 'Tipo', dataIndex: 'tipo', width: 160 },
    { title: 'N° Serie', dataIndex: 'numero_serie', width: 160 },
    { title: 'Motor', dataIndex: 'motor', width: 160 },
    { title: 'Temp (°C)', dataIndex: 'temperatura', width: 120 },
    { title: 'Vibración (mm/s)', dataIndex: 'vibracion', width: 150 },
    { title: 'Aceite (PSI)', dataIndex: 'presion_aceite', width: 130 },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 120,
      render: (_, r) => tagEstado(r.estado),
      filters: true,
      onFilter: (v, r) => r.estado === v,
      valueEnum: {
        OK: { text: 'OK' },
        ALERTA: { text: 'ALERTA' },
        CRITICO: { text: 'CRÍTICO' },
      },
    },
    {
      title: 'Última lectura',
      dataIndex: 'ts',
      width: 180,
      valueType: 'dateTime',
    },
  ];

  const dataPie = useMemo(() => {
    if (!resumen) return [];
    return Object.entries(resumen.por_tipo).map(([name, value]) => ({
      name,
      value,
    }));
  }, [resumen]);

  const dataBar = useMemo(
    () => [
      { name: 'OK', value: resumen?.ok ?? 0 },
      { name: 'ALERTA', value: resumen?.alerta ?? 0 },
      { name: 'CRÍTICO', value: resumen?.critico ?? 0 },
    ],
    [resumen],
  );

  return (
    <PageContainer
      header={{
        title: 'Dashboard',
        subTitle: 'Estado de maquinaria (simulado / listo para backend)',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total maquinaria"
              value={resumen?.total_maquinas ?? 0}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="En OK"
              value={resumen?.ok ?? 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="En ALERTA"
              value={resumen?.alerta ?? 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic
              title="En CRÍTICO"
              value={resumen?.critico ?? 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Maquinaria por tipo"
            loading={loading}
            style={{ height: 380 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {dataPie.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Estado de máquinas"
            loading={loading}
            style={{ height: 380 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Detalle por maquinaria" loading={loading}>
            <ProTable<RowItem>
              columns={columns}
              dataSource={rows}
              rowKey="id"
              search={false}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1200 }}
              toolBarRender={() => [
                <Space key="legend">
                  <Tag color="green">OK</Tag>
                  <Tag color="orange">ALERTA</Tag>
                  <Tag color="red">CRÍTICO</Tag>
                </Space>,
              ]}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
