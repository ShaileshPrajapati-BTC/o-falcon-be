import {
    FILTER_VISIBLE,
    VEHICLE_TYPES,
    FRANCHISEE_LABEL,
    USER_TYPES,
    FLEET_TYPE,
    DEALER_LABEL,
    DEFAULT_VEHICLE,
    FRANCHISEE_VISIBLE,
    PARTNER_WITH_CLIENT_FEATURE,
    CLIENT_VISIBLE,
    FILTER_BY_FLEET_TYPE
} from "../../constants/Common";
import {
    Button, Col, Form, Input, Row, Select, InputNumber, message
} from "antd";
import React, { Component } from "react";
import CustomScrollbars from "util/CustomScrollbars";
import IntlMessages from "../../util/IntlMessages";

const _ = require("lodash");

class ZoneUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            radius: props.radius
        }
        this.isFranchiseeOrDealer = (props.authUser.type === USER_TYPES.FRANCHISEE) || (props.authUser.type === USER_TYPES.DEALER)
        this.fleetTypeFilter = FILTER_BY_FLEET_TYPE.filter((ele) => { return ele.value !== 1 })
    }

    componentDidMount = () => {
        const { form } = this.props;
        if (!_.isEmpty(this.props.editData) && this.props.editkey === 'edit') {
            let formVal;
            if (this.isFranchiseeOrDealer) {
                formVal = _.pick(this.props.editData, ["vehicleTypes", "name", "dealerId", "fleetType"]);
                if (formVal && formVal.dealerId) {
                    formVal.fleetType = formVal.fleetType;
                }
                if (formVal && formVal.dealerId && formVal.dealerId.id) {
                    formVal.dealerId = formVal.dealerId.id;
                }
            } else {
                formVal = _.pick(this.props.editData, ["vehicleTypes", "name", "franchiseeId", "fleetType"]);
                if (formVal && formVal.franchiseeId && formVal.franchiseeId.id) {
                    formVal.franchiseeId = formVal.franchiseeId.id;
                }
            }
            form.setFieldsValue(formVal);
        }
        else {
            let values = {};
            if (this.isFranchiseeOrDealer) {
                values = {
                    vehicleTypes: [DEFAULT_VEHICLE],
                    dealerId: this.props.dealerId ? this.props.dealerId : this.props.list.length !== 0 ? this.props.list[0].id : ''
                };
            } else {
                values = {
                    vehicleTypes: [DEFAULT_VEHICLE],
                    franchiseeId: this.props.franchiseeId ? this.props.franchiseeId : this.props.list.length !== 0 ? this.props.list[0].id : ''
                };
            }
            if (CLIENT_VISIBLE || PARTNER_WITH_CLIENT_FEATURE) {
                values.fleetType = FLEET_TYPE.PRIVATE;
            }
            form.setFieldsValue(values);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.radius && nextProps.radius !== this.state.radius) {
            this.setState({ radius: nextProps.radius });
        }
    }

    handleRadiusChange = (radius) => {
        this.setState({ radius: radius });
        this.props.handleRadiusChange(radius);
    }

    fetch = async (data) => {
        const { form } = this.props;
        let formVal = _.pick(data, [
            "vehicleTypes",
            "name",
        ]);

        form.setFieldsValue(formVal);
    }
    clearFormFn = () => {
        const { form } = this.props;
        form.resetFields();
        this.props.clearFormFn();
    }
    handleSubmit = (e) => {
        e.preventDefault();
        const isDrwaingZoneIsCircle = this.props.isDrwaingZoneIsCircle;
        this.props.form.validateFields((err, values) => {
            if (err) {
                return false;
            }
            if (isDrwaingZoneIsCircle && this.state.radius === 0) {
                message.error(<IntlMessages id="app.zone.radiusCantZero" />);
                return false;
            }
            this.props.handleSubmit(values);
        })
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { visibleAll, list, franchiseeList, isDrwaingZoneIsCircle } = this.props;
        let showFleetType = false;
        if (PARTNER_WITH_CLIENT_FEATURE) {
            // if franchiseeId exist
            showFleetType = getFieldValue('franchiseeId') !== null;
        } else {
            // if dealerId exist in franchisee or dealer panel
            showFleetType = this.isFranchiseeOrDealer && getFieldValue('dealerId') !== null;
        }

        if (FRANCHISEE_VISIBLE && !CLIENT_VISIBLE && !PARTNER_WITH_CLIENT_FEATURE) {
            showFleetType = false;
        }

        return (
            <CustomScrollbars>
                <div style={{ paddingTop: 15 }}>
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <Row type="flex" justify="start"  >
                            <Col span={24} >
                                <Form.Item label={<IntlMessages id="app.name" />} hasFeedback >
                                    {getFieldDecorator("name", {
                                        rules: [{
                                            transform: value => { return (value && value.trim()); }
                                        },
                                        { required: true, message: <IntlMessages id="app.nameRequiredMsg" /> },
                                        { max: 50, message: <IntlMessages id="app.zone.nameMaxLimitMsg" /> },
                                        { min: 3, message: <IntlMessages id="app.zone.nameMinLimitMsg" /> },
                                        { pattern: /^[a-z\d\-_\s]+$/i, message: <IntlMessages id="app.zone.validationMsg" /> }
                                        ]
                                    }
                                    )(
                                        <Input placeholder="Name" />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        {!this.isFranchiseeOrDealer && FRANCHISEE_VISIBLE && <Row type="flex" justify="start"  >
                            <Col span={24} >
                                <Form.Item label={FRANCHISEE_LABEL} hasFeedback >
                                    {getFieldDecorator('franchiseeId', {})
                                        (< Select
                                            placeholder={`Select ${FRANCHISEE_LABEL}  `}
                                            disabled={this.props.franchiseeId || list.length === 0}>
                                            {list && list.map((val) => {
                                                return (
                                                    <Select.Option key={val.id} value={val.id} >
                                                        {`${val.name}`}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>)
                                    }
                                </Form.Item>
                            </Col>
                        </Row>}
                        {this.isFranchiseeOrDealer && CLIENT_VISIBLE && <Row type="flex" justify="start"  >
                            <Col span={24} >
                                <Form.Item label={DEALER_LABEL} hasFeedback >
                                    {getFieldDecorator('dealerId', {})
                                        (< Select
                                            placeholder={`Select ${DEALER_LABEL}  `}
                                            disabled={this.props.dealerId || list.length === 0}>
                                            {list && list.map((val) => {
                                                return (
                                                    <Select.Option key={val.id} value={val.id} >
                                                        {`${val.name}`}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>)
                                    }
                                </Form.Item>
                            </Col>
                        </Row>}
                        {
                            showFleetType && <Row type="flex" justify="start" >
                                <Col span={24} >
                                    <Form.Item label={<IntlMessages id="app.user.fleetTypeLabel" />} hasFeedback >
                                        {getFieldDecorator("fleetType", {
                                            rules: [{
                                                required: true, message: <IntlMessages id="app.user.fleetTypeRequiredMsg" />
                                            }]
                                        }
                                        )(
                                            <Select placeholder="Select type">
                                                {this.fleetTypeFilter.map(val => {
                                                    return (
                                                        <Select.Option
                                                            key={val.value}
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
                            </Row>
                        }

                        <Row type="flex" justify="start" className={!FILTER_VISIBLE ? "displayNone" : ""} >
                            <Col span={24} >
                                <Form.Item label={<IntlMessages id="app.vehicleType" />} hasFeedback >
                                    {getFieldDecorator("vehicleTypes", {
                                        rules: [{
                                            required: true, message: <IntlMessages id="app.vehicle.vehicleTypeRequiredMsg" />
                                        }]
                                    }
                                    )(
                                        <Select placeholder="Select type" mode="multiple">
                                            {visibleAll && (
                                                <Select.Option value={0}>
                                                    <IntlMessages id="app.all" />
                                                </Select.Option>
                                            )}
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
                            </Col>
                        </Row>

                        <Row type="flex" justify="start" className={!isDrwaingZoneIsCircle ? "displayNone" : ""}>
                            <Col span={24} >
                                <Form.Item label={<IntlMessages id="app.zone.radius" />} hasFeedback >
                                    <InputNumber value={this.state.radius} onChange={this.handleRadiusChange.bind(this)} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row type="flex" justify="start">
                            <Col span={24} className="gx-text-right" >
                                <Button style={{ marginLeft: 8, marginTop: 15 }}
                                    onClick={() => { return this.props.handleReset(); }}
                                > <IntlMessages id="app.zone.changeShape" />
                                </Button>
                                <Button style={{ marginLeft: 8, marginTop: 15 }}
                                    onClick={() => { return this.clearFormFn(); }}
                                > <IntlMessages id="app.cancel" />
                                </Button>
                                <span className="topbarCommonBtn">
                                    <Button style={{ display: "inline-flex" }} type="primary" htmlType="submit" >
                                        <IntlMessages id="app.save" />
                                    </Button>
                                </span>
                            </Col>
                        </Row>
                    </Form>
                </div >
            </CustomScrollbars>
        );
    }
}


const WrappedZone = Form.create({ name: "ZoneUpsertForm" })(ZoneUpsert);

export default WrappedZone;