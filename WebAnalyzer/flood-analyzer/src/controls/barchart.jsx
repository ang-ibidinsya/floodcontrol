import './barchart.css';

export const BarChart = ({cost, minCost, maxCost}) => {
    let percentFill = (cost - minCost) / (maxCost - minCost) * 100.00;
        
    return <div className="barChart">
        <div className="barFilled" style={{flexBasis: `${percentFill}%`}}/>
        <div className="barEmpty" style={{flexBasis: `${100-percentFill}%`}}/>
    </div>
}

