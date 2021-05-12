/* eslint-disable max-lines-per-function */
import {
    Badge, Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Typography, message
} from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_VEHICLE, DISCOUNT_TYPE_ARRAY, RIDER_LABEL, FILTER_BY_VEHICLE_TYPE, FILTER_VISIBLE, ONLY_NUMBER_REQ_EXP, UNIT_TYPE_ARRAY, USER_TYPES, VEHICLE_TYPES, DISCOUNT_TYPE, GUEST_USER
} from '../../constants/Common';
import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import moment from 'moment';
import IntlMessages from '../../util/IntlMessages';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;
const _ = require('lodash');
class PromoCodeUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.match.params.id,
            data: {},
            userData: [],
            discountType: false,
            filter: {
                filter: {
                    type: USER_TYPES.RIDER,
                    isDeleted: false,
                    isActive: true
                }
            },
            tagCount: 2,
            searchUserData: [],
            type: DISCOUNT_TYPE.FREE_FIRST_RIDE
        };
        let userType = USER_TYPES;
        // if (userType['RIDER'] && RIDER_LABEL.toUpperCase() !== 'RIDER') {
        //     delete Object.assign(userType, { [RIDER_LABEL.toUpperCase()]: userType['RIDER'] })['RIDER'];
        // }
        this.userType = userType;
        this.discountTypeArray = DISCOUNT_TYPE_ARRAY.slice(1);
    }
    componentDidMount() {
        // do nothing
        const { form } = this.props;
        form.setFieldsValue({
            type: this.state.type,
            unitType: UNIT_TYPE_ARRAY[0].value,
            vehicleType: DEFAULT_VEHICLE
        });
        console.log('TCL: PromoCodeUpsert -> componentDidMount -> form', form);
        let id = _.last(_.split(window.location.pathname, '/'));
        if (id !== 'upsert') {
            this.setState({ id: id });
            // this.fetch(id);
        }
        this.setSelection();
    }
    fetch = async (id) => {
        const { form } = this.props;

        this.setState({ loading: true });
        try {
            let response = await axios.get(`admin/promo-code/${id}`);
            if (response.code === 'OK') {
                this.setState({
                    loading: false,
                    data: response.data,
                    type: response.data.type
                });
                let data = response.data;
                let formVal = _.pick(data, [
                    'name', 'code', 'description', 'link', 'notes', 'tnc', 'type'
                ]);
                if (data.vehicleType.length > 1) {
                    formVal.vehicleType = 0;
                } else {
                    formVal.vehicleType = _.flatten(data.vehicleType);
                }
                if (data.type === DISCOUNT_TYPE.GENERAL || data.type === DISCOUNT_TYPE.WALLET_BALANCE) {
                    this.setState({ discountType: true });
                }
                if (data.isApplicableToAllUsers) {
                    let array = [];
                    _.each(this.state.userData, (value) => {
                        array.push(value.id);
                    });
                    formVal.applicableUsers = array;
                } else {
                    if (data.applicableUsers && data.applicableUsers.length) {
                        formVal.applicableUsers = data.applicableUsers;
                    } else {
                        delete formVal.applicableUsers;
                    }
                }
                formVal.valid = [
                    moment(UtilService.displayDate(data.startDateTime)),
                    moment(UtilService.displayDate(data.endDateTime))
                ];
                if (formVal.type === DISCOUNT_TYPE.GENERAL || formVal.type === DISCOUNT_TYPE.WALLET_BALANCE) {
                    formVal.maxUseLimitPerUser = data.maxUseLimitPerUser;
                    formVal.unitType = data.discountType;
                    if (data.discountType === UNIT_TYPE_ARRAY[0].value) {
                        formVal.discount = data.flatDiscountAmount;
                    } else {
                        formVal.discount = data.percentage;
                        formVal.upto = data.maximumDiscountLimit;
                    }
                }
                form.setFieldsValue(formVal);
            }
            this.setState({ loading: false });

        } catch (error) {
            this.setState({ loading: false });
            console.log('ERROR   ', error);
        }
    }
    setSelection = async () => {
        try {
            let response = await axios.post('admin/user/user-list', this.state.filter);
            if (response.code === 'OK') {
                let array = [];
                let userData = response.data.list;
                let all = { id: 'all', name: 'All' };
                userData = _.concat(all, userData);
                _.each(userData, (value) => {
                    if (!value.name) {
                        value.name = GUEST_USER;
                    }
                    value.checked = false;
                    array.push(value.id);
                });
                this.setState({
                    userData: userData,
                    searchUserData: userData
                });
            }
            if (this.state.id) {
                this.fetch(this.state.id);
            }
        } catch (error) {
            console.log('error', error);
            // message.error(error);
        }
    }
    onChange = (date, dateString) => {
        console.log(date, dateString);
    }
    handleReset = () => {
        this.props.form.resetFields();
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            if (!values.vehicleType) {
                values.vehicleType = FILTER_BY_VEHICLE_TYPE[0].type;
            } else {
                _.each(FILTER_BY_VEHICLE_TYPE, (item) => {
                    if (values.vehicleType === item.value) {
                        values.vehicleType = item.type;
                    }
                });
            }
            let url = `admin/promo-code/add`;
            let method = `post`;
            if (this.state.id) {
                url = `admin/promo-code/${this.state.id}`;
                method = `put`;
            }

            let obj = _.pick(values, ['vehicleType', 'name', 'description', 'link', 'notes', 'tnc', 'type']);
            obj.code = _.toUpper(values.code);
            obj.startDateTime = UtilService.getStartOfTheDay(values.valid[0].toISOString());
            obj.endDateTime = UtilService.getEndOfTheDay(values.valid[1].toISOString());
            if (!this.state.id) { obj.isActive = true; }
            if (!_.includes(values.applicableUsers, 'all')) {
                obj.applicableUsers = values.applicableUsers;
                obj.isApplicableToAllUsers = false;
            } else {
                obj.isApplicableToAllUsers = true;
            }
            if (values.type === DISCOUNT_TYPE.GENERAL || values.type === DISCOUNT_TYPE.WALLET_BALANCE) {
                obj.maxUseLimitPerUser = values.maxUseLimitPerUser;
                obj.discountType = values.unitType;
                if (values.unitType === UNIT_TYPE_ARRAY[0].value) {
                    obj.flatDiscountAmount = values.discount;
                } else {
                    obj.percentage = values.discount;
                    obj.maximumDiscountLimit = values.upto;
                }
            } else {
                obj.maxUseLimitPerUser = 1;
            }

            try {
                let data = await axios[method](url, obj);
                if (data.code === 'OK') {
                    message.success(`${data.message}`);
                    this.props.history.push({
                        pathname: `/e-scooter/promocode`,
                        filter: this.props.location.filter
                    });
                } else {
                    message.error(`${data.message}`);
                }
            } catch (error) {
                console.log('error', error);
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    }
    handleSelectChange = (array) => {
        if (!array.includes('all')) {
            this.setState({ tagCount: 2 });
            if (this.state.userData[0].checked) {
                _.each(this.state.userData, (item) => {
                    item.checked = false;
                });
                array.length = 0;
            } else if (array.length === this.state.userData.length - 1) {
                array.push('all');
            }
        }
        if (array.includes('all')) {
            if (!this.state.userData[0].checked) {
                array.length = 0;
                this.setState({ tagCount: 1 });
                _.each(this.state.userData, (item) => {
                    item.checked = true;
                    if (!_.includes(array, item.id)) {
                        array.push(item.id);
                    }
                });
            } else {
                this.setState({ tagCount: 2 });
                let tempdata = _.cloneDeep(this.state.userData);
                tempdata[0].checked = false;
                this.setState({ userData: tempdata })
                array = _.remove(array, (data) => {
                    return data === 'all';
                });
            }
        }
    }
    handleType = (value) => {
        this.setState({
            discountType: DISCOUNT_TYPE.GENERAL === value || DISCOUNT_TYPE.WALLET_BALANCE === value,
            type: value
        });
    }

    disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < moment().startOf('day');
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { discountType, userData, type } = this.state;

        let aUCount = form.getFieldValue('applicableUsers') ?
            form.getFieldValue('applicableUsers').length :
            0;
        let label = <>
            {<IntlMessages id="app.promocode.applicableUsers" />}
            <Badge count={aUCount} className="notification-badge" overflowCount={999} />
        </>;

        return <>
            <div className="gx-module-box gx-module-box-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <div>
                            <Title level={4}
                                className="gx-mb-0 gx-d-inline-block">
                                {this.state.id ? <IntlMessages id="app.promocode.updatePromocode" /> : <IntlMessages id="app.promocode.addPromocode" />}
                            </Title>
                        </div>
                        <div>
                            <Link className="gx-ml-2 topbarCommonBtn" to={{
                                pathname: `/e-scooter/promocode`,
                                filter: this.props.location.filter
                            }}>
                                <Button className="gx-mb-0" style={{ display: 'inline-flex' }}><IntlMessages id="app.list" /></Button>
                            </Link>
                        </div>
                    </Row>
                </div>

                <div className="gx-module-box-content">

                    <div className="gx-mt-3">
                        <Form layout="vertical"
                            onSubmit={this.handleSubmit.bind(this)}>
                            <Row type="flex" justify="start">
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.name" />} hasFeedback>
                                        {getFieldDecorator('name', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.nameRequiredMsg" defaultMessage="Please add name." /> }
                                            ]
                                        })(
                                            <Input placeholder="Name" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.user.codeLabel" />} hasFeedback>
                                        {getFieldDecorator('code', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.partner.codeRequiredMsg" defaultMessage="Please add Code." /> }
                                            ]
                                        })(
                                            <Input placeholder="Code" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.promocode.link" />} hasFeedback>
                                        {getFieldDecorator('link', {
                                            rules: [
                                                // { required: true, message: 'Please add Code.' }
                                            ]
                                        })(
                                            <Input placeholder="Link" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.description" />}>
                                        {getFieldDecorator('description', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.procedure.addDescription" defaultMessage="Please add Description." /> }
                                            ]
                                        })(
                                            <TextArea multiline="true"
                                                rows={3}
                                                placeholder="Description"
                                                margin="none" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.promocode.termAndCondition" />}>
                                        {getFieldDecorator('tnc', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.addTermAndCondition" defaultMessage="Please add Terms and Conditions." /> }
                                            ]
                                        })(
                                            <TextArea multiline="true"
                                                rows={3}
                                                placeholder="Terms and Conditions"
                                                margin="none" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.promocode.notes" />}>
                                        {getFieldDecorator('notes', {})(
                                            <TextArea multiline="true"
                                                rows={3}
                                                placeholder="Notes"
                                                margin="none" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.type" />} hasFeedback>
                                        {getFieldDecorator('type', {
                                            rules: [
                                                // { required: true, message: 'Please add Code.' }
                                            ]
                                        })(
                                            <Select placeholder="Select Type"
                                                onChange={this.handleType}
                                            >
                                                {_.map(this.discountTypeArray, (item) => {

                                                    return <Select.Option
                                                        key={item.value}
                                                        value={item.type}
                                                    >
                                                        {item.label}
                                                    </Select.Option>;
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>


                                {/* <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label="User Type"
                                        hasFeedback>
                                        {getFieldDecorator('userType', {
                                            rules: [{
                                                required: true,
                                                message: 'Please select user type!'
                                            }]
                                        })(
                                            <Select
                                                onChange={this.getUsers.bind(this)}
                                                placeholder="Select Type"
                                            >
                                                {
                                                    Object.keys(this.userType).map((val) => {
                                                        return <Select.Option
                                                            key={userType[val]}
                                                            value={userType[val]}>
                                                            {val.replace(/_/g, ' ')}
                                                        </Select.Option>;
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col> */}
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={label}
                                        hasFeedback>
                                        {getFieldDecorator('applicableUsers', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.promocode.pleaseAddUser" /> }
                                            ]
                                        })(
                                            <Select
                                                maxTagCount={this.state.tagCount}
                                                placeholder="Select Users"
                                                mode="multiple"
                                                optionLabelProp="children"
                                                filterOption={(input, option) => {
                                                    if (typeof option.props.children === 'string'){
                                                        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                                    }
                                                    return option.props.children.props.defaultMessage.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                                }}
                                                onChange={this.handleSelectChange}
                                            >
                                                {
                                                    userData.map((val, index) => {
                                                        return <Option
                                                            key={index}
                                                            value={val.id}>
                                                            {(val.name)}
                                                        </Option>;
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.promocode.validity" />} hasFeedback>
                                        {getFieldDecorator('valid', {
                                            rules: [
                                                { required: true, message: <IntlMessages id="app.partner.codeRequiredMsg" defaultMessage="Please add Code." /> }
                                            ]
                                        })(
                                            <RangePicker
                                                style={{ width: '100%' }}
                                                disabledDate={this.disabledDate}
                                                onChange={this.onChange.bind(this)} />
                                        )}
                                    </Form.Item>
                                </Col>
                                {type !== DISCOUNT_TYPE.WALLET_BALANCE && <Col lg={8} md={8} sm={8} xs={24} className={!FILTER_VISIBLE ? 'displayNone' : ''}>
                                    <Form.Item label={<IntlMessages id="app.vehicleType" />}

                                        hasFeedback>
                                        {getFieldDecorator('vehicleType', {
                                            initialValue: DEFAULT_VEHICLE,
                                            rules: [
                                                { required: false, message: <IntlMessages id="app.vehicle.vehicleTypeRequiredMsg" /> }]
                                        })(
                                            <Select placeholder="Select type">
                                                <Select.Option value={0}>
                                                    <IntlMessages id="app.all" />
                                                </Select.Option>
                                                {
                                                    Object.keys(VEHICLE_TYPES).map((val) => {
                                                        return <Select.Option
                                                            key={VEHICLE_TYPES[val]}
                                                            value={VEHICLE_TYPES[val]}>
                                                            {val.replace(/_/g, ' ')}
                                                        </Select.Option>;
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>}


                                {discountType && < >
                                    <Col span={3} >
                                        <Form.Item label={type === DISCOUNT_TYPE.WALLET_BALANCE ? <IntlMessages id="app.wallet.amount" /> : <IntlMessages id="app.promocode.discount" />} >
                                            {getFieldDecorator('discount', {
                                                rules: [
                                                    {
                                                        required: discountType,
                                                        message: <IntlMessages id="app.promocode.addDiscountMessage" />
                                                    },
                                                    {
                                                        pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                        message: <IntlMessages id="app.promocode.invalidDiscount" />
                                                    }
                                                ]
                                            })(
                                                <InputNumber placeholder="Discount"
                                                    max={form.getFieldValue('unitType') === UNIT_TYPE_ARRAY[1].value ? 100 : Infinity} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Form.Item label={<IntlMessages id="app.promocode.unit" />} >
                                            {getFieldDecorator('unitType', {
                                                initialValue: 1
                                            })(
                                                <Select disabled={type === DISCOUNT_TYPE.WALLET_BALANCE}>
                                                    {_.map(UNIT_TYPE_ARRAY, (item) => {

                                                        return <Select.Option
                                                            key={item.value}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </Select.Option>;
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {type === DISCOUNT_TYPE.GENERAL ?
                                        <Col span={3}>
                                            <Form.Item label={<IntlMessages id="app.promocode.upto" />} >
                                                {getFieldDecorator('upto', {
                                                    rules: [
                                                        {
                                                            pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                            message: <IntlMessages id="app.promocode.invalidDiscount" />
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber placeholder="Upto" disabled={form.getFieldValue('unitType') === UNIT_TYPE_ARRAY[0].value} />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        : <Col span={3}></Col>
                                    }
                                    <Col span={4}>
                                        <Form.Item label={type === DISCOUNT_TYPE.WALLET_BALANCE ? <IntlMessages id="app.promocode.maxUsagePerUser" /> : <IntlMessages id="app.promocode.maxRidesPerUser" />} >
                                            {getFieldDecorator('maxUseLimitPerUser', {
                                                initialValue: 1,
                                                rules: [
                                                    {
                                                        required: discountType,
                                                        message: <IntlMessages id="app.promocode.addMaxNumberOfRidesPerUser" />
                                                    },
                                                    {
                                                        pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                        message: <IntlMessages id="app.promocode.invalidRideNumber" />
                                                    }
                                                ]
                                            }
                                            )(
                                                <InputNumber placeholder="Max Rides per User" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </>}

                            </Row>
                            <Row>
                                <Col span={24} className="gx-text-right">
                                    {!this.state.id &&
                                        <Button style={{ marginLeft: 8, marginTop: 15 }} onClick={this.handleReset.bind(this)}>
                                            <IntlMessages id="app.clear" />
                                        </Button>
                                    }
                                    <span className="topbarCommonBtn">
                                        <Button style={{ display: 'inline-flex' }} type="primary" htmlType="submit"><IntlMessages id="app.save" /></Button>
                                    </span>
                                </Col>
                            </Row>
                        </Form>
                    </div>

                </div>
            </div>
        </>;
    }
}
const WrappedPromoCodeUpsert = Form.create({ name: 'PromoCodeUpsertForm' })(PromoCodeUpsert);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedPromoCodeUpsert);

