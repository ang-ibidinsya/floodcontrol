import './stackedbarchart.css';

const mapColors = {
    2017: '#E74C3C', //Red
    2018: '#3498DB', //Blue
    2019: '#2ECC71', //Green
    2020: '#F39C12', //Orange
    2021: '#2C3E50', //Dark Blue
    2022: '#1ABC9C', //Teal
    2023: '#F1C40F', //Yellow
    2024: '#9B59B6', //Purple
}

export const StackedBarChart = ({name, subtotalsMap, minCost, maxCost}) => {
    let stacks = [];
    let sumCosts = Object.values(subtotalsMap).reduce((sum, a) => sum + a, 0);
    let minMaxDiff = maxCost - minCost;
    for (var year in subtotalsMap) {
        if (!Object.prototype.hasOwnProperty.call(subtotalsMap, year)) {
            continue;            
        }        
        let currCost = subtotalsMap[year];
        let percentFill = (sumCosts-minCost)/minMaxDiff * currCost/sumCosts * 100.0;
        stacks.push(<div className="bar" key={`stack-region-${name}-${year}`} style={{flexBasis: `${percentFill}%`, backgroundColor: `${mapColors[year]}`}}/>);    
    }
    
    let remaining = (maxCost-sumCosts) / minMaxDiff * 100.00;
    stacks.push(<div className="barEmpty" key={`stack-region-${name}-${remaining}`} style={{flexBasis: `${remaining}%`}}/>);
        
    return <div className="barChart">
        {stacks}
    </div>
}

