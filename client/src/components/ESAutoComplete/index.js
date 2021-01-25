import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import { USER_TYPES, FRANCHISEE_LABEL } from '../../constants/Common';
import axios from 'util/Api';
const _ = require('lodash');

class ESAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dataSource: [],
            defaultSearch: '',
            value: '',
            filter: {
                filter: {
                    type: USER_TYPES.FRANCHISEE,
                    isDeleted: false,
                    isActive: true,
                    addOwnUser: true
                }
            }
        };
    }
    componentDidMount() {
        this.fetch();
    }
    fetch = async () => {
        try {
            let response = await axios.post(this.props.url, this.state.filter);
            if (response && response.code === 'OK') {
                let dataSource = [];
                _.each(response.data.list, (val) => {
                    dataSource.push(val.name);
                });
                this.setState({ data: response.data.list, dataSource: dataSource });
            } else {
                this.setState({ data: [], dataSource: [] });
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    onSelect = (value) => {
        let index = _.findIndex(this.state.data, { name: value });
        let id = this.state.data[index].id;

        return this.props.onSelect(id);
    };
    onSearch = (search) => {
        return this.props.onSelect(false);
    };
    onChange = (value) => {
        this.setState({ value });
    };
    render() {
        const { dataSource, defaultSearch, value } = this.state;

        return <AutoComplete
            value={value}
            defaultValue={defaultSearch}
            dataSource={dataSource}
            onSelect={this.onSelect}
            placeholder={`Search By name`}
            onSearch={this.onSearch}
            onChange={this.onChange}
            style={{ width: 300 }} />;
    }
}
export default ESAutoComplete;
