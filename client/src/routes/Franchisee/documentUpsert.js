import {
    Button, Col, Form, Icon, Input, Modal, Row, Upload, message, Select
} from 'antd';
import {
    FILE_TYPES, MASTER_CODES, DEFAULT_API_ERROR, PAGE_PERMISSION
} from '../../constants/Common';

import CrudService from '../../services/api';
import React from 'react';
import axios from 'util/Api';
// import { codeConvert } from '../../appRedux/actions/Master';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';


const _ = require('lodash');

class BankDataUpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleDocumentName: false,
            documents: [],
            recordData: null,
            disable: false,
            imageUploadprops: {
                name: 'file',
                action: `/upload-file`,
                fileList: [],
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: ['image', 'pdf'] });
                },
                onChange: (info) => {
                    return this.onFileChange(info, { fieldName: 'document', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                },
                showUploadList: {
                    showDownloadIcon: false
                }
            }
        };
    }
    componentDidMount = async () => {
        await this.getDocument();

    }
    getDocument = async () => {
        let obj = {
            masters: [MASTER_CODES.DOCUMENT],
            include: ['subMasters'],
        };
        try {
            let data = await axios.post('admin/master/list-by-code', obj);
            if (data.code === 'OK') {
                let brands = data.data;
                if (brands && brands[MASTER_CODES.DOCUMENT] && brands[MASTER_CODES.DOCUMENT].subMasters) {
                    this.setState({
                        documents: brands[MASTER_CODES.DOCUMENT].subMasters
                    });
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
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
    validateFile = function (file, as) {
        let validSize = (file.size / (1024 * 1024)).toFixed(2) > 5;
        file.isValid = FILE_TYPES[as.type[0]].indexOf(file.type) > -1 || FILE_TYPES[as.type[1]].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error(<IntlMessages id="app.invalidFileType" />);
        }
        if (validSize) {
            message.error(<IntlMessages id="app.fileSizeMsg" />);
            file.isValid = !validSize;
        }
        return file.isValid;
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            // this.fetch();
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
    getDocumentName = value => {
        let otherDocument = _.filter(this.state.documents, (doc) => { return doc.id === value })[0].code;
        if (otherDocument === 'OTHER') {
            this.setState({ visibleDocumentName: true })
        }
        else {
            this.setState({ visibleDocumentName: false })
        }
    }
    handleSubmit = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            let obj = values;
            if (obj.path === '' || obj.path === undefined) {
                message.error(<IntlMessages id="app.partner.documentMustUpload" />)
                return
            }
            obj.backPath = obj.path;
            obj.referenceId = this.props.id;
            obj.number = "";
            obj.module = PAGE_PERMISSION.USERS;
            console.log("TCL: BankDataUpsertModal -> handleSubmit -> obj", obj)
            let url = `/admin/document/add`;
            let method = `post`;
            // //edit
            // if (this.state.recordData) {
            //     url = `/admin/payment/update-bank-account`;
            //     method = `put`;
            //     obj.bankDetails.bankAccountId = this.state.recordData.id
            // }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ recordData: null })
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
    render() {
        const { onCancel, form } = this.props;
        const { documents } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.partner.addDocument" />}
                okText={< IntlMessages id="app.add" />}
                cancelText={<IntlMessages id="app.cancel" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.partner.documentType" />} hasFeedback>
                                {getFieldDecorator("type", {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.partner.documentTypeRequiredMsg" />
                                    }]
                                })(
                                    <Select
                                        onChange={this.getDocumentName.bind(this)}
                                        placeholder="Select Document Type"
                                    >
                                        {
                                            documents.map((documents) => {
                                                return <Select.Option key={documents.id}
                                                    value={documents.id}>
                                                    {documents.name}
                                                </Select.Option>;
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        {this.state.visibleDocumentName &&
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label={<IntlMessages id="app.partner.documentName" />}
                                    style={{ paddingLeft: '5px' }}
                                    hasFeedback>
                                    {getFieldDecorator('name', {
                                        rules: [{
                                            required: true,
                                            message: <IntlMessages id="app.partner.documentNameRequiredMsg" />
                                        }, { max: 25 },
                                        {
                                            pattern: /^([a-zA-Z0-9]+)$/,
                                            message: <IntlMessages id="app.partner.documentNameSpaceMsg" />
                                        }]
                                    })(
                                        <Input placeholder="Document Name" />
                                    )}
                                </Form.Item>
                            </Col>}
                    </Row>
                    <Row>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item
                                // className="inlineRow"
                                style={{ display: 'inline-block', paddingLeft: '5px' }}>
                                {getFieldDecorator('path', {
                                    required: true,
                                    getValueFromEvent: this.getSingleFilePath
                                })(
                                    <Upload key="image" {...this.state.imageUploadprops}>
                                        <Button disabled={this.state.disable}>
                                            <Icon type="upload" /> <IntlMessages id="app.partner.uploadDocument" />
                                        </Button>
                                    </Upload>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal >
        );
    }
}

const WrappedBankUpsertModal = Form.create({ name: 'bankdataUpsertForm' })(BankDataUpsertModal);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedBankUpsertModal);
