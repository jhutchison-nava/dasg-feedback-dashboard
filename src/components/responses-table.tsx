import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from '@tanstack/react-table'
import { compareItems, rankItem } from '@tanstack/match-sorter-utils'

import type {
  Column,
  ColumnDef,
  FilterFn,
  SortingFn,
} from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { type ResponsesSchema } from '@/utils/responsesSchema'

type SingleResponse = ResponsesSchema['included'][number]


declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

export function ResponsesTable({
  responses
}: {
  responses: ResponsesSchema['included']
}) {
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo<ColumnDef<SingleResponse, any>[]>(
    () => [
      {
        accessorKey: 'id',
        // filterFn: 'equalsString', //note: normal non-fuzzy filter column - exact match required
      },
      {
        accessorFn: (row) => row.attributes.answer_01,
        id: 'response',
        cell: (info) => info.getValue() === "1" ? "Yes" : "No",
        header: "Response",
        // filterFn: 'includesString', // note: normal non-fuzzy filter column - case insensitive
      },
      {
        accessorFn: (row) => row.attributes.page,
        id: 'slug',
        cell: (info) => info.getValue(),
        header: "Slug",
        filterFn: 'includesString', // note: normal non-fuzzy filter column - case insensitive
      },
      {
        accessorFn: (row) => row.attributes.hostname,
        id: 'hostname',
        cell: (info) => info.getValue(),
        header: "Domain",
        filterFn: 'includesString', // note: normal non-fuzzy filter column - case insensitive
      },
      {
        accessorFn: (row) => row.attributes.updated_at,
        id: 'updated_at',
        cell: (info) => new Date(info.getValue()).toISOString().split('T')[0],
        header: "Created"
      }
    ],
    [],
  )

  const table = useReactTable({
    data: responses,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, // define as a filter function that can be used in column definitions
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', // apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  })

  // apply the fuzzy sort if the fullName column is being filtered
  React.useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }])
      }
    }
  }, [table.getState().columnFilters[0]?.id])

  return (
    <div>
      <div className='mb-4'>
        <DebouncedInput
          value={globalFilter || ''}
          onChange={(value) => setGlobalFilter(String(value))}
          className="w-full p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Search all columns..."
        />
      </div>
      <div>
        <table className="w-full">
          <thead >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3 text-left"
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-blue-400 transition-colors'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-black">
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id} className="px-4 py-3 text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="h-4" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="px-3 py-1 rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="px-3 py-1 rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="px-3 py-1 rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="px-3 py-1 rounded-md disabled:opacity-80 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 px-2 py-1 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="px-2 py-1 rounded-md border border-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        {table.getPrePaginationRowModel().rows.length} Rows
      </div>
      <div className="mt-4 flex gap-2">
        {/* <button
          onClick={() => rerender()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Force Rerender
        </button> */}
        {/* <button
          onClick={() => refreshData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button> */}
      </div>
      <pre className="mt-4 p-4 bg-gray-200 rounded-lg overflow-auto text-left">
        {JSON.stringify(
          {
            columnFilters: table.getState().columnFilters,
            globalFilter: table.getState().globalFilter,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    />
  )
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
