import { loginLocal } from '@/services/auth';
import { UsuariosService } from '@/services/usuarios';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Alert, message } from 'antd';
import React, { useState } from 'react';

const Login: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      // verificar si existe en localStorage y redirigirlo al home
    })();
  }, []);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const isUserAccepted = await UsuariosService.actualizar({
        name: values.email.trim(),
        errorCode: values.password,
      });

      console.info(isUserAccepted);
      const user = await loginLocal(values.email.trim(), values.password);
      await setInitialState((s: any) => ({ ...s, currentUser: user }));
      message.success(`Bienvenido, ${user.name}`);
      history.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error de autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <LoginForm
        onFinish={handleSubmit}
        submitter={{
          searchConfig: { submitText: 'Ingresar' },
          submitButtonProps: { loading: submitting },
        }}
        title="Sistema de Mantenimiento Predictivo"
        subTitle="Empresas de maquinaria pesada en Guatemala"
      >
        {errorMsg && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={errorMsg}
          />
        )}
        <ProFormText
          name="email"
          fieldProps={{ size: 'large', prefix: <MailOutlined /> }}
          placeholder="Correo (ej: admin@demo.com)"
          rules={[
            { required: true, message: 'Ingresa tu correo' },
            { type: 'string', message: 'Correo inválido' },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
          placeholder="Contraseña (ej: 123456)"
          rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
        />
        <div style={{ marginBlockEnd: 12 }}>
          <ProFormCheckbox noStyle name="autoLogin">
            Recordarme
          </ProFormCheckbox>
        </div>
        <div style={{ color: '#999' }}>
          Demo: admin@demo.com / 123456 (Administrador) • user@demo.com / 123456
          (Operador)
        </div>
      </LoginForm>
    </div>
  );
};

export default Login;
