import './floodTable.css';
import { useEffect, useMemo, useState } from "react";
import {data} from '../assets/FloodControl';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {prepareBody, prepareHeader, preparePagninator, showGrandTotal, convertStateToTableFilter} from './floodTable';
import {formatMoney} from '../utils/utils';


const columnDefs = [
    {
        accessorKey: "Year",
        header: "Year",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
        return <div>{getValue()}</div>
        },
    },
    {
        accessorKey: "Region",
        header: "Region",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
                return <div>{getValue()}</div>
            },
    },
    {
        accessorKey: "District",
        header: "District",
        filterFn: 'multiValueFilter',
        cell: ({ getValue, row, column, table }) => {
                return <div>{getValue()}</div>
            },
    },
    {
        accessorKey: "Item",
        header: "Project",
        enableSorting: false, // disables sorting - from tanstack

        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "Cost",
        header: "Cost",
        sortingFn: 'alphanumeric',
        cell: ({ getValue, row, column, table }) => {
            return <div className="tdCost">{formatMoney(getValue())}</div>
        },
    },
];

export const FloodTableByProject = (props) => {
    console.log('[FloodTableByProject] render');

    const [columnFilters, setColumnFilters] = useState([]);
    const {settingsState} = props;

    const table = useReactTable({
        data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters: columnFilters
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            }
        }
    })

    useEffect(() => {
        console.log('[Project Table UseEffect]');
        table.setColumnFilters(convertStateToTableFilter(settingsState))
    }, [settingsState.Filters.Project, settingsState.Filters.Year, settingsState.Filters.District, settingsState.Filters.Region])


    return <div className="tableContainer">
        {showGrandTotal(table, 'Cost')}
        {preparePagninator(table)}
        <table className="floodTable">
            <thead>
                {prepareHeader(table)}
            </thead>
            <tbody>
                {prepareBody(table)}
            </tbody>
        </table>
        
    </div>;
}