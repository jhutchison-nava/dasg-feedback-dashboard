import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { PageAggregate } from '@/utils/dashboard'

export function PagesTable({
  pages,
  selectedPage,
  onSelectPage,
}: {
  pages: PageAggregate[]
  selectedPage: { page: string; hostname: string } | null
  onSelectPage: (page: { page: string; hostname: string } | null) => void
}) {
  const columns = useMemo<ColumnDef<PageAggregate, any>[]>(
    () => [
      {
        accessorKey: 'page',
        header: 'Page URL',
        cell: (info) => (
          <span className="truncate block max-w-[300px]" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'hostname',
        header: 'Hostname',
      },
      {
        accessorKey: 'total',
        header: 'Total',
      },
      {
        accessorKey: 'yes',
        header: 'Yes',
        cell: (info) => (
          <span className="text-emerald-600 font-medium">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'no',
        header: 'No',
        cell: (info) => (
          <span className="text-red-600 font-medium">{info.getValue()}</span>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: pages,
    columns,
    filterFns: {
      fuzzy: () => true,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'total', desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{ asc: ' \u2191', desc: ' \u2193' }[
                    header.column.getIsSorted() as string
                  ] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => {
            const rowData = row.original
            const isSelected =
              selectedPage?.page === rowData.page &&
              selectedPage?.hostname === rowData.hostname

            return (
              <tr
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isSelected) {
                    onSelectPage(null)
                  } else {
                    onSelectPage({
                      page: rowData.page,
                      hostname: rowData.hostname,
                    })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (isSelected) {
                      onSelectPage(null)
                    } else {
                      onSelectPage({
                        page: rowData.page,
                        hostname: rowData.hostname,
                      })
                    }
                  }
                }}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {pages.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          No pages to display
        </div>
      )}
      {pages.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="First page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Last page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
