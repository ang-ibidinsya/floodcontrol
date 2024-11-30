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
import {BarChart} from '../controls/barchart';

const convertStateToTableFilter = (settingsState) => {
    let ret = [];
    if (settingsState.Filters.Year?.length > 0) {
        ret.push({id: 'year', value: settingsState.Filters.Year});
    }
    return ret;
}

export const showGrandTotalDirectly = (grandTotal) => {
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
    </div>;
}

export const FloodTableByYear = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const {settingsState} = props;
    
    console.log('[FloodTableByYear] render, settingsState:', settingsState);

    const filteredYearGroups = settingsState.FilteredData?.yearGroups;
    console.log('filteredYearGroups', filteredYearGroups);

    const columnDefs = [
        {
            accessorKey: "year",
            header: "Year",
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
        {
            accessorKey: "CostBar",
            header: "CostBar",
            cell: ({ getValue, row, column, table }) => {
                let {minCost, maxCost} = table.getState();
                return <BarChart cost={row.getValue('subtotal')} minCost={minCost} maxCost={maxCost}/>;
            },
        },
    ];

    const table = useReactTable({
        data: filteredYearGroups,
        //data: dataAll,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters: columnFilters,
            maxCost: settingsState.FilteredData.overallYearMaxCost,
            minCost: settingsState.FilteredData.overallYearMinCost,
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