/* eslint-disable */
import React, { Component } from "react";
import {
    Button,
    Form,
    Input,
    Select,
    Row,
    Typography,
    Col,
    InputNumber,
    Checkbox,
    message,
    Tabs, Radio, Card
} from "antd";
import { connect } from "react-redux";
import axios from "util/Api";
import { VEHICLE_TYPES, FILTER_BY_VEHICLE_TYPE, FRANCHISEE_LABEL } from "../../constants/Setup";
import {
    DEFAULT_API_ERROR,
    EMAIL_VERIFICATION_TYPE,
    USER_LOGIN_TYPES,
    ONLY_NUMBER_REQ_EXP
} from "../../constants/Common";
import DynamicWalletTopUpsField from './DynamicWalletField'
const { Title } = Typography;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

const _ = require("lodash");
class ProjectSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestEmail: [],
            checkedValue: {
                isAutoDeduct: false,
                isMask: false,
                deductOnStartRide: false,
                mailEnableMail: false,
                userEnableMasterOtp: false,
                isWalletEnable: false,
                userIsMobileVerificationRequired: false,
                addDummyScooters: false,
                loginByOtp: false,
                userIsEmailVerificationRequired: false
            },
            isEdit: false
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        const { form } = this.props;

        this.setState({ loading: true });
        try {
            let response = await axios.get(`/admin/config/project`);
            if (response.code === "OK") {
                this.setState({
                    loading: false,
                    data: response.data,
                    isEdit: response.data ? true : false
                });
                let data = response.data;
                let formVal = data;
                this.setState(state => {
                    state.checkedValue.isAutoDeduct = formVal.isAutoDeduct;
                    state.checkedValue.isMask = formVal.isMask;
                    state.checkedValue.deductOnStartRide =
                        formVal.deductOnStartRide;
                    state.checkedValue.mailEnableMail = formVal.mailEnableMail;
                    state.checkedValue.userEnableMasterOtp =
                        formVal.userEnableMasterOtp;
                    state.checkedValue.userIsMobileVerificationRequired =
                        formVal.userIsMobileVerificationRequired;
                    state.checkedValue.isWalletEnable = formVal.isWalletEnable;
                    state.checkedValue.addDummyScooters = formVal.addDummyScooters;
                    state.checkedValue.loginByOtp = formVal.loginByOtp;
                    state.checkedValue.userIsEmailVerificationRequired = formVal.userIsEmailVerificationRequired;
                });
                form.setFieldsValue(formVal);
                if (formVal.walletTopUps && formVal.walletTopUps.length > 0) {
                    let id = 0;
                    let data = { title: [], amount: [], bonusAmount: [], id: [], updatedWalletTopUps: [] }
                    for (let value of formVal.walletTopUps) {
                        let IncrementId = id++
                        data.updatedWalletTopUps.push({ ...value, id: IncrementId })
                        data.title.push(...[value.title])
                        data.amount.push(...[value.amount])
                        data.bonusAmount.push(...[value.bonusAmount])
                        data.id.push(...[IncrementId])
                    }
                    form.setFieldsValue({ walletTopUps: data.updatedWalletTopUps })
                    form.setFieldsValue({ title: data.title, amount: data.amount, bonusAmount: data.bonusAmount, id: data.id })
                }
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false, isEdit: false });
            console.log("ERROR   ", error);
        }
    };

    handleEmail = e => {
        let val = e.target.value.split(",");

        this.setState({
            requestEmail: val
        });
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {

            if (err) {
                return false;
            }
            let obj = values;
            if (obj.walletTopUps.length > 0) {
                const { title, amount, bonusAmount, id } = obj
                const newUpdatedData = title.map((value, i) => {
                    return {
                        title: value,
                        amount: amount[i],
                        bonusAmount: bonusAmount[i],
                        id: id[i]
                    }
                })
                const nonEmptyData = newUpdatedData.filter(el => el.id !== undefined)
                let removeIdFromWalletTopUps = nonEmptyData.map(el => {
                    return {
                        title: el.title,
                        amount: el.amount,
                        bonusAmount: el.bonusAmount
                    }
                })
                obj = _.omit(obj, ['title', 'amount', 'bonusAmount', 'id'])
                obj = { ...obj, walletTopUps: removeIdFromWalletTopUps }
            }
            console.log('obj1', obj)
            let convertToString = [
                obj.defaultMobileNo,
                obj.defaultOtp,
                obj.countryCode,
                obj.currencyCode,
                obj.countryIsoCode
            ];
            Object.keys(obj).map(k => {
                obj[k] = convertToString.includes(obj[k]) && obj[k]
                    ? obj[k].toString()
                    : obj[k];
                obj[k] = typeof obj[k] == "string" ? obj[k].trim() : obj[k];
                return true;
            });

            _.each(FILTER_BY_VEHICLE_TYPE, item => {
                if (obj.defaultVehicleType === item.value) {
                    obj.defaultVehicleTypeArray = item.type;
                }
            });
            obj.supportRequestEmails = _.compact(this.state.requestEmail);

            let url = `/admin/config/project`;
            let method = `put`;

            let walletTopUps = _.map(obj.walletDenominations, x => {
                return parseInt(x)
            });
            obj.walletDenominations = walletTopUps;

            let operationHoursNotificationInterval = _.map(obj.operationHoursNotificationInterval, x => {
                return parseInt(x)
            });
            obj.operationHoursNotificationInterval = operationHoursNotificationInterval;

            let operationHoursSocketEventInterval = _.map(obj.operationHoursSocketEventInterval, x => {
                return parseInt(x)
            });
            obj.operationHoursSocketEventInterval = operationHoursSocketEventInterval;
            
            try {
                let data = await axios[method](url, obj);
                if (data.code === "OK") {
                    message.success(`${data.message}`);
                    this.fetch();
                } else {
                    message.error(`${data.message}`);
                }
            } catch (error) {
                console.log("error", error);
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    };

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { checkedValue, isEdit } = this.state;
        const cardStyle = [{ marginBottom: 0, borderTop: 0 }, { padding: '0px 0px 0px 25px' }, { borderBottom: 0 }]
        return (
            <>
                <div className="gx-module-box gx-module-box-100">
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <div>
                                <Title
                                    level={4}
                                    className="gx-mb-0 gx-d-inline-block"
                                >
                                    Project Config
                                </Title>
                            </div>
                        </Row>
                    </div>

                    <div className="gx-module-box-content">
                        <div className="gx-mt-3 project-config-tab">
                            <Form layout="vertical">
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="General Setting" key="1">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Project Name">
                                                    {getFieldDecorator(
                                                        "projectName"
                                                    )(
                                                        <Input placeholder="Project Name" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Project Url">
                                                    {getFieldDecorator(
                                                        "projectUrl"
                                                    )(
                                                        <Input placeholder="Project Url" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Project Default Mail">
                                                    {getFieldDecorator(
                                                        "projectDefaultMail"
                                                    )(
                                                        <Input placeholder="Project Default Mail" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Mobile No">
                                                    {getFieldDecorator(
                                                        "defaultMobileNo"
                                                    )(
                                                        <InputNumber placeholder="Mobile No" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Mail Subject">
                                                    {getFieldDecorator(
                                                        "defaultMailSubject"
                                                    )(
                                                        <TextArea
                                                            rows={3}
                                                            className="width-100"
                                                            placeholder="Mail Subject"
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Support Request Emails">
                                                    {getFieldDecorator(
                                                        "supportRequestEmails"
                                                    )(
                                                        <TextArea
                                                            rows={3}
                                                            className="width-100"
                                                            placeholder="Support Request Emails"
                                                            onChange={
                                                                this.handleEmail
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Master Password">
                                                    {getFieldDecorator(
                                                        "masterPassword"
                                                    )(
                                                        <Input placeholder="Master Password" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Type">
                                                    {getFieldDecorator(
                                                        "defaultVehicleType"
                                                    )(
                                                        <Select placeholder="Select type">
                                                            {Object.keys(
                                                                VEHICLE_TYPES
                                                            ).map(val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={
                                                                            VEHICLE_TYPES[
                                                                            val
                                                                            ]
                                                                        }
                                                                        value={
                                                                            VEHICLE_TYPES[
                                                                            val
                                                                            ]
                                                                        }
                                                                    >
                                                                        {val.replace(
                                                                            /_/g,
                                                                            " "
                                                                        )}
                                                                    </Select.Option>
                                                                );
                                                            })}
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label={`Username for ${FRANCHISEE_LABEL} List Dropdown`}>
                                                    {getFieldDecorator(
                                                        "ownUsernameForFranchiseeList"
                                                    )(
                                                        <Input placeholder={`Username for ${FRANCHISEE_LABEL} List`} />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={6} sm={12} xs={24}>
                                                <Form.Item label="Ride Subscription Feature">
                                                    {getFieldDecorator(
                                                        "rideSubscriptionFeatureActive"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={6} sm={12} xs={24}>
                                                <Form.Item label="Master App Flow">
                                                    {getFieldDecorator(
                                                        "isMasterAuthFlow"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Book Plan minimun time limit(sec)">
                                                    {getFieldDecorator(
                                                        "bookPlanMinTimeLimitToCheck", {
                                                        rules: [
                                                            {
                                                                pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                                message: 'Enter only number!'
                                                            }
                                                        ]
                                                    }
                                                    )(
                                                        <Input placeholder='Enter time limit..' />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Payment Disabled">
                                                    {getFieldDecorator(
                                                        "paymentDisabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Add Dummy Card">
                                                    {getFieldDecorator(
                                                        "isAddDummyCard"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Nest to Nest Ride Enabled">
                                                    {getFieldDecorator("isNestToNestRideEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="KYC Authantication">
                                                    {getFieldDecorator(
                                                        "kycAuthentication"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            {/* <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Auto Create task">
                                                    {getFieldDecorator(
                                                        "isAutoCreateTask"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col> */}
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Send Email when user created">
                                                    {getFieldDecorator(
                                                        "isSendEmailToNewUsers"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="KYC Testing Driving License Active">
                                                    {getFieldDecorator(
                                                        "kycTestingDrivingLicenseActive"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Test Driving License Number">
                                                    {getFieldDecorator("testDrivingLicenseNumber")
                                                        (<Input placeholder='Driving License Number..' />)}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Show Sub Zone">
                                                    {getFieldDecorator(
                                                        "isShowSubZone"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Nest Claim Type">
                                                    {getFieldDecorator("nestClaimType")
                                                        (<Input placeholder='Nest Clain Type' />)}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Nest Claim Time">
                                                    {getFieldDecorator(
                                                        "nestClaimTime"
                                                    )(
                                                        <InputNumber placeholder="Nest Claim Time" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Create Dummy Zone">
                                                    {getFieldDecorator(
                                                        "createDummyZone"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Rider can add card">
                                                    {getFieldDecorator(
                                                        "riderCanAddCards"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Show Geo Fence In App">
                                                    {getFieldDecorator(
                                                        "showGeoFenceInApp"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Min Fare For New Zone">
                                                    {getFieldDecorator(
                                                        "minFareForNewZone"
                                                    )(
                                                        <InputNumber placeholder="MinFareForNewZone" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Nest Basic Radius">
                                                    {getFieldDecorator(
                                                        "nestBasicRadius"
                                                    )(
                                                        <InputNumber placeholder="Nest Basic Radius" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Current Migration Version">
                                                    {getFieldDecorator(
                                                        "currentMigrationVersion"
                                                    )(
                                                        <InputNumber placeholder="Current Migration Version" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="BookingPass Feature Active">
                                                    {getFieldDecorator(
                                                        "isBookingPassFeatureActive"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Auto Cancel Claim Nest">
                                                    {getFieldDecorator(
                                                        "autoCancelClaimNest"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Project Latest Version">
                                                    {getFieldDecorator(
                                                        "projectLatestVersion"
                                                    )(
                                                        <Input placeholder="Project Latest Version" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Pause RideLimit Enabled">
                                                    {getFieldDecorator(
                                                        "pauseRideLimitEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Max Payment Request Limit">
                                                    {getFieldDecorator(
                                                        "maxPaymentRequestLimit"
                                                    )(
                                                        <InputNumber placeholder="Max Payment Request Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Calculate ParkingFine">
                                                    {getFieldDecorator(
                                                        "calculateParkingFine"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Calculate UnlockFees">
                                                    {getFieldDecorator(
                                                        "calculateUnlockFees"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Daily Light On Off">
                                                    {getFieldDecorator(
                                                        "isDailyLightOnOff"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Max Cron Interval for light OnOff">
                                                    {getFieldDecorator(
                                                        "maxCronInterval"
                                                    )(
                                                        <InputNumber placeholder="Max Cron Interval for light OnOff" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Cron Interval Time for Light OnOff">
                                                    {getFieldDecorator(
                                                        "cronIntervalTimeInMinute"
                                                    )(
                                                        <InputNumber placeholder="Cron Interval Time for Light OnOff" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Referral Enable">
                                                    {getFieldDecorator(
                                                        "isReferralEnable"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Nest Enabled">
                                                    {getFieldDecorator(
                                                        "isNestEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Fire base Api key">
                                                    {getFieldDecorator(
                                                        "firebaseApiKey"
                                                    )(
                                                        <Input placeholder="Fire base Api key" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Android Application Id">
                                                    {getFieldDecorator(
                                                        "androidApplicationId"
                                                    )(
                                                        <Input placeholder="Android Application Id" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="IOS Application Id">
                                                    {getFieldDecorator(
                                                        "iosApplicationId"
                                                    )(
                                                        <Input placeholder="IOS Application Id" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Firebase Domain Uri Prefix">
                                                    {getFieldDecorator(
                                                        "firebaseDomainUriPrefix"
                                                    )(
                                                        <Input placeholder="Firebase Domain Uri Prefix" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="IOS AppStore Id">
                                                    {getFieldDecorator(
                                                        "iosAppStoreId"
                                                    )(
                                                        <Input placeholder="IOS AppStore Id" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={4} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Position PingInterval Enabled ForRide">
                                                    {getFieldDecorator(
                                                        "defaultPositionPingIntervalEnabledForRide"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Position PingInterval ForRide">
                                                    {getFieldDecorator(
                                                        "defaultPositionPingIntervalForRide"
                                                    )(
                                                        <InputNumber placeholder="Default Position PingInterval ForRide" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Use Fare Data Api">
                                                    {getFieldDecorator(
                                                        "isUseFareDataApi"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Time Zone">
                                                    {getFieldDecorator(
                                                        "defaultTimeZone"
                                                    )(
                                                        <Input placeholder="Default Time Zone" />
                                                    )}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Operational Hour Enable">
                                                    {getFieldDecorator(
                                                        "isOperationalHourEnable"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Operation Hours Notification Interval">
                                                    {getFieldDecorator(
                                                        "operationHoursNotificationInterval"
                                                    )(
                                                        <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                                                        {[]}
                                                       </Select>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Operation Hours Socket Interval">
                                                    {getFieldDecorator(
                                                        "operationHoursSocketEventInterval"
                                                    )(
                                                        <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                                                        {[]}
                                                       </Select>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>

                                    <TabPane tab="Verification Setting" key="2">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Email Verification Type">
                                                    {getFieldDecorator(
                                                        "emailVerificationType"
                                                    )(
                                                        <Select placeholder="Select type">
                                                            {EMAIL_VERIFICATION_TYPE.map(
                                                                val => {
                                                                    return (
                                                                        <Select.Option
                                                                            key={
                                                                                val
                                                                            }
                                                                            value={
                                                                                val
                                                                            }
                                                                        >
                                                                            {
                                                                                val
                                                                            }
                                                                        </Select.Option>
                                                                    );
                                                                }
                                                            )}
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Login Type (when loginByOtp true)">
                                                    {getFieldDecorator(
                                                        "userDefaultLoginType"
                                                    )(
                                                        <Select placeholder="Select type">
                                                            {Object.keys(
                                                                USER_LOGIN_TYPES
                                                            ).map(val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={
                                                                            USER_LOGIN_TYPES[
                                                                            val
                                                                            ]
                                                                        }
                                                                        value={
                                                                            USER_LOGIN_TYPES[
                                                                            val
                                                                            ]
                                                                        }
                                                                    >
                                                                        {val.replace(
                                                                            /_/g,
                                                                            " "
                                                                        )}
                                                                    </Select.Option>
                                                                );
                                                            })}
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="User Master Otp">
                                                    {getFieldDecorator(
                                                        "userMasterOtp"
                                                    )(
                                                        <Input placeholder="User Master Otp" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Enable Mail">
                                                    {getFieldDecorator(
                                                        "mailEnableMail"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.mailEnableMail
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.mailEnableMail = !checkedValue.mailEnableMail;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>

                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Email Mask">
                                                    {getFieldDecorator(
                                                        "isMask"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.isMask
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.isMask = !checkedValue.isMask;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="User Mobile Verification Required">
                                                    {getFieldDecorator(
                                                        "userIsMobileVerificationRequired"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.userIsMobileVerificationRequired
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.userIsMobileVerificationRequired = !checkedValue.userIsMobileVerificationRequired;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Login By Otp">
                                                    {getFieldDecorator(
                                                        "loginByOtp"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.loginByOtp
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.loginByOtp = !checkedValue.loginByOtp;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="User Email Verification Required">
                                                    {getFieldDecorator(
                                                        "userIsEmailVerificationRequired"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.userIsEmailVerificationRequired
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.userIsEmailVerificationRequired = !checkedValue.userIsEmailVerificationRequired;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="User Enable Master Otp">
                                                    {getFieldDecorator(
                                                        "userEnableMasterOtp"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.userEnableMasterOtp
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.userEnableMasterOtp = !checkedValue.userEnableMasterOtp;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="Region Setting" key="3">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Country Code">
                                                    {getFieldDecorator(
                                                        "countryCode"
                                                    )(
                                                        <InputNumber placeholder="Country Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Currency Code">
                                                    {getFieldDecorator(
                                                        "currencyCode"
                                                    )(
                                                        <Input placeholder="Currency Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Country Iso Code">
                                                    {getFieldDecorator(
                                                        "countryIsoCode"
                                                    )(
                                                        <Input placeholder="Country Iso Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Currency Symbol">
                                                    {getFieldDecorator(
                                                        "currencySym"
                                                    )(
                                                        <Input placeholder="Currency Sym" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Add Dummy Scooters">
                                                    {getFieldDecorator(
                                                        "addDummyScooters"
                                                    )(
                                                        <Checkbox
                                                            checked={
                                                                checkedValue.addDummyScooters
                                                            }
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => {
                                                                        state.checkedValue.addDummyScooters = !checkedValue.addDummyScooters;
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>

                                    <TabPane tab="Payment Setting" key="4" forceRender={true}>

                                        <Card style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start">

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Stripe Card Verify Amount">
                                                        {getFieldDecorator(
                                                            "stripeCardVerifyAmount"
                                                        )(
                                                            <InputNumber placeholder="Stripe Card Verify Amount" />
                                                        )}
                                                    </Form.Item>
                                                </Col>

                                                <Col lg={8} md={12} sm={12} xs={24} style={{ marginTop: 30 }}>
                                                    <Form.Item label="">
                                                        {getFieldDecorator(
                                                            "isAutoDeduct",
                                                            {
                                                                initialValue:
                                                                    checkedValue &&
                                                                    checkedValue.isAutoDeduct
                                                            }
                                                        )(
                                                            <Checkbox
                                                                checked={
                                                                    checkedValue.isAutoDeduct
                                                                }
                                                                onClick={() =>
                                                                    this.setState(
                                                                        state => {
                                                                            state.checkedValue.isAutoDeduct = !checkedValue.isAutoDeduct;
                                                                        }
                                                                    )
                                                                }
                                                            >Is AutoDeduct</Checkbox>
                                                        )}
                                                    </Form.Item>
                                                </Col>

                                                <Col lg={8} md={12} sm={12} xs={24} style={{ marginTop: 30 }}>
                                                    <Form.Item label="">
                                                        {getFieldDecorator(
                                                            "deductOnStartRide"
                                                        )(
                                                            <Checkbox
                                                                checked={
                                                                    checkedValue.deductOnStartRide
                                                                }
                                                                onClick={() =>
                                                                    this.setState(
                                                                        state => {
                                                                            state.checkedValue.deductOnStartRide = !checkedValue.deductOnStartRide;
                                                                        }
                                                                    )
                                                                }
                                                            >Deduct On Start Ride</Checkbox>
                                                        )}
                                                    </Form.Item>
                                                </Col>

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Noqoody Default Email">
                                                        {getFieldDecorator(
                                                            "noqoodyDefaultEmail"
                                                        )(
                                                            <Input placeholder="Noqoody Default Email" />
                                                        )}
                                                    </Form.Item>
                                                </Col>

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Noqoody Default Mobile">
                                                        {getFieldDecorator(
                                                            "noqoodyDefaultMobile"
                                                        )(
                                                            <Input placeholder="Noqoody Default Mobile" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            
                                            </Row>
                                        </Card>


                                        <Card title={<b>Wallet</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start">
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Wallet Notification Frequency">
                                                        {getFieldDecorator(
                                                            "walletNotificationFrequency"
                                                        )(
                                                            <InputNumber placeholder="Wallet Notification Frequency" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Min Wallet Credit Amount">
                                                        {getFieldDecorator(
                                                            "minWalletCreditAmount"
                                                        )(
                                                            <InputNumber placeholder="Min Wallet Credit Amount" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Max Wallet Credit Amount">
                                                        {getFieldDecorator(
                                                            "maxWalletCreditAmount"
                                                        )(
                                                            <InputNumber placeholder="Max Wallet Credit Amount" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row type="flex" justify="start">
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Min Wallet Notification Amount">
                                                        {getFieldDecorator(
                                                            "minWalletNotificationAmount"
                                                        )(
                                                            <InputNumber placeholder="Min Wallet Notification Amount" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Default Wallet Amount">
                                                        {getFieldDecorator(
                                                            "defaultWalletAmount"
                                                        )(
                                                            <InputNumber placeholder="Default Wallet Amount" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Wallet Denominations">
                                                        {getFieldDecorator(
                                                            "walletDenominations"
                                                        )(
                                                            <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                                                                {[]}
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row type="flex" justify="start">
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Min Wallet Amount For Ride">
                                                        {getFieldDecorator(
                                                            "minWalletAmountForRide"
                                                        )(
                                                            <InputNumber placeholder="Min Wallet Amount For Ride" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24} style={{ marginTop: 30 }}>
                                                    <Form.Item label="">
                                                        {getFieldDecorator(
                                                            "isWalletEnable"
                                                        )(
                                                            <Checkbox
                                                                checked={
                                                                    checkedValue.isWalletEnable
                                                                }
                                                                onClick={() =>
                                                                    this.setState(
                                                                        state => {
                                                                            state.checkedValue.isWalletEnable = !checkedValue.isWalletEnable;
                                                                        }
                                                                    )
                                                                }
                                                            >is Wallet Enable</Checkbox>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row type="flex" justify="start">

                                                <Col lg={24} md={12} sm={12} xs={24}>
                                                    <DynamicWalletTopUpsField form={form} />
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>

                                    <TabPane tab="IOT Setting" key="5">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Max Iot Request Limit">
                                                    {getFieldDecorator(
                                                        "maxIotRequestLimit"
                                                    )(
                                                        <InputNumber placeholder="Max Iot Request Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Max Iot Request Retry Limit">
                                                    {getFieldDecorator(
                                                        "maxIotRequestRetryLimit"
                                                    )(
                                                        <InputNumber placeholder="Max Iot Request Retry Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Iot Request Time Out Limit">
                                                    {getFieldDecorator(
                                                        "iotRequestTimeOutLimit"
                                                    )(
                                                        <InputNumber placeholder="Iot Request Time Out Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Virtual Scooter Project Code">
                                                    {getFieldDecorator(
                                                        "virtualScooterProjectCode"
                                                    )(
                                                        <Input placeholder="Virtual Scooter Project Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Zimo Topic Url">
                                                    {getFieldDecorator(
                                                        "zimoTopicUrl"
                                                    )(
                                                        <Input placeholder="Zimo Topic Url" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Advertise Audio Volume">
                                                    {getFieldDecorator(
                                                        "isAdvertiseEnable"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Advertise Enable">
                                                    {getFieldDecorator(
                                                        "advertiseVolume"
                                                    )(
                                                        <InputNumber placeholder="Audio Volume" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Virtual Scooter Server Url">
                                                    {getFieldDecorator(
                                                        "virtualScooterServerUrl"
                                                    )(
                                                        <Input placeholder="Virtual Scooter Server Url" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Buzz Command Interval">
                                                    {getFieldDecorator(
                                                        "buzzCommandInterval"
                                                    )(
                                                        <InputNumber placeholder="Buzz Command Interval" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Buzz Command Iteration Count">
                                                    {getFieldDecorator(
                                                        "buzzCommandIterationCount"
                                                    )(
                                                        <InputNumber placeholder="Buzz Command Iteration Count" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Outside Zone Command Interval">
                                                    {getFieldDecorator(
                                                        "outsideZoneCommandInterval"
                                                    )(
                                                        <InputNumber placeholder="Outside Zone Command Interval" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Outside Zone Alarm Duration">
                                                    {getFieldDecorator(
                                                        "outSideZoneAlarmDuration"
                                                    )(
                                                        <InputNumber placeholder="Outside Zone Alarm Duration" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Outside Zone Speed Limit">
                                                    {getFieldDecorator(
                                                        "outSideZoneSpeedLimit"
                                                    )(
                                                        <InputNumber placeholder="Outside Zone Speed Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Non Ride Zone Speed Limit">
                                                    {getFieldDecorator(
                                                        "nonRideZoneSpeedLimit"
                                                    )(
                                                        <InputNumber placeholder="Non Ride Zone Speed Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Speed Limit Enabled">
                                                    {getFieldDecorator(
                                                        "defaultVehicleSpeedLimitEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Speed Limit">
                                                    {getFieldDecorator(
                                                        "defaultVehicleSpeedLimit"
                                                    )(
                                                        <InputNumber placeholder="Default Vehicle Speed Limit" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Ping Interval Enabled">
                                                    {getFieldDecorator(
                                                        "defaultPingIntervalEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Ping Interval">
                                                    {getFieldDecorator(
                                                        "defaultPingInterval"
                                                    )(
                                                        <InputNumber placeholder="Default Vehicle Ping Interval" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Ride Ping Interval Enabled">
                                                    {getFieldDecorator(
                                                        "defaultRidePingIntervalEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Ride Ping Interval">
                                                    {getFieldDecorator(
                                                        "defaultRidePingInterval"
                                                    )(
                                                        <InputNumber placeholder="Default Vehicle Ping Interval" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Position Ping Interval Enabled">
                                                    {getFieldDecorator(
                                                        "defaultPositionPingIntervalEnabled"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Default Vehicle Position Ping Interval">
                                                    {getFieldDecorator(
                                                        "defaultPositionPingInterval"
                                                    )(
                                                        <InputNumber placeholder="Default Vehicle Ping Interval" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Get Logs of IMEI">
                                                    {getFieldDecorator(
                                                        "getLogsForImei"
                                                    )(
                                                        <Input placeholder="Get Logs of IMEI" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Get Scooter Callback Logs">
                                                    {getFieldDecorator(
                                                        "getScooterCallbackLogs"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Get Scooter Command Logs">
                                                    {getFieldDecorator(
                                                        "getScooterCommandLogs"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Iot Omni Scooter Code">
                                                    {getFieldDecorator(
                                                        "iotOmniScooterCode"
                                                    )(
                                                        <Input placeholder="Iot Omni Scooter Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Iot Omni Bicycle Code">
                                                    {getFieldDecorator(
                                                        "iotOmniBicycleCode"
                                                    )(
                                                        <Input placeholder="Iot Omni Bicycle Code" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Stop Ride For Outside Zone">
                                                    {getFieldDecorator(
                                                        "isStopRideOutSideZone"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Stop Ride For No Ride Zone">
                                                    {getFieldDecorator(
                                                        "isStopRideForNoRideZone"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="is DeActive Vehicle For No Ride Zone">
                                                    {getFieldDecorator(
                                                        "isDeActiveVehicleForNoRideZone"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="is Set Inch Speed Display Value">
                                                    {getFieldDecorator(
                                                        "isSetInchSpeedDisplayValue"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Scooter Location Change Min Distance">
                                                    {getFieldDecorator(
                                                        "scooterLocationChangeMinDistance"
                                                    )(
                                                        <InputNumber placeholder="Scooter Location Change Min Distance" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Scooter Location Change Max Distance">
                                                    {getFieldDecorator(
                                                        "scooterLocationChangeMaxDistance"
                                                    )(
                                                        <InputNumber placeholder="Scooter Location Change Max Distance" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="End Ride After Specific Time(in min)">
                                                    {getFieldDecorator(
                                                        "endRideAfterSpecificTime"
                                                    )(
                                                        <InputNumber placeholder="End Ride After Specific Time" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Is Ride End After Insufficient Wallet Balance">
                                                    {getFieldDecorator(
                                                        "isRideEndAfterInsufficientWalletBalance"
                                                    )(
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            <Radio value={true}>Yes</Radio>
                                                            <Radio value={false}>No</Radio>
                                                        </Radio.Group>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                </Tabs>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
const WrappedProjectSetting = Form.create({ name: "ProjectSetting" })(
    ProjectSetting
);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedProjectSetting);
