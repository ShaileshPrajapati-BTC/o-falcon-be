import {
    Modal} from 'antd';
import React, { Component } from 'react';
const _ = require('lodash');

class InfoModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {}
        };
    }
    componentDidMount() {
        // this.fetch(this.props.id);
    }
    render() {
        const { onCancel, data } = this.props;

        return (
            data ?
                <Modal
                    visible={true}
                    title=""
                    footer=""
                    onCancel={onCancel}
                    width={600}
                >
                    <div>
                        {_.map(Object.keys(data), (item) => {

                            if (_.isObject(data[item])) {
                                _.map(Object.keys(data[item]), (val) => {

                                    return <span>{`${val} : ${data[item][val]}`}<br /></span>;
                                });
                            }

                            return <span><b>{_.capitalize(_.lowerCase(item))}</b>{` : ${data[item]}`}<br /></span>;
                        })
                        }
                    </div>
                </Modal> :
                null
        );
    }
}

export default InfoModal;
