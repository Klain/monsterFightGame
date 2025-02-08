export interface User {
    id: number;
    username: string;
    [key: string]: any; // Permite añadir más propiedades en el futuro
  }
  