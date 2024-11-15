import { configureStore } from "@reduxjs/toolkit";
import { settingsReducer } from './settings/settingsSlice';

export const store = configureStore({
    reducer: {
        settingsReducer: settingsReducer
    }
});
