/******************************* [Notes]*******************************
Group By:
	⏺️Region
	⏺️District
	⏺None		To see most expensive projects

Sort By:
	⏺️Group Name
	⏺️Cost
Filter:
	Year: _Dropdown_🔽
    Item: _Text________
    Region: _Dropdown_🔽
    District: _Dropdown_🔽
    Cost: Min - Max
	__Politician Filter Keyword
	
Chart:
    Top: 30
	Y: Cost
	X: Group
	   Sorted by:
 *************************************************************************/
import './filters.css';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {setFilter} from '../state/filter/filterSlice';

export const Filters = () => {    

    // Note: calling watch here (not inside useEffect) will cause this for to re-render each time a watched value changes (not good)
    console.log('[Filter render]');
    const {register, handleSubmit, watch} = useForm();
    
    // redux values
    
    const dispatch = useDispatch();

    // Purpose: for firing 
    useEffect(() => {        
        console.log('useEffect')
        const subscription = watch( data => {
            // Will be called on each input change of any of the controls
            // At least, no re-render happens
            console.log('[watch subscription]', data);
            dispatch(setFilter(data));
        });

        return () => {
            // Need to unsubscribe, otherwise the subscription function will be called 1 time each per registerd control, for each keystroke
            subscription.unsubscribe();
        }
    }, [watch]);

    // currently not called
    const onSubmit = (data) => {
        console.log('onsubmit', data)
    }

    const createFilterField = (fieldName, fieldType) => {
        return <>
            <div className="fieldLabel">
                {fieldName}:
            </div>
            <div className="fieldInput">
                <input {...register(fieldName)} type="text"></input>
            </div>
        </>
    }

    const createGroupingFields = () => {
        return <div className="groupingFieldsContainer">
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Year"></input>
                <span>Year</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Region"></input>
                <span>Region</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="District"></input>
                <span>District</span>
            </label>
            <label className="groupingField">
                <input type="radio" name="groupingFields" value="Project"></input>
                <span>Project</span>
            </label>
        </div>;
    }
    
    const formMain = <form className="mainForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="collapsibleContainerText">
            <i className="bx bxs-cog"></i>
            <span>Settings</span>
        </div>
        <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bxs-filter-alt"></i> Filters
            </div>
            <div className="fieldTable">
                {createFilterField('Year', 'text')}
                {createFilterField('Region', 'text')}
                {createFilterField('District', 'text')}
                {createFilterField('Project', 'text')}
                {createFilterField('Cost', 'text')}
                {createFilterField('Politician', 'text')}
            </div>
        </div>
        <div className="groupForm">
            <div className="groupLabel">
                <i className="bx bx-merge"></i> Grouping
            </div>
            {createGroupingFields()}
        </div>
    </form>
    return formMain;
}