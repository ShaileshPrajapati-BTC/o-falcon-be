import { Avatar, Button, Card, Col, Form, Input, Row, Tabs, Tooltip, Upload, message, DatePicker, Radio } from 'antd';
import React, { Component } from 'react';
import { FILE_TYPES, USER_TYPES, FRANCHISEE_VISIBLE, CLIENT_VISIBLE, PARTNER_WITH_CLIENT_FEATURE } from '../../constants/Common';
import PasswordForm from '../../components/PasswordForm';
import { USER_DATA } from '../../constants/ActionTypes';
import UtilService from '../../services/util';
import UtilLocalService from '../../services/localServiceUtil';
import BankDetails from '../Franchisee/bankDetail';
import Document from '../Franchisee/document';

import axios from 'util/Api';
import { connect } from 'react-redux';
import moment from 'moment';
import ESBankDetail from '../../components/ESBankDetail';
import ESDocument from '../../components/ESDocument';
import IntlMessages from '../../util/IntlMessages';

const TabPane = Tabs.TabPane;
const _ = require('lodash');

const ProfileForm = Form.create({ name: 'ProfileForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        state = {
            data: []
        };
        disabledDate = (current) => {
            return current > moment().endOf('day');
        };
        onDateChange = async (rule, value, callback) => {
            if (value) {
                let today = new Date();
                let nowyear = today.getFullYear();
                let nowmonth = today.getMonth();
                let nowday = today.getDate();

                let birth = new Date(value);
                let birthyear = birth.getFullYear();
                let birthmonth = birth.getMonth();
                let birthday = birth.getDate();

                let age = nowyear - birthyear;
                let age_month = nowmonth - birthmonth;
                let age_day = nowday - birthday;

                if ((age == 18 && age_month <= 0 && age_day <= 0) || age < 18 || age > 99) {
                    await callback(<IntlMessages id="app.user.ageValidationMsg" defaultMessage="Your age must be between 18-99.!" />)
                } else {
                    await callback()
                }
            }
        };

        render() {
            const {
                form, updateProfile, isFranchiseeType, authUser
            } = this.props;
            const { getFieldDecorator } = form;

            let showInviteCode = authUser.type === USER_TYPES.DEALER ||
                authUser.type === USER_TYPES.FRANCHISEE && PARTNER_WITH_CLIENT_FEATURE;

            return (
                <Form layout="vertical" className="m-v-15">
                    <Form.Item>
                        <Form.Item label={<IntlMessages id="app.user.nameHolder" defaultMessage="First Name" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('firstName', {
                                rules: [
                                    { whitespace: true, message: <IntlMessages id="app.user.nameSpaceMsg" defaultMessage="Can't be empty." /> },
                                    { required: true, message: <IntlMessages id="app.user.nameRequiredMsg" defaultMessage="Please add first name!" /> }
                                ]
                            })(
                                <Input placeholder="First Name" disabled={true} autoComplete="disabled" />
                            )}
                        </Form.Item>
                        <Form.Item label={<IntlMessages id="app.user.lastNameHolder" defaultMessage="Last Name" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('lastName', {
                                rules: [
                                    { required: true, message: <IntlMessages id="app.user.lastNameRequiredMsg" defaultMessage="Please add last name" /> }
                                ]
                            })(
                                <Input placeholder="Last Name" disabled={true} autoComplete="disabled" />
                            )}
                        </Form.Item>
                        <Form.Item label={<IntlMessages id="app.email" defaultMessage="E-mail" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: <IntlMessages id="app.invalidEmail" defaultMessage="Invalid E-mail Id!" />
                                }, { required: true, message: <IntlMessages id="app.emailRequiredMsg" defaultMessage="Please add email" /> }]
                            })(
                                <Input placeholder="E-mail" disabled={true} autoComplete="disabled" />
                            )}
                        </Form.Item>
                        <Form.Item label={<IntlMessages id="app.user.codeLabel" defaultMessage="Code" />}
                            style={{ width: '5%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('countryCode', {
                                rules: [
                                    { transform: (value) => { return value && value.trim(); } },
                                ]
                            })(
                                <Input placeholder="+1" autoComplete="disabled" />
                            )}
                        </Form.Item>
                        <Form.Item label={<IntlMessages id="app.mobile" defaultMessage="Mobile" />}
                            style={{ width: '20%', paddingLeft: '10px', display: 'inline-block' }} hasFeedback>
                            {getFieldDecorator('mobile', {
                                rules: [
                                    { required: true, message: <IntlMessages id="app.user.mobileRequiredMsg" defaultMessage="Please add valid mobile!" /> },
                                    {
                                        pattern: new RegExp('^[1-9][0-9]*$'),
                                        message: <IntlMessages id="app.user.mobileValidationMsg" defaultMessage="First digit can't be 0!" />
                                    },
                                    {
                                        transform: (value) => {
                                            return value && value.trim();
                                        }
                                    },
                                    {
                                        pattern: new RegExp('^[0-9]{3,10}$'),
                                        message: <IntlMessages id="app.user.invalidMobile" defaultMessage="Invalid Mobile!" />
                                    }
                                ]
                            })(
                                <Input placeholder="Mobile" autoComplete="disabled" />
                            )}
                        </Form.Item>
                        {authUser.type === USER_TYPES.FRANCHISEE && <Form.Item label={<IntlMessages id="app.user.codeLabel" defaultMessage="Code" />} style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }} hasFeedback>
                            {getFieldDecorator('seriesCode', {
                                getValueFromEvent: e => e.target.value.toUpperCase().trim(),
                                rules: [{
                                    required: true,
                                    message: <IntlMessages id="app.partner.codeRequiredMsg" defaultMessage="Please add code!" />
                                }, {
                                    max: 3,
                                    message: <IntlMessages id="app.partner.codeMaxLimitMsg" defaultMessage="Code must be max 3 characters." />
                                }]
                            })(
                                <Input placeholder="Enter Code" />
                            )}
                        </Form.Item>}
                        < Form.Item label={< IntlMessages id="app.uniqueIdentityNumber" defaultMessage="Unique Identity Number" />} style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {
                                getFieldDecorator('uniqueIdentityNumber', {
                                    rules: [{
                                        required: authUser.type === USER_TYPES.FRANCHISEE ? true : false,
                                        message: <IntlMessages id="app.user.uniqueIdentityRequiredMsg" defaultMessage="Please add Unique Identity Number!" />
                                    }, {
                                        min: 3,
                                        message: <IntlMessages id="app.user.uniqueIdentityMinLimitMsg" defaultMessage="Unique Identity Number must be at least 3 characters." />
                                    },
                                    {
                                        max: 20,
                                        message: <IntlMessages id="app.user.uniqueIdentityMaxLimitMsg" defaultMessage="Unique Identity Number must be max 20 characters." />
                                    }, {
                                        pattern: /^([a-zA-Z0-9]+)$/,
                                        message: <IntlMessages id="app.user.noSpaceMsg" defaultMessage="No space allowed!" />
                                    }, {
                                        pattern: /^([a-zA-Z0-9]+)$/,
                                        message: <IntlMessages id="app.user.onlyAlphanumericMsg" defaultMessage="Only Alphanumeric allowed!" />
                                    }]
                                })(
                                    <Input placeholder="Unique Identity Number" />
                                )}
                        </Form.Item >
                        {
                            showInviteCode && <Form.Item label={<IntlMessages id="app.partner.invalidCode" defaultMessage="Invite Code" />} style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                {getFieldDecorator('inviteCode', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.partner.invalidCodeRequiredMsg" defaultMessage="Please add Invite Code!" />
                                    }, {
                                        min: 3,
                                        message: <IntlMessages id="app.partner.invalidCodeMinLimitMsg" defaultMessage="Invite Code must be at least 3 characters." />
                                    },
                                    {
                                        max: 20,
                                        message: <IntlMessages id="app.partner.invalidCodeMaxLimitMsg" defaultMessage="Invite Code must be max 20 characters." />
                                    }, {
                                        pattern: /^([a-zA-Z0-9]+)$/,
                                        message: <IntlMessages id="app.partner.invalidCodeSpaceMsg" defaultMessage="No space allowed!" />
                                    }, {
                                        pattern: /^([a-zA-Z0-9]+)$/,
                                        message: <IntlMessages id="app.partner.invalidCodePatternMsg" defaultMessage="Only Alphanumeric allowed!" />
                                    }]
                                })(
                                    <Input placeholder="Invite Code" />
                                )}
                            </Form.Item>
                        }

                        {
                            (authUser.type !== USER_TYPES.FRANCHISEE && authUser.type !== USER_TYPES.DEALER) &&
                            <Form.Item label={<IntlMessages id="app.gender" defaultMessage="Gender" />} style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                {getFieldDecorator('gender', {
                                })(
                                    <Radio.Group>
                                        <Radio value={1}><IntlMessages id="app.male" defaultMessage="Male" /></Radio>
                                        <Radio value={2}><IntlMessages id="app.female" defaultMessage="Female" /></Radio>
                                        <Radio value={3}><IntlMessages id="app.other" defaultMessage="Other" /></Radio>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        }
                        {
                            (authUser.type !== USER_TYPES.FRANCHISEE && authUser.type !== USER_TYPES.DEALER) &&
                            <Form.Item label={<IntlMessages id="app.dob" defaultMessage="DOB" />} style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }} hasFeedback>
                                {getFieldDecorator('dob', {
                                    rules: [{
                                        required: false,
                                        message: <IntlMessages id="app.user.dobRequiredMsg" defaultMessage="Please select date of birth!" />
                                    }, {
                                        validator: this.onDateChange,
                                    }]
                                })(
                                    <DatePicker
                                        disabledDate={this.disabledDate}
                                        allowClear={false}
                                        placeholder={'Select Date'}
                                        showToday={false}
                                    />
                                )}
                            </Form.Item>
                        }
                    </Form.Item >

                    <Form.Item>
                        <Form.Item label={<IntlMessages id="app.user.address1Label" defaultMessage="Address 1" />}
                            style={{ width: '50%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('address.line1', {
                                rules: [{
                                    required: authUser.type === USER_TYPES.FRANCHISEE ? true : false,
                                    message: <IntlMessages id="app.partner.addressRequiredMsg" defaultMessage="Please add Address!" />
                                }, { max: 50, message: <IntlMessages id="app.user.addressValidationMsg" defaultMessage="Address cannot be larger then 50 character" /> }]
                            })(
                                <Input placeholder="Line 1" autoComplete="disabled" />
                            )}
                        </Form.Item>

                        <Form.Item label={<IntlMessages id="app.user.address2Label" defaultMessage="Address 2" />}
                            style={{ width: '50%', paddingLeft: '10px', display: 'inline-block' }
                            }>
                            {getFieldDecorator('address.line2')(
                                <Input placeholder="Line 2" autoComplete="disabled" />
                            )}
                        </Form.Item >
                    </Form.Item >

                    <Form.Item>
                        <Form.Item
                            className="inlineRow"
                            label={<IntlMessages id="app.user.countryLabel" defaultMessage="Country" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator("address.country")(
                                <Input placeholder="Country" autoComplete="disabled" />
                            )}
                        </Form.Item>
                        <Form.Item
                            className="inlineRow"
                            label={<IntlMessages id="app.user.stateLabel" defaultMessage="State" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }
                            }>
                            {getFieldDecorator('address.state')(
                                <Input placeholder="State" autoComplete="disabled" />
                            )}
                        </Form.Item >
                        <Form.Item
                            className="inlineRow"
                            label={<IntlMessages id="app.user.cityLabel" defaultMessage="City" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {getFieldDecorator('address.city')(
                                <Input placeholder="City" autoComplete="disabled" />
                            )}
                        </Form.Item >
                        <Form.Item
                            className="inlineRow"
                            label={<IntlMessages id="app.user.pincodeLabel" defaultMessage="Pin Code" />}
                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                            {
                                getFieldDecorator('address.pinCode', {
                                    rules: [{
                                        required: authUser.type === USER_TYPES.FRANCHISEE ? true : false,
                                        message: <IntlMessages id="app.partner.pinCodeRequiredMsg" defaultMessage="Please add Pin Code!" />
                                    }]
                                })(
                                    <Input placeholder="Pin Code" autoComplete="disabled" />
                                )}
                        </Form.Item >
                    </Form.Item >

                    {/* {
                        isFranchiseeType === USER_TYPES.FRANCHISEE &&
                        <React.Fragment>
                            <Row style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                                <Col span={24}>
                                    City of Operations
                                    </Col>
                            </Row>
                            <Form.Item>
                                <Form.Item
                                    className="inlineRow"
                                    label="Country"
                                    style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                    {getFieldDecorator('franchiseeCountryId.name')(
                                        <Input disabled={true} />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    className="inlineRow"
                                    label="State"
                                    style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                    {getFieldDecorator('franchiseeStateId.name')(
                                        <Input disabled={true} />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    className="inlineRow"
                                    label="City"
                                    style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                    {getFieldDecorator('franchiseeCityId[0].name')(
                                        <Input disabled={true} />
                                    )}
                                </Form.Item>
                            </Form.Item>
                        </React.Fragment>
                    } */}
                    < Row >
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" onClick={updateProfile}><IntlMessages id="app.update" defaultMessage="Update" /></Button>
                        </Col>
                    </Row >
                </Form >
            );
        }
    }
);

