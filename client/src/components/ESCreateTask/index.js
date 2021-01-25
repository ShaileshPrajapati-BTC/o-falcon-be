import { Button, Col, Modal, Row, Select, Form, message, InputNumber, Spin } from 'antd';
import React, { Component } from 'react';
import { TASK_TYPE, TASK_LEVEL, PAGE_PERMISSION, WORK_FLOW, TASK_HEADING, DEFAULT_API_ERROR, ONLY_NUMBER_REQ_EXP, NEST_TYPE, NEST_LABEL, NEST_ROUTE, TASK_TIME_LIMIT_TYPE, FILTER_BY_TASK_TYPE, TASK_PRIORITY, TASK_TIME_LIMIT_TYPE_FILTER, FILTER_BY_WORK_FLOW, TASK_PRIORITY_FILTER, FILTER_BY_TASK_LEVEL } from '../../constants/Common';
import axios from 'util/Api';
import TextArea from 'antd/lib/input/TextArea';
const _ = require("lodash");

const TaskForm = Form.create({ name: 'TaskForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        state = {
            data: [],
            taskType: FILTER_BY_TASK_TYPE.filter((e) => e.level === 1)
        };
        componentDidMount() {
            this.props.form.setFieldsValue({ 'taskType': this.state.taskType[0].type, 'level': 1 });
        }
        onLevelChange = (value) => {
            let taskType = FILTER_BY_TASK_TYPE.filter((e) => e.level === value)
            this.setState({ taskType: taskType });
            this.props.form.setFieldsValue({ 'taskType': taskType[0].type });
        }
        render() {
            const { form, showTaskForm } = this.props;
            const { getFieldDecorator } = form;
            let taskLevelFilter = FILTER_BY_TASK_LEVEL.filter((ele) => { return ele.value !== 0 })
            return (
                <Form layout="vertical" className="m-v-15">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label="Level" hasFeedback>
                                {getFieldDecorator('level', {
                                    rules: [
                                        { required: true, message: 'Please Select Level!' }
                                    ]
                                })(
                                    <Select placeholder="Select Level" onChange={this.onLevelChange}>
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
                                    <Select placeholder="Select Task Type">
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
                    <Row>
                        <Col span={24} className="gx-text-right">
                            <Button style={{ display: "inline-flex" }} type="primary" htmlType="submit" onClick={showTaskForm}>
                                Show Form
                            </Button>
                        </Col>
                    </Row>
                </Form>
            );
        }
    }
);
const CreateTaskForm = Form.create({ name: 'CreateTaskForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        state = {
            nestList: []
        };
        componentDidMount = async () => {
            if (this.props.formFields.nest) {
                await this.getNestList();
            }
            if (this.props.data.length !== 0) {
                let formVal = _.pick(this.props.data, [
                    "taskHeading",
                    "taskWorkFlow",
                    "incentiveAmount",
                    "snoozerTime",
                    "description",
                    "priority"
                ]);
                this.props.form.setFieldsValue(formVal);
            } else {
                this.props.form.setFieldsValue({ "taskWorkFlow": 1 });
            }
            this.props.form.setFieldsValue({
                "timeLimitValue": this.props.formFields.timeLimitValue,
                "timeLimitType": this.props.formFields.timeLimitType
            });
        }
        getNestList = async () => {
            const { form } = this.props;
            let filter = {}
            // if (this.props.taskType && this.props.taskType === TASK_TYPE.REPAIR) {
            //     filter.filter = { type: NEST_TYPE.REPAIR }
            // }
            axios
                .post(`/admin/nest/paginate`, filter)
                .then((data) => {
                    if (data.code === 'OK' && data.data) {
                        this.setState({ nestList: data.data.list });
                        if (this.props.data.length === 0) {
                            form.setFieldsValue({ nestId: data.data.list[0].id });
                        } else {
                            form.setFieldsValue({ nestId: this.props.data.nestId.id });
                        }
                    }
                    else {
                        message.error(`${data.message}`);
                    }
                })
                .catch((error) => {
                    message.error(`${error.message}`);
                });
        };
        validateIncentiveAmount = (rule, value, callback) => {
            if (value > this.props.formFields.incentiveRange[1]) {
                callback(`Incentive Amount cannot be larger than ${this.props.formFields.incentiveRange[1]}`);
            } else if (value < this.props.formFields.incentiveRange[0]) {
                callback(`Incentive Amount cannot be smaller than ${this.props.formFields.incentiveRange[0]}`);
            } else {
                callback();
            }
        };
        render() {
            const { form, createTask, formFields, taskType } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Form layout="vertical" className="m-v-15">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label="Task Heading" hasFeedback>
                                {getFieldDecorator('taskHeading', {
                                    rules: [
                                        { required: true, message: 'Please select Task Heading!' },
                                    ]
                                })(
                                    <Select placeholder="Select Work Flow" initialValue={1}>
                                        {Object.keys(TASK_HEADING[taskType]).map(val => {
                                            return (
                                                <Select.Option
                                                    key={TASK_HEADING[taskType][Number(val)]}
                                                    initialValue={TASK_HEADING[taskType][Number(val)]}
                                                >
                                                    {TASK_HEADING[taskType][Number(val)]}
                                                </Select.Option>
                                            );
                                        }
                                        )}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        {formFields.nest &&
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label={`${NEST_LABEL}`} style={{ paddingLeft: '5px' }}>
                                    {getFieldDecorator('nestId', {
                                        rules: [
                                            { required: true, message: `Please select ${NEST_ROUTE}!` },
                                        ]
                                    })(
                                        <Select placeholder={`Select ${NEST_LABEL}`}>
                                            {this.state.nestList.map(val => {
                                                return (
                                                    <Select.Option
                                                        key={val.id}
                                                        value={val.id}
                                                    // disabled={!val.isActive}
                                                    >
                                                        {`${val.name}`}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>}
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label="Task Work Flow" hasFeedback>
                                {getFieldDecorator('taskWorkFlow', {
                                    rules: [
                                        { required: true, message: 'Please Select Work Flow!' }
                                    ]
                                })(
                                    <Select placeholder="Select Work Flow" disabled>
                                        {FILTER_BY_WORK_FLOW.map(val => {
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
                            <Form.Item label={`Incentive Amount (${this.props.formFields.incentiveRange[0]}-${this.props.formFields.incentiveRange[1]})`} style={{ paddingLeft: '5px' }}>
                                {getFieldDecorator('incentiveAmount', {
                                    rules: [
                                        { required: true, message: 'Please enter Incentive Amount!' },
                                        { pattern: new RegExp(ONLY_NUMBER_REQ_EXP), message: 'Please enter only digit!' },
                                        { validator: this.validateIncentiveAmount }
                                    ],
                                })(
                                    <InputNumber placeholder="Enter Incentive Amount" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={6} md={6} sm={6} xs={12} style={{ paddingRight: 0 }}>
                            <Form.Item label="Time Limit Value" style={{ paddingLeft: '5px' }}>
                                {getFieldDecorator('timeLimitValue', {
                                    rules: [
                                        { required: true, message: 'Please enter Time Limit!' },
                                        { pattern: new RegExp(ONLY_NUMBER_REQ_EXP), message: 'Please enter only digit!' },
                                    ],
                                })(
                                    <InputNumber placeholder="Enter Time Limit" disabled={true} />
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
                                    <Select placeholder="Select type" disabled={true}>
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
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label="Priority" hasFeedback>
                                {getFieldDecorator('priority', {
                                    initialValue: 1,
                                    rules: [
                                        { required: true, message: 'Please Select Priority!' }
                                    ]
                                })(
                                    <Select placeholder="Select Work Flow">
                                        {TASK_PRIORITY_FILTER.map(val => {
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
                        {formFields.isSnoozer && <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label="Snoozer Time(min)" style={{ paddingLeft: '5px' }} hasFeedback>
                                {getFieldDecorator('snoozerTime', {
                                    rules: [
                                        { required: true, message: 'Please enter Snoozer Time!' },
                                        { pattern: new RegExp(ONLY_NUMBER_REQ_EXP), message: 'Please enter only digit!' }
                                    ]
                                })(
                                    <InputNumber min={5} placeholder="Enter Snoozer Time in min" />
                                )}
                            </Form.Item>
                        </Col>}
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label="Description" style={{ paddingLeft: '5px' }}>
                                {getFieldDecorator('description', {
                                    rules: [
                                        { max: 200, message: 'Description cannot be longer than 200 character!' }
                                    ]
                                })(
                                    <TextArea
                                        rows={3}
                                        className="width-100"
                                        placeholder="Add description"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="gx-text-right">
                            <Button style={{ display: "inline-flex" }} type="primary" htmlType="submit" onClick={createTask}>
                                {this.props.data.length !== 0 ? 'Update Task' : 'Create Task'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            );
        }
    }
);

class ESCreateTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createTaskForm: false,
            formFields: [],
            loading: false,
            taskType: 0,
            level: 0,
            getformfields: true,
            data: []
        };
    }
    componentDidMount = async () => {
        if (this.props.editId) {
            this.setState({ getformfields: false })
            await this.fetch(this.props.editId);
            let obj = {
                level: this.state.data.level,
                taskType: this.state.data.taskType
            }
            await this.getFormFields(obj)
        }
    }

    fetch = async (id) => {
        this.setState({ loading: true })
        try {
            let response = await axios.get(`/admin/task/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                this.setState({ data: recordData, loading: false });
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
    getFormFields = async (obj) => {
        this.setState({ loading: true, taskType: obj.taskType, level: obj.level })
        try {
            let data = await axios.post(`/admin/task-form-setting/get-task-form`, obj);
            if (data.code === 'OK' && data.data) {
                this.setState({ formFields: data.data, createTaskForm: true, loading: false, getformfields: false })
            }
            else {
                this.setState({ loading: false })
                message.error(`${data.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false })
        }
    }
    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };
    createTaskRef = (formRef) => {
        this.TaskRef = formRef;
    };
    showTaskForm = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.getFormFields(values)
        });
    }
    createTask = async () => {
        const { form } = this.TaskRef.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let url, method;
            let obj = values;
            if (this.props.editId) {
                url = `/admin/task/${this.props.editId}`;
                method = `put`;
            }
            else {
                url = `/admin/task/create`;
                method = `post`;
                obj.taskType = this.state.taskType;
                obj.level = this.state.level;
                obj.module = PAGE_PERMISSION.VEHICLES;
                obj.referenceId = this.props.id;
                if (this.props.reportId) {
                    obj.reportId = this.props.reportId;
                }
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ loading: false })
                    this.props.onSubmit(response.data.id);
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
    render() {
        const { onCancel, visible } = this.props;
        const { createTaskForm, formFields, taskType, getformfields, data, loading } = this.state;
        return (
            <Modal
                title={this.props.editId ? 'Update Task' : "Create task"}
                footer=""
                width={700}
                visible={visible}
                onCancel={onCancel}
            >
                <div style={{ minHeight: '220px' }}>
                    <Spin spinning={loading} delay={100}>
                        {getformfields && <TaskForm
                            wrappedComponentRef={this.saveFormRef}
                            showTaskForm={this.showTaskForm}
                        />}
                        {createTaskForm &&
                            <CreateTaskForm
                                data={data}
                                wrappedComponentRef={this.createTaskRef}
                                createTask={this.createTask}
                                formFields={formFields}
                                taskType={taskType}
                            />}
                    </Spin>
                </div>
            </Modal>
        );
    }
}
export default ESCreateTask;
