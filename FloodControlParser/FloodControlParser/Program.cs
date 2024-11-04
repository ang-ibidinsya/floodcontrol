using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis;
using UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter;
using UglyToad.PdfPig.DocumentLayoutAnalysis.ReadingOrderDetector;
using UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor;
using UglyToad.PdfPig.Fonts.Standard14Fonts;
using UglyToad.PdfPig.Writer;
using FloodControlParser.Models;
using UglyToad.PdfPig.Core;
using System.Text.RegularExpressions;
using System.Text;
using System.Globalization;
using System.Text.Json;
using FloodControlParser;

Console.WriteLine($"[{DateTime.Now.ToString("HH:mm:ss")}] Start Parse PDF!");
/*
 * ------------------------------------------------------------------------------------------
 * |  FY  |  REGION  |           PROGRAMS/ACTIVITIES/PROJECTS           |   PROJECT COST    |
 * ------------------------------------------------------------------------------------------
 */

// [TODO] Better method of parsing:
// Do not map item with cost by relying on bottom-Y's are the same (there are a few exceptions)
// Instead: Index each item and each cost. Use the index for mapping the item with the cost.

double BUFFER = 10;
double FY_LEFT = 18.36;
double FY_RIGHT = 41.89;
double ITEM_LEFT = 110.18;
double ITEM_INDENTED_LEFT = 122.3;
double COST_RIGHT = 574.79;
string[] COL_HEADERS = new string[] { "FY", "REGION", "PROGRAMS/ACTIVITIES/PROJECTS", "PROJECT COST" };
string SPECIAL_HANDLING_DISTRICT_IEM = "PROGRAMS/ACTIVITIES/PROJECTS";
string SPECIAL_HANDLING_COST = "PROJECT COST";
bool GenerateExcel = true;

//int[] SPECIAL_HANDLING_PAGE = new int[] { 14, 263 }; // PDF Library has a bug; does not separate out the textblocks
// Region text is centered, just compute it based on FY-Right and Item-Left
//double REGION_LEFT = FY_RIGHT + BUFFER;
//double REGION_RIGHT = ITEM_LEFT - BUFFER;

string sourcePdfPath = "5521-Flood-Control-Projects-1.pdf";

//Study();
Dictionary<int, PageContent> allPages = new Dictionary<int, PageContent>();
ParseAll();

#region Study
void Study()
{
    int pageNumber = 196;
    string outputPath = $"ParseOut_UnsupervisedReadingOrderDetector_Page{pageNumber}.pdf";
    string txtOutputPath = $"ParsedText_Page{pageNumber}.txt";

    using (var document = PdfDocument.Open(sourcePdfPath))
    {
        int numPages = document.NumberOfPages;
        var builder = new PdfDocumentBuilder { };
        PdfDocumentBuilder.AddedFont font = builder.AddStandard14Font(Standard14Font.Helvetica);
        var pageBuilder = builder.AddPage(document, pageNumber);
        pageBuilder.SetStrokeColor(0, 255, 0);
        var page = document.GetPage(pageNumber);

        var letters = page.Letters; // no preprocessing

        // 1. Extract words
        var wordExtractor = NearestNeighbourWordExtractor.Instance;

        var words = wordExtractor.GetWords(letters);

        // 2. Segment page
        var pageSegmenter = DocstrumBoundingBoxes.Instance;

        var textBlocks = pageSegmenter.GetBlocks(words);

        // 3. Postprocessing
        //var readingOrder = UnsupervisedReadingOrderDetector.Instance;
        var readingOrder = DefaultReadingOrderDetector.Instance;
        //var readingOrder = RenderingReadingOrderDetector.Instance;
        var orderedTextBlocks = readingOrder.Get(textBlocks);

        // 4. Add debug info - Bounding boxes and reading order
        foreach (var block in orderedTextBlocks)
        {
            File.AppendAllText(txtOutputPath, "\r\n♦Block Start\r\n");

            var bbox = block.BoundingBox;

            File.AppendAllText(txtOutputPath, $"[{bbox.TopLeft.X}, {bbox.TopLeft.Y}], [{bbox.BottomRight.X}, {bbox.BottomRight.Y}]\r\n");
            pageBuilder.DrawRectangle(bbox.BottomLeft, bbox.Width, bbox.Height);
            pageBuilder.AddText(block.ReadingOrder.ToString(), 8, bbox.TopLeft, font);
            foreach (var line in block.TextLines)
            {
                bool isBold = line.Words.Any(w => w.Letters.Any(ltr => ltr.Font.IsBold));
                File.AppendAllText(txtOutputPath, $"[Bold={isBold}]{line.Text}");

                foreach (var word in line.Words)
                {
                    //word.Letters.Any(l => l.Font.)
                }
            }
        }

        // 5. Write result to a file
        byte[] fileBytes = builder.Build();
        File.WriteAllBytes(outputPath, fileBytes); // save to file
    }
    
}
#endregion Study

