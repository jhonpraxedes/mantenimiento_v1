import { Maquinaria, TIPOS_MAQUINARIA } from '@/constants/maquinaria';
import { MaquinariaStore } from '@/services/maquinariaLocal';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

const Ingreso: React.FC = () => {
  const [maquinas, setMaquinas] = useState<Maquinaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await MaquinariaStore.list();
      setMaquinas(data);
    } catch {
      message.error('Error al cargar maquinaria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await MaquinariaStore.update(editingId, values);
        message.success('Máquina actualizada correctamente');
      } else {
        await MaquinariaStore.create(values);
        message.success('Máquina creada correctamente');
      }
      setModalVisible(false);
      setEditingId(null);
      cargarDatos();
      return true;
    } catch (error: any) {
      message.error(error.message || 'Error al guardar');
      return false;
    }
  };

  const handleEdit = (record: Maquinaria) => {
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await MaquinariaStore.delete(id);
      message.success('Eliminado correctamente');
      cargarDatos();
    } catch {
      message.error('Error al eliminar maquinaria');
    }
  };

  const columns: ProColumns<Maquinaria>[] = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      width: 150,
      render: (_, record) => {
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
      title: 'Descripción',
      dataIndex: 'descripcion',
      width: 300,
    },
    {
      title: 'Número de Serie',
      dataIndex: 'numero_serie',
      width: 180,
    },
    {
      title: 'Motor',
      dataIndex: 'motor',
      width: 180,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Deseas eliminar esta máquina?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Ingreso de Maquinaria',
        subTitle: 'Gestión de maquinaria pesada',
      }}
    >
      <ProTable<Maquinaria>
        columns={columns}
        dataSource={maquinas}
        rowKey="id"
        loading={loading}
        search={false}
        pagination={{ pageSize: 5 }}
        toolBarRender={() => [
          <Button
            key="add"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingId(null);
              setModalVisible(true);
            }}
          >
            Nueva Maquinaria
          </Button>,
        ]}
      />

      <ModalForm
        title={editingId ? 'Editar Maquinaria' : 'Nueva Maquinaria'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        width={500}
        request={async () => {
          if (editingId) {
            const maquina = await MaquinariaStore.get(editingId);
            return maquina || {};
          }
          return {};
        }}
      >
        {/* Campos del formulario */}
        <ProFormText
          name="nombre"
          label="Nombre"
          placeholder="Ej: Excavadora CAT 320D"
          rules={[{ required: true, message: 'El nombre es obligatorio' }]}
        />
        <ProFormSelect
          name="tipo"
          label="Tipo de maquinaria"
          options={TIPOS_MAQUINARIA.map((t) => ({ label: t, value: t }))}
          placeholder="Selecciona el tipo"
          rules={[{ required: true, message: 'El tipo es obligatorio' }]}
        />
        <ProFormTextArea
          name="descripcion"
          label="Descripción"
          placeholder="Descripción breve de la máquina"
        />
        <ProFormText
          name="numero_serie"
          label="Número de Serie"
          placeholder="Ej: CAT320D-001"
          rules={[
            { required: true, message: 'El número de serie es obligatorio' },
          ]}
        />
        <ProFormText
          name="motor"
          label="Motor"
          placeholder="Ej: Caterpillar C6.4"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Ingreso;
