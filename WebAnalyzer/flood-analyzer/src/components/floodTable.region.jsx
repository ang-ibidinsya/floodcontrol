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
import {StackedBarChart} from '../controls/stackedbarchart';

const convertStateToTableFilter = (settingsState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
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
            filterFn: 'greaterThan0',
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBar",
            header: "CostBar",
            cell: ({ getValue, row, column, table }) => {
                let {regionGroups, minCost, maxCost} = table.getState();
                const currRegion = row.getValue('region');
                const findRegion = regionGroups.find(r => r.region === currRegion);
                if (!findRegion) {
                    console.error('[RegionTavble][CostBar] Unable to find region', currRegion);
                    return;
                }
                const yearSubtotals = findRegion.yearSubTotals;                
                return <StackedBarChart name={currRegion} subtotalsMap={yearSubtotals} minCost={minCost} maxCost={maxCost}/>;
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
        initialState: {
            pagination: {
                pageSize: 20,
            },
            sorting: [
                {
                    id: 'subtotal',
                    desc: true
                }
            ]
        },
        state: {
            columnFilters: columnFilters,
            regionGroups: settingsState.FilteredData.regionGroups,
            maxCost: settingsState.FilteredData.overallRegionMaxCost,
            minCost: settingsState.FilteredData.overallRegionMinCost,
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
                {prepareBody(table, true)}
            </tbody>
            {/* {createToolTip('my-tooltip')} */}
        </table>    
    </div>;
}