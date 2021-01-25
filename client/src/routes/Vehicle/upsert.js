import {
    Affix,
    Button,
    Col,
    Form,
    Input,
    Row,
    Select,
    Typography,
    message,
    DatePicker,
    Upload,
    Icon
} from 'antd';
import {
    DEFAULT_API_ERROR,
    DEFAULT_LANGUAGE,
    MASTER_CODES,
    VEHICLE_TYPES,
    FRANCHISEE_LABEL,
    FLEET_TYPE,
    FILE_TYPES,
    DEFAULT_VEHICLE,
    FILTER_VISIBLE,
    USER_TYPES,
    PARTNER_WITH_CLIENT_FEATURE
} from '../../constants/Common';
import { Link, Redirect } from 'react-router-dom';
import LanguagesList from '../../components/LanguagesList';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import moment from 'moment';
import CrudService from '../../services/api';
import uuid from 'react-uuid';
import IntlMessages from '../../util/IntlMessages';

const { Title } = Typography;
const _ = require("lodash");
let hasPower = true;
let hasPlug = true;
let hasFleetType = true;
class VehicleUpsert extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.match.params.id,
            recordData: {},
            manufacturers: [],
            lockManufacturers: [],
            // userList: [],
            franchiseeList: [],
            chargerPlugs: [],
            chargerPowers: [],
            language: DEFAULT_LANGUAGE,
            fields: ["name"],
            vehicleCode: false,
            selectedManufacturer: {},
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
        this.fleetType = [];
    }

    componentDidMount() {
        for (const key in FLEET_TYPE) {
            this.fleetType.push({ id: FLEET_TYPE[key], name: key })
        }
        this.initialize();
    }

    initialize = async () => {
        await this.getMasters();
        // await this.getAdminUserList();
        await this.getFranchiseeList();
        if (this.state.id) {
            await this.fetch(this.state.id);

            return;
        }
        if (DEFAULT_VEHICLE) {
            const { form } = this.props;
            form.setFieldsValue({ type: DEFAULT_VEHICLE });
        }

    }

    // getAdminUserList = async () => {
    //     const { auth } = this.props;
    //     if (auth.authUser.type === USER_TYPES.SUPER_ADMIN) {
    //         let data = await axios.post('admin/user/paginate', {
    //             filter: {
    //                 type: USER_TYPES.ADMIN
    //             },
    //             project: ['firstName', 'lastName', 'type', 'isActive']
    //         });

    //         if (data && data.code === "OK") {
    //             data = data.data;
    //             this.setState({
    //                 userList: data.list
    //             });
    //         }
    //     } else {
    //         this.setState({ userList: [auth.authUser] });
    //     }
    // };
    getFranchiseeList = async () => {
        let data = await axios.post('admin/user/franchisee-list', {
            filter: { type: USER_TYPES.FRANCHISEE, isDeleted: false, isActive: true, addOwnUser: false }
        });
        if (data && data.code === 'OK') {
            data = data.data;
            this.setState({
                franchiseeList: data.list
            });
        }
    };
    getMasters = async () => {
        let obj = {
            masters: [
                MASTER_CODES.MANUFACTURER,
                MASTER_CODES.LOCK_MANUFACTURER,
                MASTER_CODES.CHARGING_PLUG,
                MASTER_CODES.CHARGING_POWER
            ],
            include: ['subMasters']
        };
        try {
            const { form } = this.props;
            let data = await axios.post('admin/master/list-by-code', obj);
            if (data.code === 'OK') {
                let masters = data.data;
                if (masters && masters[MASTER_CODES.MANUFACTURER]) {
                    this.setState({
                        manufacturers: masters[MASTER_CODES.MANUFACTURER]
                            .subMasters ?
                            masters[MASTER_CODES.MANUFACTURER].subMasters :
                            []
                    });
                    _.each(this.state.manufacturers, (item) => {
                        if (item.isDefault) {
                            form.setFieldsValue({ manufacturer: item.id });
                            this.setState({
                                selectedManufacturer: item
                            });
                        }
                    });
                }
                if (masters && masters[MASTER_CODES.LOCK_MANUFACTURER]) {
                    let lockManufacturers = masters[
                        MASTER_CODES.LOCK_MANUFACTURER
                    ].subMasters ?
                        masters[MASTER_CODES.LOCK_MANUFACTURER].subMasters :
                        [];
                    _.each(lockManufacturers, (item) => {
                        if (item.isDefault) {
                            form.setFieldsValue({ lockManufacturer: item.id });
                        }
                    });
                    this.setState({
                        lockManufacturers: lockManufacturers
                    });
                }
                if (masters && masters[MASTER_CODES.CHARGING_PLUG]) {
                    this.setState({
                        chargerPlugs: masters[MASTER_CODES.CHARGING_PLUG]
                            .subMasters ?
                            masters[MASTER_CODES.CHARGING_PLUG].subMasters :
                            []
                    });
                    _.each(this.state.chargerPlugs, (item) => {
                        if (item.isDefault) {
                            form.setFieldsValue({ chargerPlugIds: item.id });
                        }
                    });
                }

                if (masters && masters[MASTER_CODES.CHARGING_POWER]) {
                    this.setState({
                        chargerPowers: masters[MASTER_CODES.CHARGING_POWER]
                            .subMasters ?
                            masters[MASTER_CODES.CHARGING_POWER].subMasters :
                            []
                    });
                    _.each(this.state.chargerPowers, (item) => {
                        if (item.isDefault) {
                            form.setFieldsValue({ chargerPowerTypes: item.id });
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    };
    fetch = async id => {
        const { form } = this.props;

        let self = this;
        self.setState({ loading: true });
        try {
            let response = await axios.get(`admin/vehicle/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                if (recordData.chargerPlugIds === null) {
                    recordData = _.omit(recordData, [
                        "chargerPlugIds"
                    ]);
                }
                if (recordData.chargerPowerTypes === null) {
                    recordData = _.omit(recordData, [
                        "chargerPowerTypes"
                    ]);
                }
                this.handleManufacturer(recordData.manufacturer);
                let formVal = recordData;

                form.setFieldsValue(formVal);
                self.setState((prevState) => {
                    prevState.recordData = recordData;
                });
                let image = form.getFieldValue('image');
                let filelist = [];
                image && image.forEach((image, i) => {
                    if (image && typeof image === 'string') {
                        filelist.push({
                            uid: `uid${i}`,
                            name: `Image${i}`,
                            status: 'done',
                            url: image
                        })
                    }
                })
                this.setState((state) => {
                    state.imageUploadprops.fileList = filelist;
                    return state;
                });
            }
            self.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        let self = this;

        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }

            let url = `admin/vehicle/add`;
            let method = `post`;
            let { id } = self.state.recordData;
            values.multiLanguageData = this.state.recordData.multiLanguageData;
            let obj = UtilService.setFormDataForLanguage(
                this.state.fields,
                this.state.language,
                values
            );
            const isValid = UtilService.defaultLanguageDataValidation(
                this.state.fields,
                obj
            );
            if (isValid !== true) {
                message.error(isValid);
                return;
            }
            if (id) {
                url = `admin/vehicle/${id}`;
                method = `put`;
            }
            try {
                let data = await axios[method](url, obj);
                if (data.code === 'OK') {
                    message.success(`${data.message}`);
                    this.props.history.push({
                        pathname: `/e-scooter/vehicle`,
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
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    handleLanguageChange = (language) => {
        // multi language field
        const { recordData } = this.state;
        const { form } = this.props;
        let formValues = form.getFieldsValue();
        formValues.multiLanguageData = recordData.multiLanguageData;
        let newRecordData = UtilService.setFormDataForLanguage(
            this.state.fields,
            this.state.language,
            formValues
        );
        recordData.multiLanguageData = newRecordData.multiLanguageData;
        this.setState({ language, recordData });
        const values = UtilService.getLanguageValues(
            this.state.fields,
            language,
            recordData.multiLanguageData
        );
        form.setFieldsValue(values);
    };
    handelPower = (e) => {
        if (e.length === 0) {
            hasPower = false;
        }
        else {
            hasPower = true;
        }
    }
    handelPlug = (e) => {
        if (e.length === 0) {
            hasPlug = false;
        }
        else {
            hasPlug = true;
        }
    }
    handleFleetTYpe = (e) => e.length === 0 ? hasFleetType = false : hasFleetType = true

    handleManufacturer = (value) => {
        let selectedManufacturer = _.find(this.state.manufacturers, { id: value });
        this.setState({ selectedManufacturer: selectedManufacturer });
    }
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
        this.setState((state) => {
            state[option.stateKeyName].fileList = _.filter(info.fileList, { isValid: true });
            return state;
        });
    }
    getSingleFilePath = (e) => {
        let fileArr = [];
        if (e && e.fileList) {
            e.fileList.forEach((file) => {
                if (file.response && file.response.data && file.response.data.files[0]) {
                    fileArr.push(file.response.data.files[0].absolutePath);
                }
            })
        }
        if (fileArr.length === 0) {
            return '';
        }
        if (e.file && (e.file.status === 'done' || e.file.status === 'removed')) {
            return fileArr;
        }
        return '';
    };
    // eslint-disable-next-line max-lines-per-function
    render() {
        const {
            recordData,
            manufacturers,
            lockManufacturers,
            language,
            chargerPlugs,
            chargerPowers,
            franchiseeList,
            vehicleCode,
            id,
            selectedManufacturer
        } = this.state;
        const { form, auth } = this.props;
        const { getFieldDecorator } = form;
        // no need we do it from access permission
        // const isSuperAdminOrAdmin =
        //     auth.authUser.type === USER_TYPES.SUPER_ADMIN ||
        //     auth.authUser.type === USER_TYPES.ADMIN;
        // if (!isSuperAdminOrAdmin) {
        //     return <Redirect to={"/e-scooter/dashboard"} />;
        // }

        const isDealer = auth.authUser.type === USER_TYPES.DEALER
        const isFranchisee = auth.authUser.type === USER_TYPES.FRANCHISEE
        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <div>
                                <Title
                                    level={4}
                                    className="gx-mb-0 gx-d-inline-block"
                                >
                                    {recordData.id ?
                                        <IntlMessages id="app.vehicle.updateVehicle" /> :
                                        <IntlMessages id="app.vehicle.addVehicle" />}
                                </Title>
                            </div>
                            <div>
                                <LanguagesList
                                    onSelect={this.handleLanguageChange.bind(
                                        this
                                    )}
                                    selected={language}
                                />

                                <Link
                                    className="gx-ml-2 topbarCommonBtn"
                                    to={{
                                        pathname: `/e-scooter/vehicle`,
                                        filter: this.props.location.filter
                                    }}
                                >
                                    <Button
                                        className="gx-mb-0"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <IntlMessages id="app.list" />
                                    </Button>
                                </Link>
                            </div>
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content">
                    <div className="gx-mt-3">
                        <Form layout="vertical" onSubmit={this.handleSubmit}>
                            <Row type="flex" justify="start">
                                <Col lg={8} md={12} sm={12} xs={24} className={!FILTER_VISIBLE ? "displayNone" : ""}>
                                    <Form.Item label={<IntlMessages id="app.type" />} hasFeedback>
                                        {getFieldDecorator('type', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: <IntlMessages id="app.vehicle.vehicleTypeRequiredMsg" />
                                                }
                                            ]
                                        })(
                                            <Select placeholder="Select type" disabled={isDealer || isFranchisee}>
                                                {Object.keys(VEHICLE_TYPES).map(
                                                    (val) => {
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
                                                                    ' '
                                                                )}
                                                            </Select.Option>
                                                        );
                                                    }
                                                )}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.name" />} hasFeedback>
                                        {getFieldDecorator('name', {
                                            rules: [
                                                {
                                                    transform: (value) => {
                                                        return (
                                                            value &&
                                                            value.trim()
                                                        );
                                                    }
                                                },
                                                {
                                                    required: true,
                                                    message: <IntlMessages id="app.nameRequiredMsg" />
                                                }
                                            ]
                                        })(<Input placeholder="Name" disabled={isDealer || isFranchisee} name={uuid()} />)}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.qrNumber" />} hasFeedback>
                                        {getFieldDecorator('qrNumber', {
                                            rules: [
                                                {
                                                    transform: (value) => {
                                                        return (
                                                            value &&
                                                            value.trim()
                                                        );
                                                    }
                                                },
                                                {
                                                    required: true,
                                                    message: <IntlMessages id="app.vehicle.qrNumberRequiredMsg" />
                                                }, {
                                                    min: 3,
                                                    message: <IntlMessages id="app.vehicle.qrNumberMinLimitMsg" />
                                                }, {
                                                    max: 30,
                                                    message: <IntlMessages id="app.vehicle.qrNumberMaxLimitMsg" />
                                                }
                                            ]
                                        })(<Input placeholder="QR Number" disabled={isDealer || isFranchisee} name={uuid()} />)}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row type="flex" justify="start">
                                {/* Plug Id */}
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.changePlugLabel" />} hasFeedback={hasPlug}>
                                        {getFieldDecorator("chargerPlugIds")(
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Charger Plug"
                                                onChange={this.handelPlug}
                                                disabled={isDealer || isFranchisee}
                                            >
                                                {chargerPlugs.map((plug) => {
                                                    return (
                                                        <Select.Option
                                                            key={plug.id}
                                                            value={plug.id}
                                                        >
                                                            {plug.name}
                                                        </Select.Option>
                                                    );
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                {
                                    (auth.authUser.type === USER_TYPES.FRANCHISEE || PARTNER_WITH_CLIENT_FEATURE || auth.authUser.type === USER_TYPES.DEALER) && id &&
                                    <Col lg={8} md={24} sm={12} xs={24}>
                                        <Form.Item
                                            label={<IntlMessages id="app.user.fleetTypeLabel" />}
                                            hasFeedback={hasFleetType}
                                        >
                                            {getFieldDecorator('fleetType', {
                                                rules: [
                                                    {
                                                        required: auth.authUser.type === USER_TYPES.DEALER,
                                                        message: <IntlMessages id="app.user.fleetTypeRequiredMsg" />
                                                    },
                                                ]
                                            })(
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Select Fleet Type"
                                                    onChange={this.handleFleetTYpe}
                                                >
                                                    {this.fleetType.map((fleet) => {
                                                        return (
                                                            <Select.Option
                                                                key={fleet.id}
                                                                value={fleet.id}
                                                            >
                                                                {fleet.name}
                                                            </Select.Option>
                                                        );
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                }
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item
                                        label={<IntlMessages id="app.vehicle.chargerPower" />}
                                        hasFeedback={hasPower}
                                    >
                                        {getFieldDecorator('chargerPowerTypes')(
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Charger Power"
                                                onChange={this.handelPower}
                                                disabled={isDealer || isFranchisee}
                                            >
                                                {chargerPowers.map((power) => {
                                                    return (
                                                        <Select.Option
                                                            key={power.id}
                                                            value={power.id}
                                                        >
                                                            {power.name}
                                                        </Select.Option>
                                                    );
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.numberPlateLabel" />} hasFeedback>
                                        {getFieldDecorator("numberPlate", {
                                            rules: [
                                                {
                                                    transform: value => { return (value && value.trim()); }
                                                },
                                                { required: false, message: <IntlMessages id="app.vehicle.numberPlateRequiredMsg" /> },
                                                { pattern: /^[a-z\d\s]+$/i, message: <IntlMessages id="app.vehicle.numberPlateValidationMsg" /> },
                                                {
                                                    min: 3,
                                                    message: <IntlMessages id="app.vehicle.numberPlateMinLimitMsg" />
                                                }, {
                                                    max: 30,
                                                    message: <IntlMessages id="app.vehicle.numberPlateMaxLimitMsg" />
                                                }
                                            ]
                                        })(<Input placeholder="Number Plate" disabled={isDealer || isFranchisee} name={uuid()} />)}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row type="flex" justify="start">
                                <Col lg={12} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.manufacturer" />} hasFeedback>
                                        {getFieldDecorator('manufacturer', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: <IntlMessages id="app.vehicle.manufacturerRequiredMsg" />
                                                }
                                            ]
                                        })(
                                            <Select placeholder="Select Manufacturer"
                                                onSelect={this.handleManufacturer} disabled={isDealer || isFranchisee}>
                                                {manufacturers.map(
                                                    (manufacturer) => {
                                                        return (
                                                            <Select.Option
                                                                key={
                                                                    manufacturer.id
                                                                }
                                                                value={
                                                                    manufacturer.id
                                                                }
                                                            >
                                                                {
                                                                    manufacturer.name
                                                                }
                                                            </Select.Option>
                                                        );
                                                    }
                                                )}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item
                                        label={<IntlMessages id="app.vehicle.lockManufacturer" />}
                                        hasFeedback
                                    >
                                        {getFieldDecorator('lockManufacturer')(
                                            <Select placeholder="Select Lock Manufacturer" disabled={isDealer || isFranchisee}>
                                                {lockManufacturers.map(
                                                    (lockManufacturer) => {
                                                        return (
                                                            <Select.Option
                                                                key={
                                                                    lockManufacturer.id
                                                                }
                                                                value={
                                                                    lockManufacturer.id
                                                                }
                                                            >
                                                                {
                                                                    lockManufacturer.name
                                                                }
                                                            </Select.Option>
                                                        );
                                                    }
                                                )}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            {
                                selectedManufacturer.description ?
                                    <Row type="flex" justify="start">
                                        <Col lg={12} md={12} sm={12} xs={24}>
                                            <pre className="gx-bg-primary" style={{ padding: '10px' }}>
                                                {selectedManufacturer.description}
                                            </pre>
                                        </Col>
                                    </Row> :
                                    null
                            }

                            <Row type="flex" justify="start">
                                <Col lg={12} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.imei" />} hasFeedback>
                                        {getFieldDecorator('imei', {
                                            rules: [
                                                { pattern: /^\S+$/g, message: <IntlMessages id="app.vehicle.imeiSpaceValidation" /> },
                                                { required: true, message: <IntlMessages id="app.vehicle.imeiRequiredMsg" /> },
                                                { transform: value => { return (value && value.trim()); } },
                                                { min: 3, message: <IntlMessages id="app.vehicle.imeiMinLimitMsg" /> },
                                                { max: 30, message: <IntlMessages id="app.vehicle.imeiMaxLimitMsg" /> }
                                            ]
                                        })(<Input placeholder="Imei" name={uuid()} disabled={isDealer || isFranchisee} />)}
                                    </Form.Item>
                                </Col>
                                <Col lg={12} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.macAddress" />} hasFeedback>
                                        {getFieldDecorator('mac', {
                                            rules: [
                                                { pattern: /^\S+$/g, message: <IntlMessages id="app.vehicle.macAddressSpaceValidation" /> },
                                                { transform: value => { return (value && value.trim()); } },
                                                { min: 3, message: <IntlMessages id="app.vehicle.macAddressMinLimitMsg" /> },
                                                { max: 30, message: <IntlMessages id="app.vehicle.macAddressMaxLimitMsg" /> }
                                            ]
                                        })(<Input placeholder="Mac Address" name={uuid()} disabled={isDealer || isFranchisee} />)}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                {vehicleCode && <Col lg={8} md={24} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.vehicle.vehicleCode" />} hasFeedback>
                                        {getFieldDecorator("vehicleCode", {
                                            rules: [{
                                                required: vehicleCode,
                                                message: <IntlMessages id="app.vehicle.vehicleCodeRequiredMsg" />
                                            }]
                                        })(<Input placeholder="Vehicle Code" name={uuid()} disabled={isDealer || isFranchisee} />)}
                                    </Form.Item>
                                </Col>}
                            </Row>
                            <Row type="flex" justify="start">
                                {/* upload photo */}
                                {/* <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label="Model Name" hasFeedback>
                                        {getFieldDecorator("modelName", {
                                            rules: [
                                                {
                                                    transform: value => {
                                                        return (
                                                            value &&
                                                            value.trim()
                                                        );
                                                    }
                                                },
                                                {
                                                    required: false,
                                                    message: "Please add Model Name."
                                                }
                                            ]
                                        })(<Input placeholder="Model Name" name={uuid()}/>)}
                                    </Form.Item>
                                </Col> */}
                                <Col lg={6} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.user.uploadPhotoLabel" />}>
                                        {getFieldDecorator('image', {
                                            required: false,
                                            getValueFromEvent: this.getSingleFilePath
                                        })(
                                            <Upload key="image" {...this.state.imageUploadprops}>
                                                <Button disabled={isDealer || isFranchisee}>
                                                    <Icon type="upload" /> <IntlMessages id="app.user.uploadPictureLabel" />
                                                </Button>
                                            </Upload>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24} className="gx-text-right">
                                    {!recordData.id ?
                                        <Button
                                            style={{
                                                marginLeft: 8,
                                                marginTop: 15
                                            }}
                                            onClick={this.handleReset}
                                        >
                                            <IntlMessages id="app.clear" />
                                        </Button>
                                        : null}
                                    <span className="topbarCommonBtn">
                                        <Button
                                            style={{ display: 'inline-flex' }}
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            <IntlMessages id="app.save" />
                                        </Button>
                                    </span>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

const WrappedVehicleUpsert = Form.create({ name: 'VehicleUpsertForm' })(
    VehicleUpsert
);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedVehicleUpsert);
