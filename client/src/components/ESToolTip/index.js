import React, { Component } from 'react';
import { Tooltip } from 'antd';

class ESToolTip extends Component {
    render() {
        const { text, placement } = this.props;

        return (
            <Tooltip placement={placement} title={text} overlayStyle={{whiteSpace:'pre-line'}}>
                {this.props.children}
            </Tooltip>
        );
    }
}
export default ESToolTip;
