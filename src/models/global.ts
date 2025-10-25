// Ejemplo de datos compartidos globalmente
import { useState } from 'react';

const DEFAULT_NAME = 'MAQUINARIA'; // Valor inicial por defecto

const useUser = () => {
  const [name, setName] = useState<string>(DEFAULT_NAME);

  return {
    name,
    setName,
  };
};

export default useUser;
