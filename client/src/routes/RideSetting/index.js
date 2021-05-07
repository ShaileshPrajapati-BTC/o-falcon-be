/* eslint-disable max-lines-per-function */
import { Button, Col, Form, Input, InputNumber, Row, Spin, message, Switch, TimePicker } from 'antd';
import React, { Component } from 'react';
import CustomScrollbars from '../../util/CustomScrollbars';
import { SETTING_TYPE, DEFAULT_DISTANCE_UNIT, PAGE_PERMISSION, RIDER_LABEL, DECIMAL_NUMBER_REG_EXP, DEFAULT_BASE_CURRENCY, ZONE_LABEL, MINIMUM_AGE_VISIBLE, BOOKING_PASS_VISIBLE, DAILY_LIGHT_ON_OFF, WORKING_HOURS_VISIBLE, IS_PARKING_FINE_FEATURE } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import ESInfoLabel from '../../components/ESInfoLabel';
import moment from 'moment';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
const format = 'HH:mm';

class RideSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            isCaptureParkingImage: 0
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/settings', { type: SETTING_TYPE.RIDE });
            let record = response.data;
            const formObj = _.omit(record, ['id', 'startWorkingTime', 'endWorkingTime', 'lightOnTime', 'lightOffTime']);
            if (record.startWorkingTime) {
                formObj.startWorkingTime = moment(record.startWorkingTime, format);
            } else {
                formObj.startWorkingTime = moment('00:00');
            }
            if (record.endWorkingTime) {
                formObj.endWorkingTime = moment(record.endWorkingTime, format);
            } else {
                formObj.endWorkingTime = moment('23:59');
            }
            if (record.lightOnTime) {
                formObj.lightOnTime = moment(record.lightOnTime);
            }
            if (record.lightOffTime) {
                formObj.lightOffTime = moment(record.lightOffTime);
            }
            const { form } = this.props;
            form.setFieldsValue(formObj);
            this.setState({ loading: false, isCaptureParkingImage: record.isCaptureParkingImage });
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    handleUpsert = async () => {
        const { form } = this.props;

        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            values.startWorkingTime = UtilService.displayTime(values.startWorkingTime, true)
            values.endWorkingTime = UtilService.displayTime(values.endWorkingTime, true)
            let obj = values;
            console.log('values :>> ', values);

            try {
                let response = await axios.put(`/admin/settings/${SETTING_TYPE.RIDE}`, obj);
                console.log('response', response);
                message.success(`${response.message}`);
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(`${error.message}`);
            }
        });
    };

    minAgeValidation = (rule, value, callback) => {
        console.log('value', value);
        if (!value || value <= 0 || value > 99) {
            callback("Age should be between 0-99.");
        } else {
            callback();
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading, isCaptureParkingImage } = this.state;
        const basicRadiusLabel = `Basic Radius (${DEFAULT_DISTANCE_UNIT})`;
        const unlockRadiusLabel = 'Unlock Radius (m)';

        //update permission
        const hasPermission = this.props.auth.authUser.accessPermission;
        const pageIndex = PAGE_PERMISSION.RIDE_SETTING;
        const getIndex = (el) => el.module === pageIndex;
        const index = hasPermission.findIndex(getIndex);
        const updatePermission = pageIndex && hasPermission[index] && hasPermission[index].permissions ? hasPermission[index].permissions.update : false;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading"><IntlMessages id="app.rideSetting" defaultMessage="Ride Setting" /></h1>
                        {updatePermission && <Row>
                            <div >
                                <Button type="primary" style={{ marginRight: '10px' }}
                                    onClick={this.handleUpsert}>{<IntlMessages id="app.update" defaultMessage="Update" />}
                                </Button>
                            </div>
                        </Row>}
                    </Row>
                </div>

                <br></br>

                <Spin spinning={loading} delay={100}>
                    <div className="gx-module-box-content">
                        <CustomScrollbars className="gx-module-content-scroll">
                            <div className="gx-mt-3">
                                <Form layout="vertical"
                                >
                                    <Row type="flex" justify="start">
                                        {/* User*/}
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={basicRadiusLabel}
                                                    isRequiredField={true}
                                                    message={<span><IntlMessages id="app.rideSetting.inTheMobileApp" defaultMessage="In the mobile app," /> {RIDER_LABEL} <IntlMessages id="app.rideSetting.willSeeOnlyThoseVehicles" defaultMessage="will see only those vehicles located within the set proximity." /></span>}
                                                />}
                                            >
                                                {getFieldDecorator('basicRadius', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.rideSetting.addBasicRadius" defaultMessage="Please add basic radius" />
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={1} placeholder="basic radius" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={<IntlMessages id="app.rideSetting.rideReserveTimeLimitMin" defaultMessage="Ride Reserve Time Limit(min)" />}
                                                    isRequiredField={true}
                                                    message={<span><IntlMessages id="app.rideSetting.aVehicleRemainsReserved" defaultMessage="A vehicle remains reserved for a" /> {RIDER_LABEL} <IntlMessages id="app.rideSetting.forTheSetTimeLimit" defaultMessage="for the set time limit." /></span>}
                                                />}
                                            >
                                                {getFieldDecorator('rideReserveTimeLimit', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.rideSetting.addRideReserveTimeLimit" defaultMessage="Please add ride reserve time limit" />

                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={1} placeholder="Ride Reserve Time Limit" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={<IntlMessages id="app.minimumBatteryLevel" defaultMessage="Minimum Battery Level" />}
                                                    message={<span><IntlMessages id="app.rideSetting.vehicleWithLessBatteryLevel" defaultMessage="Vehicles with less battery level will not be available to" /> {RIDER_LABEL}.</span>}
                                                />}
                                            >
                                                {getFieldDecorator('minBatteryLevel', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={1} max={100} placeholder="Minimum Battery Level" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row type="flex" justify="start">
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={<IntlMessages id="app.rideSetting.pauseTimeLimitInMin" defaultMessage="Pause Time Limit(in min)" />}
                                                    message={<IntlMessages id="app.rideSetting.pauseTimeLimitMessage" defaultMessage=" A vehicle can be paused while riding only for the set time limit." />}
                                                />}>
                                                {getFieldDecorator('pauseTimeLimit', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={1} placeholder="Pause Time Limit" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={<IntlMessages id="app.rideSetting.rideReserveTimeFreeLimit" defaultMessage="Ride Reserve Time Free Limit" />}
                                                    message={<IntlMessages id="app.rideSetting.noReservationChargeWill" defaultMessage="No reservation charge will be applied for the first X minutes of Reservation. It is a percentage of the Ride Reserve Time Limit." />}
                                                />}
                                            >
                                                {getFieldDecorator('rideReserveTimeFreeLimit', {
                                                    type: 'number',
                                                    initialValue: '0',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={0}
                                                        max={100}
                                                        placeholder="Ride Reserve Time Free Limit"
                                                        // type="number"
                                                        formatter={(value) => {
                                                            return `${value}%`;

                                                        }}
                                                        parser={(value) => {
                                                            return value.replace('%', '');

                                                        }}
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={unlockRadiusLabel}
                                                    message={<span>{RIDER_LABEL} <IntlMessages id="app.rideSetting.canUnlockAVehicleOnly" defaultMessage="can unlock a vehicle only when they are inside the unlock proximity." /></span>}
                                                />}
                                            >
                                                {getFieldDecorator('unlockRadius', {
                                                    type: 'number',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.rideSetting.addUnlockRadius" defaultMessage="Please add unlock radius" />
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={0} placeholder="unlock radius" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {/* <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<ESInfoLabel
                                                    label={<span><IntlMessages id="app.rideSetting.fareForAuto" defaultMessage="Fare for Auto" /> {ZONE_LABEL} ({DEFAULT_BASE_CURRENCY}/<IntlMessages id="app.min" defaultMessage="min" />)</span>}
                                                    message={`Fare applied on rides taken in system created ${ZONE_LABEL}.`}
                                                />}
                                            >
                                                {getFieldDecorator('minFareForNewZone', {
                                                    type: 'number',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: <IntlMessages id="app.rideSetting.addUnlockRadius" defaultMessage="Please add unlock radius" />
                                                        },
                                                        {
                                                            pattern: new RegExp(DECIMAL_NUMBER_REG_EXP),
                                                            message: <IntlMessages id="app.rideSetting.invalidFareValue" defaultMessage="Invalid Fare Value!" />
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={0} placeholder="unlock radius" />
                                                )}
                                            </Form.Item>
                                        </Col> */}
                                        {
                                            WORKING_HOURS_VISIBLE &&
                                            <>
                                                <Col lg={4} md={4} sm={6} xs={12}>
                                                    <Form.Item
                                                        label={<ESInfoLabel
                                                            label="Working Time"
                                                            message='Working Time'
                                                        />}
                                                    >
                                                        {getFieldDecorator('startWorkingTime', {
                                                            type: 'number',
                                                            rules: [
                                                                // {
                                                                //     required: false,
                                                                //     message: <IntlMessages id="app.rideSetting.addUnlockRadius" defaultMessage="Please add unlock radius" />
                                                                // },
                                                            ]
                                                        })(
                                                            <TimePicker
                                                                format={format}
                                                            />,
                                                        )}

                                                    </Form.Item>
                                                </Col>
                                                <Col lg={4} md={4} sm={6} xs={12} style={{ marginTop: 25 }}>
                                                    <Form.Item
                                                        label=''
                                                    >
                                                        {getFieldDecorator('endWorkingTime', {
                                                            type: 'number',
                                                            rules: [
                                                                // {
                                                                //     required: false,
                                                                //     message: <IntlMessages id="app.rideSetting.addUnlockRadius" defaultMessage="Please add unlock radius" />
                                                                // },
                                                            ]
                                                        })(
                                                            <TimePicker
                                                                format={format}
                                                            />,
                                                        )}

                                                    </Form.Item>
                                                </Col>
                                            </>
                                        }
                                        {
                                            DAILY_LIGHT_ON_OFF &&
                                            <>
                                                <Col lg={4} md={4} sm={6} xs={12}>
                                                    <Form.Item
                                                        label={<ESInfoLabel
                                                            label="Light On Time"
                                                            message='Light On Time'
                                                        />}
                                                    >
                                                        {getFieldDecorator('lightOnTime', {
                                                            type: 'number',
                                                            rules: [
                                                                {
                                                                    required: false,
                                                                    message: 'Please add light on time'
                                                                },
                                                            ]
                                                        })(
                                                            <TimePicker
                                                                format={format}
                                                            />,
                                                        )}

                                                    </Form.Item>
                                                </Col>
                                                <Col lg={4} md={4} sm={6} xs={12}>
                                                    <Form.Item
                                                        label='Light Off Time'
                                                    >
                                                        {getFieldDecorator('lightOffTime', {
                                                            type: 'number',
                                                            rules: [
                                                                {
                                                                    required: false,
                                                                    message: 'Please add light off time'
                                                                },
                                                            ]
                                                        })(
                                                            <TimePicker
                                                                format={format}
                                                            />,
                                                        )}

                                                    </Form.Item>
                                                </Col>
                                            </>
                                        }
                                        {
                                            MINIMUM_AGE_VISIBLE && <>
                                                <Col lg={8} md={8} sm={12} xs={24}>
                                                    <Form.Item
                                                        label={<ESInfoLabel
                                                            label={<IntlMessages id="app.minimumAge" defaultMessage="Minimum Age" />}
                                                            message={<IntlMessages id="app.rideSetting.minimumAgeMessage" defaultMessage="The age of the customer extracted from the Photo ID will be verified with this minimum age." />}
                                                        />}
                                                    >
                                                        {getFieldDecorator('minAgeRequired', {
                                                            type: 'number',
                                                            rules: [
                                                                {
                                                                    validator: this.minAgeValidation
                                                                }
                                                            ]
                                                        })(
                                                            <InputNumber placeholder="Minimum Age Limit" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </>
                                        }
                                    </Row>

                                    <Row type="flex" justify="start">
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item>
                                                <ESInfoLabel
                                                    label={<b><IntlMessages id="app.rideSetting.scooterUsedLimitInMinutes" defaultMessage="Scooter Used Limit (in Minutes)" /></b>}
                                                    message={<IntlMessages id="app.rideSetting.scooterStatisticsInTheDashboard" defaultMessage="Scooter Statistics in the Dashboard are decided based on these parameters." />}
                                                />
                                            </Form.Item>
                                            <Form.Item label="High">
                                                {getFieldDecorator('scooterUsedLimit.high', {
                                                    type: 'number',
                                                    initialValue: '2',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={2}
                                                        placeholder="High"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>
                                            <Form.Item label="Average">
                                                {getFieldDecorator('scooterUsedLimit.average', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="Average"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>

                                            <Form.Item label="Low">
                                                {getFieldDecorator('scooterUsedLimit.low', {
                                                    type: 'number',
                                                    initialValue: '0',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="Low"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item>
                                                <ESInfoLabel
                                                    label={<b><IntlMessages id="app.bookingHabitsRideLimit" defaultMessage="Booking Habits Ride Limit" /></b>}
                                                    message={<IntlMessages id="app.rideSetting.bookingHabitsRideLimitMessage" defaultMessage="Shades of booking in the Booking Habits section in the Dashboard are decided on these parameters." />}
                                                />
                                            </Form.Item>
                                            <Form.Item label={<IntlMessages id="app.high" defaultMessage="High" />}>
                                                {getFieldDecorator('bookingHabitsRideLimit.high', {
                                                    type: 'number',
                                                    initialValue: '2',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={2}
                                                        placeholder="High"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>
                                            <Form.Item label={<IntlMessages id="app.average" defaultMessage="Average" />}>
                                                {getFieldDecorator('bookingHabitsRideLimit.average', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="Average"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>

                                            <Form.Item label={<IntlMessages id="app.low" defaultMessage="Low" />}>
                                                {getFieldDecorator('bookingHabitsRideLimit.low', {
                                                    type: 'number',
                                                    initialValue: '0',
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message: ''
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="Low"
                                                        disabled={!updatePermission}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {IS_PARKING_FINE_FEATURE && isCaptureParkingImage !== 0 &&
                                            <Col lg={8} md={8} sm={12} xs={24}>
                                                <Form.Item>
                                                    <ESInfoLabel
                                                        label={<b><IntlMessages id="app.rideSetting.scooterParkingImage" defaultMessage="Parking funtionality enabled?" /></b>}
                                                        message={<IntlMessages id="app.rideSetting.scooterParkingImageInfo" defaultMessage="Enable/Disable parking functionality." />}
                                                    />
                                                </Form.Item>
                                                <Form.Item label="Parking">
                                                    {getFieldDecorator('isCaptureParkingImage', {})(
                                                        <Switch defaultChecked={isCaptureParkingImage} />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        }
                                    </Row>
                                </Form>
                            </div>
                        </CustomScrollbars >
                    </div>
                </Spin >


            </div >
        );
    }
}


const WrappedSettingModal = Form.create({ name: 'settingform' })(RideSetting);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedSettingModal);
