import type { ResumeData } from "../../models/Resume.ts";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {Table} from "../SiteComponents/Table.tsx";
import {Button} from "../SiteComponents/Button.tsx";
import {setActiveResume} from "../../services/resume/firestoreResumeService.ts";
import {toast} from "sonner";


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
        cell: info =>
            (
                <div className="flex space-x-2">
                    <a
                        href={info.row.original.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                    >{info.getValue()}</a>
                </div>
            )
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
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (props) => (
            <div className="flex space-x-2">
                { !props.row.original.isActive ? (
                    <Button
                        content="Set Display"
                        onClick={() =>
                            setActiveResume(props.row.original.guid).then(() => {
                                toast.success('Resume set as active')
                                window.location.reload()
                            }).catch(e => {
                                toast.error(e.message)
                            })
                        }
                    />
                ) : <b>Active</b>
                }
            </div>
        )
    })
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