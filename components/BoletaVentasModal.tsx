'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { X, Printer, Receipt, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BoletaVentasModalProps {
  user: User
  onClose: () => void
}

export default function BoletaVentasModal({ user, onClose }: BoletaVentasModalProps) {
  const [loading, setLoading] = useState(true)
  const [ventas, setVentas] = useState<any[]>([])
  const [resumen, setResumen] = useState({
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalFactura: 0,
    cantidadVentas: 0,
    dineroInicial: 0,
    dineroFinal: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener hora de conexión del turno
        const { data: sesion } = await supabase
          .from('sesiones_usuarios')
          .select('hora_conexion')
          .eq('usuario_id', user.id)
          .single()

        if (!sesion?.hora_conexion) {
          setLoading(false)
          return
        }

        // Obtener ventas del turno
        const { data: ventasData } = await supabase
          .from('ventas')
          .select('*')
          .eq('vendedor_id', user.id)
          .gte('created_at', sesion.hora_conexion)
          .order('created_at', { ascending: false })

        if (ventasData) {
          setVentas(ventasData)
          
          const efectivo = ventasData
            .filter(v => v.tipo_pago === 'efectivo')
            .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
          
          const tarjeta = ventasData
            .filter(v => v.tipo_pago === 'tarjeta')
            .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
          
          const factura = ventasData
            .filter(v => v.tipo_pago === 'factura')
            .reduce((sum, v) => sum + (Number(v.total) || 0), 0)

          setResumen({
            totalEfectivo: efectivo,
            totalTarjeta: tarjeta,
            totalFactura: factura,
            cantidadVentas: ventasData.length,
            dineroInicial: 0, // Se puede obtener de caja_movimientos si existe
            dineroFinal: efectivo, // Dinero inicial + efectivo recibido
          })
        }
      } catch (error) {
        // Error silencioso
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user.id])

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-4xl w-full border border-border shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Boleta de Ventas del Turno</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado */}
              <div className="text-center border-b border-border pb-4">
                <h3 className="text-xl font-bold text-foreground">Ferretería</h3>
                <p className="text-sm text-muted-foreground">Boleta de Ventas del Turno</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(), "PPpp", { locale: es })}
                </p>
                <p className="text-sm text-foreground mt-2">
                  Cajero: <span className="font-semibold">{user.nombre}</span>
                </p>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <Receipt className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-xs text-muted-foreground">Total Ventas</p>
                  <p className="text-xl font-bold text-foreground">{resumen.cantidadVentas}</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <DollarSign className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-xs text-muted-foreground">Efectivo</p>
                  <p className="text-xl font-bold text-foreground">{formatearPeso(resumen.totalEfectivo)}</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <DollarSign className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-xs text-muted-foreground">Tarjeta</p>
                  <p className="text-xl font-bold text-foreground">{formatearPeso(resumen.totalTarjeta)}</p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <DollarSign className="w-6 h-6 text-orange-400 mb-2" />
                  <p className="text-xs text-muted-foreground">Factura</p>
                  <p className="text-xl font-bold text-foreground">{formatearPeso(resumen.totalFactura)}</p>
                </div>
              </div>

              {/* Total General */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-foreground">Total General</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatearPeso(resumen.totalEfectivo + resumen.totalTarjeta + resumen.totalFactura)}
                  </p>
                </div>
              </div>

              {/* Lista de Ventas */}
              {ventas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Detalle de Ventas</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ventas.map((venta) => (
                      <div
                        key={venta.id}
                        className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{venta.numero_factura}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(venta.created_at), "PPp", { locale: es })} • {venta.tipo_pago}
                          </p>
                        </div>
                        <p className="font-bold text-primary ml-4">
                          {formatearPeso(Number(venta.total) || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ventas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay ventas registradas en este turno</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
