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
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, createToolTip} from './floodTable';
import {formatMoney} from '../utils/utils';
import {EntityTypes} from '../enums';

const convertStateToTableFilter = (settingsState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (settingsState.Filters.District?.length > 0) {
        ret.push({id: 'district', value: settingsState.Filters.District});
    }
    return ret;
}

export const showGrandTotalDirectly = (grandTotal) => {
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
    </div>;
}

export const FloodTableByDistrict = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {settingsState} = props;
    
    console.log('[FloodTableByDistrict] render, settingsState:', settingsState);

    const filteredDistrictGroups = settingsState.FilteredData?.districtGroups;
    console.log('filteredDistrictGroups', filteredDistrictGroups);

    const columnDefs = [
        {
            accessorKey: "district",
            header: "District",
            filterFn: 'multiValueFilter',
            cell: ({ getValue, row, column, table }) => {
            return <div>{getValue()}</div>
            },
        },
        {
            accessorKey: "subtotal",
            header: "Cost",
            filterFn: 'greaterThan0',
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBar",
            header: "CostBar"
        },
    ];

    const table = useReactTable({
        data: filteredDistrictGroups,
        //data: dataAll,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        state: {
            sorting,
            columnFilters: columnFilters,
            entityGroups: settingsState.FilteredData.districtGroups,
            maxCost: settingsState.FilteredData.overallDistrictMaxCost,
            minCost: settingsState.FilteredData.overallDistrictMinCost,
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            },
            greaterThan0:(row, columnId, filterValue) => {
                return row.getValue(columnId) > 0
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
        {showYearLegends()}
        {showGrandTotalDirectly(settingsState.FilteredData.grandTotal)}
        {preparePagninator(table)}
        <table className="floodTable">
            <thead>
                {prepareHeader(table)}
            </thead>
            <tbody>
                {prepareBody(table, EntityTypes.district)}
            </tbody>
        </table>
        {/* {createToolTip('my-tooltip')} */}
    </div>;
}