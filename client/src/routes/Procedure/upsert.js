import {
    Button, Col, Form, Icon, Input, Modal, Row, Select, Upload, message
} from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_LANGUAGE, FILE_TYPES, MASTER_CODES
} from '../../constants/Common';
import CrudService from '../../services/api';
import LanguagesList from '../../components/LanguagesList';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');
const { TextArea } = Input;

class UpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disable: false,
            language: DEFAULT_LANGUAGE,
            fields: ['name', 'description', 'path'],
            recordData: {},
            manufacturers: [],
            imageUploadprops: {
                name: 'file',
                action: `/upload-file`,
                fileList: [],
                headers: {
                    destination: 'procedure'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'pdf' });
                },
                onChange: (info) => {
                    return this.onFileChange(info, { fieldName: 'path', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        };
    }
    componentDidMount() {
        this.getMasters();
        if (this.props.id) {
            this.fetch(this.props.id);
        }
    }

    fetch = async (id) => {
        const { form } = this.props;
        let self = this;
        try {
            let response = await axios.get(`admin/procedure/${id}`);
            let recordData = response.data;
            let formVal = recordData;
            form.setFieldsValue(formVal);

            self.setState((state) => {
                state.recordData = recordData;

                return state;
            });
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    getMasters = async () => {
        let obj = {
            masters: [MASTER_CODES.MANUFACTURER],
            include: ['subMasters']
        };
        try {
            let data = await axios.post('admin/master/list-by-code', obj);
            if (data.code === 'OK') {
                let masters = data.data;
                if (masters && masters[MASTER_CODES.MANUFACTURER]) {
                    let manufacturers = masters[MASTER_CODES.MANUFACTURER].subMasters ?
                        masters[MASTER_CODES.MANUFACTURER].subMasters :
                        [];
                    this.setState({
                        manufacturers: manufacturers
                    });
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    };

    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error('Invalid file type');
        }

        return file.isValid;
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            this.fetch();
            this.setState({ disable: false });
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
        if (e.file && e.file.status === 'removed') {
            this.setState({ disable: false });

            return '';
        }

        if (e.file && e.file.status === 'done') {
            if (e && e.file.response && e.file.response.data &&
                _.size(e.file.response.data.files) > 0 &&
                e.file.response.data.files[0].absolutePath) {
                this.setState({ disable: true });

                return e.file.response.data.files[0].absolutePath;
            }
        }

        return '';
    };
    handleSubmit = async () => {
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            let url = `admin/procedure/add`;
            let method = `post`;
            let { id } = self.state.recordData;
            values.multiLanguageData = this.state.recordData.multiLanguageData;
            let obj = UtilService.setFormDataForLanguage(
                this.state.fields,
                this.state.language,
                values
            );
            const isValid = UtilService.defaultLanguageDataValidation(this.state.fields, obj);
            if (isValid !== true) {
                message.error(isValid);

                return;
            }

            if (id) {
                url = `admin/procedure/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.props.handleSubmit();
                } else {
                    message.error(`${response.message}`);
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }

        });
    }
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
    }

    render() {
        const { manufacturers } = this.state;
        const {
            onCancel, form, id
        } = this.props;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title={id ? <IntlMessages id="app.procedure.editProcedure" /> : <IntlMessages id="app.procedure.addProcedure" />}
                okText={id ? <IntlMessages id="app.update" /> : <IntlMessages id="app.add" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item>
                                <LanguagesList
                                    onSelect={this.handleLanguageChange.bind(this)}
                                    selected={this.state.language}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.name" />}
                                hasFeedback>
                                {getFieldDecorator('name', {
                                    rules: [
                                        {
                                            transform: (value) => {
                                                return value && value.trim();
                                            }
                                        },
                                        { required: true, message: 'Please add name!' }
                                    ]
                                })(
                                    <Input placeholder="Name"
                                        onChange={this.handleOnChange} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.vehicle.manufacturer" />}
                                hasFeedback>
                                {getFieldDecorator('manufacturer', {
                                    rules: [{ required: true, message: <IntlMessages id="app.vehicle.manufacturerRequiredMsg" /> }]
                                })(
                                    <Select placeholder="Select Manufacturer">
                                        {
                                            manufacturers.map((manufacturer) => {
                                                return <Select.Option key={manufacturer.id}
                                                    value={manufacturer.id}>
                                                    {manufacturer.name}
                                                </Select.Option>;
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>

                            <Form.Item label={<IntlMessages id="app.description" />}>
                                {getFieldDecorator('description', {
                                    rules: [{ required: true, message: <IntlMessages id="app.procedure.addDescription" /> }]
                                })(
                                    <TextArea multiline="true"
                                        rows={3}
                                        placeholder="Description"
                                        margin="none" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item
                                // className="inlineRow"
                                style={{ display: 'inline-block', paddingLeft: '5px' }}>
                                {getFieldDecorator('path', {
                                    rules: [{ required: true, message: <IntlMessages id="app.procedure.pleaseUploadPdf" /> }],
                                    getValueFromEvent: this.getSingleFilePath
                                })(
                                    <Upload key="image" {...this.state.imageUploadprops}>
                                        <Button disabled={this.state.disable}>
                                            <Icon type="upload" /> <IntlMessages id="app.uploadPdf" />
                                        </Button>
                                    </Upload>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

const WrappedUpsertModal = Form.create({ name: 'UpsertForm' })(UpsertModal);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedUpsertModal);
