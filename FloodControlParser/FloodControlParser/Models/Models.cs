using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UglyToad.PdfPig.Core;

namespace FloodControlParser.Models;

public class PageContent
{
    public List<YearBlock> YearBlocks { get; set; } = new List<YearBlock>();
    public List<RegionBlock> RegionBlocks { get; set; } = new List<RegionBlock>();
    public List<DistrictBlock> DistrictBlocks { get; set; } = new List<DistrictBlock>();
    public List<ItemBlock> ItemBlocks { get; set; } = new List<ItemBlock>();
    public List<CostBlock> CostBlocks { get; set; } = new List<CostBlock>();

    public bool IsSpecialHandling = false;
}


public class YearBlock
{
    public int YearVal { get; set; }
    public PdfPoint TopLeft;
}


public class RegionBlock
{
    public PdfPoint TopLeft;
    public string RegionName { get; set; }
}

public class DistrictBlock
{
    public PdfPoint TopLeft;
    public string DistrictName { get; set; }

    public int SpecialPageIdx;
}


public class ItemBlock
{
    public PdfPoint BottomRight;    
    public int Year { get; set; }
    public string Region { get; set; }
    public string District { get; set; }
    public string Item { get; set; }
    public decimal Cost{ get; set; }

    public int SpecialPageIdx;
}

public class CostBlock
{
    public PdfPoint TopLeft;
    public PdfPoint BottomRight;

    public decimal Cost { get; set; }

    public int SpecialPageIdx;
}