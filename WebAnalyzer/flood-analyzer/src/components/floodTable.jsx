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

const iconSortLookup = {
    'asc': 'bx bxs-chevron-up-circle',
    'desc': 'bx bxs-chevron-down-circle',
}

const convertStateToFilter= (filterState) => {
    let ret = [];
    if (filterState.Project) {
        ret.push({id: 'Item', value: filterState.Project});
    }
    //debugger
    if (filterState.Year?.length > 0) {
        ret.push({id: 'Year', value: filterState.Year});
    }

    if (filterState.Region?.length > 0) {
        ret.push({id: 'Region', value: filterState.Region});
    }

    if (filterState.District?.length > 0) {
        ret.push({id: 'District', value: filterState.District});
    }

    return ret;
}

/* Filter re-render issue: Each time filter changes, there will be 3 re-renders (expected: 2)
 * 1st: Due to redux (No change in UI)
        useEffect will detect change in redux, so will call setColumnFilters()
 * 2nd & 3rd: Due to calling setColumnFilters(). Ideally 1 re-render only, not 2. Maybe react-table bug.
 */

export const FloodTable = () => {
    // Redux values (global-values)
    const filterState = useSelector(state => state.filterReducer);
    
    
    // Table filter (local table filters)
    const tableFilter = convertStateToFilter(filterState);
    const [columnFilters, setColumnFilters] = useState([]);    
    //console.log('[FloodTable] render, filterState:', filterState, 'New Table Filter', tableFilter);    

    // Columns
    //const columns = useMemo(() => prepareColumns(), );
    const table = useReactTable({
        data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {
                //debugger
                let ret = filterValue.includes(row.getValue(columnId));
                //console.log('[multiValueFilter]', ret)
                return ret;
            }
        }
    })
    
    console.log('[FloodTable] render, filterState:', filterState);

    useEffect(() => {
        console.log('[Table UseEffect]');
        //table.setColumnFilters(tableFilter)
        table.setColumnFilters(convertStateToFilter(filterState))
    }, [filterState.Project, filterState.Year, filterState.District, filterState.Region])


    const getSortingIcon = (isSorted) => {        
        const iconLookup = iconSortLookup[isSorted];
        if (!iconLookup) {
            return <i className="bx bxs-sort-alt table-icon table-icon-disabled"></i>
        }
        const iconClass = `${iconLookup} table-icon table-icon-enabled`;
        //console.log('isSorted', isSorted, iconClass);

        return <i className={iconClass}></i>;
    }

    const prepareHeader = () => {
        const headerGroups = table.getHeaderGroups();
        
        //console.log('HeaderGroups', headerGroups);

        let headerColumns = headerGroups.map(hdrGrp => {
            return hdrGrp.headers.map(header => {
                const isSortable = header.column.getCanSort();
                let thClassNames = 'thTable';
                if (isSortable) {
                    thClassNames += ' thSortable'
                }
                return <th key={header.id} className={thClassNames} onClick={header.column.getToggleSortingHandler()}>
                    {header.column.columnDef.header}
                    {isSortable && getSortingIcon(header.column.getIsSorted())}
                    
                </th>
            })
        });
        //console.log('headers', headerColumns);

        return <tr>
            {headerColumns}
        </tr>;
    }

    const prepareBody = () => {
        const rows = table.getRowModel().rows;
        const ret = rows.map(row => {
            return <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                    return <td key={cell.id} className="tdTable">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                })}
            </tr>
        })
        //console.log('rows', ret)
        return ret;
    }

    const preparePagninator = () => {
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
                {/* TODO: Let the user choose page size */}
                <div className='pageSize'>
                    Page Size: 10 
                </div>
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

    const showGrandTotal = () => {
        let rows = table.getFilteredRowModel().rows;
        let sum = 0;
        rows.forEach(row => {
            sum += row.getValue('Cost')
        })
        
        return <div className="grandTotalContainer">
            <div className="grandTotalLabel">SUBTOTAL:</div>
            <div className="grandTotalValue">{formatMoney(sum)}</div>
        </div>;
    }
    
    return <div className="tableContainer">
        {showGrandTotal()}
        {preparePagninator()}
        <table className="floodTable">
            <thead>
                {prepareHeader()}
            </thead>
            <tbody>
                {prepareBody()}
            </tbody>
            {/* TODO: Grand total */}
        </table>
        
    </div>;
}