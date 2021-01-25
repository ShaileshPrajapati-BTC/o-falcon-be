/* eslint-disable */
import React from 'react';
import {Spin} from 'antd';
import {LOCATION_TYPE} from "../../constants/Common";

import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';


class GeoLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            isLoading: false,
            latLang: {}
        };

    }

    componentDidMount() {
        this.handleInitilVal();
    }

    componentWillReceiveProps() {
        console.log('this.state.address',this.state.address);
        this.handleInitilVal();
    }

    handleInitilVal = () => {
        let form = this.props.form;
        if (form) {
            let fieldName = this.props && this.props.fieldName ? this.props.fieldName : 'name';
            let address = form.getFieldValue(fieldName);
            if (address) {
                this.setState({address})
            }
        }
    };

    handleChange = address => {
        let form = this.props.form;
        this.setState({address});
        if((!address || address === '') && form){
            let fieldName = this.props && this.props.fieldName ? this.props.fieldName : 'name';
            form.resetFields([fieldName]);
        }
    };

    handleSelect = address => {
        let { form, isEdit } = this.props;
        let self = this;
        geocodeByAddress(address)
            .then(results => {
                console.log('result', results);
                let latLngPromise = getLatLng(results[0]);
                latLngPromise.then((latLng) => self.setState(state => {
                    state.latLang = latLng;
                    state.address = results[0].formatted_address;
                    return state;
                }, function () {
                    console.log("state set", self.state);
                    let type;
                    if (results[0] && results[0].types[0]) {
                        switch (results[0].types[0]) {
                            case "locality": // city
                                type = LOCATION_TYPE.CITY;
                                break;
                            case "administrative_area_level_1": // state
                                type = LOCATION_TYPE.STATE;
                                break;
                            case "country": // country
                                type = LOCATION_TYPE.COUNTRY;
                                break;
                            default:
                                break;
                        }
                    }
                    if (form) {
                        let fieldName = self.props && self.props.fieldName ? self.props.fieldName : 'name';
                        let dataToSet = {};
                        dataToSet[fieldName] = results[0].formatted_address;
                        dataToSet.latLang = self.state.latLang;
                        form.setFieldsValue(dataToSet);
                        if (type && !isEdit) {
                            form.setFieldsValue({type: type})
                        }
                    }
                }));

            })
            .catch(error => console.error('Error', error));
    };

    render() {
        return (
            <PlacesAutocomplete
                value={this.state.address}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
            >
                {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                    <div>
                        <input
                            {...getInputProps({
                                placeholder: 'Search Places ...',
                                className: 'ant-input',
                            })}
                            value={this.state.address}
                        />
                        <div className="autocomplete-dropdown-container">
                            {loading && <div className="ant-list-item text-center"><Spin size="small"/></div>}
                            {suggestions.map(suggestion => {
                                let className = suggestion.active
                                    ? 'suggestion-item--active'
                                    : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                    ? {backgroundColor: '#fafafa', cursor: 'pointer'}
                                    : {backgroundColor: '#ffffff', cursor: 'pointer'};
                                className += ' ant-list-item';
                                return (
                                    <div
                                        {...getSuggestionItemProps(suggestion, {
                                            className,
                                            style,
                                        })}
                                    >
                                        <span>{suggestion.description}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </PlacesAutocomplete>
        );
    }

}

export default GeoLocation;
