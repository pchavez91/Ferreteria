'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productos: 0,
    ventasHoy: 0,
    ingresosHoy: 0,
    empresas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Contar productos activos
        const { count: productosCount } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        // Ventas de hoy
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { data: ventasHoy, count: ventasCount } = await supabase
          .from('ventas')
          .select('total', { count: 'exact' })
          .gte('created_at', today.toISOString())
          .eq('estado', 'completada')

        const ingresosHoy = ventasHoy?.reduce((sum, v) => sum + Number(v.total), 0) || 0

        // Contar empresas activas
        const { count: empresasCount } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .eq('activa', true)

        setStats({
          productos: productosCount || 0,
          ventasHoy: ventasCount || 0,
          ingresosHoy,
          empresas: empresasCount || 0,
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  const statCards = [
    {
      title: 'Productos Activos',
      value: stats.productos,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Ventas Hoy',
      value: stats.ventasHoy,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.ingresosHoy.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Empresas',
      value: stats.empresas,
      icon: Users,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
