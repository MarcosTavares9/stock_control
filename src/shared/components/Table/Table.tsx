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
}

export function Table<T = any>({ 
  columns, 
  data, 
  actions,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 75, 100]
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

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
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
                <td colSpan={columns.length + (actions ? 1 : 0)} className="table-empty">
                  Nenhum dado encontrado
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index
                return (
                  <tr 
                    key={globalIndex} 
                    className={`table-row ${globalIndex % 2 === 0 ? 'table-row--even' : 'table-row--odd'}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`table-cell table-cell--${column.align || 'left'}`}
                      >
                        {column.render ? column.render(item) : (item as any)[column.key]}
                      </td>
                    ))}
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

