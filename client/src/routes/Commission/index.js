/* eslint-disable max-lines-per-function */
import { Button, Col, Form, InputNumber, Row, message, Select, Icon, Popover } from 'antd';
import React, { Component } from 'react';
import {
    SETTING_TYPE, USER_TYPES, ONLY_NUMBER_REQ_EXP, COMMISSION_TYPE_ARRAY, COMMISSION_TYPE
} from '../../constants/Common';
import { DEFAULT_BASE_CURRENCY } from "../../constants/Setup";
import axios from 'util/Api';
import { connect } from 'react-redux';
import FranchiseeCommissionUpsert from './FranchiseeCommissionUpsert';
import StatusTrack from "./statusTrack";

const _ = require('lodash');

class Commission extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            commissionData: {},
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            loggedInFranchiseeObj: null,
            showStatusTrackModal: false,
            statusTrack: [],
            fetchFranchiseeCommission: false
        };
    }

    componentDidMount() {
        this.fetch();
        if (this.state.loginUser.type === USER_TYPES.FRANCHISEE) {
            this.fetchFranchiseeCommission();
        }
    }

    fetchFranchiseeCommission = async () => {
        try {
            let response = await axios.post('/admin/franchisee/commission-list', {});
            let list = response.data.list;
            let loggedInFranchiseeObj = _.find(list, e => e.franchiseeId.id === this.state.loginUser.id);
            this.setState({
                loggedInFranchiseeObj: loggedInFranchiseeObj
            })
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/settings', { type: SETTING_TYPE.COMMISSION });
            let record = response.data;
            const formObj = _.omit(record, ['id']);
            const { form } = this.props;
            if (record.commissionType === COMMISSION_TYPE.AMOUNT) {
                formObj.commissionValue = record.commissionAmount;
            } else {
                formObj.commissionValue = record.commissionPercentage;
            }
            form.setFieldsValue(formObj);
            this.setState({ loading: false, commissionData: record });
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    handleCommissionSettingUpsert = async () => {
        const { form } = this.props;

        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let commissionUpdateObj = {
                commissionType: values.commissionType
            };
            if (values.commissionType === COMMISSION_TYPE.AMOUNT) {
                commissionUpdateObj.commissionAmount = values.commissionValue;
            } else {
                commissionUpdateObj.commissionPercentage = values.commissionValue;
            }

            console.log('commissionUpdateObj', commissionUpdateObj)
            try {
                let response = await axios.put(`/admin/franchisee/commission/update-all-commissions`, commissionUpdateObj);
                console.log('response', response);
                message.success(`${response.message}`);
                this.handleFetchFranchiseeCommission(true);
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(`${error.message}`);
            }
        });
    };

    handleFetchFranchiseeCommission = (val) => {
        this.setState({
            fetchFranchiseeCommission: val
        });
    }

    statusTrack = value => {
        console.log("status track", value);
        this.setState({ showStatusTrackModal: true, statusTrack: value });
    };
    hideStatusTrack = () => {
        this.setState({ showStatusTrackModal: false });
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { loginUser, loggedInFranchiseeObj, fetchFranchiseeCommission } = this.state;

        let isFranchiseeType = false;
        isFranchiseeType = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;

        let franchiseeCommissionValue = 0;
        let franchiseeCommissionType = '%';
        if (loggedInFranchiseeObj) {
            if (loggedInFranchiseeObj.type === COMMISSION_TYPE.AMOUNT) {
                franchiseeCommissionValue = loggedInFranchiseeObj.amount;
            } else if (loggedInFranchiseeObj.type === COMMISSION_TYPE.PERCENTAGE) {
                franchiseeCommissionValue = loggedInFranchiseeObj.percentage;
            }
            franchiseeCommissionType = loggedInFranchiseeObj.type === COMMISSION_TYPE.PERCENTAGE ? "%" : DEFAULT_BASE_CURRENCY;
        }

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">Commission</h1>
                    </Row>
                </div>

                <br></br>
                {isFranchiseeType && loggedInFranchiseeObj && <div className="gx-module-box-content">
                    <div className="gx-mt-15">
                        <Form layout="vertical">
                            <Row type="flex" justify="start">
                                <Col span={6} >
                                    Current Commission:
                                    {`
                                        ${franchiseeCommissionValue}
                                        ${franchiseeCommissionType}
                                    `}
                                    <div className="scooterIC" style={{ display: 'inline-block', paddingLeft: '15px' }}>
                                        <Popover content="Commission Track" title={null}>
                                            <a href="/#" onClick={(e) => {
                                                e.preventDefault();
                                            }}>
                                                <Icon
                                                    type="profile"
                                                    onClick={this.statusTrack.bind(
                                                        this,
                                                        loggedInFranchiseeObj.track
                                                    )}
                                                />
                                            </a>
                                        </Popover>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>}
                <div className="gx-module-box-content" style={{ display: isFranchiseeType ? 'none' : 'inline-block' }}>
                    <div className="gx-mt-15">
                        <Form layout="vertical">
                            <Row type="flex" justify="start">
                                <Col span={6} >
                                    <Form.Item label="Commission" >
                                        {getFieldDecorator('commissionValue', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: 'Please add amount.'
                                                },
                                                {
                                                    pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                    message: 'Invalid discount!'
                                                }
                                            ]
                                        })(
                                            <InputNumber placeholder="Commission"
                                                max={form.getFieldValue('commissionType') === COMMISSION_TYPE.PERCENTAGE ? 100 : Infinity} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Type" >
                                        {getFieldDecorator('commissionType', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: 'Please add commission type.'
                                                }
                                            ]
                                        })(
                                            <Select width={'100%'} >
                                                {_.map(COMMISSION_TYPE_ARRAY, (item) => {

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
                                <Col span={6}>
                                    <Button type="primary" onClick={this.handleCommissionSettingUpsert} style={{ marginTop: 25 }}>
                                        Update
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                        <FranchiseeCommissionUpsert
                            reFetch={fetchFranchiseeCommission}
                            handleFetchFranchiseeCommission={this.handleFetchFranchiseeCommission}
                        />
                    </div>
                </div>
                <StatusTrack
                    data={this.state.statusTrack}
                    onCancel={this.hideStatusTrack}
                    visible={this.state.showStatusTrackModal}
                />
            </div>
        );
    }
}


const WrappedCommissionModal = Form.create({ name: 'commissionForm' })(Commission);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedCommissionModal);
