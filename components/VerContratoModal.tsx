'use client'

import { Contrato } from '@/lib/types'
import { X, Printer, Calendar, DollarSign, FileText, User } from 'lucide-react'

interface VerContratoModalProps {
  contrato: Contrato
  onClose: () => void
}

export default function VerContratoModal({ contrato, onClose }: VerContratoModalProps) {
  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  const handleImprimir = () => {
    window.print()
  }

  const tipoContratoLabels: Record<string, string> = {
    indefinido: 'Indefinido',
    plazo_fijo: 'Plazo Fijo',
    honorarios: 'Honorarios',
    temporal: 'Temporal',
  }

  const jornadaLabels: Record<string, string> = {
    completa: 'Jornada Completa',
    parcial: 'Jornada Parcial',
    media: 'Media Jornada',
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:backdrop-blur-none">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col print:shadow-none print:border-none">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0 no-print">
          <h2 className="text-2xl font-bold text-foreground">Contrato de Trabajo</h2>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Imprimir"
            >
              <Printer size={20} className="text-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 print:p-8">
          {/* Contrato */}
          <div className="space-y-6 print:space-y-4">
            {/* Encabezado */}
            <div className="text-center border-b border-border pb-4 print:border-b-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">CONTRATO DE TRABAJO</h1>
              <p className="text-muted-foreground">Ferretería - Sistema de Gestión</p>
            </div>

            {/* Información del Empleado */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User size={20} />
                Datos del Trabajador
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-accent/30 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium text-foreground">{contrato.empleado?.nombre_completo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RUT</p>
                  <p className="font-medium text-foreground">{contrato.empleado?.rut || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium text-foreground">{contrato.empleado?.direccion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-foreground">{contrato.empleado?.telefono || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Información del Contrato */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText size={20} />
                Detalles del Contrato
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Tipo de Contrato
                  </p>
                  <p className="font-medium text-foreground mt-1">
                    {tipoContratoLabels[contrato.tipo_contrato] || contrato.tipo_contrato}
                  </p>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Jornada
                  </p>
                  <p className="font-medium text-foreground mt-1">
                    {contrato.jornada ? jornadaLabels[contrato.jornada] : 'N/A'}
                  </p>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Fecha de Inicio
                  </p>
                  <p className="font-medium text-foreground mt-1">{formatearFecha(contrato.fecha_inicio)}</p>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Fecha de Término
                  </p>
                  <p className="font-medium text-foreground mt-1">
                    {contrato.fecha_termino ? formatearFecha(contrato.fecha_termino) : 'Indefinido'}
                  </p>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium text-foreground mt-1">{contrato.cargo}</p>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign size={16} />
                    Sueldo Base
                  </p>
                  <p className="font-medium text-foreground mt-1">{formatearPeso(contrato.sueldo_base)}</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {contrato.descripcion && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Descripción</h3>
                <p className="text-foreground bg-accent/30 p-4 rounded-lg">{contrato.descripcion}</p>
              </div>
            )}

            {/* Estado */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Estado del Contrato</p>
                <p className="font-medium text-foreground capitalize">{contrato.estado}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium text-foreground">{formatearFecha(contrato.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  )
}
