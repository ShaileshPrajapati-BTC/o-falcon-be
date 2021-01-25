import { Button, Col, DatePicker, Form, Input, Row, Select, Typography, message, Radio, Upload, Icon, Spin } from 'antd';
import { DEFAULT_API_ERROR, USER_TYPES, LOCATION_TYPE, FILE_TYPES, FRANCHISEE_LABEL, FRANCHISEE_ROUTE, RIDER_ROUTE, PARTNER_WITH_CLIENT_FEATURE } from '../../constants/Common';
import moment from 'moment';
import CustomScrollbars from '../../util/CustomScrollbars';
import { Link } from 'react-router-dom';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import CrudService from '../../services/api';
import IntlMessages from '../../util/IntlMessages';

const { Title } = Typography;
const _ = require('lodash');

class FranchiseeUpsert extends React.Component {
    constructor(props) {
        super(props);

        const { authUser } = props.auth;

        let pathname = window.location.pathname.split('/');
        this.state = {
            route: pathname[2],
            id: props.match.params.id,
            userData: {},
            loading: false,
            parentVisible: false,
            parentUsers: [],
            typeDisable: false,
            locationCountries: [],
            locationStates: [],
            locationCities: [],
            isStateVisible: false,
            isCityVisible: false,
            imageUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                action: `/upload-file`,
                fileList: [],
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'image' });
                },
                onChange: (info) => {
                    return this.onFileChange(info, { fieldName: 'document', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        };
    }
    componentDidMount() {
        const { form } = this.props;

        if (!_.isArray(this.props.location.type)) {
            // this.getLocations({
            //     filter: {
            //         type: LOCATION_TYPE.COUNTRY
            //     }
            // });
            form.setFieldsValue({ type: this.props.location.type });

        }
        if (this.state.id) {
            this.fetch(this.state.id);

            return;
        }
        // using customer static for now.
        if (this.state.route === RIDER_ROUTE) {
            this.setState({
                typeDisable: true
            });
        } else {
            this.setState({
                typeDisable: false
            });
        }
    }
    fetch = (id) => {
        const { form } = this.props;

        let self = this;
        self.setState({ loading: true });

        axios
            .get(`admin/user/${id}`)
            .then((data) => {
                if (data.code === 'OK') {
                    let userData = data.data;
                    if (userData.type === USER_TYPES.STAFF || userData.type === USER_TYPES.SUB_ADMIN) {
                        self.setState({ parentVisible: true });
                    }
                    let formVal = _.pick(userData, [
                        'type',
                        'firstName',
                        'lastName',
                        'addresses',
                        // "parentId",
                        'username',
                        'companyName',
                        // 'franchiseeCountryId',
                        // 'franchiseeStateId',
                        // 'franchiseeCityId',
                        'designation',
                        'uniqueIdentityNumber',
                        'seriesCode',
                        'image',
                        'inviteCode'
                    ]);
                    if (formVal.image && typeof formVal.image === 'string') {
                        this.setState((state) => {
                            state.imageUploadprops.fileList = [{
                                uid: 'uid',
                                name: 'Image',
                                status: 'done',
                                url: formVal.image
                            }];

                            return state;
                        });
                    } else {
                        this.setState((state) => {
                            state.imageUploadprops.fileList = [];

                            return state;
                        });
                    }
                    formVal.primaryMobile = userData.mobiles && userData.mobiles[0] && userData.mobiles[0].mobile;
                    formVal.secondaryMobile = userData.mobiles && userData.mobiles[1] && userData.mobiles[1].mobile;
                    formVal.primaryCountryCode = userData.mobiles &&
                        userData.mobiles[0] &&
                        userData.mobiles[0].countryCode;
                    formVal.secondaryCountryCode = userData.mobiles &&
                        userData.mobiles[1] &&
                        userData.mobiles[1].countryCode;
                    formVal.emails =
                        userData.emails &&
                        userData.emails[0] &&
                        userData.emails[0].email;
                    formVal.address =
                        userData.addresses &&
                        userData.addresses[0] &&
                        userData.addresses[0];
                    if (userData.type === USER_TYPES.RIDER) {
                        this.setState({ typeDisable: true });
                    }
                    this.setState({
                        isStateVisible: true,
                        isCityVisible: true
                    });
                    // if (userData.franchiseeCountryId) {
                    //     self.getLocations({
                    //         filter: {
                    //             type: LOCATION_TYPE.STATE,
                    //             parentId: userData.franchiseeCountryId
                    //         }
                    //     });
                    // }
                    // if (userData.franchiseeStateId) {
                    //     self.getLocations({
                    //         filter: {
                    //             type: LOCATION_TYPE.CITY,
                    //             parentId: userData.franchiseeStateId
                    //         }
                    //     });
                    // }
                    form.setFieldsValue(formVal);
                    self.setState((prevState) => {
                        prevState.userData = userData;
                        prevState.vendorVisible =
                            USER_TYPES.STAFF === userData.type;
                    });
                }
                self.setState({ loading: false });
            })
            .catch((error) => {
                console.log('Error****:', error.message);
                self.setState({ loading: false });
            });
    };
    getSingleFilePath = (e) => {
        if (e.file && e.file.status === 'removed') {
            return '';
        }
        if (e.file && e.file.status === 'done') {
            if (e && e.file.response && e.file.response.data &&
                _.size(e.file.response.data.files) > 0 &&
                e.file.response.data.files[0].absolutePath) {
                return e.file.response.data.files[0].absolutePath;
            }
        }
        return '';
    };
    validateFile = function (file, as) {
        let isLess5MB = file.size / 1024 / 1024 < 5;
        let isValidType = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!isValidType) {
            message.error(<IntlMessages id="app.invalidFileType" />);
        }
        if (!isLess5MB) {
            message.error(<IntlMessages id="app.fileSizeMsg" />);
        }
        return file.isValid = isValidType && isLess5MB
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            // this.fetch();
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }

        if (info.fileList.length > 1) return message.error(<IntlMessages id="app.fileUploadLimitMsg" />)

        this.setState((state) => {
            state[option.stateKeyName].fileList = _.filter(info.fileList, { isValid: true });
            return state;
        });
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            if (values.primaryCountryCode && values.primaryCountryCode !== undefined && values.primaryCountryCode.length > 0 && values.primaryCountryCode.charAt(0) !== '+') {
                message.error(<IntlMessages id="app.partner.primaryMobilePlusPrefix" />);
                return false;
            }
            if (values.secondaryMobile) {
                if (values.secondaryCountryCode && values.secondaryCountryCode !== undefined && values.secondaryCountryCode.length > 0 && values.secondaryCountryCode.charAt(0) !== '+') {
                    message.error(<IntlMessages id="app.partner.secondaryMobilePlusPrefix" />);
                    return false;
                }
            }
            this.setState({ loading: true })
            let url = `admin/franchisee/create`;
            let method = `post`;
            let reqObj = _.omit(values, ['primaryMobile', 'secondaryMobile', 'emails', 'confirmPassword']);
            let { id } = self.state.userData;
            // if (id) {
            //     reqObj.mobiles = [{ isPrimary: true, mobile: values.primaryMobile }, { isPrimary: false, mobile: values.secondaryMobile }];
            //     reqObj.emails = [{ ...emails[0], email: values.emails }];
            // } else {
            if (id) {
                let mobiles = this.state.userData.mobiles;
                if (values.primaryMobile) {
                    if (!mobiles) {
                        mobiles = [{ isPrimary: true, mobile: values.primaryMobile }];
                    }
                    mobiles[0].mobile = values.primaryMobile;
                    if (values.primaryCountryCode === undefined || values.primaryCountryCode === "") {
                        delete mobiles[0].countryCode;
                    } else {
                        mobiles[0].countryCode = values.primaryCountryCode;
                    }
                    if (values.secondaryMobile) {
                        if (!mobiles[1]) {
                            let secondaryMobile = { isPrimary: false, mobile: values.secondaryMobile };
                            if (values.secondaryCountryCode && values.secondaryCountryCode !== undefined) {
                                secondaryMobile.countryCode = values.secondaryCountryCode;
                            }
                            mobiles.push(secondaryMobile);
                        } else {
                            mobiles[1].mobile = values.secondaryMobile;
                            if (values.secondaryCountryCode === undefined || values.secondaryCountryCode === "") {
                                delete mobiles[1].countryCode;
                            } else {
                                mobiles[1].countryCode = values.secondaryCountryCode;
                            }
                        }
                    }
                } else {
                    mobiles = null;
                }
                let emails = this.state.userData.emails;
                emails[0].email = values.emails;
                reqObj.mobiles = mobiles;
                reqObj.emails = emails;
            }
            else {
                if (values.primaryMobile) {
                    reqObj.mobiles = [{ isPrimary: true, mobile: values.primaryMobile }];
                    if (values.primaryCountryCode && values.primaryCountryCode !== undefined) {
                        reqObj.mobiles[0].countryCode = values.primaryCountryCode;
                    }
                    if (values.secondaryMobile) {
                        let secondaryMobile = { isPrimary: false, mobile: values.secondaryMobile };
                        if (values.secondaryCountryCode && values.secondaryCountryCode !== undefined) {
                            secondaryMobile.countryCode = values.secondaryCountryCode;
                        }
                        reqObj.mobiles.push(secondaryMobile);
                    }
                } else {
                    reqObj.mobiles = null;
                }
                reqObj.emails = [{ isPrimary: true, email: values.emails }];
            }
            // }
            if (values.address) {
                values.address.isPrimary = true;
            }
            reqObj.addresses = [values.address];
            delete reqObj.address;
            delete reqObj.primaryCountryCode;
            delete reqObj.secondaryCountryCode;

            if (id) {
                url = `admin/user/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, reqObj);
                if (response && response.code === 'OK') {
                    this.setState({ loading: false })
                    message.success(`${response.message}`);
                    this.props.history.push({
                        pathname: `/e-scooter/${FRANCHISEE_ROUTE}`,
                        filter: this.props.location.filter
                    });
                    form.resetFields();

                    // no need of this because /e-scooter/franchisee will call this
                    // await this.props.getFranchisee();
                } else {
                    this.setState({ loading: false })
                    message.error(`${response.message}`);
                }
            } catch (error) {
                this.setState({ loading: false })
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
        this.setState({
            parentVisible: false,
            isCityVisible: false,
            isStateVisible: false
        });
    };

    // getLocations = async (filter) => {
    //     const { form } = this.props;

    //     let type = LOCATION_TYPE.COUNTRY;
    //     if (filter && filter.filter && filter.filter.type) {
    //         type = filter.filter.type;
    //     }
    //     let self = this;
    //     self.setState({ loading: true });

    //     await axios
    //         .post(`admin/location/paginate`, filter)
    //         .then((data) => {
    //             if (data.code === 'OK') {
    //                 let locationList = data.data.list;
    //                 if (type === LOCATION_TYPE.COUNTRY) {
    //                     self.setState({
    //                         locationCountries: locationList
    //                     });
    //                     if (locationList.length && !this.state.id) {
    //                         form.setFieldsValue({ franchiseeCountryId: locationList[0].id });
    //                         self.setState({
    //                             isStateVisible: true
    //                         });
    //                         self.getLocations({
    //                             filter: {
    //                                 type: LOCATION_TYPE.STATE,
    //                                 parentId: locationList[0].id
    //                             }
    //                         });
    //                     }
    //                 } else if (type === LOCATION_TYPE.STATE) {
    //                     this.setState({
    //                         locationStates: locationList,
    //                         isStateVisible: true
    //                     });
    //                     if (locationList.length && !this.state.id) {
    //                         form.setFieldsValue({ franchiseeStateId: locationList[0].id });
    //                         self.setState({
    //                             isCityVisible: true
    //                         });
    //                         self.getLocations({
    //                             filter: {
    //                                 type: LOCATION_TYPE.CITY,
    //                                 parentId: locationList[0].id
    //                             }
    //                         });
    //                     }
    //                 } else if (type === LOCATION_TYPE.CITY) {
    //                     this.setState({
    //                         locationCities: locationList,
    //                         isCityVisible: true
    //                     });
    //                     if (locationList.length && !this.state.id) {
    //                         form.setFieldsValue({ franchiseeCityId: locationList[0].id });
    //                     }
    //                 }
    //             }
    //             self.setState({ loading: false });
    //         })
    //         .catch((error) => {
    //             console.log('Error****:', error.message);
    //             self.setState({ loading: false });
    //         });
    // };

    // handleCountryChange = async (value) => {
    //     this.setState({
    //         locationStates: [],
    //         locationCities: [],
    //         isCityVisible: false,
    //         isStateVisible: false
    //     });
    //     this.props.form.setFieldsValue({ franchiseeStateId: undefined });
    //     await this.getLocations({
    //         filter: {
    //             type: LOCATION_TYPE.STATE,
    //             parentId: value
    //         }
    //     });
    // };

    // handleStateChange = async (value) => {
    //     this.setState({
    //         locationCities: [],
    //         isCityVisible: false
    //     });
    //     this.props.form.setFieldsValue({ franchiseeCityId: undefined });
    //     await this.getLocations({
    //         filter: {
    //             type: LOCATION_TYPE.CITY,
    //             parentId: value
    //         }
    //     });
    // };

    // handleCityChange = (value) => {
    //     // console.log(`selected cities: ${value}`);
    // };
    isSameMobileNo = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value === form.getFieldValue('primaryMobile')) {
            callback(<IntlMessages id="app.partner.primarySecondaryDiff" />);
        } else {
            callback();
        }
    }
    // eslint-disable-next-line max-lines-per-function
    render() {
        const { userData, locationCountries, locationStates, locationCities } = this.state;

        // let { parentUsers } = this.state;
        // parentUsers = parentUsers.filter((user) => {
        //     return user.id !== id;
        // });

        const { form } = this.props;
        const { getFieldDecorator } = form;
        // const showSelectedParent = parentUsers.find((user) => {
        //     return user.id === userData.parentId;
        // });

        return (
            <div className="gx-module-box gx-module-box-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <div>
                            <Title level={4} className="gx-mb-0 gx-d-inline-block">
                                {userData.id ?
                                    <><IntlMessages id="app.update" /> {FRANCHISEE_LABEL}</>
                                    : <><IntlMessages id="app.add" /> {FRANCHISEE_LABEL}</>}
                            </Title>
                        </div>
                        <div className="topbarCommonBtn">
                            <Link
                                to={{
                                    pathname: `/e-scooter/${FRANCHISEE_ROUTE}`,
                                    filter: this.props.location.filter
                                }}
                            >
                                <Button className="gx-mb-0"><IntlMessages id="app.list" /></Button>
                            </Link>
                        </div>
                    </Row>
                </div>

                <div className="gx-module-box-content">
                    <Spin spinning={this.state.loading} delay={100}>
                        <CustomScrollbars className="gx-module-content-scroll">
                            <div className="gx-mt-3">
                                <Form layout="vertical" onSubmit={this.handleSubmit}>
                                    <Row type="flex" justify="start">
                                        {/* FirstName*/}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.nameHolder" />} hasFeedback>
                                                {getFieldDecorator('firstName', {
                                                    rules: [{
                                                        transform: (value) => {
                                                            return (value && value.trim());
                                                        }
                                                    },
                                                    {
                                                        required: true,
                                                        message: <IntlMessages id="app.user.nameRequiredMsg" />,
                                                    },
                                                    {
                                                        pattern: /^[a-zA-Z-_\s]+$/i,
                                                        message: <IntlMessages id="app.user.nameValidationMsg" />
                                                    }]
                                                })(
                                                    <Input placeholder="First Name" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {/* LastName*/}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.lastNameHolder" />} hasFeedback>
                                                {getFieldDecorator('lastName', {
                                                    rules: [{
                                                        transform: (value) => {
                                                            return (value && value.trim());
                                                        }
                                                    }, {
                                                        required: true,
                                                        message: <IntlMessages id="app.user.lastNameRequiredMsg" />
                                                    },
                                                    {
                                                        pattern: /^[a-zA-Z-_\s]+$/i,
                                                        message: <IntlMessages id="app.user.lastNameValidationMsg" />
                                                    }]
                                                })(
                                                    <Input placeholder="Last Name" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {/* Designation */}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.partner.designation" />}>
                                                {getFieldDecorator('designation', {
                                                    rules: [{
                                                        min: 3, message: <IntlMessages id="app.partner.designationMinLimitMsg" />
                                                    }, { max: 30, message: <IntlMessages id="app.partner.designationMaxLimitMsg" /> }]
                                                })(
                                                    <Input placeholder="Designation" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {/* code */}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.codeLabel" />}>
                                                {getFieldDecorator('seriesCode', {
                                                    getValueFromEvent: e => e.target.value.toUpperCase().trim(),
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.partner.codeRequiredMsg" />
                                                        },
                                                        {
                                                            max: 3,
                                                            message: <IntlMessages id="app.partner.codeMaxLimitMsg" />
                                                        }
                                                    ]
                                                })(
                                                    <Input placeholder="Enter Code" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row type="flex" justify="start">
                                        {/* Mobiles*/}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Input.Group size="large" compact>
                                                <Row type="flex" justify="start" style={{ display: 'flex' }}>
                                                    <Col span={6} style={{ padding: 0 }}>
                                                        <Form.Item label={<IntlMessages id="app.user.codeLabel" />}>
                                                            {getFieldDecorator("primaryCountryCode", {
                                                                rules: [
                                                                    {
                                                                        transform: value => {
                                                                            return (
                                                                                value &&
                                                                                value.trim()
                                                                            );
                                                                        }
                                                                    }
                                                                ]
                                                            })(<Input placeholder="+1" autoComplete='disabled' />)}
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={18} style={{ paddingRight: 0 }}>
                                                        <Form.Item label={<IntlMessages id="app.partner.primaryMobile" />} hasFeedback>
                                                            {getFieldDecorator('primaryMobile', {
                                                                rules: [{
                                                                    transform: (value) => {
                                                                        return (value && value.trim());
                                                                    }
                                                                }, {
                                                                    required: false,
                                                                    message: <IntlMessages id="app.partner.primaryMobileRequiredMsg" />
                                                                }, {
                                                                    pattern: new RegExp('^[1-9][0-9]*$'),
                                                                    message: <IntlMessages id="app.partner.primaryMobileCantZero" />
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[0-9]{1,10}$'),
                                                                    message: <IntlMessages id="app.user.invalidMobile" />
                                                                }]
                                                            })(<Input placeholder="Mobile" autoComplete='disabled' />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Input.Group>
                                        </Col>
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Input.Group size="large" compact>
                                                <Row type="flex" justify="start" style={{ display: 'flex' }}>
                                                    <Col span={6} style={{ padding: 0 }}>
                                                        <Form.Item label={<IntlMessages id="app.user.codeLabel" />}>
                                                            {getFieldDecorator("secondaryCountryCode", {
                                                                rules: [
                                                                    {
                                                                        transform: value => {
                                                                            return (
                                                                                value &&
                                                                                value.trim()
                                                                            );
                                                                        }
                                                                    }
                                                                ]
                                                            })(<Input placeholder="+1" autoComplete='disabled' />)}
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={18} style={{ paddingRight: 0 }}>
                                                        <Form.Item label={<IntlMessages id="app.partner.secondaryMobile" />} hasFeedback>
                                                            {getFieldDecorator('secondaryMobile', {
                                                                rules: [{
                                                                    transform: (value) => {
                                                                        return (value && value.trim());
                                                                    }
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[1-9][0-9]*$'),
                                                                    message: <IntlMessages id="app.partner.primaryMobileCantZero" />
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[0-9]{1,10}$'),
                                                                    message: <IntlMessages id="app.user.invalidMobile" />
                                                                },
                                                                {
                                                                    validator: this.isSameMobileNo
                                                                }
                                                                ]
                                                            })(<Input placeholder="Mobile" autoComplete='disabled' />)}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Input.Group>
                                        </Col>
                                        {/* Emails*/}
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.email" />} hasFeedback>
                                                {getFieldDecorator('emails', {
                                                    rules: [
                                                        {
                                                            type: 'email',
                                                            message: <IntlMessages id="app.user.emailValidationMsg" />
                                                        },
                                                        {
                                                            required: true,
                                                            message: <IntlMessages id="app.user.emailRequiredMsg" />
                                                        }
                                                    ]
                                                })(
                                                    <Input
                                                        type="email"
                                                        placeholder="E-mail"
                                                        autoComplete='disabled'
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.uniqueIdentityNumber" />}>
                                                {getFieldDecorator('uniqueIdentityNumber', {
                                                    rules: [{
                                                        required: true,
                                                        message: <IntlMessages id="app.user.uniqueIdentityRequiredMsg" />
                                                    }, {
                                                        pattern: /^([a-zA-Z0-9]+)$/,
                                                        message: <IntlMessages id="app.user.noSpaceMsg" />
                                                    }, {
                                                        pattern: /^([a-zA-Z0-9]+)$/,
                                                        message: <IntlMessages id="app.user.onlyAlphanumericMsg" />
                                                    }, {
                                                        min: 3,
                                                        message: <IntlMessages id="app.user.uniqueIdentityMinLimitMsg" />
                                                    }, {
                                                        max: 20,
                                                        message: <IntlMessages id="app.user.uniqueIdentityMaxLimitMsg" />
                                                    }]
                                                })(
                                                    <Input placeholder="Unique Identity Number" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item>
                                                <Form.Item
                                                    label={<IntlMessages id="app.user.address1Label" />}
                                                    style={{
                                                        width: '30%',
                                                        display: 'inline-block'
                                                    }} hasFeedback
                                                >
                                                    {getFieldDecorator(
                                                        'address.line1', {
                                                        rules: [{
                                                            required: true,
                                                            message: <IntlMessages id="app.partner.addressRequiredMsg" />
                                                        }, { max: 50, message: <IntlMessages id="app.user.addressValidationMsg" /> }]
                                                    }
                                                    )(
                                                        <Input placeholder="Line 1" autoComplete="disabled" />
                                                    )}
                                                </Form.Item>
                                                <Form.Item
                                                    label={<IntlMessages id="app.user.address2Label" />}
                                                    style={{
                                                        width: '30%',
                                                        display: 'inline-block',
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    {getFieldDecorator(
                                                        'address.line2', {
                                                        rules: [{ max: 50, message: <IntlMessages id="app.user.addressValidationMsg" /> }]
                                                    }
                                                    )(
                                                        <Input placeholder="Line 2" autoComplete="disabled" />
                                                    )}
                                                </Form.Item>
                                                {PARTNER_WITH_CLIENT_FEATURE &&
                                                    <Form.Item
                                                        label={<IntlMessages id="app.partner.invalidCode" />}
                                                        style={{
                                                            width: '30%',
                                                            display: 'inline-block',
                                                            paddingLeft: 5
                                                        }}
                                                    >
                                                        {getFieldDecorator('inviteCode', {
                                                            rules: [{
                                                                required: true,
                                                                message: <IntlMessages id="app.partner.invalidCodeRequiredMsg" />
                                                            }, {
                                                                pattern: /^([a-zA-Z0-9]+)$/,
                                                                message: <IntlMessages id="app.partner.invalidCodeSpaceMsg" />
                                                            }, {
                                                                pattern: /^([a-zA-Z0-9]+)$/,
                                                                message: <IntlMessages id="app.partner.invalidCodePatternMsg" />
                                                            }, {
                                                                min: 3,
                                                                message: <IntlMessages id="app.partner.invalidCodeMinLimitMsg" />
                                                            }, {
                                                                max: 20,
                                                                message: <IntlMessages id="app.partner.invalidCodeMaxLimitMsg" />
                                                            }]
                                                        })(
                                                            <Input placeholder="Invite Code" autoComplete='disabled' />
                                                        )}
                                                    </Form.Item>
                                                }
                                            </Form.Item>
                                        </Col>
                                        {/* </Row>
                                <Row> */}
                                        <Col span={24}>
                                            <Form.Item>
                                                <Form.Item
                                                    className="state-width"
                                                    label={<IntlMessages id="app.user.countryLabel" />}
                                                    style={{
                                                        width: '30%',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {getFieldDecorator(
                                                        "address.country"
                                                    )(
                                                        <Input placeholder="Country" autoComplete="disabled" />
                                                    )}
                                                </Form.Item>
                                                <Form.Item
                                                    className="state-width"
                                                    label={<IntlMessages id="app.user.stateLabel" />}
                                                    style={{
                                                        width: '30%',
                                                        display: 'inline-block',
                                                        paddingLeft: '5px'
                                                    }}
                                                >
                                                    {getFieldDecorator(
                                                        'address.state'
                                                    )(
                                                        <Input placeholder="State" autoComplete="disabled" />
                                                    )}
                                                </Form.Item>
                                                <Form.Item
                                                    className="city-width"
                                                    label={<IntlMessages id="app.user.cityLabel" />}
                                                    style={{
                                                        width: '25%',
                                                        display: 'inline-block',
                                                        paddingLeft: '5px'
                                                    }}
                                                >
                                                    {getFieldDecorator(
                                                        'address.city'
                                                    )(<Input placeholder="City" autoComplete="disabled" />)}
                                                </Form.Item>
                                                <Form.Item
                                                    className="pincode-width"
                                                    label={<IntlMessages id="app.user.pincodeLabel" />}
                                                    style={{
                                                        width: '15%',
                                                        display: 'inline-block',
                                                        paddingLeft: '5px'
                                                    }}
                                                >
                                                    {getFieldDecorator('address.pinCode', {
                                                        rules: [
                                                            {
                                                                pattern: new RegExp('^[0-9]{3,6}$'),
                                                                message: <IntlMessages id="app.user.pincodeLimitValidationMsg" />
                                                            },
                                                            {
                                                                pattern: new RegExp('^[1-9][0-9]*$'),
                                                                message: <IntlMessages id="app.user.mobileValidationMsg" />
                                                            }, {
                                                                required: true,
                                                                message: <IntlMessages id="app.partner.pinCodeRequiredMsg" />
                                                            }
                                                        ]

                                                    }
                                                    )(
                                                        <Input placeholder="Pin Code" autoComplete="disabled" />
                                                    )}
                                                </Form.Item>
                                            </Form.Item >
                                        </Col >
                                    </Row >
                                    <Row type="flex" justify="start">
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.partner.companyName" />}>
                                                {getFieldDecorator('companyName', {
                                                    rules: [{
                                                        min: 2, message: <IntlMessages id="app.partner.companyNameMinLimitMsg" />
                                                    }, { max: 200, message: <IntlMessages id="app.partner.companyNameMaxLimitMsg" /> }]
                                                })(
                                                    <Input placeholder="Company Name" autoComplete='disabled' />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.uploadPhotoLabel" />}>
                                                {getFieldDecorator('image', {
                                                    required: false,
                                                    getValueFromEvent: this.getSingleFilePath
                                                })(
                                                    <Upload key="image" {...this.state.imageUploadprops}
                                                    >
                                                        <Button disabled={this.state.imageUploadprops.fileList.length > 1}>
                                                            <Icon type="upload" /> <IntlMessages id="app.user.uploadPhotoLabel" />
                                                        </Button>
                                                    </Upload>
                                                )}
                                            </Form.Item>
                                        </Col >
                                    </Row >
                                    {/* <Row style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                                        <Col span={24}>
                                            City of Operations
                                    </Col>
                                    </Row>
                                    <Row type="flex" justify="start">
                                        <Col span={8}>
                                            <Form.Item
                                                label="Country"
                                            >
                                                {getFieldDecorator("franchiseeCountryId", {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message:
                                                                "Please select country!"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        mode="default"
                                                        style={{ width: '100%' }}
                                                        placeholder="Country"
                                                        onChange={this.handleCountryChange}
                                                    >
                                                        {locationCountries.map(
                                                            val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.id}
                                                                        value={val.id}
                                                                        disabled={!val.isActive}
                                                                    >
                                                                        {val.name}
                                                                    </Select.Option>
                                                                );
                                                            }
                                                        )}
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={8} style={{
                                            opacity: this.state.isStateVisible ? 1 : 0
                                        }}>
                                            <Form.Item
                                                label="State"
                                            >
                                                {getFieldDecorator("franchiseeStateId", {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message:
                                                                "Please select state!"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        mode="default"
                                                        style={{ width: '100%' }}
                                                        placeholder="State"
                                                        onChange={this.handleStateChange}
                                                    >
                                                        {locationStates.map(
                                                            val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.id}
                                                                        value={val.id}
                                                                        disabled={!val.isActive}
                                                                    >
                                                                        {val.name}
                                                                    </Select.Option>
                                                                );
                                                            }
                                                        )}
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={8} style={{
                                            opacity: this.state.isCityVisible ? 1 : 0
                                        }}>
                                            <Form.Item
                                                label="Cities"
                                            >
                                                {getFieldDecorator("franchiseeCityId", {
                                                    rules: [
                                                        {
                                                            required: false,
                                                            message:
                                                                "Please select cities!"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        mode="multiple"
                                                        style={{ width: '100%' }}
                                                        placeholder="Cities"
                                                        onChange={this.handleCityChange}
                                                    >
                                                        {locationCities.map(
                                                            val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.id}
                                                                        value={val.id}
                                                                        disabled={!val.isActive}
                                                                    >
                                                                        {val.name}
                                                                    </Select.Option>
                                                                );
                                                            }
                                                        )}
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row> */}
                                    < Row >
                                        <Col span={24} className="gx-text-right">
                                            {!userData.id ?
                                                <Button
                                                    style={{
                                                        marginLeft: 8,
                                                        marginTop: 15
                                                    }}
                                                    onClick={this.handleReset}
                                                >
                                                    <IntlMessages id="app.clear" />
                                                </Button> :
                                                <Link
                                                    to={{
                                                        pathname: `/e-scooter/${FRANCHISEE_ROUTE}`,
                                                        filter: this.props.location.filter
                                                    }}
                                                >
                                                    <Button
                                                        style={{
                                                            marginLeft: 8,
                                                            marginTop: 15
                                                        }}
                                                    >
                                                        <IntlMessages id="app.cancel" />
                                                    </Button>
                                                </Link>
                                            }
                                            <span className="topbarCommonBtn">
                                                <Button
                                                    style={{
                                                        display: 'inline-flex'
                                                    }}
                                                    type="primary"
                                                    htmlType="submit"
                                                >
                                                    {!userData.id ?
                                                        <IntlMessages id="app.save" /> :
                                                        <IntlMessages id="app.update" />}
                                                </Button>
                                            </span>
                                        </Col>
                                    </Row >
                                </Form >
                            </div >
                        </CustomScrollbars >
                    </Spin >
                </div >
            </div >
        );
    }
}

const WrappedFranchiseeUpsert = Form.create({ name: 'franchiseeUpsertForm' })(FranchiseeUpsert);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedFranchiseeUpsert);
