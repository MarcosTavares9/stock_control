import { ReactNode, useState, useMemo } from 'react'
import './Table.sass'
import { Pagination } from './Pagination'

export interface TableColumn<T = any> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  actions?: (item: T) => ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  selectedItems?: Set<string | number>
  onSelectionChange?: (selectedItems: Set<string | number>) => void
  getItemId?: (item: T) => string | number
}

export function Table<T = any>({ 
  columns, 
  data, 
  actions,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 75, 100],
  selectable = false,
  selectedItems = new Set(),
  onSelectionChange,
  getItemId = (item: any) => item.id
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])

  const totalPages = Math.ceil(data.length / pageSize)

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelection = new Set(selectedItems)
    if (checked) {
      paginatedData.forEach(item => {
        newSelection.add(getItemId(item))
      })
    } else {
      paginatedData.forEach(item => {
        newSelection.delete(getItemId(item))
      })
    }
    onSelectionChange(newSelection)
  }

  const handleSelectItem = (itemId: string | number, checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    onSelectionChange(newSelection)
  }

  const allSelected = paginatedData.length > 0 && paginatedData.every(item => selectedItems.has(getItemId(item)))
  const someSelected = paginatedData.some(item => selectedItems.has(getItemId(item)))

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th className="table-header table-header--center" style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected && !allSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="table-checkbox"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`table-header table-header--${column.align || 'left'}`}
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="table-header table-header--center">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} className="table-empty">
                  Nenhum dado encontrado
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index
                const itemId = getItemId(item)
                const isSelected = selectedItems.has(itemId)
                return (
                  <tr 
                    key={globalIndex} 
                    className={`table-row ${globalIndex % 2 === 0 ? 'table-row--even' : 'table-row--odd'} ${isSelected ? 'table-row--selected' : ''}`}
                  >
                    {selectable && (
                      <td className="table-cell table-cell--center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(itemId, e.target.checked)}
                          className="table-checkbox"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const isImageColumn = column.key === 'imagem'
                      return (
                        <td
                          key={column.key}
                          className={`table-cell table-cell--${column.align || 'left'} ${isImageColumn ? 'table-cell--image' : ''}`}
                        >
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </td>
                      )
                    })}
                    {actions && (
                      <td className="table-cell table-cell--center">
                        <div className="table-actions">{actions(item)}</div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={data.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  )
}