const ResetPasswordForm = Form.create({ name: 'resetPasswordForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const {
                form, resetPassword
            } = this.props;

            return (
                <Form layout="vertical">
                    <Row>
                        <Col lg={8} sm={8} md={16} xs={24}>
                            <PasswordForm
                                baseForm={form}
                                passwordField={'newPassword'}
                                confirmField={'confirm'}
                            />
                        </Col>

                        <Col lg={8} sm={8} md={16} xs={24} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" onClick={resetPassword}><IntlMessages id="app.changePassword" defaultMessage="Change Password" /></Button>
                        </Col>
                    </Row>
                </Form>
            );
        }
    }
);

class MyAccount extends Component {
    constructor(props) {
        super(props);

        this.state = {
            profileImage: props.authUser && props.authUser.image,
            data: [],
            imageUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                showUploadList: false,
                action: '/upload-file',
                fileList: [],
                cityOperation: {},
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: ['image'] });
                },
                onChange: (info) => {
                    return this.onFileChange(info, {
                        fieldName: 'image',
                        stateKeyName: 'imageUploadprops'
                    })
                        ;
                }
            }
        };
    }
    componentDidMount = async () => {
        this.handleEditData();
        // await this.getLocation();
    }

    validateFile = function (file, as) {
        let isLess5MB = file.size / 1024 / 1024 < 5;
        let isValidType = FILE_TYPES[as.type[0]].indexOf(file.type) > -1;
        if (!isValidType) {
            message.error('Invalid file type');
        }
        if (!isLess5MB) {
            message.error('File size exceeds 5 MB');
        }
        return file.isValid = isValidType && isLess5MB
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }

        if (info.file && info.file.response && info.file.response.code === 'OK') {
            let { data } = info.file.response;
            this.setState({ profileImage: data.files[0].absolutePath });
        }

        const validFiles = _.filter(info.fileList, { isValid: true }) || [];
        this.setState((state) => {
            state[option.stateKeyName].fileList = validFiles;

            return state;
        });
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };


    saveResetPasswordFormRef = (formRef) => {
        this.formResetPasswordRef = formRef;
    };
    resetPassword = () => {
        const { form } = this.formResetPasswordRef.props;
        const { authUser } = this.props;
        if (authUser && authUser.id) {
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }

                let obj = {
                    id: authUser.id,
                    newPassword: values.newPassword
                };

                axios
                    .post('admin/user/reset-password', obj)
                    .then((data) => {
                        if (data.code === 'OK') {
                            form.resetFields();
                            message.success(`${data.message}`);
                        }
                    })
                    .catch((error) => {
                        console.log('Error****:', error.message);
                        message.success(`${error.message}`);
                    });
            });
        }
    };
    handleEditData = () => {
        let self = this;
        const { form } = self.formRef.props;
        const { authUser } = this.props;
        if (authUser && authUser.id) {
            axios
                .get(`admin/user/${authUser.id}`)
                .then((data) => {

                    if (data.code === 'OK') {
                        self.setState({
                            createModalVisible: true,
                            isEdit: true
                        });
                        let resData = data.data;
                        console.log('........user profile....', resData);
                        // let value = {
                        //     firstName: resData.firstName,
                        //     lastName: resData.lastName,
                        //     type: resData.type,
                        //     image: resData.image
                        // };
                        let value = _.pick(resData, [
                            'type',
                            'firstName',
                            'lastName',
                            'image',
                            'seriesCode',
                            'uniqueIdentityNumber',
                            'gender',
                            'inviteCode'
                        ]);
                        if (resData.addresses && resData.addresses.length) {
                            value.address = _.first(resData.addresses);
                        }

                        if (resData.emails && resData.emails.length) {
                            value.email = UtilService.getPrimaryValue(resData.emails, 'email');
                        }

                        if (resData.mobiles && resData.mobiles.length) {
                            value.mobile = UtilService.getPrimaryValue(resData.mobiles, 'mobile');
                        }
                        if (resData.mobiles && resData.mobiles.length) {
                            value.mobile = UtilService.getPrimaryValue(resData.mobiles, 'mobile');
                        }
                        value.countryCode = resData.mobiles &&
                            resData.mobiles[0] &&
                            resData.mobiles[0].countryCode;
                        if (resData.dob) {
                            value.dob = moment(
                                UtilService.displayUserDOB(resData.dob)
                            );
                        }
                        form.setFieldsValue(value);
                        this.setState({ profileImage: value.image, data: resData })
                        console.log('edit data', form.getFieldsValue());
                    }
                    else {
                        message.success(`${data.message}`);
                    }
                })
                .catch((error) => {
                    console.log('Error****:', error.message);
                    message.success(`${error.message}`);
                });
        }
    };

    updateProfile = () => {
        const { form } = this.formRef.props;
        let self = this;
        const { authUser } = this.props;
        const { profileImage } = this.state;

        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (values.countryCode && values.countryCode !== undefined && values.countryCode.length > 0 && values.countryCode.charAt(0) !== '+') {
                message.error('Please enter country code with + prefix');
                return false;
            }
            let obj = values;
            if (obj.address && _.size(obj.address)) {
                obj.addresses = [];
                obj.addresses.push(obj.address);
                delete obj.address;
            }
            if (obj.dob) {
                obj.dob = moment(obj.dob).format('DD-MM-YYYY');
            } else {
                // error when setting null value even attribute is optional, so solution is empty string
                obj.dob = '';
            }
            if (obj.email && _.size(obj.email) > 0) {
                if (authUser && authUser.emails && authUser.emails.length) {
                    let primaryIndex = _.findIndex(authUser.emails, { isPrimary: true });
                    if (primaryIndex >= 0) {
                        authUser.emails[primaryIndex].email = obj.email;
                        obj.emails = authUser.emails;
                    }
                    else {
                        obj.emails.push({ email: obj.email, isPrimary: true });
                    }
                    delete obj.email;
                }
                else {
                    obj.emails = [{ email: obj.email, isPrimary: true }];
                    delete obj.email;
                }

            }
            if (obj.mobile && _.size(obj.mobile) > 0) {
                if (authUser && authUser.mobiles && authUser.mobiles.length) {
                    let primaryIndex = _.findIndex(authUser.mobiles, { isPrimary: true });
                    if (primaryIndex >= 0) {
                        authUser.mobiles[primaryIndex].mobile = obj.mobile;
                        obj.mobiles = authUser.mobiles;
                    }
                    else {
                        obj.mobiles.push({ mobile: obj.mobile, isPrimary: true });
                    }
                    delete obj.mobile;
                }
                else {
                    obj.mobiles = [{ mobile: obj.mobile, isPrimary: true }];
                    delete obj.mobile;
                }
                if (obj.countryCode === undefined || obj.countryCode === "") {
                    delete obj.mobiles[0].countryCode;
                } else {
                    obj.mobiles[0].countryCode = obj.countryCode;
                }
            }
            else {
                obj.mobiles = [];
            }

            obj.image = profileImage || null;
            // obj = _.omit(obj, ['franchiseeCountryId', 'franchiseeStateId', 'franchiseeCityId'])
            if (authUser && authUser.id) {
                obj.id = authUser.id;
                axios
                    .put(`admin/user/${authUser.id}`, obj)
                    .then((data) => {
                        if (data.code === 'OK' && data.data && data.data.length) {
                            message.success(`${data.message}`);

                            const user = data.data[0];
                            UtilLocalService.setLocalStorage('user', user);
                            self.props.dispatch({ type: USER_DATA, payload: user });
                        }
                    })
                    .catch((error) => {
                        console.log('Error****:', error.message);
                        message.error(`${error.message}`);
                    });
            }
        });
    };

    render() {
        const { authUser } = this.props;
        const { imageUploadprops, profileImage, cityOperation } = this.state;
        let cityName = [];
        { cityOperation && cityOperation.franchiseeCityId && _.each(cityOperation.franchiseeCityId, (city) => { cityName.push(city.name) }) }
        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-content">
                    <div className={'gx-p-5'}>
                        <div className="gx-profile-banner">
                            <div className="gx-profile-container">
                                <div className="gx-profile-banner-top">
                                    <div className="gx-profile-banner-top-left">
                                        <div className="gx-profile-banner-avatar">
                                            <Upload {...imageUploadprops}>
                                                <Tooltip title={'Change Avtar'}>
                                                    <div className={'avtarEditAction'}>
                                                        <Avatar className="gx-size-90"
                                                            alt="..."
                                                            icon="user" src={profileImage}>
                                                            {this.state.data.name}
                                                        </Avatar>
                                                    </div>
                                                </Tooltip>
                                            </Upload>
                                        </div>
                                        <div className="gx-profile-banner-avatar-info">
                                            <h2 className="gx-mb-2 gx-mb-sm-3 gx-fs-xxl gx-font-weight-light gx-text-capitalize">
                                                {this.state.data && this.state.data.firstName ?
                                                    `${this.state.data.firstName} ${this.state.data.lastName}` : ''}
                                            </h2>
                                            <div className="signupDate">
                                                <IntlMessages id="app.signUpDate" defaultMessage="Signup Date" />: {UtilService.displayDate(authUser.createdAt)}
                                            </div>
                                            {/* {cityOperation && cityOperation.franchiseeCityId && <div className="signupDate">
                                                City of Operation:  {cityName.map((city, index) => {
                                                    return (index + 1) + ') ' + city + '   ';
                                                })}
                                            </div>} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gx-profile-content">
                            <Card title=""
                                className="gx-card-tabs gx-card-tabs-right gx-card-profile">
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab={<IntlMessages id="app.user.profile" defaultMessage="Signup Date" />} key="1">
                                        <div className="gx-mb-2">
                                            <ProfileForm
                                                id={authUser.id}
                                                isFranchiseeType={this.props.authUser.type}
                                                wrappedComponentRef={this.saveFormRef}
                                                updateProfile={this.updateProfile.bind(this)}
                                                authUser={this.props.authUser} />
                                        </div>
                                    </TabPane>

                                    <TabPane tab={<IntlMessages id="app.changePassword" defaultMessage="Change Password" />} key="2">
                                        <div className="gx-mb-2">
                                            <ResetPasswordForm
                                                wrappedComponentRef={this.saveResetPasswordFormRef}
                                                resetPassword={this.resetPassword}
                                            />
                                        </div>
                                    </TabPane>
                                    {((authUser.type === USER_TYPES.FRANCHISEE && FRANCHISEE_VISIBLE) || (CLIENT_VISIBLE && authUser.type === USER_TYPES.DEALER)) &&
                                        < TabPane tab={<IntlMessages id="app.partner.bankDetailsLabel" defaultMessage="Bank Details" />} key="3">
                                            {/* <BankDetails id={authUser.id} /> */}

                                            <ESBankDetail id={authUser.id} />

                                        </TabPane>}
                                    {((authUser.type === USER_TYPES.FRANCHISEE && FRANCHISEE_VISIBLE) || (CLIENT_VISIBLE && authUser.type === USER_TYPES.DEALER)) &&
                                        <TabPane tab={<IntlMessages id="app.partner.document" defaultMessage="Document" />} key="4">
                                            {/* <Document id={authUser.id} /> */}

                                            <ESDocument id={authUser.id} />

                                        </TabPane>}
                                </Tabs>
                            </Card>
                        </div>
                    </div>
                </div >
            </div >
        );
    }
}

const mapStateToProps = ({ auth }) => {
    const { authUser } = auth;

    return { authUser };
};

export default connect(mapStateToProps)(MyAccount);