void ParseAll()
{
    string outputJson = "FloodControl.json";
    using (var document = PdfDocument.Open(sourcePdfPath))
    {
        int numPages = document.NumberOfPages;
        //int numPages = 2;
        for (int iPage = 1; iPage <= numPages; iPage++)
        //for (int iPage = 14; iPage <= 14; iPage++)
        {
            Console.WriteLine($"[{DateTime.Now.ToString("HH:mm:ss")}] Parse Page {iPage}");
            PageContent pageContent = new PageContent();
            allPages[iPage] = pageContent;
            var page = document.GetPage(iPage);
            var letters = page.Letters; // no preprocessing
            // 1. Extract words
            var wordExtractor = NearestNeighbourWordExtractor.Instance;
            var words = wordExtractor.GetWords(letters);

            // 2. Segment page
            var pageSegmenter = DocstrumBoundingBoxes.Instance;
            var textBlocks = pageSegmenter.GetBlocks(words);

            // 3. Postprocessing
            var readingOrder = UnsupervisedReadingOrderDetector.Instance;
            var orderedTextBlocks = readingOrder.Get(textBlocks);
            foreach (var block in orderedTextBlocks)
            {
                // Parse as-is first, no correlation between Regions/District/Items yet
                ProcessBlock(block, pageContent);
            }
        }
        // Stitch up Regions to Districts to Items based on Page number and XY positions
        CorrelateData();
    }

    var allItems = allPages.SelectMany(p => p.Value.ItemBlocks);
    var jsonStr = JsonSerializer.Serialize(allItems);
    File.WriteAllText(outputJson, jsonStr);

    // Compute grand total
    decimal sum = allItems.Sum(i => i.Cost);
    Console.WriteLine("GrandTotal: " + sum);
    
    // Validations
    var invalids = allItems.Where(item => item.Year == 0 || 
                                string.IsNullOrEmpty(item.Region) || 
                                string.IsNullOrEmpty(item.District) || 
                                string.IsNullOrEmpty(item.Item) || 
                                item.Cost <= 0);
    foreach(var invalid in invalids)
    {
        Console.WriteLine("Invalid: " + invalid.Item);
    }

    if (!invalids.Any() && GenerateExcel)
    {
        new ExcelUtil().GenerateExcel(allItems);
    }
}

// Main business logic
void ProcessBlock(TextBlock block, PageContent pageContent)
{
    PdfPoint blockTopLeft = block.BoundingBox.TopLeft;
    PdfPoint blockBtmRight = block.BoundingBox.BottomRight;

    if (COL_HEADERS.Contains(block.Text))
    {
        return;
    }

    // Some pages (14, 263) can't parse out 
    if (block.Text.StartsWith(SPECIAL_HANDLING_DISTRICT_IEM))
    {
        SpecialHandle_DistrictItem(block, pageContent);
        return;
    }

    if (block.Text.StartsWith(SPECIAL_HANDLING_COST) ||
        pageContent.IsSpecialHandling) // Page206 and 234 splits the cost into 2 blocks
    {
        SpecialHandle_Cost(block, pageContent);
        return;
    }

    // [a] FY
    if (IsNear(FY_LEFT, blockTopLeft.X))
    {
        string yearVal = block.Text;
        int yearNum = Convert.ToInt32(yearVal); // just let it throw exception if it fails
        pageContent.YearBlocks.Add(new YearBlock()
        {
            TopLeft = blockTopLeft,
            YearVal = yearNum
        });
        return;
    }
    // [b] Region
    if (blockTopLeft.X > FY_RIGHT && 
        blockBtmRight.X < ITEM_LEFT && 
        !block.Text.Trim().Equals("GRANDTOTAL", StringComparison.InvariantCultureIgnoreCase))
    {
        pageContent.RegionBlocks.Add(new RegionBlock()
        {
            TopLeft = blockTopLeft,
            RegionName = block.Text
        });
        return;
    }
    // [c - Not indented] Item or District
    if (IsNear(ITEM_LEFT, blockTopLeft.X))
    {
        List<string> itemTexLines = new List<string>();
        for (int iLine = 0; iLine < block.TextLines.Count; iLine++)
        {
            TextLine currLine = block.TextLines[iLine];
            string lineText = currLine.Text.Trim();
            bool bStartsWithNum = startsWithNum(lineText);
            if (iLine == 0 && !bStartsWithNum)
            {
                // [c1] District
                pageContent.DistrictBlocks.Add(new DistrictBlock()
                {
                    DistrictName = lineText,
                    TopLeft = blockTopLeft
                });
                continue;
            }
            // [c2] Item
            // disregard pure number
            if (isPureNumber(lineText))
            {
                continue;
            }
            itemTexLines.Add(lineText);
        }
        if (itemTexLines.Any())
        {
            pageContent.ItemBlocks.Add(new ItemBlock()
            {
                Item = String.Join(' ', itemTexLines),
                BottomRight = blockBtmRight
            });
        }
        return;
    }
    // [c - indented] Indented Item only
    if (IsNear(ITEM_INDENTED_LEFT, blockTopLeft.X))
    {
        List<string> itemTexLines = new List<string>();
        foreach(TextLine currLine in block.TextLines)
        {
            string lineText = currLine.Text.Trim();
            itemTexLines.Add(lineText);
        }
        if (itemTexLines.Any())
        {
            pageContent.ItemBlocks.Add(new ItemBlock()
            {
                Item = String.Join(' ', itemTexLines),
                BottomRight = blockBtmRight
            });
        }
        return;
    }

    // [d] Cost
    if (IsNear(COST_RIGHT, blockBtmRight.X))
    {
        bool isBold = block.TextLines.Any(line => line.Words.Any(word => word.Letters.Any(ltr => ltr.Font.IsBold)));
        if (isBold)
        {
            // Bold means subtotal
            return;
        }
        pageContent.CostBlocks.Add(new CostBlock()
        {
            BottomRight = blockBtmRight,
            Cost = ConvertMoneyString(block.Text.Trim())
        });
        return;
    }
}

