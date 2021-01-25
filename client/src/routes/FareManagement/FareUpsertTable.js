import {
    Button,
    Col,
    Form,
    InputNumber,
    Row,
    Select,
    Spin,
    message
} from "antd";
import {
    DECIMAL_NUMBER_REG_EXP,
    MINIMUM_FARE_TYPE,
    ONLY_NUMBER_REQ_EXP,
    VEHICLE_TYPES,
    DEFAULT_BASE_CURRENCY,
    DEFAULT_DISTANCE_UNIT,
    RIDER_LABEL,
    DEFAULT_API_ERROR
} from "../../constants/Common";
import CustomScrollbars from "../../util/CustomScrollbars";
import ESInfoLabel from "../../components/ESInfoLabel";
import React, { Component } from "react";
import axios from "util/Api";
import IntlMessages from "../../util/IntlMessages";

const _ = require("lodash");
class FareUpsertTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data
        };
    }
    componentDidMount() {
        let formVal = _.omit(this.props.data, [
            "boundary",
            "name",
            "isActive",
            "baseCurrency"
        ]);
        if ("minimumFareType" in formVal && formVal.minimumFareType === 0) {
            formVal.minimumFareType = MINIMUM_FARE_TYPE[0].value;
        }
        this.props.form.setFieldsValue(formVal);
    }
    fareTypeSelection = value => {
        let val = _.find(MINIMUM_FARE_TYPE, { code: "PER_DISTANCE_UNIT_CHARGE" }).value;
        if (value === val) {
            let baseFare = this.props.form.getFieldValue("distanceFare");
            this.props.form.setFieldsValue({ baseFare: baseFare });
        }
    };
    distanceFare = value => {
        let fareType = this.props.form.getFieldValue("minimumFareType");
        let val = _.find(MINIMUM_FARE_TYPE, { code: "PER_DISTANCE_UNIT_CHARGE" }).value;
        if (fareType === val) {
            this.props.form.setFieldsValue({ baseFare: value });
        }
    };
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                return false;
            }
            if (!values.ridePauseFare) {
                values.ridePauseFare = 0;
            }
            let reqObj = _.clone(values);
            let { id } = this.props;
            axios
                .put(`/admin/fare-management/${id}`, reqObj)
                .then(data => {
                    if (data.code === "OK") {
                        message.success(`${data.message}`);
                        this.props.sendFareListingPage();
                    } else {
                        message.error(`${data.message}`);
                    }
                })
                .catch(({ response }) => {
                    let resp = (response && response.data) || {
                        message: DEFAULT_API_ERROR
                    };
                    message.error(`${resp.message}`);
                });
        });
    };
    render() {
        const { loading, form } = this.props;
        const { getFieldDecorator } = form;
        return (
            <Spin spinning={loading} delay={100}>
                <div className="gx-module-box-content">
                    <CustomScrollbars className="gx-module-content-scroll">
                        <div className="gx-mt-3">
                            <Form
                                layout="vertical"
                                onSubmit={this.handleSubmit}
                            >
                                <Row type="flex" justify="start">
                                    {/* Time fare*/}
                                    <Col lg={5} md={5} sm={10} xs={24}>
                                        <Form.Item
                                            label={<span><IntlMessages id="app.timeFare" defaultMessage="Time Fare" />({DEFAULT_BASE_CURRENCY}/X <IntlMessages id="app.min" defaultMessage="min" />)</span>}
                                            hasFeedback
                                        >
                                            {getFieldDecorator("timeFare", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.pleaseAddTimeFare" defaultMessage="Please add  Time Fare!" />
                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagemant.invalidTimeFare" defaultMessage="Invalid Time Fare!" />

                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Time Fare"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={2} md={2} sm={4} xs={24}>
                                        <Form.Item label=" ">
                                            <br />
                                            <div style={{ paddingTop: 10 }}>
                                                Per (/)
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col lg={5} md={5} sm={10} xs={24}>
                                        <Form.Item
                                            style={{ paddingTop: 4 }}
                                            label={
                                                <ESInfoLabel
                                                    label=" "
                                                    message={<span>{RIDER_LABEL} <IntlMessages id="app.faremanagement.willBeChargedBasedOnTime" defaultMessage=" will be charged based on Time" /></span>}
                                                    unit=""
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "perXBaseMinute",
                                                {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.faremanagemant.pleaseAddMinutes" defaultMessage="Please add minutes!" />
                                                        },
                                                        {
                                                            pattern: new RegExp(
                                                                ONLY_NUMBER_REQ_EXP
                                                            ),
                                                            message: <IntlMessages id="app.faremanagemant.invalidMinutes" defaultMessage="Invalid Minutes!" />

                                                        }
                                                    ]
                                                }
                                            )(
                                                <InputNumber
                                                    min={1}
                                                    placeholder="X Minutes"
                                                    step={1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* Distance Fare*/}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.distanceFare" defaultMessage="Distance Fare" />}
                                                    message={`${RIDER_LABEL} will be charged based on Distance`}
                                                    unit={`(${DEFAULT_BASE_CURRENCY}/${DEFAULT_DISTANCE_UNIT})`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator("distanceFare", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.pleaseAddDistanceFare" defaultMessage="Please add Distance  Fare!" />
                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagement.invalidDistanceFare" defaultMessage="Invalid Distance Fare!" />
                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Distance Fare"
                                                    onChange={this.distanceFare}
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* ridePauseFare */}
                                    {form.getFieldValue("vehicleType") !==
                                        VEHICLE_TYPES.BICYCLE && (
                                            <Col lg={6} md={6} sm={12} xs={24}>
                                                <Form.Item
                                                    label={
                                                        <ESInfoLabel
                                                            label={<IntlMessages id="app.ridePauseFare" defaultMessage="Ride Pause Fare" />}
                                                            message={`${RIDER_LABEL} will be charged based on pause time`}
                                                            unit={`(${DEFAULT_BASE_CURRENCY}/min)`}
                                                            placement="topRight"
                                                        />
                                                    }
                                                    hasFeedback
                                                >
                                                    {getFieldDecorator(
                                                        "ridePauseFare",
                                                        {
                                                            rules: [
                                                                {
                                                                    required: false,
                                                                    message: <IntlMessages id="app.faremanagement.pleaseAddRidePauseFare" defaultMessage="Please add  Ride Pause  Fare!" />
                                                                },
                                                                {
                                                                    pattern: new RegExp(
                                                                        DECIMAL_NUMBER_REG_EXP
                                                                    ),
                                                                    message: <IntlMessages id="app.faremanagement.invalidRidePauseFare" defaultMessage="Invalid Ride Pause Fare!" />
                                                                }
                                                            ]
                                                        }
                                                    )(
                                                        <InputNumber
                                                            placeholder="Ride Pause Fare"
                                                            step={0.1}
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        )}
                                    {/* lateFare*/}
                                    {/* <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item label="Late Fare"
                                            hasFeedback>
                                            {getFieldDecorator('lateFare', {
                                                rules: [
                                                    { required: false, message: 'Please add  Late Fare!' },
                                                    {
                                                        pattern: new RegExp(DECIMAL_NUMBER_REG_EXP),
                                                        message: 'Invalid Late Fare!'
                                                    }
                                                ]
                                            })(
                                                <InputNumber placeholder="Late Fare" />
                                            )}
                                        </Form.Item>
                                    </Col> */}
                                    {/* rideReserveFare */}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.rideReserveFare" defaultMessage="Ride Reserve Fare" />}
                                                    message={<span>{RIDER_LABEL} <IntlMessages id="app.faremanagement.chargeBasedOnReserveTime" /> </span>}
                                                    unit={`(${DEFAULT_BASE_CURRENCY}/min)`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "rideReserveFare",
                                                {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.faremanagement.pleaseAddRideReserveFare" defaultMessage="Please add  Ride Reserve Fare!" />
                                                        },
                                                        {
                                                            pattern: new RegExp(
                                                                DECIMAL_NUMBER_REG_EXP
                                                            ),
                                                            message: <IntlMessages id="app.faremanagement.invalidRideReserveFare" defaultMessage="Invalid Ride Reserve Fare!" />
                                                        }
                                                    ]
                                                }
                                            )(
                                                <InputNumber
                                                    placeholder="Ride Reserve Fare"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* cancellation Fare*/}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.cancellationFare" defaultMessage="Cancellation Fare" />}
                                                    message={<span>${RIDER_LABEL} <IntlMessages id="app.faremanagement.willBeChargedForCancellation" defaultMessage=" will be charged for cancellation" /></span>}
                                                    unit={`(${DEFAULT_BASE_CURRENCY})`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "cancellationFare",
                                                {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.faremanagement.addCancellationFare" defaultMessage="Please add  Cancellation  Fare!" />
                                                        },
                                                        {
                                                            pattern: new RegExp(
                                                                DECIMAL_NUMBER_REG_EXP
                                                            ),
                                                            message: <IntlMessages id="app.faremanagement.invalidCancellationFare" defaultMessage="Invalid Cancellation Fare!" />

                                                        }
                                                    ]
                                                }
                                            )(
                                                <InputNumber
                                                    placeholder="Cancellation Fare"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* timeFareFreeLimit */}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.timeFareFreeLimit" defaultMessage="Time Fare Free Limit" />}
                                                    message={<span>{RIDER_LABEL} <IntlMessages id="app.faremanagement.willNotBeChargedUpTo" defaultMessage="will not be charged upto this time" /></span>}
                                                    unit={`(${DEFAULT_BASE_CURRENCY}/min)`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "timeFareFreeLimit",
                                                {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.faremanagement.pleaseAddTImeFareFreeLimit" defaultMessage="Please add  Time Fare Free Limit!" />

                                                        },
                                                        {
                                                            pattern: new RegExp(
                                                                ONLY_NUMBER_REQ_EXP
                                                            ),
                                                            message: <IntlMessages id="app.faremanagement.invalidTimeFareFreeLimit" defaultMessage="Invalid Time Fare Free Limit!" />

                                                        }
                                                    ]
                                                }
                                            )(
                                                <InputNumber placeholder="Time Fare Free Limit .E.X. 20 min" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* distanceFareFreeLimit */}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.distanceFareFreeLimit" defaultMessage="Distance Fare Free Limit" />}
                                                    message={<span>{RIDER_LABEL} <IntlMessages id="app.faremanagement.willNotBeChargedUoToThisDistance" defaultMessage="will not be charged upto this distance" /></span>}
                                                    unit={`(${DEFAULT_BASE_CURRENCY}/${DEFAULT_DISTANCE_UNIT})`}
                                                    placement="topRight"
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "distanceFareFreeLimit",
                                                {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.faremanagement.pleaseAddDistanceFareFree" defaultMessage="Please add Distance Fare Free Limit!" />
                                                        },
                                                        {
                                                            pattern: new RegExp(
                                                                ONLY_NUMBER_REQ_EXP
                                                            ),
                                                            message: <IntlMessages id="app.faremanagement.invalidDistanceFareFreeLimit" defaultMessage="Invalid Distance Fare Free Limit!" />

                                                        }
                                                    ]
                                                }
                                            )(
                                                <InputNumber placeholder="Distance Fare Free Limit .E.X. 3 km" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={<IntlMessages id="app.minimumFareType" defaultMessage="Minimum Fare Type" />}
                                            hasFeedback
                                        >
                                            {getFieldDecorator(
                                                "minimumFareType"
                                            )(
                                                <Select
                                                    placeholder="Select minimum fare type"
                                                    onChange={
                                                        this.fareTypeSelection
                                                    }
                                                >
                                                    {MINIMUM_FARE_TYPE.map(
                                                        data => {
                                                            return (
                                                                <Select.Option
                                                                    key={
                                                                        data.value
                                                                    }
                                                                    value={
                                                                        data.value
                                                                    }
                                                                >
                                                                    {data.name}
                                                                </Select.Option>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.minimumFare" defaultMessage="Minimum Fare" />}
                                                    message={
                                                        <span>
                                                            <IntlMessages id="app.faremanagement.minimumFareMessage1" defaultMessage="The Minimum Fare charged to a customer for taking a ride." />
                                                            <br />
                                                            <IntlMessages id="app.faremanagement.minimumFareMessage2" defaultMessage="Charged when sum of unlock fees, reserved fare, time fare, distance fare and pause fare is less than the minimum fare." />
                                                        </span>
                                                    }
                                                    unit={`(${DEFAULT_BASE_CURRENCY})`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator("baseFare", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.addBaseFare" defaultMessage="Please add Base Fare!" />
                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagement.invalidBaseFare" defaultMessage="Invalid Base Fare!" />
                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Base Fare"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.faremanagement.parkingFine" defaultMessage="Parking Fine" />}
                                                    message={<IntlMessages id="app.faremanagement.photoNotUploadedMessage" defaultMessage="Customer will be charged, if parking photo is not uploaded." />}
                                                    unit={`(${DEFAULT_BASE_CURRENCY})`}
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator("parkingFine", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.addParkingFine" defaultMessage="Please add parking fine!" />
                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagement.invalidParkingFine" defaultMessage="Invalid Parking Fine!" />

                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Parking Fine"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col> */}
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.unlockFree" defaultMessage="Unlock Fees" />}
                                                    message={<IntlMessages id="app.faremanagement.customerIsChargedWhenVehicle" defaultMessage="Customer is charged when vehicle is unlocked on starting the ride." />}
                                                    unit={`(${DEFAULT_BASE_CURRENCY})`}
                                                    placement="topRight"
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator("unlockFees", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.pleaseAddUnlockFees" defaultMessage="Please add Unlock fees!" />

                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagement.invalidUnlockFees" defaultMessage="Invalid Unlock Fees!" />

                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Unlock Fees"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item
                                            label={
                                                <ESInfoLabel
                                                    label={<IntlMessages id="app.rideDeposit" defaultMessage="Ride Deposit" />}
                                                    message={<IntlMessages id="app.faremanagement.customerIsChargedOnStartRide" defaultMessage="Customer is charged on starting the ride and later will be refunded in ending ride." />}
                                                    unit={`(${DEFAULT_BASE_CURRENCY})`}
                                                    placement="topRight"
                                                />
                                            }
                                            hasFeedback
                                        >
                                            {getFieldDecorator("rideDeposit", {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: <IntlMessages id="app.faremanagement.pleaseAddRideDeposit" defaultMessage="Please add Ride Deposit!" />
                                                    },
                                                    {
                                                        pattern: new RegExp(
                                                            DECIMAL_NUMBER_REG_EXP
                                                        ),
                                                        message: <IntlMessages id="app.faremanagement.invalidRideDeposit" defaultMessage="Invalid Ride Deposit!" />

                                                    }
                                                ]
                                            })(
                                                <InputNumber
                                                    placeholder="Ride Deposit"
                                                    step={0.1}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24} className="gx-text-right">
                                        <span className="topbarCommonBtn">
                                            <Button
                                                style={{
                                                    display: "inline-flex"
                                                }}
                                                type="primary"
                                                htmlType="submit"
                                            >
                                                Update
                                            </Button>
                                        </span>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </CustomScrollbars>
                </div>
            </Spin>
        );
    }
}

const WrappedFareManagementUpsert = Form.create({
    name: "fareManementUpsertForm"
})(FareUpsertTable);

export default WrappedFareManagementUpsert;
