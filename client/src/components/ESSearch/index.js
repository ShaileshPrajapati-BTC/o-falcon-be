import { Input } from 'antd';
import React, { Component } from 'react';
import update from 'immutability-helper';
const Search = Input.Search;

class CommonSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: {},
            keys: []
        }
    }
    componentDidMount() {
        this.setState({ filter: this.props.filter, keys: this.props.keys })
    }
    componentDidUpdate(prevProps) {
        if (this.props.filter && prevProps.filter && this.props.filter.filter
            && this.props.filter.filter.status && this.props.filter.filter.status !== prevProps.filter.filter.status)
        {
            this.setState({ filter: this.props.filter });
        }
    }
    onSearch = (search) => {
        let data = this.state.filter;
        let keys = this.state.keys;
        data.search = undefined;
        if (search.trim()) {
            data.search = {
                keyword: search,
                keys: keys
            };
        }
        const newState = update(this.state.filter, {
            $merge: { ...data, page: 1 }
        });
        this.props.handelSearch(newState);
    };
    render() {
        const width = this.props.width ? this.props.width : 300;
        return (
            <Search placeholder={this.props.placeholder}
                onSearch={this.onSearch}
                style={{ width: width }} />
        );
    }
}
export default CommonSearch;