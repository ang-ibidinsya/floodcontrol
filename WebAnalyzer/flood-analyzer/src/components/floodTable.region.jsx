import './floodTable.css';
import { useEffect, useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {prepareBody, prepareHeader, preparePagninator} from './floodTable';
import {formatMoney} from '../utils/utils';

const convertStateToTableFilter = (settingsState) => {
    let ret = [];
    if (settingsState.Filters.Region?.length > 0) {
        ret.push({id: 'region', value: settingsState.Filters.Region});
    }
    return ret;
}

export const showGrandTotalDirectly = (grandTotal) => {
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
    </div>;
}

export const FloodTableByRegion = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const {settingsState} = props;
    
    console.log('[FloodTableByRegion] render, settingsState:', settingsState);

    const filteredRegionGroups = settingsState.FilteredData?.regionGroups;
    console.log('filteredRegionGroups', filteredRegionGroups);

    const columnDefs = [
        {
            accessorKey: "region",
            header: "Region",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
            return <div>{getValue()}</div>
            },
        },
        {
            accessorKey: "subtotal",
            header: "Cost",
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
    ];

    const table = useReactTable({
        data: filteredRegionGroups,
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
        table.setColumnFilters(convertStateToTableFilter(settingsState));
    }, [
        settingsState.Filters.Project, 
        settingsState.Filters.Year, 
        settingsState.Filters.District, 
        settingsState.Filters.Region
    ])


    return <div className="tableContainer">
        {showGrandTotalDirectly(settingsState.FilteredData.grandTotal)}
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