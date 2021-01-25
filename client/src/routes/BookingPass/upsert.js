import {
    Col, Form, Input, Typography, Row, message, Select, Radio, DatePicker, InputNumber, Spin, Tooltip, Icon, Button, Checkbox
} from 'antd';

import {
    BOOK_PLAN_EXPIRATION_TYPES, DEFAULT_API_ERROR, BOOK_PLAN_LIMIT_TYPES, RIDER_LABEL, BOOKING_PASS_LIMIT_TYPES, BOOKING_PASS_TYPE, BOOKING_PASS_LABEL, BOOKING_PASS_ROUTE, BOOKING_PASS_TIME_TYPES, VEHICLE_TYPES, BOOKING_PASS_LIMIT_TYPES_FILTER, BOOKING_PASS_TYPE_FILTER, BOOKING_PASS_EXPIRATION_TYPES_FILTER, BOOKING_PASS_EXPIRATION_TYPES
} from '../../constants/Common';
import moment from 'moment';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';

import ESInfoLabel from '../../components/ESInfoLabel'
import CustomScrollbars from '../../util/CustomScrollbars';
import { Link } from 'react-router-dom';
const { RangePicker } = DatePicker;
const _ = require('lodash');
const { TextArea } = Input;
const { Title } = Typography;
let err = null;

