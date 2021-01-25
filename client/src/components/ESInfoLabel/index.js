import React, { Component } from 'react';
import { Tooltip, Icon } from 'antd';

class ESInfoLabel extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }
    render() {
        const { label, placement, unit, isRequiredField } = this.props;

        return (
            <span className={isRequiredField ? "" : "info-label"} >
                {label}
                {unit}
                <Tooltip
                    title={this.props.message}
                    className="es-icon-right"
                    placement={placement ? placement : "top"} >
                    <Icon type="info-circle-o" style={{ float: isRequiredField ? "right" : null }} />
                </Tooltip >
            </span >
        );
    }
}
export default ESInfoLabel;