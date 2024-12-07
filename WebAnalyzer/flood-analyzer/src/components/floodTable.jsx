import './floodTable.css';
import {data} from '../assets/FloodControl';
import { useEffect, useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {formatMoney} from '../utils/utils';
import {useSelector} from 'react-redux';
import {FloodTableByProject} from './floodTable.project';
import {FloodTableByYear} from './floodTable.year';
import {FloodTableByRegion} from './floodTable.region';
import {FloodTableByDistrict} from './floodTable.district';
import {mapColors} from '../controls/stackedbarchart';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import {StackedBarChart} from '../controls/stackedbarchart';
import {EntityTypes} from '../enums';

const iconSortLookup = {
    'asc': 'bx bxs-chevron-up-circle',
    'desc': 'bx bxs-chevron-down-circle',
}

export const showYearLegends = () => {
    let legendsEl = [];
    for (var year in mapColors) {
        if (!Object.prototype.hasOwnProperty.call(mapColors, year)) {
            continue;
        }
        legendsEl.push(<div key={`legend-${year}`} className="legendItem">
            <div className='legendSquare' style={{backgroundColor:`${mapColors[year]}`}}/>
            <div className='legendLabel'>{year}</div>
        </div>);
    }

    return <div className='legendsContainer'>{legendsEl}</div>;
}

export const createToolTip = (tooltipId) => {
    return <Tooltip
    id={tooltipId}
    opacity={1}
    clickable={true}
    float={true}
    style={{ background: "black", color: "#fff" }}
    render={({ content, activeAnchor }) => {
        let subtotalsMap = JSON.parse(content);
        if (!subtotalsMap) {
            console.log('[ToolTip] Render -- NULL', content);
            return "NULL";
        }
        console.log('[ToolTip] Render', content);
        let items = [];
        for (var year in subtotalsMap) {
            if (!Object.prototype.hasOwnProperty.call(subtotalsMap, year)) {
                continue;
            }
            items.push(<div className="tooltipItemContainer">
                <div className="tooltipCell tooltipYearColor" style={{backgroundColor: `${mapColors[year]}`}}/>
                <div className="tooltipCell tooltipYear">{year}:</div>
                <div className="tooltipCell tooltipCost">{formatMoney(subtotalsMap[year])}</div>
            </div>);
        }
        return <div>
            {items}
        </div>
    }}
      
  />
}

// Returns Table filter required by react-table
export const convertStateToTableFilter= (settingsState) => {
    let ret = [];
    if (settingsState.Filters.Project) {
        ret.push({id: 'Item', value: settingsState.Filters.Project});
    }
    
    if (settingsState.Filters.Year?.length > 0) {
        ret.push({id: 'Year', value: settingsState.Filters.Year});
    }

    if (settingsState.Filters.Region?.length > 0) {
        ret.push({id: 'Region', value: settingsState.Filters.Region});
    }

    if (settingsState.Filters.District?.length > 0) {
        ret.push({id: 'District', value: settingsState.Filters.District});
    }

    return ret;
}

export const prepareBody = (table, entityType) => {

    
    const prepareCostBarCell = (cell, row) => {
        let cellClass = 'tdCostBar ';
        if (entityType === EntityTypes.district || entityType === EntityTypes.region) {
            // Stacked Bar Chart
            // We put all the stackedbarChart logic here and avoid doing the rendering inside the columnDef cell render because the react-tooltip has intermittent issues when user clicks Sort
            cellClass += ' tdCostBarFullWidth';
            let {entityGroups, minCost, maxCost} = table.getState();
            const currEntity = row.getValue(entityType);
            const findEntity = entityGroups.find(grp => grp[entityType] === currEntity);
            if (!findEntity) {
                console.error('[prepareCostBarCell] Unable to find entity', currEntity);
                return;
            }
            const yearSubtotals = findEntity.yearSubTotals;            
            return <td key={cell.id} className={cellClass}>
                <div
                data-tooltip-id="my-tooltip"
                data-tooltip-content={JSON.stringify(yearSubtotals)}
                >                        
                <StackedBarChart name={currEntity} subtotalsMap={yearSubtotals} minCost={minCost} maxCost={maxCost}/>
                </div>                
            </td>
        }
        // else: just a normal bar chart (e.g. project/year view)
        return <td key={cell.id} className={cellClass}>
                    <div>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>                
                </td>
    }

    const prepareNormalCell = (cell) => {
        let cellClass = 'tdTable';
        const cellColId = cell.column.id;
        if (cellColId === 'Cost' || cellColId === 'subtotal') {
            cellClass = 'tdCost';
        }

        if (entityType === EntityTypes.district || entityType === EntityTypes.region || entityType === EntityTypes.year) {
            cellClass += ' tdSummary';
        }

        return <td key={cell.id} className={cellClass}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
    }

    const prepareCells = (row) => {
        let retCells = row.getVisibleCells().map(cell => {
            const cellColId = cell.column.id;
            if (cellColId === 'CostBar') {
                return prepareCostBarCell(cell, row)
            }
            return prepareNormalCell(cell);
        });

        return retCells;
    }

    const rows = table.getRowModel().rows;
    const ret = rows.map(row => {
        return <tr key={row.id}>
            {prepareCells(row)}
        </tr>
    })
    //console.log('rows', ret)
    return ret;
}

const getSortingIcon = (isSorted) => {        
    const iconLookup = iconSortLookup[isSorted];
    if (!iconLookup) {
        return <i className="bx bxs-sort-alt table-icon table-icon-disabled"></i>
    }
    const iconClass = `${iconLookup} table-icon table-icon-enabled`;

    return <i className={iconClass}></i>;
}

export const prepareHeader = (table) => {
    const headerGroups = table.getHeaderGroups();
    let headerColumns = [];
    
    headerGroups.forEach(hdrGrp => {
        hdrGrp.headers.forEach(header => {
            let colHeader = header.column.columnDef.header;
            if (colHeader === 'CostBar') {
                return;
            }
            const isSortable = header.column.getCanSort();
            let thClassNames = 'thTable';
            if (isSortable) {
                thClassNames += ' thSortable'
            }
            let colSpan = colHeader === 'Cost' ? 2 : 1;

            headerColumns.push(<th key={header.id} className={thClassNames} onClick={header.column.getToggleSortingHandler()} colSpan={colSpan}>
                {colHeader}
                {isSortable && getSortingIcon(header.column.getIsSorted())}                
            </th>);
        });
    })

    return <tr>
        {headerColumns}
    </tr>;
}

export const showGrandTotal = (table, costColumn) => {
    let rows = table.getFilteredRowModel().rows;
    let sum = 0;
    // Use for instead of foreach, for potential performance improvements
    for (let i = 0; i < rows.length; i++) {
        sum += rows[i].getValue(costColumn)
    }
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(sum)}</div>
    </div>;
}

