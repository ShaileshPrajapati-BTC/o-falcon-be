import {
    Form, Input, Modal, Radio, message
} from 'antd';
import React, { Component } from 'react';
import { DISPUTE_STATUS_ARRAY } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class UpdateStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remarks: [],
            status: '',
            statusArray: []
        };
        this.defaultValue = '';
    }
    componentDidMount() {
        let data = [];
        _.each(this.props.record, (item) => {
            let object = {
                id: item.id,
                remark: item.remark,
                uniqNumber: item.uniqNumber
            };
            data.push(object);
        });
        let status = this.props.status;
        this.setState({
            remarks: data,
            status: status
        });
        _.each(DISPUTE_STATUS_ARRAY, (data) => {
            if (status < data.value) {
                this.state.statusArray.push({ label: data.label, value: data.value });
            }
        });
        // default set 1             
        this.defaultValue = this.state.statusArray[0].value;
        this.setState({ status: this.defaultValue });
    }
    onCreate = async () => {
        let data = this.state.remarks.map((item) => {
            return _.omit(item, ['uniqNumber']);
        });
        let obj = {
            status: this.state.status,
            disputeIds: data
        };
        try {
            let response = await axios.post('admin/ride-complaint-dispute/status-update', obj);
            if (response.code === 'OK') {
                message.success(response.message);
            }

        } catch (err) {
            console.log('Error****:', err.message);
        }
        this.props.onCreate();
    }
    onChange = (id, e) => {
        let remarks = [];
        _.each(this.state.remarks, (data) => {
            if (data.id === id) {
                data.remark = e.target.value;
            }
            remarks.push(data);
        });
        this.setState({
            remarks: remarks
        });
    }
    onClick = (e) => {
        let status = Number(e.target.value);
        this.setState({ status: status });
    }
    render() {
        const { onCancel } = this.props;
        const { statusArray } = this.state;

        return (
            <Modal
                visible={true}
                title=""
                okText={<IntlMessages id="app.submit" />}
                cancelText={<IntlMessages id="app.cancel" />}
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <Form>
                    <h3><IntlMessages id="app.dispute.statusUpdate" /></h3>
                    <Form.Item style={{ marginLeft: 5 }}>
                        <div className="CustomRadio">
                            <Radio.Group buttonStyle="solid" defaultValue={this.defaultValue}>
                                {statusArray.map((item, index) => {

                                    return <Radio.Button
                                        key={index}
                                        value={item.value}
                                        onClick={this.onClick.bind(this)}>
                                        {item.label}
                                    </Radio.Button>;
                                })}
                            </Radio.Group>
                        </div>
                    </Form.Item>
                    {this.state.remarks.map((item, index) => {

                        return (
                            < div key={index}>
                                <Form.Item label={item.uniqNumber} style={{ marginLeft: 5 }}>
                                    <Input
                                        autosize={{ minRows: 2, maxRows: 6 }}
                                        id={item.id}
                                        placeholder="Remark"
                                        value={item.remark}
                                        onChange={this.onChange.bind(this, item.id)}
                                    />
                                </Form.Item>
                            </div>
                        );
                    })
                    }
                </Form>
            </Modal >
        );
    }
}
const WrappedUpdateModal = Form.create({ name: 'UpdateStatus' })(UpdateStatus);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedUpdateModal);
