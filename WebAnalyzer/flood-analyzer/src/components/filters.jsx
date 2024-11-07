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
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {setFilter} from '../state/filter/filterSlice';
import Select from 'react-select';
import {uniqueYears, uniqueRegions, uniqueDistricts} from './filterItems';

// Needed by React Select
const formatComboOptions = (uniqValues) => {
    return uniqValues.map((v, i, arr) => {
        return {value: v, label: v}
    });
}

const comboOptions = {
    Year: formatComboOptions(uniqueYears),
    Region: formatComboOptions(uniqueRegions),
    District: formatComboOptions(uniqueDistricts),
}

export const Filters = () => {    

    // Note: calling watch here (not inside useEffect) will cause this for to re-render each time a watched value changes (not good)
    console.log('[Filter render]');
    const {register, handleSubmit, watch, control} = useForm();
    
    // redux values
    
    const dispatch = useDispatch();

    // Purpose: for firing 
    useEffect(() => {
        console.log('useEffect')
        const subscription = watch( data => {
            // Will be called on each input change of any of the controls
            // At least, no re-render happens
            console.log('[watch subscription]', data);
            const actionPayload = {
                Project: data.Project,
                Year: data.Year ? data.Year.map(x => x.value): [],
                Region: data.Region ? data.Region.map(x => x.value): [],
                District: data.District ? data.District.map(x => x.value): [],
            }
            dispatch(setFilter(actionPayload));
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
        const customStylesSelect = {
            container: provided => ({
              ...provided,
              width: '100%',
            }),
            control: base => ({
                ...base,
                border: '1px solid black',
                boxShadow: '1px solid black',
                "&:hover": {
                    border: "1px solid #054bfc",
                    cursor: 'text'
                },                
            }),
            multiValue: (styles, { data }) => {                
                return {
                  ...styles,
                  backgroundColor: '#c9e2f5',
                };
            }
        };

        const inputElem = fieldType === 'text' ? 
            <input {...register(fieldName)} type="text" className="fieldText"></input> :
            <Controller
                name={fieldName}
                control={control}
                defaultValue=""
                render = {({ field}) => (
                    <Select {...field} 
                        className="fieldSelect"
                        options={comboOptions[fieldName]}
                        styles={customStylesSelect}
                        isMulti={true}
                        closeMenuOnSelect={false}
                        placeholder={`Select ${fieldName}...`}
                    />
                )}
            />
        return <>
            <div className="fieldLabel">
                {fieldName}:
            </div>
            <div className="fieldInput">                
                {inputElem}
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
                {createFilterField('Year', 'combo')}
                {createFilterField('Region', 'combo')}
                {createFilterField('District', 'combo')}
                {createFilterField('Project', 'text')}
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