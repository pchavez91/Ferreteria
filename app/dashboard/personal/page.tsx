'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Empleado, Contrato } from '@/lib/types'
import { Plus, Search, Eye } from 'lucide-react'
import ContratoModal from '@/components/ContratoModal'
import NuevoEmpleadoModal from '@/components/NuevoEmpleadoModal'
import VerContratoModal from '@/components/VerContratoModal'
import VerEditarEmpleadoModal from '@/components/VerEditarEmpleadoModal'
import MotivoEdicionModal from '@/components/MotivoEdicionModal'

export default function PersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActivos, setShowActivos] = useState(true)
  const [isNuevoEmpleadoModalOpen, setIsNuevoEmpleadoModalOpen] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [showContratoModal, setShowContratoModal] = useState(false)
  const [showVerContratoModal, setShowVerContratoModal] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null)
  const [showVerEmpleadoModal, setShowVerEmpleadoModal] = useState(false)
  const [showMotivoModal, setShowMotivoModal] = useState(false)
  const [empleadoParaEditar, setEmpleadoParaEditar] = useState<Empleado | null>(null)
  const [formDataEdicion, setFormDataEdicion] = useState<any>(null)

  useEffect(() => {
    loadEmpleados()
    loadContratos()
  }, [])

  const loadEmpleados = async () => {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('fecha_ingreso', { ascending: false })

      if (error) throw error
      setEmpleados(data || [])
    } catch (error) {
      console.error('Error cargando empleados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*, empleado:empleados(*)')
        .order('fecha_inicio', { ascending: false })

      if (error) throw error
      setContratos(data || [])
    } catch (error) {
      console.error('Error cargando contratos:', error)
    }
  }

  const empleadosFiltrados = empleados.filter((emp) => {
    const matchesSearch =
      emp.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActivo = showActivos ? emp.activo : !emp.activo
    return matchesSearch && matchesActivo
  })

  const getContratoActivo = (empleadoId: string) => {
    return contratos.find(
      (c) => c.empleado_id === empleadoId && c.estado === 'activo'
    )
  }

  const handleVerContrato = (empleado: Empleado) => {
    const contrato = getContratoActivo(empleado.id)
    if (contrato) {
      setSelectedContrato(contrato)
      setShowVerContratoModal(true)
    }
  }

  const handleNuevoContrato = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setShowContratoModal(true)
  }

  const handleVerEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setShowVerEmpleadoModal(true)
  }

  const handleEditarEmpleado = (empleado: Empleado, motivo: string, formData?: any) => {
    // Guardar los datos del formulario
    if (formData) {
      setFormDataEdicion(formData)
    }
    
    // Si no hay motivo, mostrar el modal de motivo primero
    if (!motivo) {
      setEmpleadoParaEditar(empleado)
      setShowMotivoModal(true)
      return
    }

    // Si hay motivo, proceder con la edición
    actualizarEmpleado(empleado, motivo)
  }

  const actualizarEmpleado = async (empleado: Empleado, motivo: string) => {
    if (!formDataEdicion) {
      alert('Error: No se encontraron datos para actualizar')
      return
    }

    try {
      const { error } = await supabase
        .from('empleados')
        .update({
          nombre_completo: formDataEdicion.nombre_completo,
          rut: formDataEdicion.rut,
          direccion: formDataEdicion.direccion || null,
          telefono: formDataEdicion.telefono || null,
          email: formDataEdicion.email || null,
          fecha_nacimiento: formDataEdicion.fecha_nacimiento || null,
          fecha_ingreso: formDataEdicion.fecha_ingreso,
          fecha_termino: formDataEdicion.fecha_termino || null,
          cargo: formDataEdicion.cargo || null,
          observaciones: formDataEdicion.observaciones || null,
        })
        .eq('id', empleado.id)

      if (error) throw error

      // Aquí podrías guardar el motivo en una tabla de historial si lo deseas
      console.log('Motivo de edición:', motivo)
      console.log('Empleado editado:', empleado.nombre_completo)
      console.log('Datos actualizados:', formDataEdicion)

      setShowVerEmpleadoModal(false)
      setShowMotivoModal(false)
      setEmpleadoParaEditar(null)
      setFormDataEdicion(null)
      loadEmpleados()
    } catch (error) {
      console.error('Error actualizando empleado:', error)
      alert('Error al actualizar el empleado. Por favor, intenta nuevamente.')
    }
  }

  const handleConfirmarMotivo = (motivo: string) => {
    if (empleadoParaEditar && formDataEdicion) {
      actualizarEmpleado(empleadoParaEditar, motivo)
    }
  }

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-CL')
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando empleados...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personal / Empleados</h1>
          <p className="text-muted-foreground mt-1">Gestión de empleados y contratos</p>
        </div>
        <button
          onClick={() => setIsNuevoEmpleadoModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Nuevo Empleado
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowActivos(!showActivos)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showActivos
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-accent'
            }`}
          >
            {showActivos ? 'Activos' : 'Historial'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-foreground">Nombre</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Cargo</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No se encontraron empleados
                  </td>
                </tr>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{empleado.nombre_completo}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-muted-foreground">{empleado.cargo || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleVerEmpleado(empleado)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {empleadosFiltrados.length} empleado{empleadosFiltrados.length !== 1 ? 's' : ''} ({showActivos ? 'activos' : 'historial'})
        </div>
      </div>

      {/* Modales */}
      {isNuevoEmpleadoModalOpen && (
        <NuevoEmpleadoModal
          onClose={() => {
            setIsNuevoEmpleadoModalOpen(false)
            loadEmpleados()
          }}
          onCreateContrato={(empleado) => {
            setSelectedEmpleado(empleado)
            setIsNuevoEmpleadoModalOpen(false)
            setShowContratoModal(true)
          }}
        />
      )}

      {showContratoModal && selectedEmpleado && (
        <ContratoModal
          empleado={selectedEmpleado}
          onClose={() => {
            setShowContratoModal(false)
            setSelectedEmpleado(null)
            loadContratos()
            loadEmpleados()
          }}
        />
      )}

      {showVerContratoModal && selectedContrato && (
        <VerContratoModal
          contrato={selectedContrato}
          onClose={() => {
            setShowVerContratoModal(false)
            setSelectedContrato(null)
          }}
        />
      )}

      {showVerEmpleadoModal && selectedEmpleado && (
        <VerEditarEmpleadoModal
          empleado={selectedEmpleado}
          onClose={() => {
            setShowVerEmpleadoModal(false)
            setSelectedEmpleado(null)
          }}
          onUpdate={loadEmpleados}
          onEdit={(empleado, motivo, formData) => {
            handleEditarEmpleado(empleado, motivo, formData)
          }}
        />
      )}

      {showMotivoModal && empleadoParaEditar && (
        <MotivoEdicionModal
          empleadoNombre={empleadoParaEditar.nombre_completo}
          onClose={() => {
            setShowMotivoModal(false)
            setEmpleadoParaEditar(null)
            setFormDataEdicion(null)
          }}
          onConfirm={handleConfirmarMotivo}
        />
      )}
    </div>
  )
}
