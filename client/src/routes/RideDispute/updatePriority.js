import {
    Form, Input, Modal, Radio, message
} from 'antd';
import React, { Component } from 'react';
import { PRIORITY_FILTER } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class UpdatePriority extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remarks: [],
            priority: '',
            statusArray: []
        };
        this.defaultValue = '';
    }
    componentDidMount() {
        let data = [];
        _.each(this.props.record, (item) => {
            let object = {
                id: item.id,
                priority: item.priority,
                remark: item.remark
            };
            data.push(object);
        });
        let priority = this.props.priority;
        this.setState({
            remarks: data,
            priority: priority
        });
        if (this.props.record.length === 1) {
            _.each(PRIORITY_FILTER, (data) => {
                if (data.value !== 0 && data.value !== this.props.record[0].priority) {
                    this.state.statusArray.push({ label: data.label, value: data.type });
                }
            })
        }
        else {
            _.each(PRIORITY_FILTER, (data) => {
                if (data.value !== 0 && data.value !== priority) {
                    this.state.statusArray.push({ label: data.label, value: data.type });
                }
            })
        }
        this.defaultValue = this.state.statusArray[0].value;
    }
    onCreate = async () => {
        let priority = this.state.priority;
        let remark = this.state.remarks;
        if (priority === 0) {
            priority = this.defaultValue;
            remark = _.each(this.state.remarks, (data) => {
                data.priority = priority;
            });
        }
        let disputesIds = [];
        this.state.remarks.map((item) => {
            disputesIds.push(item.id);
        });
        let obj = {
            priority: priority,
            disputeIds: remark
        };
        try {
            let response = await axios.post('/admin/ride-complaint-dispute/priority-update', obj);
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
        let priority = Number(e.target.value);
        this.setState({ priority: priority });
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
                    <h3><IntlMessages id="app.dispute.priorityUpdate" /></h3>
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
const WrappedUpdateModal = Form.create({ name: 'UpdatePriority' })(UpdatePriority);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedUpdateModal);
