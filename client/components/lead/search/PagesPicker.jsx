import React from 'react'

const PAGES = 5
export const PagesPicker = ({ totalPages, page, changePage }) => {
  const firstPage = Math.max(1, Math.min(page - (PAGES - 1) / 2, totalPages - PAGES + 1))
  const pageNos = Array(totalPages > PAGES ? PAGES : totalPages)
    .fill(0)
    .map((__, i) => firstPage + i)
  return (
    <nav aria-label="Search page">
      <ul className="pagination">
        <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            title="First page"
            onClick={() => changePage(1)}
            disabled={page <= 1}
          >
            &lt;&lt;
          </button>
        </li>
        <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            title="Previous page"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
          >
            &lt;
          </button>
        </li>
        {pageNos.map(pageNo => (
          <li key={pageNo} className={`page-item${page === pageNo ? ' active' : ''}`}>
            <button
              type="button"
              className="page-link"
              title={`Page ${pageNo}`}
              onClick={() => changePage(pageNo)}
            >
              {pageNo}
            </button>
          </li>
        ))}
        <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            title="Next page"
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
          >
            &gt;
          </button>
        </li>
        <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            title="Last page"
            onClick={() => changePage(totalPages)}
            disabled={page >= totalPages}
          >
            &gt;&gt;
          </button>
        </li>
      </ul>
    </nav>
  )
}
