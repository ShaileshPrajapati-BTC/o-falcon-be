import {
    Button, Checkbox, Col, Form, Icon, Input, Modal, Row, Upload, message
} from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_LANGUAGE, FILE_TYPES
} from '../../constants/Common';

import CrudService from '../../services/api';
import IntlMessages from 'util/IntlMessages';
import LanguagesList from '../../components/LanguagesList';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { codeConvert } from '../../appRedux/actions/Master';
import { connect } from 'react-redux';


const _ = require('lodash');
const { TextArea } = Input;

class MasterUpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: DEFAULT_LANGUAGE,
            fields: ['name'],
            recordData: {},
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
                    return this.onFileChange(info, { fieldName: 'icon', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        };
    }
    componentDidMount() {
        if (this.props.id) {
            this.fetch(this.props.id);
        }
    }

    fetch = async (id) => {
        const { form } = this.props;
        try {
            let response = await axios.get(`admin/master/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                let formVal = recordData;
                form.setFieldsValue(formVal);
                console.log('   filelist   ', recordData);
                this.setState({
                    recordData: recordData
                });

                let image = form.getFieldValue('icon');
                if (image && typeof image === 'string') {
                    this.setState((state) => {
                        state.imageUploadprops.fileList = [{
                            uid: 'uid',
                            name: 'Image',
                            status: 'done',
                            url: image
                        }];

                        return state;
                    });
                } else {
                    this.setState((state) => {
                        state.imageUploadprops.fileList = [];

                        return state;
                    });
                }
            } else {
                console.log(' ELSE ERROR ');
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    handleOnChange = (e) => {
        if (this.state.language !== DEFAULT_LANGUAGE) {
            return false;
        }
        const code = codeConvert(e.target.value);
        this.props.form.setFieldsValue({ code: code });
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

    handleSubmit = async () => {
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            let url = `admin/master/create`;
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
                url = `admin/master/${id}`;
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
        const {
            onCancel, form, id
        } = this.props;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title={id ? <IntlMessages id="app.master.editMaster" /> : <IntlMessages id="app.master.addMaster" />}
                okText={id ? <IntlMessages id="app.update" defaultMessage="Update"/> : <IntlMessages id="app.add" defaultMessage="Add"/>}
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
                                        { max: 35 },
                                        { required: true, message: <IntlMessages id="app.master.pleaseAddName" /> }
                                    ]
                                })(
                                    <Input placeholder="Name"
                                        onChange={this.handleOnChange} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.user.codeLabel" />}
                                // className="inlineRow"
                                style={{ paddingLeft: '5px' }}
                                hasFeedback>
                                {getFieldDecorator('code', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.master.pleaseAddCode" />
                                    }, {
                                        pattern: /^[\w-+.\\/]+$/,
                                        message: <IntlMessages id="app.master.codeCharSpaceValidation" />
                                    }, {
                                        max: 35
                                    }]
                                })(
                                    <Input placeholder="Code" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>

                            <Form.Item label={<IntlMessages id="app.description" />}>
                                {getFieldDecorator('description', {})(
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

                            <Form.Item className="inlineRow">
                                {getFieldDecorator('isActive', {
                                    valuePropName: 'checked',
                                    initialValue: true
                                })(
                                    <Checkbox><IntlMessages id="app.active" /></Checkbox>
                                )}

                                {/* {getFieldDecorator('isDefault', {
                                valuePropName: 'checked'
                            })(
                                <Checkbox><IntlMessages id="master.isDefault" /></Checkbox>
                            )}*/}
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item
                                // className="inlineRow"
                                style={{ display: 'inline-block', paddingLeft: '5px' }}>
                                {getFieldDecorator('icon', {
                                    required: false,
                                    getValueFromEvent: this.getSingleFilePath
                                })(
                                    <Upload key="image" {...this.state.imageUploadprops}>
                                        <Button>
                                            <Icon type="upload" /> <IntlMessages id="app.uploadIcon" defaultMessage="upload Icon"/>
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

const WrappedMasterUpsertModal = Form.create({ name: 'masterUpsertForm' })(MasterUpsertModal);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedMasterUpsertModal);
