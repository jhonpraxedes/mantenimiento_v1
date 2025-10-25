import { ROLES_USUARIO, Usuario } from '@/constants/usuarios';
import { UsuariosStore } from '@/services/usuariosLocal';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await UsuariosStore.list();
      setUsuarios(data);
    } catch (error) {
      message.error('Error al cargar usuarios');
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
        await UsuariosStore.update(editingId, values);
        message.success('Usuario actualizado correctamente');
      } else {
        await UsuariosStore.create(values);
        message.success('Usuario creado correctamente');
      }
      setModalVisible(false);
      setEditingId(null);
      cargarDatos();
      return true;
    } catch (error: any) {
      message.error(error.message || 'Error al guardar usuario');
      return false;
    }
  };

  const handleEdit = (record: Usuario) => {
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await UsuariosStore.delete(id);
      message.success('Usuario eliminado correctamente');
      cargarDatos();
    } catch (error) {
      message.error('Error al eliminar usuario');
    }
  };

  const columns: ProColumns<Usuario>[] = [
    {
      title: 'Código',
      dataIndex: 'code',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      width: 150,
      filters: ROLES_USUARIO.map((rol) => ({ text: rol, value: rol })),
      onFilter: (value, record) => record.rol === value,
      render: (_, record) => {
        const color = record.rol === 'Administrador' ? 'red' : 'blue';
        return <Tag color={color}>{record.rol}</Tag>;
      },
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'created_at',
      width: 180,
      valueType: 'dateTime',
      sorter: (a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
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
            title="¿Estás seguro de eliminar este usuario?"
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
        title: 'Gestión de Usuarios',
        subTitle: 'Administración de usuarios del sistema',
      }}
    >
      <ProTable<Usuario>
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        loading={loading}
        search={false}
        dateFormatter="string"
        scroll={{ x: 900 }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingId(null);
              setModalVisible(true);
            }}
          >
            Nuevo Usuario
          </Button>,
        ]}
      />

      <ModalForm
        title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleSubmit}
        width={500}
        request={async () => {
          if (editingId) {
            const usuario = await UsuariosStore.get(editingId);
            return usuario || {};
          }
          return {};
        }}
      >
        <ProFormText
          name="code"
          label="Código"
          placeholder="Ej: ADM-001, OPR-001"
          rules={[
            { required: true, message: 'El código es requerido' },
            {
              pattern: /^[A-Z]{3}-\d{3}$/,
              message: 'Formato: XXX-000 (Ej: ADM-001)',
            },
          ]}
        />
        <ProFormText
          name="name"
          label="Nombre Completo"
          placeholder="Ingrese el nombre completo"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
          ]}
        />
        <ProFormSelect
          name="rol"
          label="Rol"
          options={ROLES_USUARIO.map((rol) => ({ label: rol, value: rol }))}
          rules={[{ required: true, message: 'El rol es requerido' }]}
          placeholder="Seleccione un rol"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Usuarios;
