import {
    Button,
    Col,
    DatePicker,
    Form,
    Icon,
    Input,
    Radio,
    Row,
    Select,
    Typography,
    Upload,
    message
} from 'antd';
import {
    DEFAULT_API_ERROR,
    FILE_TYPES,
    USER_TYPES,
    GENDER_FILTER,
    FRANCHISEE_ROUTE,
    FLEET_TYPE,
    RIDER_LABEL,
    RIDER_ROUTE,
    FEEDER_LABEL,
    FEEDER_ROUTE,
    TASK_LEVEL,
    FILTER_BY_FLEET_TYPE,
    FILTER_BY_TASK_LEVEL,
    USER_TYPES_FILTER
} from '../../constants/Common';
import moment from 'moment';
import CustomScrollbars from '../../util/CustomScrollbars';
import { Link } from 'react-router-dom';
import PasswordForm from '../../components/PasswordForm';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import CrudService from '../../services/api';
import uuid from 'react-uuid';
import IntlMessages from '../../util/IntlMessages';

const { Title } = Typography;
const _ = require('lodash');

class UserUpsert extends React.Component {
    constructor(props) {
        super(props);

        const { authUser } = props.auth;

        let UserTypes = USER_TYPES_FILTER;
        UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.SUPER_ADMIN, USER_TYPES.FRANCHISEE, USER_TYPES.DEALER].includes(uType.type) });
        if (authUser.type === USER_TYPES.ADMIN) {
            UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.ADMIN].includes(uType.type) });
        }
        if (authUser.type === USER_TYPES.SUB_ADMIN) {
            UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.ADMIN, USER_TYPES.SUB_ADMIN].includes(uType.type) });
        }
        let pathname = window.location.pathname.split("/");
        if (pathname[2] === 'users') {
            UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.RIDER, USER_TYPES.FEEDER].includes(uType.type) });
        }
        // if (UserTypes['RIDER'] && RIDER_LABEL.toUpperCase() !== 'RIDER') {
        //     delete Object.assign(UserTypes, { [RIDER_LABEL.toUpperCase()]: UserTypes['RIDER'] })['RIDER'];
        // }
        // if (UserTypes['FEEDER'] && FEEDER_LABEL.toUpperCase() !== 'FEEDER') {
        //     delete Object.assign(UserTypes, { [FEEDER_LABEL.toUpperCase()]: UserTypes['FEEDER'] })['FEEDER'];
        // }

        this.state = {
            route: pathname[2],
            id: props.match.params.id,
            userTypes: UserTypes,
            userData: {},
            parentVisible: false,
            parentUsers: [],
            typeDisable: false,
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
                    return this.onFileChange(info, { fieldName: 'image', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        };
        this.taskLevelFilter = FILTER_BY_TASK_LEVEL.filter((ele) => { return ele.value !== 0 })
        this.fleetTypeFilter = FILTER_BY_FLEET_TYPE.filter((ele) => { return ele.value !== 1 })
        if (this.props.location.franchiseeId) {
            this.franchiseeId = this.props.location.franchiseeId;
        }
    }
    componentDidMount() {
        const { authUser } = this.props.auth;
        const { form } = this.props;

        if (!_.isArray(this.props.location.type)) {
            this.getParentUsers(this.props.location.type);
            form.setFieldsValue({ type: this.props.location.type });
        }
        if (this.state.id) {
            this.fetch(this.state.id);

            return;
        }
        // using customer static for now.
        if (this.state.route === RIDER_ROUTE) {
            form.setFieldsValue({ type: USER_TYPES.RIDER });
            this.setState({
                typeDisable: true
            });
        } else if (this.state.route === FEEDER_ROUTE) {
            form.setFieldsValue({ type: USER_TYPES.FEEDER, level: TASK_LEVEL.LEVEL_1 });
            this.setState({
                typeDisable: true
            });
        } else {
            this.setState({
                typeDisable: false
            });
        }

        if (authUser.type === USER_TYPES.FRANCHISEE || this.franchiseeId) {
            form.setFieldsValue({ type: USER_TYPES.STAFF });
        }
    }
    fetch = (id) => {
        const { form, auth } = this.props;

        let self = this;
        self.setState({ loading: true });

        axios
            .get(`admin/user/${id}`)
            .then((data) => {
                if (data.code === 'OK') {
                    let userData = data.data;
                    if (userData.type === USER_TYPES.STAFF || userData.type === USER_TYPES.SUB_ADMIN) {
                        this.getParentUsers(userData.type);
                        self.setState({ parentVisible: true });
                    }
                    let formVal = _.pick(userData, [
                        'type',
                        'firstName',
                        'lastName',
                        'addresses',
                        // "parentId",
                        'username',
                        'gender',
                        'uniqueIdentityNumber',
                        'image',
                        'fleetType',
                        'dealerId',
                        'level'
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
                    formVal.mobiles =
                        userData.mobiles &&
                        userData.mobiles[0] &&
                        userData.mobiles[0].mobile;
                    formVal.countryCode = userData.mobiles &&
                        userData.mobiles[0] &&
                        userData.mobiles[0].countryCode;
                    formVal.emails =
                        userData.emails &&
                        userData.emails[0] &&
                        userData.emails[0].email;
                    formVal.address =
                        userData.addresses &&
                        userData.addresses[0] &&
                        userData.addresses[0];
                    if (userData.dob) {
                        formVal.dob = moment(
                            UtilService.displayUserDOB(userData.dob)
                        );
                    }
                    if (userData.type === USER_TYPES.RIDER || userData.type === USER_TYPES.FEEDER) {
                        this.setState({ typeDisable: true });
                    }
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

    handleSubmit = async (e) => {
        e.preventDefault();
        const { authUser } = this.props.auth;
        let self = this;

        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            if (values.countryCode && values.countryCode !== undefined && values.countryCode.length > 0 && values.countryCode.charAt(0) !== '+') {
                message.error(<IntlMessages id="app.user.countryCodePrefixMsg" />);
                return false;
            }

            let reqObj = _.omit(values, [
                "mobiles",
                "emails",
                "confirmPassword"
            ]);

            let { id, mobiles, emails } = self.state.userData;
            if (id) {
                if (values.mobiles) {
                    let mobileObj = mobiles ? { ...mobiles[0], mobile: values.mobiles } :
                        {
                            id: uuid(),
                            mobile: values.mobiles,
                            isPrimary: true,
                            isVerified: true
                        };
                    if (values.countryCode === undefined || values.countryCode === "" || values.countryCode === null) {
                        delete mobileObj.countryCode;
                    } else {
                        mobileObj.countryCode = values.countryCode;
                    }
                    reqObj.mobiles = [mobileObj];
                } else {
                    reqObj.mobiles = null;
                }
                reqObj.emails = emails ? [{ ...emails[0], email: values.emails }] :
                    [{
                        id: uuid(),
                        email: values.emails,
                        isPrimary: true,
                        isVerified: true
                    }];
            } else {
                if (values.mobiles) {
                    reqObj.mobiles = [{ isPrimary: true, mobile: values.mobiles }];
                    if (values.countryCode && values.countryCode !== undefined) {
                        reqObj.mobiles[0].countryCode = values.countryCode;
                    }
                } else {
                    reqObj.mobiles = null;
                }
                reqObj.emails = [{ isPrimary: true, email: values.emails }];
            }

            if (values.address) {
                values.address.isPrimary = true;
                reqObj.addresses = [values.address];
            }
            if (reqObj.dob) {
                reqObj.dob = moment(reqObj.dob).format("DD-MM-YYYY");
            } else {
                // error when setting null value even attribute is optional, so solution is empty string
                reqObj.dob = '';
            }
            if (authUser.type === USER_TYPES.FRANCHISEE) {
                reqObj.parentId = authUser.id;
                reqObj.type = USER_TYPES.STAFF;
            }
            if (this.franchiseeId) {
                reqObj.franchiseeId = this.franchiseeId;
                reqObj.type = USER_TYPES.STAFF;
            }
            delete reqObj.address;
            delete reqObj.countryCode;

            let url = `admin/user/create`;
            let method = `post`;
            if (id) {
                url = `admin/user/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, reqObj);
                if (response && response.code === 'OK') {
                    message.success(`${response.message}`);
                    if (this.franchiseeId) {
                        this.props.history.push({
                            pathname: `/e-scooter/${FRANCHISEE_ROUTE}/view/${this.franchiseeId}`,
                            filter: this.props.location.filter,
                            tab: '4'
                        });

                    } else if (this.state.route === RIDER_ROUTE) {
                        this.props.history.push({
                            pathname: `/e-scooter/${RIDER_ROUTE}`,
                            filter: this.props.location.filter
                        });
                    } else if (this.state.route === FEEDER_ROUTE) {
                        this.props.history.push({
                            pathname: `/e-scooter/${FEEDER_ROUTE}`,
                            filter: this.props.location.filter
                        });
                    } else {
                        this.props.history.push({
                            pathname: `/e-scooter/users`,
                            filter: this.props.location.filter
                        });
                    }
                } else {
                    message.error(`${response.message}`);
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    };

    handleReset = () => {
        if (this.state.route === RIDER_ROUTE || this.state.route === FEEDER_ROUTE) {
            this.props.form.validateFields((err, values) => {
                let formFieldNames = Object.keys(values)
                formFieldNames = formFieldNames.filter(el => el !== 'type')
                this.props.form.resetFields(formFieldNames);
            })
        } else {
            this.props.form.resetFields();
        }
        this.setState({ parentVisible: false });
    };

    getParentUsers = async (userType) => {
        const { authUser } = this.props.auth;
        this.props.form.setFieldsValue({ parentId: undefined });
        let updatedUserData = { ...this.state.userData };
        updatedUserData.parentId = undefined;
        this.setState({ userData: updatedUserData });

        if (userType === USER_TYPES.STAFF) {
            if (authUser.type === USER_TYPES.SUB_ADMIN) {
                this.setState({
                    parentVisible: true,
                    parentUsers: [authUser]
                });
                updatedUserData.parentId = authUser.id;
                this.setState({ userData: updatedUserData });
                this.props.form.setFieldsValue({ parentId: authUser.id });
            } else {
                let data = await axios.post('admin/user/paginate', {
                    filter: {
                        type: USER_TYPES.SUB_ADMIN,
                        isDeleted: false
                    },
                    project: ['firstName', 'lastName', 'type', 'isActive']
                });

                if (data.code === 'OK' && data) {
                    data = data.data;
                    this.setState({
                        parentVisible: true,
                        parentUsers: data.list
                    });
                }
            }
        } else if (userType === USER_TYPES.SUB_ADMIN) {
            if (authUser.type === USER_TYPES.ADMIN) {
                this.setState({
                    parentVisible: true,
                    parentUsers: [authUser]
                });
                updatedUserData.parentId = authUser.id;
                this.setState({ userData: updatedUserData });
                this.props.form.setFieldsValue({ parentId: authUser.id });
            } else {
                let data = await axios.post('admin/user/paginate', {
                    filter: {
                        type: USER_TYPES.ADMIN,
                        isDeleted: false
                    },
                    project: ['firstName', 'lastName', 'type', 'isActive']
                });

                if (data.code === 'OK' && data) {
                    data = data.data;
                    this.setState({
                        parentVisible: true,
                        parentUsers: data.list
                    });
                }
            }
        } else {
            this.setState({
                parentVisible: false
            });
        }
    };

    disabledDate = (current) => {
        return current > moment().endOf('day');
    };
    disabledDate = current => {
        return current > moment().endOf("day");
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

            if ((age === 18 && age_month <= 0 && age_day <= 0) || age < 18 || age > 99) {
                await callback(<IntlMessages id="app.user.ageValidationMsg" />)
            } else {
                await callback()
            }
        }
    };


    // eslint-disable-next-line max-lines-per-function
    render() {
        const { userTypes, userData, parentVisible, id } = this.state;

        let { parentUsers } = this.state;
        parentUsers = parentUsers.filter((user) => {
            return user.id !== id;
        });

        const { form } = this.props;
        const { getFieldDecorator } = form;
        const showSelectedParent = parentUsers.find(
            (user) => {
                return user.id === userData.parentId;
            }
        );
        const { authUser } = this.props.auth;

        return (
            <div className="gx-module-box gx-module-box-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <div>
                            <Title
                                level={4}
                                className="gx-mb-0 gx-d-inline-block"
                            >
                                {this.state.route === RIDER_ROUTE
                                    ? userData.id ?
                                        <><IntlMessages id="app.update" /> {RIDER_LABEL}</>
                                        : <><IntlMessages id="app.add" /> {RIDER_LABEL}</>
                                    : this.state.route === FEEDER_ROUTE
                                        ? userData.id
                                            ? <><IntlMessages id="app.update" /> {FEEDER_LABEL}</>
                                            : <><IntlMessages id="app.add" /> {FEEDER_LABEL}</>
                                        : userData.id
                                            ? authUser.type === USER_TYPES.FRANCHISEE || this.franchiseeId
                                                ? <IntlMessages id="app.user.updateStaff" />
                                                : <IntlMessages id="app.user.updateUser" />
                                            : authUser.type === USER_TYPES.FRANCHISEE || this.franchiseeId
                                                ? <IntlMessages id="app.user.addStaff" />
                                                : <IntlMessages id="app.user.addUser" />}
                            </Title>
                        </div>
                        <div className="topbarCommonBtn">
                            <Link
                                to={{
                                    pathname: this.franchiseeId
                                        ? `/e-scooter/${FRANCHISEE_ROUTE}/view/${this.franchiseeId}`
                                        : this.state.route === RIDER_ROUTE
                                            ? `/e-scooter/${RIDER_ROUTE}`
                                            : this.state.route === FEEDER_ROUTE
                                                ? `/e-scooter/${FEEDER_ROUTE}`
                                                : `/e-scooter/users`,
                                    filter: this.props.location.filter,
                                    tab: "4"
                                }}
                            >
                                <Button className="gx-mb-0"><IntlMessages id="app.list" /></Button>
                            </Link>
                        </div>
                    </Row>
                </div>

                <div className="gx-module-box-content">
                    <CustomScrollbars className="gx-module-content-scroll">
                        <div className="gx-mt-3">
                            <Form
                                layout="vertical"
                                onSubmit={this.handleSubmit}
                            >
                                <Row type="flex" justify="start">
                                    {/* FirstName*/}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item
                                            label={<IntlMessages id="app.user.nameHolder" />}
                                            hasFeedback
                                        >
                                            {getFieldDecorator('firstName', {
                                                rules: [
                                                    {
                                                        transform: value => { return (value && value.trim()); }
                                                    },
                                                    {
                                                        required: true,
                                                        message: <IntlMessages id="app.user.nameRequiredMsg" />
                                                    },
                                                    {
                                                        pattern: /^[a-zA-Z-_\s]+$/i,
                                                        message: <IntlMessages id="app.user.nameValidationMsg" />
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="First Name" autoComplete="disabled" name={uuid()} />
                                            )}
                                        </Form.Item>
                                    </Col>

                                    {/* LastName*/}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.user.lastNameHolder" />} hasFeedback>
                                            {getFieldDecorator("lastName", {
                                                rules: [
                                                    {
                                                        transform: value => { return (value && value.trim()); }
                                                    },
                                                    {
                                                        required: true,
                                                        message: <IntlMessages id="app.user.lastNameRequiredMsg" />
                                                    },
                                                    {
                                                        pattern: /^[a-zA-Z-_\s]+$/i,
                                                        message: <IntlMessages id="app.user.lastNameValidationMsg" />
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="Last Name" autoComplete="disabled" name={uuid()} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* Type*/}
                                    {!(authUser.type === USER_TYPES.FRANCHISEE || !!this.franchiseeId) && <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.type" />} hasFeedback>
                                            {/* <Form.Item label="Type"> */}
                                            {getFieldDecorator('type', {
                                                rules: [{
                                                    required: true,
                                                    message: <IntlMessages id="app.user.userTypeRequiredMsg" />
                                                }]
                                            })(
                                                <Select onChange={this.getParentUsers.bind(this)}
                                                    placeholder="Select Type"
                                                    disabled={this.state.typeDisable}>
                                                    {userTypes.map(
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
                                    </Col>}
                                    {/* gender */}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.gender" />}>
                                            {getFieldDecorator('gender', {})(
                                                <Radio.Group>
                                                    {GENDER_FILTER.map(
                                                        (val) => {
                                                            return (
                                                                <Radio
                                                                    key={val.value}
                                                                    value={val.type}>
                                                                    {val.label}
                                                                </Radio>
                                                            );
                                                        }
                                                    )}
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* parentUsers */}
                                    {!(authUser.type === USER_TYPES.FRANCHISEE || this.franchiseeId) &&
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            {parentVisible ?
                                                <Form.Item
                                                    label={<IntlMessages id="app.user.parentUserLabel" />}
                                                    hasFeedback
                                                    isParentRequired
                                                >
                                                    {getFieldDecorator('parentId', {
                                                        initialValue: showSelectedParent ?
                                                            userData.parentId :
                                                            undefined,
                                                        rules: [
                                                            { required: true, message: <IntlMessages id="app.user.parentUserRequiredMsg" /> }
                                                        ]
                                                    })(
                                                        <Select placeholder="Select Parent User">
                                                            {parentUsers.map(
                                                                (val) => {
                                                                    return (
                                                                        <Select.Option
                                                                            key={val.id}
                                                                            value={val.id}
                                                                            disabled={!val.isActive}
                                                                        >
                                                                            {`${val.firstName} ${val.lastName}`}
                                                                        </Select.Option>
                                                                    );
                                                                }
                                                            )}
                                                        </Select>
                                                    )}
                                                </Form.Item> :
                                                null}
                                        </Col>}
                                </Row>

                                <Row type="flex" justify="start">
                                    {/* Mobiles*/}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Input.Group size="large" compact>
                                            <Row type="flex" justify="start" style={{ display: 'flex' }}>
                                                <Col span={6} style={{ padding: 0 }}>
                                                    <Form.Item label={<IntlMessages id="app.user.codeLabel" />}>
                                                        {getFieldDecorator("countryCode", {
                                                            rules: [
                                                                {
                                                                    transform: value => { return (value && value.trim()); }
                                                                }
                                                            ]
                                                        })(<Input placeholder="+1" autoComplete="disabled" name={uuid()} />)}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={18} style={{ paddingRight: 0 }}>
                                                    <Form.Item label={<IntlMessages id="app.mobile" />} hasFeedback>
                                                        {getFieldDecorator("mobiles", {
                                                            rules: [
                                                                {
                                                                    transform: value => { return (value && value.trim()); }
                                                                },
                                                                {
                                                                    required: false,
                                                                    message: <IntlMessages id="app.user.mobileRequiredMsg" />
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[1-9][0-9]*$'),
                                                                    message: <IntlMessages id="app.user.mobileValidationMsg" />
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[0-9]{3,10}$'),
                                                                    message: <IntlMessages id="app.user.invalidMobile" />
                                                                }
                                                            ]
                                                        })(<Input placeholder="123456789"
                                                            autoComplete="disabled" name={uuid()} />)}
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
                                                    { type: "email", message: <IntlMessages id="app.user.emailValidationMsg" /> },
                                                    { required: true, message: <IntlMessages id="app.user.emailRequiredMsg" /> }
                                                ]
                                            })(
                                                <Input
                                                    type="email"
                                                    placeholder="E-mail"
                                                    autoComplete="disabled" name={uuid()}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* Username */}
                                    {/* <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label="Username">
                                            {getFieldDecorator('username', {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message:
                                                            'Please add username!'
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="Username" />
                                            )}
                                        </Form.Item>
                                    </Col> */}
                                    {this.state.route === FEEDER_ROUTE &&
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.levelLabel" />} hasFeedback>
                                                {getFieldDecorator("level", {
                                                    rules: [
                                                        { required: true, message: <IntlMessages id="app.user.levelRequiredMsg" /> }
                                                    ]
                                                })(
                                                    <Select placeholder="Select Level" >
                                                        {this.taskLevelFilter.map(
                                                            val => {
                                                                return (
                                                                    <Select.Option
                                                                        key={val.value}
                                                                        value={val.type}
                                                                    >
                                                                        {val.label}
                                                                    </Select.Option>
                                                                );
                                                            }
                                                        )}
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>}
                                    {/* dob */}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.dob" />} hasFeedback>
                                            {getFieldDecorator('dob', {
                                                rules: [
                                                    {
                                                        required: (authUser.type === USER_TYPES.FRANCHISEE || !!this.franchiseeId) ? true : false,
                                                        message: <IntlMessages id="app.user.dobRequiredMsg" />
                                                    },
                                                    {
                                                        validator: this.onDateChange,
                                                    }
                                                ]
                                            })(
                                                <DatePicker
                                                    disabledDate={this.disabledDate}
                                                    allowClear={false}
                                                    placeholder="Select Date"
                                                    showToday={false}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {
                                        (authUser.type === USER_TYPES.DEALER || authUser.type === USER_TYPES.FRANCHISEE) &&
                                        <Col lg={6} md={12} sm={12} xs={24}>
                                            <Form.Item label={<IntlMessages id="app.user.fleetTypeLabel" />} hasFeedback>
                                                {getFieldDecorator('fleetType',
                                                    {
                                                        initialValue: FLEET_TYPE.PRIVATE,
                                                        rules: [
                                                            {
                                                                required: true,
                                                                message: <IntlMessages id="app.user.fleetTypeRequiredMsg" />
                                                            }
                                                        ]
                                                    })(
                                                        <Select placeholder="Select Fleet type" disabled>
                                                            {this.fleetTypeFilter.map(
                                                                (val) => {
                                                                    return (
                                                                        <Select.Option
                                                                            key={val.value}
                                                                            value={val.type
                                                                            }
                                                                        >{val.label}
                                                                        </Select.Option>
                                                                    );
                                                                }
                                                            )}
                                                        </Select>
                                                    )}
                                            </Form.Item>
                                        </Col>
                                    }
                                </Row>
                                {this.state.route !== FEEDER_ROUTE &&
                                    <>
                                        {!userData.id && this.state.route !== RIDER_ROUTE ? (
                                            <Row type="flex" justify="start">
                                                <PasswordForm
                                                    baseForm={form}
                                                    layout="horizontal"
                                                />
                                            </Row>
                                        ) : null}
                                        <Row>
                                            <Col span={24}>
                                                <Form.Item>
                                                    <Form.Item
                                                        label={<IntlMessages id="app.user.address1Label" />}
                                                        style={{
                                                            width: "40%",
                                                            display: "inline-block"
                                                        }}
                                                    >
                                                        {getFieldDecorator(
                                                            'address.line1', {
                                                            rules: [
                                                                {
                                                                    required: (authUser.type === USER_TYPES.FRANCHISEE || !!this.franchiseeId) ? true : false,
                                                                    message: <IntlMessages id="app.user.addressRequiredMsg" />
                                                                }, { max: 50, message: <IntlMessages id="app.user.addressValidationMsg" /> }
                                                            ]
                                                        }
                                                        )(
                                                            <Input placeholder="Line 1"
                                                                autoComplete="disabled" />
                                                        )}
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<IntlMessages id="app.user.address2Label" />}
                                                        style={{
                                                            width: "40%",
                                                            display: "inline-block",
                                                            paddingLeft: 5
                                                        }}
                                                    >
                                                        {getFieldDecorator(
                                                            "address.line2"
                                                        )(
                                                            <Input placeholder="Line 2"
                                                                autoComplete="disabled" />
                                                        )}
                                                    </Form.Item>
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
                                                            width: "30%",
                                                            display: "inline-block"
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
                                                            width: "30%",
                                                            display: "inline-block",
                                                            paddingLeft: "5px"
                                                        }}
                                                    >
                                                        {getFieldDecorator(
                                                            "address.state"
                                                        )(
                                                            <Input placeholder="State" autoComplete="disabled" />
                                                        )}
                                                    </Form.Item>
                                                    <Form.Item
                                                        className="city-width"
                                                        label={<IntlMessages id="app.user.cityLabel" />}
                                                        style={{
                                                            width: "25%",
                                                            display: "inline-block",
                                                            paddingLeft: "5px"
                                                        }}
                                                    >
                                                        {getFieldDecorator("address.city"
                                                        )(<Input placeholder="City" autoComplete="disabled" />)}
                                                    </Form.Item>
                                                    <Form.Item
                                                        className="pincode-width"
                                                        label={<IntlMessages id="app.user.pincodeLabel" />}
                                                        style={{
                                                            width: "15%",
                                                            display: "inline-block",
                                                            paddingLeft: "5px"
                                                        }}
                                                    >
                                                        {getFieldDecorator(
                                                            'address.pinCode', {
                                                            rules: [
                                                                {
                                                                    pattern: new RegExp('^[0-9]{3,6}$'),
                                                                    message: <IntlMessages id="app.user.pincodeLimitValidationMsg" />
                                                                },
                                                                {
                                                                    pattern: new RegExp('^[1-9][0-9]*$'),
                                                                    message: <IntlMessages id="app.user.mobileValidationMsg" />
                                                                },
                                                                {
                                                                    required: (authUser.type === USER_TYPES.FRANCHISEE || !!this.franchiseeId) ? true : false,
                                                                    message: <IntlMessages id="app.user.pincodeRequiredMsg" />
                                                                },
                                                            ]
                                                        }
                                                        )(
                                                            <Input placeholder="Pin Code"
                                                                autoComplete="disabled" />
                                                        )}
                                                    </Form.Item>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                }

                                <Row type="flex" justify="start">
                                    {/* Unique Number*/}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.uniqueIdentityNumber" />}>
                                            {getFieldDecorator('uniqueIdentityNumber', {
                                                rules: [{
                                                    required: false,
                                                    message: <IntlMessages id="app.user.uniqueIdentityRequiredMsg" />
                                                }, {
                                                    min: 3,
                                                    message: <IntlMessages id="app.user.uniqueIdentityMinLimitMsg" />
                                                },
                                                {
                                                    max: 20,
                                                    message: <IntlMessages id="app.user.uniqueIdentityMaxLimitMsg" />
                                                }, {
                                                    pattern: /^([a-zA-Z0-9]+)$/,
                                                    message: <IntlMessages id="app.user.noSpaceMsg" />
                                                }, {
                                                    pattern: /^([a-zA-Z0-9]+)$/,
                                                    message: <IntlMessages id="app.user.onlyAlphanumericMsg" />
                                                }]
                                            })(
                                                <Input placeholder="Unique Identity number" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    {/* upload Image*/}
                                    <Col lg={6} md={12} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.user.uploadPhotoLabel" />}>
                                            {getFieldDecorator('image', {
                                                required: false,
                                                getValueFromEvent: this.getSingleFilePath
                                            })(
                                                <Upload key="image" {...this.state.imageUploadprops}>
                                                    <Button>
                                                        <Icon type="upload" /> <IntlMessages id="app.user.uploadPhotoLabel" />
                                                    </Button>
                                                </Upload>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
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
                                                    pathname: this.franchiseeId ?
                                                        `/e-scooter/${FRANCHISEE_ROUTE}/view/${this.franchiseeId}` :
                                                        this.state.route === RIDER_ROUTE
                                                            ? `/e-scooter/${RIDER_ROUTE}`
                                                            : this.state.route === FEEDER_ROUTE
                                                                ? `/e-scooter/${FEEDER_ROUTE}`
                                                                : `/e-scooter/users`,
                                                    tab: "4"
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
                                                style={{ display: "inline-flex" }}
                                                type="primary"
                                                htmlType="submit"
                                            >
                                                {!userData.id ?
                                                    <IntlMessages id="app.save" /> :
                                                    <IntlMessages id="app.update" />}
                                            </Button>
                                        </span>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </CustomScrollbars>
                </div>
            </div >
        );
    }
}

const WrappedUserUpsert = Form.create({ name: 'userUpsertForm' })(UserUpsert);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedUserUpsert);