void SpecialHandle_Cost(TextBlock block, PageContent pageContent)
{
    Console.Write(" -- Special Handling Cost\r\n");
    int idx = pageContent.CostBlocks.Any() ? pageContent.CostBlocks.Max(c => c.SpecialPageIdx) : 0;
    pageContent.IsSpecialHandling = true;
    string[] toks = block.Text.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
    foreach (string tok in toks)
    {
        if (COL_HEADERS.Contains(tok))
        {
            continue;
        }

        pageContent.CostBlocks.Add(new CostBlock()
        {
            Cost = ConvertMoneyString(tok),
            SpecialPageIdx = idx++,
        });
    }
}

void SpecialHandle_DistrictItem(TextBlock block, PageContent pageContent)
{
    Console.Write(" -- Special Handling District");
    int idx = 0;
    pageContent.IsSpecialHandling = true;
    string[] toks = block.Text.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
    ItemBlock currItem = null;
    foreach(string tok in toks)
    {
        if (COL_HEADERS.Contains(tok))
        {
            continue;
        }

        if (tok.Contains("DEO"))
        {
            pageContent.DistrictBlocks.Add(new DistrictBlock() { 
                DistrictName = tok,
                SpecialPageIdx = idx++,
            });
            continue;
        }

        if (startsWithNum(tok))
        {
            currItem = new ItemBlock()
            {
                Item = tok,
                SpecialPageIdx = idx++,
            };
            pageContent.ItemBlocks.Add(currItem);
            continue;
        }
        if (currItem != null)
        {
            currItem.Item += " " + tok;
        }        
    }
}

/* Note: Y is descending in value
* TopLeft:  X = 0;         Y = BigNumber
* BtmRight: X = BigNumber; Y = 0 
* 
* */

