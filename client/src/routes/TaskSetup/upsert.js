import {
    Col, Form, Input, Modal, Row, Select, InputNumber, Switch, Slider, message, Spin
} from 'antd';
import {
    TASK_LEVEL, TASK_TYPE, DEFAULT_API_ERROR, FILTER_BY_TASK_TYPE, NEST_LABEL, TASK_TIME_LIMIT_TYPE, TASK_TIME_LIMIT_TYPE_FILTER, FILTER_BY_TASK_LEVEL
} from '../../constants/Common';
import React from 'react';
import axios from 'util/Api';
let err = null;

class TaskSetupForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            incentiveRange: [20, 50],
            isSnoozer: false,
            nest: false,
            taskCompletionReq: false,
            loading: false,
            editData: [],
            taskType: FILTER_BY_TASK_TYPE.filter((e) => e.level === 1),
            timeLimitType: TASK_TIME_LIMIT_TYPE.MINUTES
        };
    }
    componentDidMount() {
        if (this.props.id) {
            this.fetch(this.props.id);
            return;
        }
        this.props.form.setFieldsValue({ 'taskType': this.state.taskType[0].type, 'level': 1, 'timeLimitType': TASK_TIME_LIMIT_TYPE.MINUTES });
    }
    fetch = async (id) => {
        const { form } = this.props;
        this.setState({ loading: true })
        try {
            let response = await axios.get(`/admin/task-form-setting/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                let formVal = recordData;
                this.setState({
                    isSnoozer: recordData.isSnoozer,
                    nest: recordData.nest,
                    taskCompletionReq: recordData.taskCompletionReq,
                    incentiveRange: recordData.incentiveRange,
                    editData: recordData,
                    loading: false,
                    taskType: FILTER_BY_TASK_TYPE.filter((e) => e.level === recordData.level)
                });
                form.setFieldsValue(formVal);
            } else {
                this.setState({ loading: false })
                message.error(response.message)
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false })
        }
    }

    handleSubmit = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            this.setState({ loading: true });
            let { id } = this.state.editData;
            let url = `/admin/task-form-setting/add`;
            let method = `post`;
            let obj = values;
            obj.incentiveRange = this.state.incentiveRange;
            obj.isSnoozer = this.state.isSnoozer;
            obj.nest = this.state.nest;
            obj.taskCompletionReq = this.state.taskCompletionReq;
            if (id) {
                url = `/admin/task-form-setting/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ loading: false })
                    this.props.handleSubmit();
                } else {
                    message.error(`${response.message}`);
                    this.setState({ loading: false })
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
                this.setState({ loading: false })
            }

        });
    }
    handelIncentiveRange = (e) => {
        this.setState({ incentiveRange: e })
    }
    onLevelChange = (value) => {
        let taskType = FILTER_BY_TASK_TYPE.filter((e) => e.level === value)
        this.setState({ taskType: taskType });
        this.props.form.setFieldsValue({ 'taskType': taskType[0].type });
    }
    onTimeLimitTypeChange = (value) => {
        let timeLimitValue = this.props.form.getFieldValue("timeLimitValue");
        if (value === TASK_TIME_LIMIT_TYPE.HOURS && timeLimitValue > 24) {
            err = 'Please enter hour between 1 to 24!';
        } else if (value === TASK_TIME_LIMIT_TYPE.DAYS && timeLimitValue > 31) {
            err = 'Please enter day between 1 to 31!';
        } else if (value === TASK_TIME_LIMIT_TYPE.MINUTES && timeLimitValue > 60) {
            err = 'Please enter month between 1 to 12!';
        } else {
            err = null;
        }
        if (err) {
            this.props.form.setFields({
                timeLimitValue: {
                    value: timeLimitValue,
                    errors: [new Error(err)],
                },
            });
        } else {
            this.props.form.setFields({
                timeLimitValue: {
                    value: timeLimitValue,
                },
            });
        }
        this.setState({ timeLimitType: value })
    }
    render() {
        const {
            onCancel, form, id
        } = this.props;
        const { incentiveRange, isSnoozer, nest, taskCompletionReq, loading } = this.state;
        const { getFieldDecorator } = form;
        let taskLevelFilter = FILTER_BY_TASK_LEVEL.filter((ele) => { return ele.value !== 0 })

        const { timeLimitType } = this.state;
        let pattern, msg;
        if (timeLimitType === TASK_TIME_LIMIT_TYPE.MINUTES) {
            pattern = /^(6[0]|[12345][0-9]|[1-9])$/;
            msg = 'Please enter minutes between 1 to 60!'
        } else if (timeLimitType === TASK_TIME_LIMIT_TYPE.HOURS) {
            pattern = /^(2[0-4]|1[0-9]|[1-9])$/;
            msg = 'Please enter hour between 1 to 24!'
        } else {
            pattern = /^(3[0-1]|[12][0-9]|[1-9])$/;
            msg = 'Please enter day between 1 to 31!'
        }
        return (
            <Modal
                visible={true}
                title={id ? `Edit Task Form ` : `Add Task Form `}
                okText={id ? 'Update' : 'Add'}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Spin spinning={loading} delay={100}>
                    <Form layout="vertical">
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Level" hasFeedback>
                                    {getFieldDecorator('level', {
                                        rules: [
                                            { required: true, message: 'Please Select Level!' }
                                        ]
                                    })(
                                        <Select placeholder="Select Level" onChange={this.onLevelChange} disabled={this.props.id}>
                                            {taskLevelFilter.map(val => {
                                                return (
                                                    <Select.Option
                                                        key={val.value}
                                                        value={val.type}
                                                    >
                                                        {val.label}
                                                    </Select.Option>
                                                );
                                            }
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Task Type" style={{ paddingLeft: '5px' }} hasFeedback>
                                    {getFieldDecorator('taskType', {
                                        rules: [
                                            { required: true, message: 'Please select Task Type!' }
                                        ]
                                    })(
                                        <Select placeholder="Select Task Type" disabled={this.props.id}>
                                            {this.state.taskType.map(val => {
                                                return (
                                                    <Select.Option
                                                        key={val.type}
                                                        value={val.type}
                                                    >
                                                        {val.label}
                                                    </Select.Option>
                                                );
                                            }
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Form Title" hasFeedback>
                                    {getFieldDecorator('title', {
                                        rules: [
                                            { transform: (value) => { return value && value.trim(); } },
                                            { max: 25, message: 'Title cannot be longer than 25 character!' },
                                            { required: true, message: 'Please add title!' },
                                            { pattern: /^[a-z\d\-_\s]+$/i, message: 'Please enter title include alphanumeric,space,-,_!' }
                                        ]
                                    })(
                                        <Input placeholder="Enter title" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12} style={{ paddingRight: 0 }}>
                                <Form.Item label="Timelimit Value" style={{ paddingLeft: '5px' }} hasFeedback>
                                    {getFieldDecorator('timeLimitValue', {
                                        rules: [
                                            { required: true, message: 'Please enter Timelimit Value!' },
                                            {
                                                pattern: pattern,
                                                message: msg
                                            }
                                        ]
                                    })(
                                        <InputNumber placeholder="Enter Timelimit Value" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Type" style={{ paddingLeft: '5px' }} hasFeedback>
                                    {getFieldDecorator('timeLimitType', {
                                        rules: [
                                            { required: true, message: 'Please select Timelimit type!' },
                                        ]
                                    })(
                                        <Select placeholder="Select type" onChange={this.onTimeLimitTypeChange}>
                                            {TASK_TIME_LIMIT_TYPE_FILTER.map(
                                                val => {
                                                    return (
                                                        <Select.Option key={val.value}
                                                            value={val.type}>
                                                            {val.label}
                                                        </Select.Option>
                                                    );
                                                }
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Incentive Range">
                                    {getFieldDecorator('incentiveRange', {})(
                                        <Slider range defaultValue={incentiveRange} max={200} onAfterChange={this.handelIncentiveRange} />
                                    )}
                                </Form.Item>
                            </Col>
                            {/* <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Snoozer" style={{ paddingLeft: '5px' }}>
                                    {getFieldDecorator('isSnoozer', {})(
                                        <Switch checked={isSnoozer} onChange={(checked) => { return this.setState({ isSnoozer: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label={`${NEST_LABEL}`} style={{ paddingLeft: '5px' }}>
                                    {getFieldDecorator('nest', {})(
                                        <Switch checked={nest} onChange={(checked) => { return this.setState({ nest: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col> */}
                        </Row>
                        {/* <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Task Completion Requirement" style={{ paddingLeft: '5px' }}>
                                    {getFieldDecorator('taskCompletionReq', {})(
                                        <Switch checked={taskCompletionReq} onChange={(checked) => { return this.setState({ taskCompletionReq: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row> */}
                    </Form>
                </Spin>
            </Modal>
        );
    }
}

const WrappedTaskSetupForm = Form.create({ name: 'TaskSetupForm' })(TaskSetupForm);

export default WrappedTaskSetupForm;
