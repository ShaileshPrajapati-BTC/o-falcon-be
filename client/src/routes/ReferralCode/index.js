/* eslint-disable max-lines-per-function */
import { Button, Col, Form, Input, InputNumber, Row, Spin, message, TimePicker, Checkbox, Select } from 'antd';
import React, { Component } from 'react';
import CustomScrollbars from '../../util/CustomScrollbars';
import { SETTING_TYPE, DEFAULT_DISTANCE_UNIT, PAGE_PERMISSION, RIDER_LABEL, DECIMAL_NUMBER_REG_EXP, DEFAULT_BASE_CURRENCY, ZONE_LABEL, MINIMUM_AGE_VISIBLE, REFERRAL_USER_BENEFIT_TYPE_FILTER } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import ESInfoLabel from '../../components/ESInfoLabel';
import moment from 'moment';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
const format = 'HH:mm';

class ReferralCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            filter: {},
            isActive: false,
            id: ""
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/referral-setting/paginate', this.state.filter);
            console.log('response :>> ', response);
            if (response && response.code === 'OK') {
                let formObj = response.data && response.data.list && response.data.list[0];
                this.setState({ id: formObj && formObj.id, isActive: formObj && formObj.isActive })
                const { form } = this.props;
                form.setFieldsValue(formObj);
            }

            this.setState({ loading: false });
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
            console.log('values :>> ', values);

            try {
                let response = await axios.put(`/admin/referral-setting/${this.state.id}`, values);
                if (response && response.code === 'OK') {
                    message.success(`${response.message}`);
                } else {
                    message.error(`${response.message}`);
                }
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(`${error.message}`);
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading } = this.state;

        //update permission
        const hasPermission = this.props.auth.authUser.accessPermission;
        const pageIndex = PAGE_PERMISSION.REFERRAL_CODE;
        const getIndex = (el) => el.module === pageIndex;
        const index = hasPermission.findIndex(getIndex);
        const updatePermission = pageIndex && hasPermission[index] && hasPermission[index].permissions ? hasPermission[index].permissions.update : false;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading"><IntlMessages id="app.referralCodeSetting" defaultMessage="Referral Code" /></h1>
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
                                <Form layout="vertical">
                                    <Row type="flex" justify="start">
                                        {/* User*/}
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<IntlMessages id="app.referralCode.referredUserBenefitType" defaultMessage="Referred User Benefit Type" />}
                                            >
                                                {getFieldDecorator('referralUserBenefitType', {
                                                    rules: [
                                                        // {
                                                        //     required: true,
                                                        //     message: <IntlMessages id="app.referralCode.referredAmountReqMsg" defaultMessage="Please Add Referred User Amount" />
                                                        // }
                                                    ]
                                                })(
                                                    <Select
                                                        placeholder="Benefit Type"
                                                        disabled={this.state.typeDisable}>
                                                        {REFERRAL_USER_BENEFIT_TYPE_FILTER.map(
                                                            (val) => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.value}
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
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<IntlMessages id="app.referralCode.referredUserAmount" defaultMessage="Referred User Amount" />}
                                            >
                                                {getFieldDecorator('referralUserBenefitValue', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.referralCode.referredAmountReqMsg" defaultMessage="Please Add Referred User Amount" />
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber placeholder="Referred User Amount" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row type="flex" justify="start">
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<IntlMessages id="app.referralCode.invitedUserBenefitType" defaultMessage="Invited User Benefit Type" />}
                                            >
                                                {getFieldDecorator('invitedUserBenefitType', {
                                                    rules: [
                                                        // {
                                                        //     required: true,
                                                        //     message: <IntlMessages id="app.referralCode.referredAmountReqMsg" defaultMessage="Please Add Referred User Amount" />
                                                        // }
                                                    ]
                                                })(
                                                    <Select
                                                        placeholder="Benefit Type"
                                                        disabled={this.state.typeDisable}>
                                                        {REFERRAL_USER_BENEFIT_TYPE_FILTER.map(
                                                            (val) => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.value}
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
                                        <Col lg={8} md={8} sm={12} xs={24}>
                                            <Form.Item
                                                label={<IntlMessages id="app.referralCode.invitedUserAmount" defaultMessage="Invited User Amount" />}
                                            >
                                                {getFieldDecorator('invitedUserBenefitValue', {
                                                    type: 'number',
                                                    initialValue: '1',
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.referralCode.invitedUserAmountReqMsg" defaultMessage="Please add Invited User Amount" />

                                                        }
                                                    ]
                                                })(
                                                    <InputNumber min={1} placeholder="Invited User Amount" disabled={!updatePermission} />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col lg={8} md={8} sm={12} xs={24} style={{ marginTop: 30 }}>
                                            <Form.Item label=" ">
                                                {getFieldDecorator(
                                                    "isActive", {}
                                                )(
                                                    <Checkbox
                                                        disabled
                                                        checked={this.state.isActive}
                                                        onClick={() =>
                                                            this.setState({ isActive: !this.state.isActive })
                                                        }
                                                    ><IntlMessages id="app.referralCode.activateonUpdate" defaultMessage="Activate on Update" /></Checkbox>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </CustomScrollbars>
                    </div>
                </Spin>
            </div >
        );
    }
}


const WrappedReferralCode = Form.create({ name: 'referralCodeSetting' })(ReferralCode);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedReferralCode);
