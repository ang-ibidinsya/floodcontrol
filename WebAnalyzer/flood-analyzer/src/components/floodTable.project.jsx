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
import {BarChart} from '../controls/barchart';
import {EntityTypes} from '../enums';

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
            let {minCost, maxCost} = table.getState();
            return <div className="divCost">{formatMoney(getValue())}</div>;
        },
    },
    {
        accessorKey: "CostBar",
        header: "CostBar",
        cell: ({ getValue, row, column, table }) => {
            let {minCost, maxCost} = table.getState();
            return <BarChart cost={row.getValue('Cost')} minCost={minCost} maxCost={maxCost}/>;
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
        initialState: {
            pagination: {
                pageSize: 20,
            },
            sorting: [
                {
                    id: 'Cost',
                    desc: true
                }
            ]
        },
        state: {
            columnFilters: columnFilters,
            maxCost: settingsState.FilteredData.overallProjMaxCost,
            minCost: settingsState.FilteredData.overallProjMinCost,
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
                {prepareBody(table, EntityTypes.project)}
            </tbody>
        </table>
        
    </div>;
}