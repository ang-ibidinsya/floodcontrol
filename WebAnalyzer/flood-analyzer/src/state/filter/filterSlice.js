import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    Year: [],
    Region: [],
    District: [],
    Project: '',
    Politician: [],        
    Grouping: ''
};

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            console.log('[filter reducer] state:', state, 'action:', action);
            Object.assign(state, action.payload);
        }
    }
})

export const {setFilter} = filterSlice.actions;

export const filterReducer = filterSlice.reducer;