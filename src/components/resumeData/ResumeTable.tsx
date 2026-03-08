import type { ResumeData } from "../../models/Resume.ts";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {Table} from "../SiteComponents/Table.tsx";

const columnHelper = createColumnHelper<ResumeData>()

const emptyCell = <span className="text-gray-400 italic">empty</span>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<ResumeData, any>[] = [
    columnHelper.accessor('guid', {
        id: 'guid',
        header: 'GUID',
        cell: info => info.getValue() ?? emptyCell,
    }),
    columnHelper.accessor('fileName', {
        header: 'File Name',
        cell: info => info.getValue() ?? emptyCell,
    }),
    columnHelper.accessor(row => row.resumeDisplayData?.name, {
        id: 'name',
        header: 'Resume Name',
        cell: info => info.getValue() ?? emptyCell,
    }),
    columnHelper.accessor('uploadDate', {
        header: 'Upload Date',
        cell: info => {
            const v = info.getValue()
            return v ? new Date(v).toLocaleDateString() : emptyCell
        },
    }),
    columnHelper.accessor('lastUpdated', {
        header: 'Last Updated',
        cell: info => {
            const v = info.getValue()
            return v ? new Date(v).toLocaleDateString() : emptyCell
        },
    }),
]

interface ResumeTableProps {
    resumes?: ResumeData[]
}

export function ResumeTable({ resumes }: ResumeTableProps) {
    return (
        <Table
            columns={columns}
            data={resumes ?? []} />
    )
}