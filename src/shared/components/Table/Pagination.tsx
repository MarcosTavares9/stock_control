import './Pagination.sass'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 75, 100]
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="table-pagination">
      <div className="table-pagination__info">
        <span className="table-pagination__text">Mostrar linhas por página</span>
        <select
          className="table-pagination__select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="table-pagination__controls">
        <span className="table-pagination__text">
          {startItem}-{endItem} de {totalItems}
        </span>
        <div className="table-pagination__buttons">
          <button
            className="table-pagination__button"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>
          <button
            className="table-pagination__button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

