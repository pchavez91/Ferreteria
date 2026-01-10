'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortDirection = 'asc' | 'desc' | null
type SortConfig<T> = {
  key: keyof T | null
  direction: SortDirection
}

interface SortableTableProps<T> {
  data: T[]
  columns: {
    key: keyof T | string
    label: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
  }[]
  defaultSort?: {
    key: keyof T | string
    direction: 'asc' | 'desc'
  }
}

export default function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  defaultSort,
}: SortableTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: (defaultSort?.key as keyof T) || null,
    direction: defaultSort?.direction || null,
  })

  const handleSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null
      setSortConfig({ key: null, direction: null })
      return
    }
    
    setSortConfig({ key: key as keyof T, direction })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Manejar objetos anidados (como categoria, empresa, etc.)
      let aCompare: any = aValue
      let bCompare: any = bValue

      if (typeof aValue === 'object' && aValue !== null) {
        aCompare = aValue.nombre || aValue.email || aValue.toString()
      }
      if (typeof bValue === 'object' && bValue !== null) {
        bCompare = bValue.nombre || bValue.email || bValue.toString()
      }

      if (typeof aCompare === 'string' && typeof bCompare === 'string') {
        const comparison = aCompare.localeCompare(bCompare, 'es', { numeric: true })
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      if (typeof aCompare === 'number' && typeof bCompare === 'number') {
        return sortConfig.direction === 'asc' ? aCompare - bCompare : bCompare - aCompare
      }

      // Para fechas
      if (aCompare instanceof Date || typeof aCompare === 'string') {
        const aDate = new Date(aCompare)
        const bDate = new Date(bCompare)
        const comparison = aDate.getTime() - bDate.getTime()
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      return 0
    })
  }, [data, sortConfig])

  const getSortIcon = (columnKey: keyof T | string) => {
    if (sortConfig.key !== columnKey) {
      return null
    }
    
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="w-4 h-4 inline ml-1" />
    }
    
    if (sortConfig.direction === 'desc') {
      return <ChevronDown className="w-4 h-4 inline ml-1" />
    }
    
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-accent/50 sticky top-0 z-10">
          <tr>
            {columns.map((column) => {
              const isSortable = column.sortable !== false
              const isSorted = sortConfig.key === column.key
              
              return (
                <th
                  key={String(column.key)}
                  onClick={() => isSortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider ${
                    isSortable
                      ? 'cursor-pointer hover:bg-accent/70 transition-colors select-none'
                      : ''
                  } ${isSorted ? 'bg-primary/20' : ''}`}
                >
                  <div className="flex items-center">
                    {column.label}
                    {isSortable && getSortIcon(column.key)}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                No se encontraron datos
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-accent/30 transition-all hover:scale-[1.01] cursor-pointer"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render
                      ? column.render(item)
                      : typeof item[column.key] === 'object' && item[column.key] !== null
                      ? (item[column.key] as any)?.nombre || (item[column.key] as any)?.email || '-'
                      : String(item[column.key] || '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
