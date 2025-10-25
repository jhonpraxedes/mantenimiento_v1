import { BookOutlined, LaptopOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Divider, Row, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  return (
    <PageContainer
      header={{
        title: 'Inicio',
        subTitle: 'Bienvenido al Sistema de Mantenimiento Predictivo',
      }}
    >
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <Card
            bordered
            style={{
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              padding: '32px',
              borderRadius: '12px',
            }}
          >
            <Title level={2} style={{ color: '#003366' }}>
              Universidad Mariano Gálvez de Guatemala
            </Title>
            <Title level={4} style={{ color: '#0050b3', marginTop: '8px' }}>
              Ingeniería en Sistemas de Información y Ciencias de la Computación
            </Title>

            <Divider />

            <Paragraph style={{ fontSize: 18, marginBottom: 0 }}>
              <Text strong>Proyecto de Graduación II</Text>
            </Paragraph>

            <Paragraph style={{ fontSize: 16, marginTop: 4 }}>
              <BookOutlined /> Dra. Sheyla Yadira Esquivel <br />
              <LaptopOutlined /> Lic. Evelyn Amalia Aguilar Ordoñez
            </Paragraph>

            <Divider />

            <Title level={3} style={{ color: '#222' }}>
              <q>
                Sistema de mantenimiento predictivo enfocado a empresas de
                maquinaria pesada en Guatemala
              </q>
            </Title>

            <Divider />

            <Paragraph>
              <Text strong style={{ fontSize: 18 }}>
                Autor:
              </Text>
              <br />
              <Text style={{ fontSize: 17 }}>
                Jhonatan Praxedes Salazar Zepeda
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 16 }}>
                0905-12-2132
              </Text>
            </Paragraph>

            {user && (
              <>
                <Divider />
                <Paragraph type="secondary">
                  Sesión iniciada como:{' '}
                  <Text strong>
                    {user.name} ({user.rol})
                  </Text>
                </Paragraph>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Home;
