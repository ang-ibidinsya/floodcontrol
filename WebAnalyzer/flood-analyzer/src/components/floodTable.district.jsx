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
import {StackedBarChart} from '../controls/stackedbarchart';

const convertStateToTableFilter = (settingsState) => {
    let ret = [];
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
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBar",
            header: "CostBar",
            cell: ({ getValue, row, column, table }) => {
                let {districtGroups, minCost, maxCost} = table.getState();
                const currDistrict = row.getValue('district');
                const findDistrict = districtGroups.find(r => r.district === currDistrict);
                if (!findDistrict) {
                    console.error('[RegionTavble][CostBar] Unable to find district', currDistrict);
                    return;
                }
                const yearSubtotals = findDistrict.yearSubTotals;                
                return <StackedBarChart name={currDistrict} subtotalsMap={yearSubtotals} minCost={minCost} maxCost={maxCost}/>;
            },
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
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        state: {
            columnFilters: columnFilters,
            districtGroups: settingsState.FilteredData.districtGroups,
            maxCost: settingsState.FilteredData.overallDistrictMaxCost,
            minCost: settingsState.FilteredData.overallDistrictMinCost,
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
                {prepareBody(table, true)}
            </tbody>
        </table>        
    </div>;
}