import { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";


function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3.5 px-5">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i + j) * 7 % 30}%` }} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}

export function Table<T>({ data, columns }: { data?: T[], columns: ColumnDef<T, undefined>[] }) {
    const isLoading = data === undefined
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data: data ?? [],
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 5 } },
    })

    const { pageIndex, pageSize } = table.getState().pagination
    const totalRows = table.getFilteredRowModel().rows.length
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1
    const to = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
        <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search resumes..."
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                </div>
                <span className="text-sm text-gray-500">
                    {totalRows} {totalRows === 1 ? 'result' : 'results'}
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider select-none border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <span className="text-gray-300">
                                                {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '↕'}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white min-h-96">
                        {isLoading ? (
                            <SkeletonRows />
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-sm text-gray-400 text-center">
                                    No resumes found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row, i) => (
                                <tr
                                    key={row.id}
                                    className={[
                                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                                        'border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer',
                                    ].join(' ')}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="py-3.5 px-5 text-sm text-gray-800 border-r border-gray-100 last:border-r-0">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    {totalRows === 0 ? 'No results' : `${from}–${to} of ${totalRows}`}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="First page"
                    >«</button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                    >‹</button>
                    <span className="px-3 py-1 rounded bg-gray-100 font-medium text-gray-700">
                        {pageIndex + 1} / {table.getPageCount() || 1}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                    >›</button>
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Last page"
                    >»</button>
                </div>
                <select
                    value={pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[5, 10, 25, 50].map(size => (
                        <option key={size} value={size}>Show {size}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}