import { forwardRef } from 'react';
import styles from './ReporteMaquinaria.module.css';

type Props = {
  titulo: string;
  empresa?: string;
  fecha?: string; // YYYY-MM-DD
  logoUrl?: string; // opcional, por ejemplo '/img1.svg'
  resumen: {
    codigo: string;
    tipo: string;
    horasUso: number;
    mantenimientos: number;
    fallas: number;
    disponibilidad: number;
  }[];
};

const ReporteMaquinaria = forwardRef<HTMLDivElement, Props>(
  ({ titulo, empresa = 'Empresa', fecha, logoUrl, resumen }, ref) => {
    const f = fecha ?? new Date().toISOString().slice(0, 10);

    return (
      <div ref={ref} className={styles.containerA4}>
        {/* Portada */}
        <div className={`${styles.page} ${styles.portada}`}>
          <div className={styles.header}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className={styles.logo} />
            ) : null}
            <h1 className={styles.title}>{titulo}</h1>
          </div>
          <div>
            <p className={styles.empresa}>{empresa}</p>
            <p style={{ margin: 0 }}>Fecha: {f}</p>
          </div>
          <div className={styles.footer}>
            <div>Sistema de Mantenimiento Predictivo</div>
          </div>
        </div>

        {/* Página 2: Resumen */}
        <div className={styles.page}>
          <h2 className={styles.h2}>Resumen por maquinaria</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Código</th>
                <th className={styles.th}>Tipo</th>
                <th className={styles.th}>Horas de uso</th>
                <th className={styles.th}>Mantenimientos</th>
                <th className={styles.th}>Fallas</th>
                <th className={styles.th}>Disponibilidad %</th>
              </tr>
            </thead>
            <tbody>
              {resumen.map((r) => (
                <tr key={r.codigo}>
                  <td className={styles.td}>{r.codigo}</td>
                  <td className={styles.td}>{r.tipo}</td>
                  <td className={styles.tdRight}>{r.horasUso}</td>
                  <td className={styles.tdRight}>{r.mantenimientos}</td>
                  <td className={styles.tdRight}>{r.fallas}</td>
                  <td className={styles.tdRight}>{r.disponibilidad}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.nota}>
            Nota: valores de ejemplo. Sustituir con datos reales del periodo
            seleccionado.
          </div>
        </div>
      </div>
    );
  },
);

ReporteMaquinaria.displayName = 'ReporteMaquinaria';
export default ReporteMaquinaria;
