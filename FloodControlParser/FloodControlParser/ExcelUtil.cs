using ClosedXML.Excel;
using FloodControlParser.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FloodControlParser;

public class ExcelUtil
{
    private readonly int ROW_COLHEADERS = 1;
    private readonly int COL_YEAR = 1;
    private readonly int COL_REGION = 2;
    private readonly int COL_DISTRICT = 3;
    private readonly int COL_ITEM = 4;
    private readonly int COL_COST = 5;
    private readonly int COL_GRANDTOTAL_LBL = 6;
    private readonly int COL_GRANDTOTAL = 7;
    private readonly int COL_FILTEREDTOTAL_LBL = 8;
    private readonly int COL_FILTEREDTOTAL = 9;

    public void GenerateExcel(IEnumerable<ItemBlock> allItems)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.AddWorksheet("Flood Control Projects");
        // [A] Headers
        worksheet.Cell(ROW_COLHEADERS, COL_YEAR).Value = "Year";
        worksheet.Cell(ROW_COLHEADERS, COL_REGION).Value = "Region";
        worksheet.Cell(ROW_COLHEADERS, COL_DISTRICT).Value = "District";
        worksheet.Cell(ROW_COLHEADERS, COL_ITEM).Value = "Item";
        worksheet.Cell(ROW_COLHEADERS, COL_COST).Value = "Cost";
        worksheet.Cell(ROW_COLHEADERS, COL_GRANDTOTAL_LBL)
            .SetValue("Grand Total")
            .Style.Fill.SetBackgroundColor(XLColor.LightBlue);
        worksheet.Cell(ROW_COLHEADERS, COL_FILTEREDTOTAL_LBL)
            .SetValue("Filtered Total")
            .Style.Fill.SetBackgroundColor(XLColor.BurlyWood);

        // Add Formatting        
        worksheet.Column(COL_YEAR).Width = 8;
        worksheet.Column(COL_REGION).Width = 18;
        worksheet.Column(COL_DISTRICT).Width = 30;
        worksheet.Column(COL_ITEM).Width = 80;
        worksheet.Column(COL_COST).Width = 20;
        worksheet.Column(COL_GRANDTOTAL_LBL).Width = 15;
        worksheet.Column(COL_GRANDTOTAL).Width = 25;
        worksheet.Column(COL_FILTEREDTOTAL_LBL).Width = 18;
        worksheet.Column(COL_FILTEREDTOTAL).Width = 25;
        worksheet.Range(ROW_COLHEADERS, COL_YEAR, ROW_COLHEADERS, COL_FILTEREDTOTAL).Style.Font.Bold = true;
        worksheet.Range(ROW_COLHEADERS, COL_YEAR, ROW_COLHEADERS, COL_COST).Style.Fill.BackgroundColor = XLColor.Beige;        

        // [B] Rows
        int iXlRow = ROW_COLHEADERS;
        foreach (ItemBlock item in allItems)
        {
            iXlRow++;
            worksheet.Cell(iXlRow, COL_YEAR).Value = item.Year;
            worksheet.Cell(iXlRow, COL_REGION).Value = item.Region;
            worksheet.Cell(iXlRow, COL_DISTRICT).Value = item.District;
            worksheet.Cell(iXlRow, COL_ITEM).Value = item.Item;
            worksheet.Cell(iXlRow, COL_COST).Value = item.Cost;
        }

        IXLRange allCells = worksheet.Range(ROW_COLHEADERS, COL_YEAR, iXlRow, COL_COST);
        allCells.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        allCells.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        IXLRange filterableCells = worksheet.Range(ROW_COLHEADERS, COL_YEAR, iXlRow, COL_DISTRICT);
        filterableCells.SetAutoFilter();
        worksheet.Range(ROW_COLHEADERS + 1, COL_COST, iXlRow, COL_COST)
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";

        // [C Formula]
        worksheet.Cell(ROW_COLHEADERS, COL_GRANDTOTAL).SetFormulaA1("=SUM(E:E)")
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";
       
        worksheet.Cell(ROW_COLHEADERS, COL_FILTEREDTOTAL).SetFormulaA1("=SUBTOTAL(9,E:E)")
            .Style.Font.SetFontName("Courier New") // For easier reading numbers (alignment)
            .NumberFormat.Format = "#,##0.00";

        workbook.SaveAs("FloodControlProjects.xlsx");

    }
}
