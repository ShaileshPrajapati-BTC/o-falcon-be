import React, { Component } from 'react';
import { Tag } from 'antd';
const _ = require("lodash");

class ESTag extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { status, filterArray } = this.props;
        let displayRecord = filterArray && status ? _.find(filterArray, { type: status }) : '';
        return (
            displayRecord &&
            <Tag color={displayRecord.displayColor}>
                {displayRecord.label}
            </Tag>
        );
    }
}
export default ESTag;
