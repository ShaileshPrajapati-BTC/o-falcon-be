import { FILTER_BY_VEHICLE_TYPE, DEFAULT_VEHICLE } from '../../constants/Common';
import React, { Component } from 'react';
import FilterDropdown from '../FilterDropdown';
const _ = require('lodash');
class ESFilterVehicleType extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.defaultVehicleType = DEFAULT_VEHICLE;
    }
    handleSelection = (selectedVal) => {
        let data = _.find(FILTER_BY_VEHICLE_TYPE, { value: selectedVal });
        this.defaultVehicleType = selectedVal;
        let filter = { filter };
        if (data && data.type) {
            console.log("TCL: ESFilterVehicleType -> handleSelection -> data.type", data.type);
            filter.filter = { vehicleType: data.type };
        }

        return this.props.setFilter(filter);
    }
    render() {
        return (
            <FilterDropdown
                title1="Vehicle Type"
                list={FILTER_BY_VEHICLE_TYPE}
                defaultSelected={this.defaultVehicleType}
                handleSelection={(val) => {
                    return this.handleSelection(val);
                }}
            />
        );
    }
}
export default ESFilterVehicleType;
