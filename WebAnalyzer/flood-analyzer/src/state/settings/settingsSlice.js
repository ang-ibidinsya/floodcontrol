import { createSlice } from "@reduxjs/toolkit";
import {data} from '../../assets/FloodControl';

const satisfiesFilter = (currData, filters) => {
    if (!filters) {
        return true;
    }

    // [1] year
    if (filters.Year?.length > 0 && !filters.Year.includes(currData.Year)) {
        return false;
    }
    // [2] Region
    if (filters.Region?.length > 0 && !filters.Region.includes(currData.Region)) {
        return false;
    }
    // [3] District
    if (filters.District?.length > 0 && !filters.District.includes(currData.District)) {
        return false;
    }
    // [4] Item Name (case insensitive)
    if (filters.Project && currData.Item.toUpperCase().indexOf(filters.Project.toUpperCase()) < 0) {
        return false;
    }
    return true;
}

const mapAndFilterData = (filters) => {
    let mapYearGroups = {};
    let mapRegionGroups = {};
    let mapDistrictGroups = {};

    let ret = {
        yearGroups: {},
        regionGroups: {},
        districtGroups: {},
        grandTotal: 0
    }
    // use for instead of forEach
    for (let i = 0; i < data.length; i++) {
        let currData = data[i];
        let currYear = currData.Year;
        let currRegion = currData.Region;
        let currDistrict = currData.District;

        if (!satisfiesFilter(currData, filters)) {
            continue;
        }
        
        // [a] year
        if (!mapYearGroups[currYear]) {
            mapYearGroups[currYear] = {    
                items:[], 
                subtotal: 0,
                year: currYear
            };
        }
        mapYearGroups[currYear].items.push(currData);
        mapYearGroups[currYear].subtotal += currData.Cost;

        // [b] region
        if (!mapRegionGroups[currRegion]) {
            mapRegionGroups[currRegion] = {
                items:[], 
                subtotal: 0,
                region: currRegion
            };
        }
        mapRegionGroups[currRegion].items.push(currData);
        mapRegionGroups[currRegion].subtotal += currData.Cost;

        // [c] district
        if (!mapDistrictGroups[currDistrict]) {
            mapDistrictGroups[currDistrict] = {
                items:[], 
                subtotal: 0,
                district: currDistrict
            };
        }
        mapDistrictGroups[currDistrict].items.push(currData);
        mapDistrictGroups[currDistrict].subtotal += currData.Cost;
        ret.grandTotal += currData.Cost;
    }

    ret.yearGroups = Object.values(mapYearGroups);
    ret.regionGroups = Object.values(mapRegionGroups);
    ret.districtGroups = Object.values(mapDistrictGroups);

    console.log('[mapAndFilterData] ret', ret);
    return ret;
}

const mapAndFilterDataOrig = (filters) => {
    let ret = {
        yearGroups: {},
        regionGroups: {},
        districtGroups: {},
        grandTotal: 0
    }
    // use for instead of forEach
    for (let i = 0; i < data.length; i++) {
        let currData = data[i];
        let currYear = currData.Year;
        let currRegion = currData.Region;
        let currDistrict = currData.District;

        if (!satisfiesFilter(currData, filters)) {
            continue;
        }
        
        // [a] year
        if (!ret.yearGroups[currYear]) {
            ret.yearGroups[currYear] = {    
                items:[], 
                subtotal: 0,
                year: currYear
            };
        }
        ret.yearGroups[currYear].items.push(currData);
        ret.yearGroups[currYear].subtotal += currData.Cost;

        // [b] region
        if (!ret.regionGroups[currRegion]) {
            ret.regionGroups[currRegion] = {
                items:[], 
                subtotal: 0,
                year: currYear
            };
        }
        ret.regionGroups[currRegion].items.push(currData);
        ret.regionGroups[currRegion].subtotal += currData.Cost;

        // [c] district
        if (!ret.districtGroups[currDistrict]) {
            ret.districtGroups[currDistrict] = {
                items:[], 
                subtotal: 0,
                year: currYear
            };
        }
        ret.districtGroups[currDistrict].items.push(currData);
        ret.districtGroups[currDistrict].subtotal += currData.Cost;
        ret.grandTotal += currData.Cost;
    }

    console.log('[mapAndFilterData] ret', ret);
    return ret;
}

// For both filters and groupings
const initialState = {
    // Filters
    Filters: {
        Year: [],
        Region: [],
        District: [],
        Project: '',    
        //Politician: [],        
    },

    // Groupings    
    Grouping: '',
    /*
    FilteredData: {
        GrandTotal: 0,
        YearlyGroups: {},
        RegionGroups: {},
        DistrictGroups: {}
    }
    */
    FilteredData: mapAndFilterData(null)
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action) => {
            console.log('[settings reducer] state:', state, 'action:', action);
            Object.assign(state, action.payload);
            Object.assign(state.Filters, action.payload.Filters);
            Object.assign(state.FilteredData, mapAndFilterData(action.payload.Filters))
        }
    }
})

export const {setSettings} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;