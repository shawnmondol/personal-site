import type { ResumeData } from "../../../models/Resume.ts";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {Table} from "../../SiteComponents/Table.tsx";
import {Button} from "../../SiteComponents/Button.tsx";
import {setActiveResume} from "../../../services/resume/firestoreResumeService.ts";
import {Timestamp} from "firebase/firestore";
import {toast} from "sonner";
import {Link} from "react-router-dom";
import {ExternalLink} from "lucide-react";


const columnHelper = createColumnHelper<ResumeData>()

const emptyCell = <span className="text-muted italic">empty</span>

const dateFormat = new Intl.DateTimeFormat("en-us", {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
})

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
                        className="flex text-accent-400 hover:text-accent-300"
                    >
                        {info.getValue()}
                        <ExternalLink className="ml-1 h-5 w-5"/>
                    </a>

                </div>
            )
    }),
    columnHelper.accessor('resumeDisplayData', {
        header: 'Resume Data',
        cell: info => {
            const resumeData = info.getValue()
            if (!resumeData) return emptyCell
            return (
                <Link
                    to={`/resume/${info.row.original.guid}/edit`}
                    className={"flex text-accent-400 hover:text-accent-300"}
                >
                    Content
                    <ExternalLink className="ml-1 h-5 w-5"/>
                </Link>
            )
        }
    }),
    columnHelper.accessor('uploadDate', {
        header: 'Upload Date',
        cell: info => {
            const date = info.getValue()
            return date ? dateFormat.format(new Timestamp(date.seconds, date.nanoseconds).toDate()) : emptyCell
        },
    }),
    columnHelper.accessor('lastUpdated', {
        header: 'Last Updated',
        cell: info => {
            const date = info.getValue()
            return date ? dateFormat.format(new Timestamp(date.seconds, date.nanoseconds).toDate()) : emptyCell
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (props) => (
            <div className="flex space-x-2">
                { !props.row.original.isActive ? (
                    <Button
                        onClick={() =>
                            setActiveResume(props.row.original.guid).then(() => {
                                toast.success('Resume set as active')
                                window.location.reload()
                            }).catch(e => {
                                toast.error(e.message)
                            })
                        }
                    >
                        Set Display
                    </Button>
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
            data={resumes} />
    )
}