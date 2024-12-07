// For debugging tooltips only
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
import {data} from '../assets/FloodControl';


export const showGrandTotalDirectly = (grandTotal) => {
    return <div className="grandTotalContainer">
        <div className="grandTotalLabel">SUBTOTAL:</div>
        <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
    </div>;
}

export const FloodTableByRegionX = (props) => {    
    const {settingsState} = props;
    const [sorting, setSorting] = useState([])
    
    console.log('[FloodTableByRegion] render, settingsState:', settingsState);

    const columnDefs = [
        {
            accessorKey: "region",
            header: "Region",
            cell: ({ getValue, row, column, table }) => {
            return <div data-tooltip-id="my-tooltip">Hello</div>
            },
        },        
    ];

    const table = useReactTable({
        data: data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        initialState: {
        },
        state: {
            
        },
    })

    return <div>
          {createToolTip('my-tooltip')}          
          <table>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                            title={
                              header.column.getCanSort()
                                ? header.column.getNextSortingOrder() === 'asc'
                                  ? 'Sort ascending'
                                  : header.column.getNextSortingOrder() === 'desc'
                                    ? 'Sort descending'
                                    : 'Clear sort'
                                : undefined
                            }
                          >
                            Header
                            {{
                              asc: ' up',
                              desc: ' down',
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, 10)
                .map(row => {
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => {
                        return (
                          <td key={cell.id}>
                            <div
                              data-tooltip-id="my-tooltip">
                                Hello
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
            </tbody>
          </table>
          <div>{table.getRowModel().rows.length.toLocaleString()} Rows</div>
          <div>
            <button onClick={() => rerender()}>Force Rerender</button>
          </div>
          <div>
            <button onClick={() => refreshData()}>Refresh Data</button>
          </div>
          <pre>{JSON.stringify(sorting, null, 2)}</pre>
        </div>
}