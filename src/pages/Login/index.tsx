// src/pages/Login.tsx
import React, { useState } from 'react';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { message, Alert } from 'antd';
import { history, useModel } from '@umijs/max';
import { loginByUsuarioCode, getCurrentUser } from '@/services/auth';

const Login: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const current = getCurrentUser();
      if (current) {
        await setInitialState((s: any) => ({ ...s, currentUser: current }));
        history.replace('/dashboard');
      }
    })();
  }, [setInitialState]);

  const handleSubmit = async (values: { code: string; name: string; autoLogin?: boolean }) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const user = await loginByUsuarioCode(values.code.trim(), values.name.trim(), !!values.autoLogin);
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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <LoginForm
        onFinish={handleSubmit}
        submitter={{ searchConfig: { submitText: 'Ingresar' }, submitButtonProps: { loading: submitting } }}
        title="Sistema de Mantenimiento Predictivo"
        subTitle="Inicia sesión con código y nombre"
      >
        {errorMsg && <Alert type="error" showIcon style={{ marginBottom: 16 }} message={errorMsg} />}

        <ProFormText
          name="code"
          fieldProps={{ size: 'large' }}
          placeholder="Código (ej: ADM001)"
          rules={[
            { required: true, message: 'Ingresa tu código' },
            { pattern: /^[A-Za-z0-9_-]{3,20}$/, message: 'Código inválido' },
          ]}
        />

        <ProFormText
          name="name"
          fieldProps={{ size: 'large' }}
          placeholder="Nombre (ej: Juan)"
          rules={[{ required: true, message: 'Ingresa tu nombre' }]}
        />

        <div style={{ marginBlockEnd: 12 }}>
          <ProFormCheckbox noStyle name="autoLogin">Recordarme</ProFormCheckbox>
        </div>

        <div style={{ color: '#999' }}>
          Ejemplos: ADM001 - Juan, OPR001 - Maria
        </div>
      </LoginForm>
    </div>
  );
};

export default Login;