const RowForm = (props) => {
    return (
        <Row type="flex" justify="start">
            <Col span={22}>
                <Form.Item>
                    {
                        props.form.getFieldDecorator(`extraDescField[${props.id.id}]`, {
                            rules: [
                                { required: true, message: 'Please add extra discription!' },
                            ]
                        })
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
const VehicleDiscountForm = (props) => {
    return (
        <Row type="flex" justify="start">
            <Col span={3}>
                {Object.keys(VEHICLE_TYPES)[props.id - 1]}
            </Col>
            <Col span={7}>
                <Form.Item label="Price"
                    hasFeedback>
                    {props.form.getFieldDecorator(`price[${props.index}]`, {
                        rules: [
                            { required: true, message: 'Please add price!' },
                            { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
                        ]
                    })(
                        <InputNumber maxLength={5} placeholder="Price" />
                    )}
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                    {
                        props.form.getFieldDecorator(`vehicleType[${props.index}]`, { initialValue: props.id })
                            (<Input />)
                    }
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                    {
                        props.form.getFieldDecorator(`vid[${props.index}]`, { initialValue: props.index })
                            (<Input />)
                    }
                </Form.Item>
            </Col>
            {props.changedOn && props.changedOn.includes(BOOKING_PASS_TYPE.RIDE) &&
                <Col span={7}>
                    <Form.Item label="Ride Discount" hasFeedback>
                        {props.form.getFieldDecorator(`rideDiscount[${props.index}]`, {
                            rules: [
                                { required: true, message: 'Please add ride discount!' },
                                { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
                            ]
                        })(
                            <InputNumber maxLength={5} placeholder="Add Ride discount" />
                        )}
                    </Form.Item>
                </Col>}
            {props.changedOn && props.changedOn.includes(BOOKING_PASS_TYPE.UNLOCK) &&
                <Col span={7}>
                    <Form.Item label="Unlock Discount" hasFeedback>
                        {props.form.getFieldDecorator(`unlockDiscount[${props.index}]`, {
                            rules: [
                                { required: true, message: 'Please add unlock discount!' },
                                { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
                            ]
                        })(
                            <InputNumber maxLength={5} placeholder="Add unlock discount" />
                        )}
                    </Form.Item>
                </Col>}
        </Row>
    )
}

class PlanUpsertModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.match.params.id,
            loading: false,
            recordData: {},
            limitType: BOOKING_PASS_LIMIT_TYPES.MINUTES,
            expirationType: BOOKING_PASS_EXPIRATION_TYPES.HOUR,
            passType: [BOOKING_PASS_TYPE.RIDE],
            vehicleTypes: [],
            ismaxRideLimit: false
        };
    }
    componentDidMount() {
        if (this.state.id) {
            this.fetch(this.state.id);
        }
        else {
            this.props.form.setFieldsValue({
                'limitType': this.state.limitType,
                'expirationType': this.state.expirationType,
                'passType': this.state.passType
            });
        }
    }

    fetch = async (id) => {
        this.setState({ loading: true })
        const { form } = this.props;
        try {
            let response = await axios.get(`admin/booking-pass/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                await this.setState({ ismaxRideLimit: recordData.ismaxRideLimit })
                let formVal = _.omit(recordData, ['vehicleTypes'])
                form.setFieldsValue(formVal);
                if (recordData.vehicleTypes && recordData.vehicleTypes.length > 0) {
                    let id = 0;
                    let data = { vehicleType: [], rideDiscount: [], unlockDiscount: [], price: [], vid: [], updatedWalletTopUps: [] }
                    for (let value of recordData.vehicleTypes) {
                        let incrementId = id++
                        data.updatedWalletTopUps.push({ ...value, vid: incrementId })
                        data.rideDiscount.push(...[value.rideDiscount])
                        data.unlockDiscount.push(...[value.unlockDiscount])
                        data.vehicleType.push(...[value.vehicleType])
                        data.price.push(...[value.price])
                        data.vid.push(...[incrementId])
                    }
                    form.setFieldsValue({ vehicleTypes: data.vehicleType })
                    this.setState({ vehicleTypes: data.vehicleType })
                    form.setFieldsValue({ vid: data.vid, price: data.price, unlockDiscount: data.unlockDiscount, rideDiscount: data.rideDiscount, vehicleType: data.vehicleType })
                }
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

    handleSubmit = e => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let error;
            let key = Object.keys(BOOKING_PASS_EXPIRATION_TYPES).find(key => BOOKING_PASS_EXPIRATION_TYPES[key] === values.expirationType)
            key.toLowerCase()

            let planValueInMinutes = moment.duration(values.expirationValue, `${key}s`).asMinutes()
            let planValueInHours = moment.duration(values.expirationValue, `${key}s`).asHours()
            let planValueInDays = moment.duration(values.expirationValue, `${key}s`).asDays()
            let planValueInMonths = moment.duration(values.expirationValue, `${key}s`).asMonths()

            if (values.limitType === BOOKING_PASS_LIMIT_TYPES.MINUTES) {
                if (values.limitValue > planValueInMinutes) {
                    error = 'Invalid minute!'
                }
            } else if (values.limitType === BOOKING_PASS_LIMIT_TYPES.HOUR) {
                if (values.limitValue > planValueInHours) {
                    error = 'Invalid hour!'
                }
            } else if (values.limitType === BOOKING_PASS_LIMIT_TYPES.DAY) {
                if (values.limitValue > planValueInDays) {
                    error = 'Invalid day!'
                }
            } else if (values.limitType === BOOKING_PASS_LIMIT_TYPES.MONTH) {
                if (values.limitValue > planValueInMonths) {
                    error = 'Invalid month!'
                }
            }

            if (error !== undefined) {
                message.error('Expiration Time must be larger than Usage limit time!')
                return;
            }

            this.setState({ loading: true })
            let url = `admin/booking-pass/add`;
            let method = `post`;
            let obj = values;
            if (!this.state.ismaxRideLimit) {
                obj.maxRidePerDay = 0;
            }
            if (obj.extraDescription && obj.extraDescription.length > 0) {
                let extraDescription = [...obj.extraDescField]
                obj = { ...obj, extraDescription }
                obj = _.omit(obj, ['extraDescField', 'id'])
            }
            if (obj.vehicleTypes && obj.vehicleTypes.length > 0) {
                const { vehicleType, rideDiscount, price, unlockDiscount } = obj
                const newUpdatedData = vehicleType.map((value, i) => {
                    return {
                        vehicleType: value,
                        rideDiscount: rideDiscount ? rideDiscount[i] : null,
                        price: price[i],
                        unlockDiscount: unlockDiscount ? unlockDiscount[i] : null
                    }
                })
                const nonEmptyData = newUpdatedData.filter(el => el.vehicleType !== undefined)
                obj = _.omit(obj, ['vehicleType', 'rideDiscount', 'unlockDiscount', 'price', 'vid'])
                obj = { ...obj, vehicleTypes: nonEmptyData }
            }
            if (this.state.id) {
                url = `admin/booking-pass/${this.state.id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ loading: false })
                    this.props.history.push({
                        pathname: `/e-scooter/${BOOKING_PASS_ROUTE}`,
                        filter: this.props.location.filter
                    });
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

    handelLimitType = (e) => {
        let limitValue = this.props.form.getFieldValue("limitValue");
        err = null;
        if (e === BOOKING_PASS_LIMIT_TYPES.MINUTES && limitValue > 60) {
            err = 'Please enter minutes between 1 to 60!';
        } else if (e === BOOKING_PASS_LIMIT_TYPES.HOUR && limitValue > 24) {
            err = 'Please enter hour between 1 to 24!';
        } else if (e === BOOKING_PASS_LIMIT_TYPES.DAY && limitValue > 31) {
            err = 'Please enter day between 1 to 31!';
        } else if (e === BOOKING_PASS_LIMIT_TYPES.MONTH && limitValue > 12) {
            err = 'Please enter month between 1 to 12!';
        } else {
            err = null;
        }
        if (err) {
            this.props.form.setFields({
                limitValue: {
                    value: limitValue,
                    errors: [new Error(err)],
                },
            });
        } else {
            this.props.form.setFields({
                limitValue: {
                    value: limitValue,
                },
            });
        }
        this.setState({ limitType: e })
    }
    handelExpirationType = (e) => {
        let expirationValue = this.props.form.getFieldValue("expirationValue");
        err = null;
        if (e === BOOKING_PASS_LIMIT_TYPES.HOUR && expirationValue > 24) {
            err = 'Please enter hour between 1 to 24!';
        } else if (e === BOOKING_PASS_LIMIT_TYPES.DAY && expirationValue > 31) {
            err = 'Please enter day between 1 to 31!';
        } else if (e === BOOKING_PASS_LIMIT_TYPES.MONTH && expirationValue > 12) {
            err = 'Please enter month between 1 to 12!';
        } else {
            err = null;
        }
        if (err) {
            this.props.form.setFields({
                expirationValue: {
                    value: expirationValue,
                    errors: [new Error(err)],
                },
            });
        } else {
            this.props.form.setFields({
                expirationValue: {
                    value: expirationValue,
                },
            });
        }
        this.setState({ expirationType: e })
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
    onVehicleChange = (e) => {
        if (this.state.vehicleTypes.length > e.length) {
            let difference = this.state.vehicleTypes.filter(x => !e.includes(x))[0];
            const price = this.props.form.getFieldValue('price')
            const rideDiscount = this.props.form.getFieldValue('rideDiscount')
            const unlockDiscount = this.props.form.getFieldValue('unlockDiscount')
            const vehicleType = this.props.form.getFieldValue('vehicleType')
            const vid = this.props.form.getFieldValue('vid')

            const updatedData = price.map((el, i) => {
                return {
                    price: el,
                    rideDiscount: rideDiscount && rideDiscount[i],
                    unlockDiscount: unlockDiscount && unlockDiscount[i],
                    vehicleType: vehicleType[i],
                    vid: vid[i]
                }
            })
            const nonEmptyData = updatedData.filter(el => el.vid !== undefined)

            const remainData = nonEmptyData.filter(el => el.vehicleType !== difference)
            if (nonEmptyData.length > 0) {
                let id = 0;
                let data = { price: [], rideDiscount: [], unlockDiscount: [], vehicleType: [], vid: [], updatedWallTopUps: [] }
                for (let value of remainData) {
                    let IncrementId = id++
                    data.price.push(...[value.price])
                    data.rideDiscount.push(...[value.rideDiscount])
                    data.unlockDiscount.push(...[value.unlockDiscount])
                    data.vehicleType.push(...[value.vehicleType])
                    data.vid.push(...[IncrementId])
                }
                this.props.form.setFieldsValue({ price: data.price, unlockDiscount: data.unlockDiscount, rideDiscount: data.rideDiscount, vehicleType: data.vehicleType, vid: data.vid })
            }
        }
        this.setState({ vehicleTypes: e });
    }
    handleReset = () => {
        this.props.form.resetFields();
    };
    validateMaxRideLength = (rule, value, callback) => {
        if (value > 10000) {
            callback(`Max ride per day can not greater than 10000`);
        } else {
            callback();
        }
    };

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        let pattern, msg, timePattern, timeMsg;
        const { limitType, expirationType, loading, recordData, vehicleTypes } = this.state;
        if (limitType === BOOKING_PASS_LIMIT_TYPES.MINUTES) {
            pattern = /^(5[0-9]|1234[0-9]|[1-9])$/;
            msg = 'Please enter minutes between 1 to 60!'
        } else if (limitType === BOOKING_PASS_LIMIT_TYPES.HOUR) {
            pattern = /^(2[0-4]|1[0-9]|[1-9])$/;
            msg = 'Please enter hour between 1 to 24!'
        } else if (limitType === BOOKING_PASS_LIMIT_TYPES.DAY) {
            pattern = /^(3[0-1]|[12][0-9]|[1-9])$/;
            msg = 'Please enter day between 1 to 31!'
        } else {
            pattern = /^(1[0-2]|[1-9])$/;
            msg = 'Please enter month between 1 to 12!'
        }

        if (limitType === BOOKING_PASS_EXPIRATION_TYPES.HOUR) {
            timePattern = /^(2[0-4]|1[0-9]|[1-9])$/;
            timeMsg = 'Please enter hour between 1 to 24!'
        } else if (limitType === BOOKING_PASS_EXPIRATION_TYPES.DAY) {
            timePattern = /^(3[0-1]|[12][0-9]|[1-9])$/;
            timeMsg = 'Please enter day between 1 to 31!'
        } else {
            timePattern = /^(1[0-2]|[1-9])$/;
            timeMsg = 'Please enter month between 1 to 12!'
        }

        const extraDescription = this.props.form.getFieldValue('extraDescription');
        const changedOn = this.props.form.getFieldValue('passType');

        return (
            <div className="gx-module-box gx-module-box-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <div>
                            <Title
                                level={4}
                                className="gx-mb-0 gx-d-inline-block"
                            >
                                {recordData.id
                                    ? <span style={{ display: 'flex' }}>Update &nbsp;{BOOKING_PASS_LABEL}</span>
                                    : <span style={{ display: 'flex' }}>Add &nbsp;{BOOKING_PASS_LABEL}</span>
                                }
                            </Title>
                        </div>
                        <div className="topbarCommonBtn">
                            <Link
                                to={{
                                    pathname: `/e-scooter/${BOOKING_PASS_ROUTE}`,
                                    filter: this.props.location.filter
                                }}
                            >
                                <Button className="gx-mb-0">List</Button>
                            </Link>
                        </div>
                    </Row>
                </div>

                <div className="gx-module-box-content">
                    <CustomScrollbars className="gx-module-content-scroll">
                        <div className="gx-mt-3">
                            <Form layout="vertical" onSubmit={this.handleSubmit}>
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
                                    <Col lg={12} md={12} sm={12} xs={24}>
                                        <Form.Item label="Code"
                                            hasFeedback>
                                            {getFieldDecorator('code', {
                                                getValueFromEvent: e => e.target.value.toUpperCase().trim(),
                                                rules: [
                                                    { required: true, message: 'Please add code!' },
                                                    { max: 6, message: 'Code must be max 6 characters.' }
                                                ]
                                            })(
                                                <Input placeholder="Code" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={6} xs={12}>
                                        <Form.Item
                                            label='Usage Limit'
                                            style={{ paddingLeft: '5px' }}
                                            hasFeedback>
                                            {getFieldDecorator('limitValue', {
                                                rules: [
                                                    {
                                                        pattern: new RegExp('^[1-9][0-9]*$'),
                                                        message: 'Please enter valid value!'
                                                    },
                                                    {
                                                        required: true,
                                                        message: 'Please add usage limit!'
                                                    }]
                                            })(
                                                <InputNumber min={1} placeholder="Time" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={6} xs={12} style={{ marginTop: 25 }}>
                                        <Form.Item hasFeedback>
                                            {getFieldDecorator("limitType", {
                                                rules: [{
                                                    required: false,
                                                    message: "Please select usage limit type!"
                                                }]
                                            })(
                                                <Select placeholder="Select type" defaultValue={this.state.limitType}
                                                // onChange={this.handelLimitType} 
                                                >
                                                    {BOOKING_PASS_LIMIT_TYPES_FILTER.map(
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
                                    <Col lg={6} md={6} sm={6} xs={12}>
                                        <Form.Item
                                            label='Expiration Limit'
                                            style={{ paddingLeft: '5px' }}
                                            hasFeedback>
                                            {getFieldDecorator('expirationValue', {
                                                rules: [
                                                    {
                                                        pattern: new RegExp('^[1-9][0-9]*$'),
                                                        message: 'Please enter valid value!'
                                                    },
                                                    {
                                                        required: true,
                                                        message: 'Please add expiration limit!'
                                                    }]
                                            })(
                                                <InputNumber min={1} placeholder="Expiration Time" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={6} xs={12} style={{ marginTop: 25 }}>
                                        <Form.Item hasFeedback>
                                            {getFieldDecorator("expirationType", {
                                                rules: [{
                                                    required: false,
                                                    message: "Please select expiration type!"
                                                }]
                                            })(
                                                <Select placeholder="Select type" defaultValue={this.state.expirationType}
                                                // onChange={this.handelExpirationType}
                                                >
                                                    {BOOKING_PASS_EXPIRATION_TYPES_FILTER.map(
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
                                        <Form.Item label="Charged On" hasFeedback>
                                            {getFieldDecorator("passType", {
                                                rules: [{
                                                    required: true,
                                                    message: "Please select on which discount is applied!"
                                                }]
                                            })(
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Select on which discount is applied"
                                                >
                                                    {BOOKING_PASS_TYPE_FILTER.map(val => {
                                                        return (
                                                            <Select.Option
                                                                key={val.type}
                                                                value={val.type}
                                                            >
                                                                {val.label}
                                                            </Select.Option>
                                                        );
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={6} xs={12} style={{ marginTop: 25 }}>
                                        <Form.Item label="">
                                            {getFieldDecorator("ismaxRideLimit")(
                                                <Checkbox
                                                    checked={this.state.ismaxRideLimit}
                                                    onClick={() =>
                                                        this.setState({ ismaxRideLimit: !this.state.ismaxRideLimit })
                                                    }
                                                >Is Max Ride Limit</Checkbox>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {this.state.ismaxRideLimit &&
                                        <Col lg={6} md={6} sm={6} xs={12}>
                                            <Form.Item label="Max Ride Per Day"
                                                style={{ paddingLeft: '5px' }}
                                                hasFeedback>
                                                {getFieldDecorator('maxRidePerDay', {
                                                    rules: [
                                                        {
                                                            required: this.state.ismaxRideLimit,
                                                            message: 'Please add max ride per day!'
                                                        }, { pattern: /^[0-9]*$/, message: 'Please Enter Number!' },
                                                        {
                                                            pattern: new RegExp('^[1-9][0-9]*$'),
                                                            message: `Max Ride can't be 0! `
                                                        },
                                                        { validator: this.validateMaxRideLength }
                                                    ]
                                                })(
                                                    <InputNumber min={1} placeholder="Max ride per day" />
                                                )}
                                            </Form.Item>
                                        </Col>}
                                </Row>
                                <Row type="flex" justify="start">
                                    <Col lg={18} md={18} sm={18} xs={24} style={{ width: "60%" }}>
                                        <Form.Item label="Vehicle Type" hasFeedback>
                                            {getFieldDecorator("vehicleTypes", {
                                                rules: [{
                                                    required: true,
                                                    message: "Please select Vehicle Type!"
                                                }]
                                            })(
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Select Pass Type"
                                                    onChange={this.onVehicleChange}
                                                >
                                                    {Object.keys(VEHICLE_TYPES).map(val => {
                                                        return (
                                                            <Select.Option
                                                                key={VEHICLE_TYPES[val]}
                                                                value={VEHICLE_TYPES[val]}
                                                            >
                                                                {val.replace(/_/g, " ")}
                                                            </Select.Option>
                                                        );
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                        {
                                            (vehicleTypes && vehicleTypes.length > 0) &&
                                            vehicleTypes.map((key, i) => <VehicleDiscountForm form={form} index={i} changedOn={changedOn} id={key} />)
                                        }
                                    </Col>
                                </Row>
                                <Row type="flex" justify="start">
                                    <Col span={24}>
                                        <Form.Item label="One line description">
                                            {getFieldDecorator('description', {
                                                rules: [
                                                    { required: true, message: 'Please add description!' }
                                                ]
                                            })(
                                                <TextArea multiline="true"
                                                    rows={3}
                                                    placeholder="One line description"
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
                                <Row>
                                    <Col span={24} className="gx-text-right">
                                        {!recordData.id ? (
                                            <Button
                                                style={{
                                                    marginLeft: 8,
                                                    marginTop: 15
                                                }}
                                                onClick={this.handleReset}
                                            >
                                                Clear
                                            </Button>
                                        ) : (
                                                <Link
                                                    to={`/e-scooter/${BOOKING_PASS_ROUTE}`}
                                                >
                                                    <Button
                                                        style={{ marginLeft: 8, marginTop: 15 }}
                                                    >
                                                        Cancel
                                                </Button>
                                                </Link>
                                            )}
                                        <span className="topbarCommonBtn">
                                            <Button
                                                style={{ display: "inline-flex" }}
                                                type="primary"
                                                htmlType="submit"
                                            >
                                                {!recordData.id
                                                    ? "Save"
                                                    : "Update"}
                                            </Button>
                                        </span>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </CustomScrollbars>
                </div>
            </div>
        );
    }
}

const WrappedPlanUpsertModel = Form.create({ name: 'planUpsertForm' })(PlanUpsertModel);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedPlanUpsertModel);