export const preparePagninator = (table) => {
    let totalFiltered = table.getFilteredRowModel().rows.length;
    let currPageIndex = table.getState().pagination.pageIndex;
    let firstRecordIndex = totalFiltered == 0 ? 0 : currPageIndex * table.getState().pagination.pageSize + 1;
    let lastRecordIndex = (currPageIndex + 1) * table.getState().pagination.pageSize;        
    let isInFirstPage = currPageIndex === 0;
    if (lastRecordIndex > totalFiltered) {
        lastRecordIndex = totalFiltered;
    }
    let isInLastPage = lastRecordIndex >= totalFiltered;
    return <div className="paginator">
            <div className='currPage'>Showing {firstRecordIndex} - {lastRecordIndex} of {totalFiltered} </div>
            <select
                className='pageSizeSelector'
                value={table.getState().pagination.pageSize}
                onChange={e => {
                    table.setPageSize(Number(e.target.value))
                }}
                >
                {[10, 20, 50, 100, 250].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                    </option>
                ))}
            </select>
            <div className='pageNavBtns'>
                <i className={`navBtn bx bx-first-page ${isInFirstPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.firstPage()}
                    title="Go to First Page"></i>

                <i className={`navBtn bx bx-chevron-left ${isInFirstPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.previousPage()}
                    title="Go to Previous Page"></i>
                
                {/* TODO dropdown to page number*/}

                <i className={`navBtn bx bx-chevron-right ${isInLastPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.nextPage()}
                    title="Go to Next Page"></i>

                <i className={`navBtn bx bx-last-page ${isInLastPage ? 'btnDisabled': 'btnEnabled' }`} 
                    onClick={()=>table.lastPage()}
                    title="Go to Last Page"></i>
            </div>
        </div>
}

/* Filter re-render issue: Each time filter changes, there will be 3 re-renders (expected: 2)
 * 1st: Due to redux (No change in UI)
        useEffect will detect change in redux, so will call setColumnFilters()
 * 2nd & 3rd: Due to calling setColumnFilters(). Ideally 1 re-render only, not 2. Maybe react-table bug.
 */

export const FloodTable = () => {
    // Redux values (global-values)
    const settingsState = useSelector(state => state.settingsReducer);
    
    //console.log('[FloodTable] render, settingsState:', settingsState, 'New Table Filter', tableFilter);
    
    // Choose table to return
    if (!settingsState.Grouping || settingsState.Grouping === 'Project') {
        return <FloodTableByProject 
            settingsState={settingsState}
        />;
    }

    if (settingsState.Grouping === 'Year') {
        return <FloodTableByYear 
            settingsState={settingsState}
        />;
    }

    if (settingsState.Grouping === 'Region') {
        return <FloodTableByRegion 
            settingsState={settingsState}
        />;
    }

    if (settingsState.Grouping === 'District') {
        return <FloodTableByDistrict 
            settingsState={settingsState}
        />;
    }

}