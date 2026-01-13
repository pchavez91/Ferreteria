'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MovimientoBodega, Producto } from '@/lib/types'
import { Plus, Package, TrendingUp, TrendingDown, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react'
import MovimientoModal from '@/components/MovimientoModal'

export default function BodegaPage() {
  const [movimientos, setMovimientos] = useState<MovimientoBodega[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'created_at',
    direction: 'desc',
  })

  useEffect(() => {
    loadMovimientos()
    loadProductos()
  }, [])

  const loadMovimientos = async () => {
    try {
      // Obtener movimientos sin relaciones para evitar error de relaciones múltiples
      const { data: movimientosData, error: movimientosError } = await supabase
        .from('movimientos_bodega')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (movimientosError) throw movimientosError

      // Obtener productos y usuarios por separado
      const productoIds = Array.from(new Set((movimientosData || []).map(m => m.producto_id).filter(Boolean)))
      const { data: productosData } = await supabase
        .from('productos')
        .select('*')
        .in('id', productoIds)

      const usuarioIds = Array.from(new Set((movimientosData || []).map(m => m.usuario_id).filter(Boolean)))
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', usuarioIds)

      // Combinar datos
      const movimientosConDatos = (movimientosData || []).map(movimiento => ({
        ...movimiento,
        producto: productosData?.find(p => p.id === movimiento.producto_id) || null,
        usuario: usuariosData?.find(u => u.id === movimiento.usuario_id) || null,
      }))

      setMovimientos(movimientosConDatos as any)
    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false)
    }
  }

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      // Error silencioso
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'salida':
        return <TrendingDown className="w-5 h-5 text-red-400" />
      case 'ajuste':
        return <RotateCcw className="w-5 h-5 text-blue-400" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada'
      case 'salida':
        return 'Salida'
      case 'ajuste':
        return 'Ajuste'
      default:
        return tipo
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        if (prev.direction === 'desc') return { key, direction: null }
        return { key, direction: 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedMovimientos = [...movimientos].sort((a, b) => {
    if (!sortConfig.direction) return 0

    let aValue: any
    let bValue: any

    if (sortConfig.key === 'producto') {
      aValue = (a.producto as any)?.nombre || ''
      bValue = (b.producto as any)?.nombre || ''
    } else if (sortConfig.key === 'usuario') {
      aValue = (a.usuario as any)?.nombre || ''
      bValue = (b.usuario as any)?.nombre || ''
    } else {
      aValue = a[sortConfig.key as keyof MovimientoBodega]
      bValue = b[sortConfig.key as keyof MovimientoBodega]
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'es', { numeric: true })
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date || typeof aValue === 'string') {
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      const comparison = aDate.getTime() - bDate.getTime()
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    return 0
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando movimientos...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Bodega</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Movimiento
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover-glow transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Fecha
                    {sortConfig.key === 'created_at' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tipo')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Tipo
                    {sortConfig.key === 'tipo' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('producto')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Producto
                    {sortConfig.key === 'producto' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cantidad')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Cantidad
                    {sortConfig.key === 'cantidad' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('motivo')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Motivo
                    {sortConfig.key === 'motivo' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('usuario')}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/70 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Usuario
                    {sortConfig.key === 'usuario' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> :
                      sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : null
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMovimientos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    {movimientos.length === 0 ? 'No hay movimientos registrados' : 'No se encontraron movimientos con ese criterio'}
                  </td>
                </tr>
              ) : (
                sortedMovimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(movimiento.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(movimiento.tipo)}
                        <span className="text-sm font-medium text-foreground">
                          {getTipoLabel(movimiento.tipo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {(movimiento.producto as any)?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-semibold ${
                          movimiento.tipo === 'entrada'
                            ? 'text-green-400'
                            : movimiento.tipo === 'salida'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {movimiento.tipo === 'entrada' ? '+' : movimiento.tipo === 'salida' ? '-' : '±'}
                        {movimiento.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {movimiento.motivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {(movimiento.usuario as any)?.nombre || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MovimientoModal
          productos={productos}
          onClose={() => {
            setIsModalOpen(false)
            loadMovimientos()
            loadProductos()
          }}
        />
      )}
    </div>
  )
}
