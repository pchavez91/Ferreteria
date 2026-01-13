export type UserRole = 'admin' | 'bodega' | 'caja' | 'contabilidad'

export interface User {
  id: string
  email: string
  nombre: string
  rol: UserRole
  activo: boolean
  created_at: string
}

export interface Producto {
  id: string
  codigo_barras: string
  nombre: string
  descripcion?: string
  categoria_id: string
  categoria?: Categoria
  precio_unitario: number
  precio_mayor: number
  cantidad_minima_mayor: number
  stock: number
  stock_minimo: number
  unidad_medida: string
  proveedor_id?: string
  proveedor?: Proveedor
  activo: boolean
  imagen_url?: string
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  activa: boolean
  created_at: string
}

export interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono?: string
  email?: string
  direccion?: string
  activo: boolean
  created_at: string
}

export interface Empresa {
  id: string
  nombre: string
  nit: string
  direccion?: string
  telefono?: string
  email?: string
  contacto?: string
  activa: boolean
  created_at: string
}

export interface Venta {
  id: string
  numero_factura: string
  cliente_id?: string
  empresa_id?: string
  empresa?: Empresa
  usuario_id: string
  usuario?: User
  tipo_pago: 'efectivo' | 'tarjeta' | 'factura'
  subtotal: number
  descuento: number
  impuesto: number
  total: number
  estado: 'pendiente' | 'completada' | 'cancelada'
  notas?: string
  created_at: string
}

export interface DetalleVenta {
  id: string
  venta_id: string
  producto_id: string
  producto?: Producto
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
  created_at: string
}

export interface MovimientoBodega {
  id: string
  producto_id: string
  producto?: Producto
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  motivo: string
  usuario_id: string
  usuario?: User
  created_at: string
}

export interface PagoFactura {
  id: string
  factura_id: string
  venta?: Venta
  empresa_id: string
  empresa?: Empresa
  monto: number
  fecha_pago: string
  metodo_pago: 'transferencia' | 'cheque' | 'efectivo'
  referencia?: string
  estado: 'pendiente' | 'pagado' | 'cancelado'
  created_at: string
}

export interface Empleado {
  id: string
  nombre_completo: string
  rut: string
  direccion?: string
  telefono?: string
  email?: string
  fecha_nacimiento?: string
  fecha_ingreso: string
  fecha_termino?: string
  activo: boolean
  cargo?: string
  observaciones?: string
  created_at: string
  updated_at: string
}

export interface Contrato {
  id: string
  empleado_id: string
  empleado?: Empleado
  tipo_contrato: 'indefinido' | 'plazo_fijo' | 'honorarios' | 'temporal'
  fecha_inicio: string
  fecha_termino?: string
  sueldo_base: number
  cargo: string
  jornada?: 'completa' | 'parcial' | 'media'
  descripcion?: string
  estado: 'activo' | 'finalizado' | 'cancelado'
  created_at: string
  updated_at: string
}
