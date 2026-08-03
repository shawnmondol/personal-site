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

const surfaceStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-divider)',
    color: 'var(--color-text)',
}

const rowRule = { borderBottom: '1px solid var(--color-divider)' }

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={rowRule}>
                    {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3.5 px-5">
                            <div
                                className="h-4 rounded animate-pulse bg-[color-mix(in_srgb,var(--color-text)_12%,transparent)]"
                                style={{ width: `${60 + (i + j) * 7 % 30}%` }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}

const pagerButtonClass = "p-1.5 rounded hover:bg-white/10 hover:text-accent-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer transition-colors"

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
            <div className="flex items-center justify-between gap-3">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search resumes..."
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm rounded-lg w-64 outline-none focus:border-accent-400"
                        style={surfaceStyle}
                    />
                </div>
                <span className="text-sm text-muted">
                    {totalRows} {totalRows === 1 ? 'result' : 'results'}
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-x-auto elev-sm" style={surfaceStyle}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr
                                key={headerGroup.id}
                                style={{
                                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                                    ...rowRule,
                                }}
                            >
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wider select-none cursor-pointer hover:text-accent-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <span className="opacity-45">
                                                {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '↕'}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <SkeletonRows />
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-sm text-muted text-center">
                                    No resumes found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
                                    style={rowRule}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="py-3.5 px-5 text-sm">
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
            <div className="flex items-center justify-between gap-3 text-sm text-muted">
                <span>
                    {totalRows === 0 ? 'No results' : `${from}–${to} of ${totalRows}`}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className={pagerButtonClass}
                        title="First page"
                    >«</button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className={pagerButtonClass}
                        title="Previous page"
                    >‹</button>
                    <span
                        className="px-3 py-1 rounded font-medium"
                        style={{ background: 'color-mix(in srgb, var(--color-text) 8%, transparent)', color: 'var(--color-text)' }}
                    >
                        {pageIndex + 1} / {table.getPageCount() || 1}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className={pagerButtonClass}
                        title="Next page"
                    >›</button>
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className={pagerButtonClass}
                        title="Last page"
                    >»</button>
                </div>
                <select
                    value={pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="rounded-lg px-2 py-1 text-sm outline-none focus:border-accent-400 cursor-pointer"
                    style={surfaceStyle}
                >
                    {[5, 10, 25, 50].map(size => (
                        <option key={size} value={size} style={{ background: 'var(--color-surface)' }}>Show {size}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
