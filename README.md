# Projects inside:

## 1. FloodControlParser
Parses the PDF File "5521-Flood-Control-Projects-1.pdf" using C#, and outputs to JSON and Excel format.
The PDF File has 323 pages. Please report if there are errors in the outputted JSON/Excel format.

## 2. WebAnalyzer (🚧Work-in-Progress)
Web-based project using React that consumes the JSON file outputted by the FloodControlParser, to allow the user to filter/sort/group/drilldown the data.

### Demo Site:
https://ang-ibidinsya.github.io/floodcontrol/

**Roadmap:**
- [x] Display of flood control projects in a flat list
- [x] Filter by Project Name
- [x] Filter by Year, Region, District
- [ ] Group By Year
- [ ] Group By Region
- [ ] Group By District
- [ ] Drilldown of data after grouping
- [ ] Bar charts

**Minor TODO's:**
- [ ] Selectable Page Size
- [ ] District filter must cascade from Region filter
