import {
    Col, Form, Input, Modal, Row, message, Select, Radio, DatePicker, InputNumber, Spin, Tooltip, Icon, Button
} from 'antd';

import {
    BOOK_PLAN_EXPIRATION_TYPES, DEFAULT_API_ERROR, BOOK_PLAN_LIMIT_TYPES, RIDER_LABEL, BOOK_PLAN_EXPIRATION_FILTER, BOOK_PLAN_LIMIT_FILTER
} from '../../constants/Common';
import moment from 'moment';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';

import ESInfoLabel from '../../components/ESInfoLabel'
const { RangePicker } = DatePicker;
const _ = require('lodash');
const { TextArea } = Input;

const ToolTipLabel = (props) => {
    return (
        <React.Fragment>
            <span style={{ marginRight: 5 }}>
                {props.label}</span>
            <Tooltip title={props.message}>
                <Icon type="info-circle" />
            </Tooltip>
        </React.Fragment>
    )
}


const RowForm = (props) => {
    return (
        <Row type="flex" justify="start">
            <Col span={22}>
                <Form.Item>
                    {
                        props.form.getFieldDecorator(`extraDescField[${props.id.id}]`)
                            (
                                <Input placeholder="Add Plan Details" />
                            )
                    }
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                    {
                        props.form.getFieldDecorator(`id[${props.id.id}]`, { initialValue: props.id.id })
                            (<Input />)
                    }
                </Form.Item>
            </Col>
            <Icon type="delete" theme="twoTone" onClick={() => props.onDelete(props.id.id)} style={{ marginTop: 6, fontSize: 20 }} />
        </Row>
    )
}

class PlanUpsertModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRenewable: true,
            isTrialPlan: false,
            loading: false,
            recordData: {},
            limitType: BOOK_PLAN_LIMIT_TYPES.MINUTE,
            planType: BOOK_PLAN_EXPIRATION_TYPES.HOUR
        };
    }
    componentDidMount() {
        if (this.props.id) {
            this.fetch(this.props.id);
        }
        else {
            this.props.form.setFieldsValue({ 'limitType': 1, 'isRenewable': true, 'isTrialPlan': false, 'planType': 1 });
        }
    }

    fetch = async (id) => {
        this.setState({ loading: true })
        const { form } = this.props;
        try {
            let response = await axios.get(`admin/book-plan/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                let formVal = recordData;
                formVal.valid = [
                    moment(recordData.startDateTimeToBuy, 'YYYY/MM/DD'),
                    moment(recordData.endDateTimeToBuy, 'YYYY/MM/DD')
                ];
                form.setFieldsValue(formVal);
                if (formVal.extraDescription && formVal.extraDescription.length > 0) {
                    let id = 0;
                    let data = { extraDescField: [], updateExtraDescription: [], id: [] }
                    for (let value of formVal.extraDescription) {
                        let incrementId = id++
                        data.updateExtraDescription.push({ extraDescField: value, id: incrementId })
                        data.extraDescField.push(...[value])
                        data.id.push(...[incrementId])
                    }
                    form.setFieldsValue({ extraDescription: data.updateExtraDescription })
                    form.setFieldsValue({ extraDescField: data.extraDescField, id: data.id })
                }
                this.setState({
                    recordData: recordData,
                    loading: false
                });
            } else {
                this.setState({ loading: false })
                message.error(`${response.message}`);
            }
        } catch (error) {
            this.setState({ loading: false })
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);;
        }
    }

    handleSubmit = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let a;
            let key = Object.keys(BOOK_PLAN_EXPIRATION_TYPES).find(key => BOOK_PLAN_EXPIRATION_TYPES[key] === values.planType)
            key.toLowerCase()

            let planValueInMinutes = moment.duration(values.planValue, `${key}s`).asMinutes()
            let planValueInHours = moment.duration(values.planValue, `${key}s`).asHours()
            if (values.limitType === BOOK_PLAN_LIMIT_TYPES.MINUTE) {
                if (values.limitValue > planValueInMinutes) {
                    a = 'Invalid minute!'
                }
            } else {
                if (values.limitValue > planValueInHours) {
                    a = 'Invalid hour!'
                }
            }
            if (a !== undefined) {
                message.error('Expiration Time must be larger than Plan limit time!')
                return;
            }
            if ((values.price === 0) && values.isTrialPlan === false) {
                message.error('Price must be greater than 0')
                return
            }
            this.setState({ loading: true })
            let url = `admin/book-plan/add`;
            let method = `post`;
            let obj = values;
            if (obj.extraDescription && obj.extraDescription.length > 0) {
                let extraDescription = [...obj.extraDescField]
                obj = { ...obj, extraDescription }
                obj = _.omit(obj, ['extraDescField', 'id'])
            }
            obj.startDateTimeToBuy = UtilService.getStartOfTheDay(values.valid[0].toISOString());
            obj.endDateTimeToBuy = UtilService.getEndOfTheDay(values.valid[1].toISOString());
            obj = _.omit(obj, ['valid']);
            if (this.props.id) {
                url = `admin/book-plan/${this.props.id}`;
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
    onRenewableChange = (e) => {
        this.setState({ isRenewable: e.target.value })
    }
    onTrialPlanChange = (e) => {
        if (e.target.value === true) {
            this.props.form.setFieldsValue({ "price": 0 });
        }
        this.setState({ isTrialPlan: e.target.value })
    }
    disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < moment().startOf('day');
    }
    handelLimitType = (e) => {
        this.setState({ limitType: e })
    }
    handelplanType = (e) => {
        this.setState({ planType: e })
    }

    handleAdd = () => {
        let extraDescription = this.props.form.getFieldValue('extraDescription')
        let extraDescriptionLastId
        if (extraDescription.length > 0) {
            extraDescriptionLastId = extraDescription[extraDescription.length - 1].id
            extraDescriptionLastId++
        }
        let nextKeys = [...extraDescription, { extraDescField: '', id: extraDescriptionLastId ? extraDescriptionLastId : 0 }]
        this.props.form.setFieldsValue({ extraDescription: nextKeys })
    }

    handleDelete = (rowIndex) => {
        const extraDescField = this.props.form.getFieldValue('extraDescField')
        const id = this.props.form.getFieldValue('id')
        const newData = extraDescField.map((el, i) => {
            return {
                extraDescField: el,
                id: id[i]
            }
        })
        const nonEmptyData = newData.filter(el => el.id !== undefined)

        const remainKeys = nonEmptyData.filter(el => el.id !== rowIndex)
        if (nonEmptyData.length > 0) {
            let id = 0;
            let data = { extraDescField: [], updateExtraDescription: [], id: [] }
            for (let value of remainKeys) {
                let incrementId = id++
                data.updateExtraDescription.push({ ...value, id: incrementId })
                data.extraDescField.push(...[value.extraDescField])
                data.id.push(...[incrementId])
            }
            this.props.form.setFieldsValue({ extraDescription: data.updateExtraDescription })
            this.props.form.setFieldsValue({ extraDescField: data.extraDescField, id: data.id })
        }
    }
    render() {
        const {
            onCancel, form, id
        } = this.props;
        const { getFieldDecorator } = form;
        let pattern, msg;
        const { planType, loading } = this.state;
        if (planType === 2) {
            pattern = /^(3[0-1]|[12][0-9]|[1-9])$/;
            msg = 'Please enter day between 1 to 31!'
        } else if (planType === 3) {
            pattern = /^[1-5]$/;
            msg = 'Please enter week between 1 to 5!'
        } else if (planType === 4) {
            pattern = /^(1[0-2]|[1-9])$/;
            msg = 'Please enter month between 1 to 12!'
        } else {
            pattern = /^(2[0-4]|1[0-9]|[1-9])$/;
            msg = 'Please enter hour between 1 to 24!'
        }

        // if (expirationType === 2) {
        //     expirepattern = /^(2[0-4]|1[0-9]|[1-9])$/;
        //     expiremsg = 'Please enter hour between 1 to 24!'
        // } else {
        //     expirepattern = /^(6[0]|[12345][0-9]|[1-9])$/;
        //     expiremsg = 'Please enter minute between 1 to 60!'
        // }

        const extraDescription = this.props.form.getFieldValue('extraDescription')
        return (
            <Modal
                visible={true}
                title={id ? `Edit Plan` : `Add Plan`}
                okText={id ? 'Update' : 'Add'}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Spin spinning={loading} delay={100}>
                    <Form layout="vertical">
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Name"
                                    hasFeedback>
                                    {getFieldDecorator('name', {
                                        rules: [
                                            {
                                                transform: (value) => {
                                                    return value && value.trim();
                                                }
                                            },
                                            { required: true, message: 'Please add name!' }, { max: 30 },
                                            { pattern: /^[a-z\d\-_\s]+$/i, message: 'Please enter name include alphanumeric,space,-,_!' }
                                        ]
                                    })(
                                        <Input placeholder="Name" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item
                                    label={<ToolTipLabel
                                        label="Trail Plan"
                                        message={`It is a Free Plan and can be used only once by the ${RIDER_LABEL}. It cannot be cancelled.`}
                                    />}
                                >
                                    {getFieldDecorator('isTrialPlan', {
                                        rules: [
                                            { required: true, message: 'Please select Trial plan!' }
                                        ]
                                    })(
                                        <Radio.Group onChange={this.onTrialPlanChange} defaultValue={this.state.isTrialPlan}>
                                            <Radio value={true}>Yes</Radio>
                                            <Radio value={false}>No</Radio>
                                        </Radio.Group>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item
                                    label={
                                        <ToolTipLabel
                                            label="Renewable"
                                            message={`If yes, the subscription can be renewed by a ${RIDER_LABEL} otherwise it expires.`}
                                        />
                                    }
                                >
                                    {getFieldDecorator('isRenewable', {
                                        rules: [
                                            { required: true, message: 'Please select Renewable plan!' }
                                        ]
                                    })(
                                        <Radio.Group onChange={this.onRenewableChange} value={this.state.isRenewable}>
                                            <Radio value={true}>Yes</Radio>
                                            <Radio value={false}>No</Radio>
                                        </Radio.Group>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Price"
                                    hasFeedback>
                                    {getFieldDecorator('price', {
                                        rules: [
                                            { required: true, message: 'Please add price!' },
                                            { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
                                        ]
                                    })(
                                        <InputNumber maxLength={5} placeholder="Price" disabled={this.state.isTrialPlan ? true : false} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Usage Limit"
                                    style={{ paddingLeft: '5px' }}
                                    hasFeedback>
                                    {getFieldDecorator('limitValue', {
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Please add time!'
                                            }, {
                                                pattern: /^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|10000)$/,
                                                message: 'Please enter time between 1 to 10000!'
                                            }
                                        ]
                                    })(
                                        <InputNumber min={1} placeholder="Time" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12} style={{ marginTop: 5 }}>
                                <Form.Item
                                    label={
                                        <ESInfoLabel
                                            // label="Type"
                                            isRequiredField={true}
                                            message={` The ${RIDER_LABEL} can use a vehicle for the set limit within the subscription period.`}
                                        />
                                    }
                                    hasFeedback>
                                    {getFieldDecorator("limitType", {
                                        rules: [{
                                            required: false,
                                            message:
                                                "Please select time type!"
                                        }]
                                    })(
                                        <Select placeholder="Select type" defaultValue={this.state.limitType} onChange={this.handelLimitType} >
                                            {BOOK_PLAN_LIMIT_FILTER.map(
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
                                <Form.Item
                                    label={
                                        <ESInfoLabel
                                            label="Plan Availability"
                                            isRequiredField={true}
                                            message={`The Plan is available for ${RIDER_LABEL} to choose between the set duration.`}
                                        />
                                    }
                                    hasFeedback>
                                    {getFieldDecorator('valid', {
                                        rules: [
                                            { required: true, message: 'Please add validity.' }
                                        ]
                                    })(
                                        <RangePicker
                                            style={{ width: '100%' }}
                                            disabledDate={this.disabledDate}
                                        // onChange={this.onChange.bind(this)} 
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item
                                    label={
                                        <ESInfoLabel
                                            label="Expiration Time"
                                            isRequiredField={true}
                                            message={`The subscription of the plan for a ${RIDER_LABEL} expires after the set time is reached.`}
                                        />}
                                    style={{ paddingLeft: '5px' }}
                                    hasFeedback>
                                    {getFieldDecorator('planValue', {
                                        rules: [
                                            {
                                                pattern: pattern,
                                                message: msg
                                            }, {
                                                required: true,
                                                message: 'Please add expire time!'
                                            }]
                                    })(
                                        <InputNumber min={1} placeholder="Time" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12} style={{ marginTop: 25 }}>
                                <Form.Item hasFeedback>
                                    {getFieldDecorator("planType", {
                                        rules: [{
                                            required: false,
                                            message:
                                                "Please select expire time limit!"
                                        }]
                                    })(
                                        <Select placeholder="Select type" defaultValue={this.state.planType} onChange={this.handelplanType} >
                                            {BOOK_PLAN_EXPIRATION_FILTER.map(
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
                            <Col span={24}>
                                <Form.Item label="Description">
                                    {getFieldDecorator('description', {
                                        rules: [
                                            { required: true, message: 'Please add description!' }
                                        ]
                                    })(
                                        <TextArea multiline="true"
                                            rows={3}
                                            placeholder="Description"
                                            margin="none" />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row type="flex" justify="start">
                            <Col span={24}>
                                <Form.Item>
                                    {
                                        getFieldDecorator('extraDescription',
                                            { initialValue: [], rules: [{ required: false }] }
                                        )(
                                            <React.Fragment>
                                                <span style={{ marginRight: 5 }}>Plan Details</span>
                                                <Button type="dashed" onClick={this.handleAdd} style={{ marginTop: 15 }}>
                                                    <Icon type="plus" /> Add</Button>
                                            </React.Fragment>
                                        )
                                    }
                                </Form.Item>
                                {
                                    (extraDescription && extraDescription.length > 0) &&
                                    extraDescription.map((key, i) => <RowForm form={form} id={key} onDelete={this.handleDelete} />)
                                }
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        );
    }
}

const WrappedPlanUpsertModel = Form.create({ name: 'planUpsertForm' })(PlanUpsertModel);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedPlanUpsertModel);
