import { Maquinaria } from '@/constants/maquinaria';
import { MaquinariaStore } from '@/services/maquinariaLocal';
import { DownloadOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';

const Reportes: React.FC = () => {
  const [data, setData] = useState<Maquinaria[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarMaquinaria = async () => {
    try {
      setLoading(true);
      const lista = await MaquinariaStore.list();
      setData(lista);
    } catch (error) {
      message.error('Error al cargar los datos de maquinaria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMaquinaria();
  }, []);

  const columns: ProColumns<Maquinaria>[] = [
    { title: 'Nombre', dataIndex: 'nombre', width: 200 },
    { title: 'Tipo', dataIndex: 'tipo', width: 150 },
    { title: 'Descripción', dataIndex: 'descripcion', width: 250 },
    { title: 'Número de Serie', dataIndex: 'numero_serie', width: 180 },
    { title: 'Motor', dataIndex: 'motor', width: 150 },
  ];

  const handleExportarPDF = () => {
    if (data.length === 0) {
      message.warning('No hay maquinaria registrada para exportar');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      // Encabezado
      doc.setFontSize(18);
      doc.text('Reporte de Maquinaria Registrada', 40, 40);

      const fecha = new Date().toLocaleString('es-GT', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      doc.setFontSize(10);
      doc.text(`Generado el: ${fecha}`, 40, 60);

      // Contenido de la tabla
      const body = data.map((m, i) => [
        i + 1,
        m.nombre,
        m.tipo,
        m.descripcion || '-',
        m.numero_serie,
        m.motor || '-',
      ]);

      autoTable(doc, {
        startY: 80,
        head: [
          ['#', 'Nombre', 'Tipo', 'Descripción', 'Número de Serie', 'Motor'],
        ],
        body,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [33, 150, 243], halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 30 },
          1: { cellWidth: 120 },
          2: { cellWidth: 100 },
          3: { cellWidth: 200 },
          4: { cellWidth: 100 },
          5: { cellWidth: 100 },
        },
      });

      // Esto es lo que funciona SIEMPRE en Brave 🔥
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank'); // Abre el PDF en una nueva pestaña

      message.success(
        'Reporte PDF generado. Se abrirá en una nueva pestaña ✅',
      );
    } catch (error) {
      console.error(error);
      message.error('Error al generar el PDF');
    }
  };

  return (
    <PageContainer
      header={{
        title: '📋 Reportes de Maquinaria',
        subTitle: 'Genera y descarga el reporte en PDF',
      }}
    >
      <ProTable<Maquinaria>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        search={false}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 800 }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            type="primary"
            onClick={handleExportarPDF}
          >
            Exportar PDF
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Reportes;
