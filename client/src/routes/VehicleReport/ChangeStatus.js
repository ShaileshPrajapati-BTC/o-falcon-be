import {
    Form, Modal, Radio, message, Upload, Button, Icon, Spin
} from 'antd';
import React, { Component } from 'react';
import { FILTER_BY_VEHICLE_REPORT_STATUS, FILE_TYPES, WORK_FLOW, DEFAULT_API_ERROR } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import CrudService from '../../services/api';
import TextArea from 'antd/lib/input/TextArea';

const _ = require('lodash');

class ChangeStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            status: '',
            statusArray: [],
        };
        this.defaultValue = '';
    }
    componentDidMount() {
        let object = {
            status: this.props.obj && this.props.obj.currentStatus,
        };
        this.setState({ data: object });
        let currentStatus = this.props.obj && this.props.obj.currentStatus;
        let statusArray = _.filter(FILTER_BY_VEHICLE_REPORT_STATUS, (data) => { return data.type !== currentStatus })
        this.setState({ statusArray: statusArray, status: statusArray[0].value })
        this.defaultValue = statusArray[0].value;
    }
    onCreate = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            this.setState({ loading: true })
            let obj = this.state.data;
            obj.status = this.state.status;
            obj = { ...obj, ...values }
            try {
                let response = await axios.put(`admin/report/update-status/${this.props.obj.id}`, obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                    this.setState({ loading: false })
                    this.props.onCreate();
                }
                else {
                    this.setState({ loading: false })
                    message.error(`${response.message}`);
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
                this.setState({ loading: false })
            }
        })
    }
    onClick = (e) => {
        let status = Number(e.target.value);
        this.setState({ status: status });
    }
    render() {
        const { onCancel, form } = this.props;
        const { statusArray, status, loading } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title=""
                okText="Submit"
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <h3>Change Status</h3>
                <Spin spinning={loading} delay={100}>
                    <Form layout="vertical" className="m-v-15">
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
                        <Form.Item label="Remark" hasFeedback>
                            {getFieldDecorator('remark', {
                                rules: [
                                    { required: true, message: 'Please add remark!' },
                                    { max: 200, message: 'Remark cannot be longer than 200 character!' },
                                ]
                            })(
                                <TextArea
                                    rows={3}
                                    className="width-100"
                                    placeholder="Add Remark"
                                />
                            )}
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal >
        );
    }
}
const WrappedChangeStatus = Form.create({ name: 'ChangeStatus' })(ChangeStatus);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedChangeStatus);
