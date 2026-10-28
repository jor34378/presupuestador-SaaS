export type CurrencyCode = 'ARS' | 'USD' | 'EUR';
export type BudgetStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado';

export interface Profile {
  id: string;
  nombre_comercial: string;
  nombre_contacto: string;
  telefono: string;
  email: string;
  logo_url?: string | null;
  cuit_dni: string;
  alias_cbu: string;
  condiciones_defecto: string;
  moneda: CurrencyCode;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  user_id: string;
  titulo: string;
  descripcion?: string | null;
  precio_sugerido: number;
  unidad: string;
  created_at?: string;
}

export interface BudgetItem {
  id: string; // ID único temporal para el frontend/mantenimiento de listas
  titulo: string;
  descripcion?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Budget {
  id?: string;
  user_id: string;
  numero_presupuesto: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion?: string | null;
  items: BudgetItem[];
  subtotal: number;
  descuento: number;
  total: number;
  estado: BudgetStatus;
  notas_condiciones: string;
  created_at?: string;
}