void CorrelateData()
{
    int currYear = 0;
    string currRegion = string.Empty;
    string currDistrict = string.Empty;

    foreach (var kvp in allPages)
    {
        int currPageNum = kvp.Key;

        PageContent currPageContent = kvp.Value;
        Console.WriteLine($"[{DateTime.Now.ToString("HH:mm:ss")}] Correlate Page {currPageNum}");

        if (currPageContent.IsSpecialHandling)
        {
            CorrelateSpecialData(currPageContent, currYear, currRegion, ref currDistrict);
            continue;
        }

        // Descending meaning those at the bottom visually will come up first in the list
        IEnumerable<YearBlock> yearSortedDesc = currPageContent.YearBlocks.OrderBy(y => y.TopLeft.Y);
        IEnumerable<RegionBlock> regionSortedDesc = currPageContent.RegionBlocks.OrderBy(r => r.TopLeft.Y);
        IEnumerable<DistrictBlock> districtSortedDesc = currPageContent.DistrictBlocks.OrderBy(d => d.TopLeft.Y);

        IEnumerable<ItemBlock> itemBlocksSorted = currPageContent.ItemBlocks.OrderByDescending(item => item.BottomRight.Y);
        foreach(ItemBlock item in itemBlocksSorted)
        {
            // Find year above current item
            var findYear = yearSortedDesc.FirstOrDefault(y => y.TopLeft.Y > item.BottomRight.Y);
            if (findYear != null)
            {
                currYear = findYear.YearVal;
            }
            var findRegion = regionSortedDesc.FirstOrDefault(y => y.TopLeft.Y > item.BottomRight.Y);
            if (findRegion != null)
            {
                currRegion = findRegion.RegionName;
            }
            var findDistrict = districtSortedDesc.FirstOrDefault(y => y.TopLeft.Y > item.BottomRight.Y);
            if (findDistrict != null)
            {
                currDistrict = findDistrict.DistrictName;
            }
            item.District = currDistrict;
            item.Region = currRegion;
            item.Year = currYear;

            // For the cost: since the Cost is bottom aligned as the item, just find the cost with equal bottom coord as the item
            var findCost = currPageContent.CostBlocks.FirstOrDefault(c => IsNear(item.BottomRight.Y, c.BottomRight.Y));
            if (findCost == null)
            {
                //throw new Exception("Unable to find cost"); // make it showstopper; we need to debug
                Console.Error.WriteLine($"[Page {currPageNum}] Cost cannot be found for: Item {item.Item}");
                // This can be because the cost accidentally has an extra newline
                // Attempt to find the nearest cost by looking up the cost a few pixels down
                for (int iAttempt = 0; iAttempt < 10; iAttempt++ )
                {
                    findCost = currPageContent.CostBlocks.FirstOrDefault(c => IsNear(item.BottomRight.Y, c.BottomRight.Y + iAttempt * BUFFER));
                    if (findCost != null)
                    {
                        Console.WriteLine($"Able to find nearest cost after attempt {iAttempt} : {findCost.Cost}");
                        break;
                    }
                }
            }
            item.Cost = findCost.Cost;
        }

        // Before moving to next page, update to latest Year/Region/District in case the last elements of the page is a year/region/district with no Item
        var findLastYear = yearSortedDesc.FirstOrDefault();
        if (findLastYear != null)
        {
            currYear = findLastYear.YearVal;
        }
        var findLastRegion = regionSortedDesc.FirstOrDefault();
        if (findLastRegion != null)
        {
            currRegion = findLastRegion.RegionName;
        }
        var findLastDistrict = districtSortedDesc.FirstOrDefault();
        if (findLastDistrict != null)
        {
            currDistrict = findLastDistrict.DistrictName;
        }

    }
}

void CorrelateSpecialData(PageContent currPageData, int currYear, string currRegion, ref string currDistrict)
{
    // No Year and Region Data in special data now
    if (currPageData.CostBlocks.Count != 
        currPageData.ItemBlocks.Count + currPageData.DistrictBlocks.Count)
    {
        throw new Exception("Cost count does not match with item+district count");
    }

    for (int i = 0; i < currPageData.CostBlocks.Count; i++)
    {
        ItemBlock findItem = currPageData.ItemBlocks.FirstOrDefault(item => item.SpecialPageIdx == i);
        if (findItem != null)
        {
            findItem.Cost = currPageData.CostBlocks[i].Cost;
            findItem.Year = currYear;
            findItem.Region = currRegion;
            findItem.District = currDistrict;
            continue;
        }

        DistrictBlock findDistrict = currPageData.DistrictBlocks.FirstOrDefault(d => d.SpecialPageIdx == i);
        if (findDistrict == null)
        {
            throw new Exception("Unable to find both Item and district at idx " + i);
        }
        currDistrict = findDistrict.DistrictName;
    }
}

bool isPureNumber(string line)
{
    string lineTrimmed = line.Trim();
    if (lineTrimmed.StartsWith("#"))
    {
        return lineTrimmed.Replace("#", string.Empty).Length <= 0;
    }

    bool containsAlphabet = Regex.IsMatch(lineTrimmed, @"[a-zA-Z]");
    if (containsAlphabet)
    {
        return false;
    }

    int idxDot = lineTrimmed.IndexOf('.');
    if (idxDot < 0)
    {
        return false;
    }
    return lineTrimmed.Substring(idxDot).Length <= 1;
}

decimal ConvertMoneyString(string moneyString)
{
    CultureInfo culture = new CultureInfo("en-US");
    if (moneyString.IndexOf('\n') >= 0)
    {
        string[] toks = moneyString.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        return decimal.Parse(toks[toks.Length-1], NumberStyles.Currency, culture);
    }
    return decimal.Parse(moneyString, NumberStyles.Currency, culture);
}

// Either starts with a number followed by dot, or "# "
bool startsWithNum(string text)
{
    // [a] #
    if (text.StartsWith("#"))
    {
        return true;
    }
    // [b] number followed by .
    string pattern = @"^\d+\.";
    return Regex.IsMatch(text, pattern);
}

bool IsNear(double nearWhat, double currPos)
{
    return Math.Abs(nearWhat - currPos) <= BUFFER;
}

string GetBlockSingleLineValue(TextBlock block)
{
    return block?.Text;
}

Console.WriteLine($"[{DateTime.Now.ToString("HH: mm:ss")}] Done!");