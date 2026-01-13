'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Empleado } from '@/lib/types'
import { X, Save, Edit, Eye } from 'lucide-react'

interface VerEditarEmpleadoModalProps {
  empleado: Empleado
  onClose: () => void
  onUpdate: () => void
  onEdit: (empleado: Empleado, motivo: string, formData: any) => void
}

export default function VerEditarEmpleadoModal({ 
  empleado, 
  onClose, 
  onUpdate,
  onEdit 
}: VerEditarEmpleadoModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: empleado.nombre_completo,
    rut: empleado.rut,
    direccion: empleado.direccion || '',
    telefono: empleado.telefono || '',
    email: empleado.email || '',
    fecha_nacimiento: empleado.fecha_nacimiento || '',
    fecha_ingreso: empleado.fecha_ingreso,
    fecha_termino: empleado.fecha_termino || '',
    cargo: empleado.cargo || '',
    observaciones: empleado.observaciones || '',
  })
  const [originalData, setOriginalData] = useState(formData)

  useEffect(() => {
    setFormData({
      nombre_completo: empleado.nombre_completo,
      rut: empleado.rut,
      direccion: empleado.direccion || '',
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      fecha_nacimiento: empleado.fecha_nacimiento || '',
      fecha_ingreso: empleado.fecha_ingreso,
      fecha_termino: empleado.fecha_termino || '',
      cargo: empleado.cargo || '',
      observaciones: empleado.observaciones || '',
    })
    setOriginalData({
      nombre_completo: empleado.nombre_completo,
      rut: empleado.rut,
      direccion: empleado.direccion || '',
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      fecha_nacimiento: empleado.fecha_nacimiento || '',
      fecha_ingreso: empleado.fecha_ingreso,
      fecha_termino: empleado.fecha_termino || '',
      cargo: empleado.cargo || '',
      observaciones: empleado.observaciones || '',
    })
  }, [empleado])

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false)
      return
    }

    // Pasar los datos del formulario al callback
    onEdit(empleado, '', formData)
  }

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <Edit className="w-6 h-6 text-primary" />
            ) : (
              <Eye className="w-6 h-6 text-primary" />
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Editar Empleado' : 'Ver Empleado'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre Completo {isEditing && '*'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.nombre_completo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                RUT {isEditing && '*'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.rut}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Nacimiento
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">
                  {formatearFecha(formData.fecha_nacimiento)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cargo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.cargo || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Ingreso {isEditing && '*'}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">
                  {formatearFecha(formData.fecha_ingreso)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Término
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.fecha_termino}
                  onChange={(e) => setFormData({ ...formData, fecha_termino: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">
                  {formatearFecha(formData.fecha_termino)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dirección
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.direccion || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.telefono || 'N/A'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground">{formData.email || 'N/A'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Observaciones
              </label>
              {isEditing ? (
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              ) : (
                <p className="px-4 py-2 bg-accent/30 rounded-lg text-foreground min-h-[60px]">
                  {formData.observaciones || 'N/A'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setFormData(originalData)
                  setIsEditing(false)
                }}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Editar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
