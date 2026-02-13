import { ReactNode, useState, useMemo } from 'react'
import { useIsMobile } from '../../utils/useIsMobile'
import { FaEllipsisV } from 'react-icons/fa'
import './Table.sass'
import { Pagination } from './Pagination'

export interface TableColumn<T = any> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  /** Se true, esta coluna será usada como título do card mobile */
  mobileTitle?: boolean
  /** Se true, esta coluna será usada como subtítulo do card mobile */
  mobileSubtitle?: boolean
  /** Se true, esta coluna será exibida como badge no card mobile */
  mobileBadge?: boolean
  /** Se true, esta coluna não será exibida no card mobile (útil para colunas já usadas como title/subtitle/badge) */
  mobileHidden?: boolean
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
  const isMobile = useIsMobile()
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

  // --- Mobile Card View ---
  if (isMobile) {
    return (
      <MobileCardView
        columns={columns}
        data={data}
        paginatedData={paginatedData}
        actions={actions}
        selectable={selectable}
        selectedItems={selectedItems}
        getItemId={getItemId}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
        someSelected={someSelected}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    )
  }

  // --- Desktop Table View ---
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

// ============================================================
// Mobile Card View - Sub-componente interno
// ============================================================

interface MobileCardViewProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  paginatedData: T[]
  actions?: (item: T) => ReactNode
  selectable: boolean
  selectedItems: Set<string | number>
  getItemId: (item: T) => string | number
  onSelectItem: (itemId: string | number, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  allSelected: boolean
  someSelected: boolean
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions: number[]
}

function MobileCardView<T>({
  columns,
  data,
  paginatedData,
  actions,
  selectable,
  selectedItems,
  getItemId,
  onSelectItem,
  onSelectAll,
  allSelected,
  someSelected,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions
}: MobileCardViewProps<T>) {

  // Identificar colunas especiais para o card mobile
  const imageColumn = columns.find(c => c.key === 'imagem')
  const titleColumn = columns.find(c => c.mobileTitle) || columns.find(c => c.key !== 'imagem')
  const subtitleColumn = columns.find(c => c.mobileSubtitle)
  const badgeColumn = columns.find(c => c.mobileBadge)

  // Colunas que aparecem como "detalhes" no corpo do card
  const detailColumns = columns.filter(c => {
    if (c.key === 'imagem' || c === imageColumn) return false
    if (c === titleColumn) return false
    if (c === subtitleColumn) return false
    if (c === badgeColumn) return false
    if (c.mobileHidden) return false
    return true
  })

  if (data.length === 0) {
    return (
      <div className="table-mobile">
        <div className="table-mobile__empty">
          Nenhum dado encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="table-mobile">
      {/* Header com seleção e contagem */}
      {selectable && (
        <div className="table-mobile__toolbar">
          <label className="table-mobile__select-all">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected && !allSelected
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="table-checkbox"
            />
            <span>Selecionar todos</span>
          </label>
          {selectedItems.size > 0 && (
            <span className="table-mobile__selected-count">
              {selectedItems.size} selecionado{selectedItems.size > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Lista de cards */}
      <div className="table-mobile__list">
        {paginatedData.map((item, index) => {
          const itemId = getItemId(item)
          const isSelected = selectedItems.has(itemId)

          return (
            <MobileCard
              key={`${itemId}-${index}`}
              item={item}
              isSelected={isSelected}
              selectable={selectable}
              imageColumn={imageColumn}
              titleColumn={titleColumn}
              subtitleColumn={subtitleColumn}
              badgeColumn={badgeColumn}
              detailColumns={detailColumns}
              actions={actions}
              onSelect={(checked) => onSelectItem(itemId, checked)}
            />
          )
        })}
      </div>

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={data.length}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  )
}

// ============================================================
// Mobile Card - Cada item da lista
// ============================================================

interface MobileCardProps<T> {
  item: T
  isSelected: boolean
  selectable: boolean
  imageColumn?: TableColumn<T>
  titleColumn?: TableColumn<T>
  subtitleColumn?: TableColumn<T>
  badgeColumn?: TableColumn<T>
  detailColumns: TableColumn<T>[]
  actions?: (item: T) => ReactNode
  onSelect: (checked: boolean) => void
}

function MobileCard<T>({
  item,
  isSelected,
  selectable,
  imageColumn,
  titleColumn,
  subtitleColumn,
  badgeColumn,
  detailColumns,
  actions,
  onSelect
}: MobileCardProps<T>) {
  const [showActions, setShowActions] = useState(false)

  const renderColumnValue = (column: TableColumn<T>) => {
    if (column.render) return column.render(item)
    return (item as any)[column.key]
  }

  return (
    <div className={`table-mobile-card ${isSelected ? 'table-mobile-card--selected' : ''}`}>
      {/* Header do card: checkbox, imagem, título, ações */}
      <div className="table-mobile-card__header">
        {selectable && (
          <div className="table-mobile-card__checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect(e.target.checked)
              }}
              className="table-checkbox"
            />
          </div>
        )}

        {imageColumn && (
          <div className="table-mobile-card__image">
            {renderColumnValue(imageColumn)}
          </div>
        )}        <div className="table-mobile-card__title-area">
          {titleColumn && (
            <h3 className="table-mobile-card__title">
              {renderColumnValue(titleColumn)}
            </h3>
          )}
          {subtitleColumn && (
            <p className="table-mobile-card__subtitle">
              {renderColumnValue(subtitleColumn)}
            </p>
          )}
        </div>

        <div className="table-mobile-card__header-right">
          {badgeColumn && (
            <div className="table-mobile-card__badge">
              {renderColumnValue(badgeColumn)}
            </div>
          )}
          {actions && (
            <div className="table-mobile-card__actions-wrapper">
              <button
                className="table-mobile-card__menu-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                aria-label="Ações"
              >
                <FaEllipsisV size={16} />
              </button>
              {showActions && (
                <>
                  <div 
                    className="table-mobile-card__actions-overlay" 
                    onClick={() => setShowActions(false)} 
                  />
                  <div className="table-mobile-card__actions-dropdown">
                    {actions(item)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detalhes do card: linhas label-valor */}
      {detailColumns.length > 0 && (
        <div className="table-mobile-card__details">
          {detailColumns.map((column) => (
            <div key={column.key} className="table-mobile-card__detail-row">
              <span className="table-mobile-card__detail-label">{column.label}</span>
              <span className="table-mobile-card__detail-value">
                {renderColumnValue(column)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}