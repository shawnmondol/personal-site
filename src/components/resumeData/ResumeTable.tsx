import type {ResumeData} from "../../models/Resume.ts";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";

const columnHelper = createColumnHelper<ResumeData>()

const columns = [
    columnHelper.accessor('guid', {
        id: 'guid',
        header: 'GUID',
    }),
    columnHelper.accessor('fileName', {
        header: 'File Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('uploadDate', {
        header: 'Upload Date',
        cell: info => info.getValue(),
    }),
]

const styles = {
    wrapper:  'rounded-xl overflow-hidden shadow-lg border border-gray-200',
    table:    'w-full text-left border-collapse',
    headerRow:'bg-gray-900',
    headerCell: [
        'py-4 px-5',
        'text-sm font-bold text-white tracking-wide uppercase',
        'border-r border-gray-700 last:border-r-0',
    ].join(' '),
    emptyRow: 'bg-white',
    emptyCell: 'py-8 px-5 text-sm text-gray-400 text-center',
    row: [
        'bg-white border-b border-gray-200',
        'hover:bg-blue-50 hover:shadow-inner',
        'transition-colors cursor-pointer',
    ].join(' '),
    cell: [
        'py-4 px-5',
        'text-sm font-medium text-gray-800',
        'border-r border-gray-200 last:border-r-0',
    ].join(' '),
}

interface ResumeTableProps {
    resumes?: ResumeData[]
}

export function ResumeTable({resumes}: ResumeTableProps) {
    const table = useReactTable({
        data: resumes ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className={styles.headerRow}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className={styles.headerCell}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                        <tr className={styles.emptyRow}>
                            <td colSpan={columns.length} className={styles.emptyCell}>
                                No data
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id} className={styles.row}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className={styles.cell}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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