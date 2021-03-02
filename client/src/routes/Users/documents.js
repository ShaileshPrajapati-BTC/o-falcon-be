/* eslint-disable multiline-ternary */
import { DOCUMENT_VERIFICATION_STATUS, BASE_URL, FILE_TYPES } from '../../constants/Common';
import { Col, Empty, Row, message, Upload, Button, Icon, Form } from 'antd';
import React, { Component } from 'react';
import ActionButton from './action';
// import ReactDOM from 'react-dom';
import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class Documents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            uploadDocument: '',
            userData: props.userData,
            data: props.data,
            documentUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                showUploadList: {
                    showRemoveIcon: false,
                },
                action: '/upload-file',
                fileList: [],
                headers: {
                    destination: 'user'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'image' });
                },
                onChange: (info) => {
                    return this.onDocumentUploadChange(info, {
                        fieldName: 'uploadDocument',
                        stateKeyName: 'documentUploadprops'
                    });
                }
            }
        };
        this.verification = [
            // { label: 'Pending', value: 0 },
            { label: <IntlMessages id="app.user.approved" />, value: 1 },
            { label: <IntlMessages id="app.user.rejected" />, value: 2 }
        ];

    }
    onVerification = (value) => {
        console.log('value---', value);
        if (this.props.data.drivingLicence.imageStatus !== DOCUMENT_VERIFICATION_STATUS.APPROVED) {
            this.setState({ showModal: true });
        }
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

    onDocumentUploadChange(info, option) {

        let lastFile = _.last(info.fileList );
        info.fileList = [lastFile];
        this.state.documentUploadprops.fileList = [info.file];
        const validFiles = _.filter(info.fileList, { isValid: true }) || [];
        console.log("Documents -> onDocumentUploadChange -> validFiles", validFiles)
        if (validFiles && validFiles[0] && validFiles[0].response && validFiles[0].response.code === 'OK') {
            let { data } = validFiles[0].response;
            this.setState({ uploadDocument: data.files[0].absolutePath });

        }
        this.setState((state) => {
            state[option.stateKeyName].fileList = validFiles;
            return state;
        })

    }

    updateDocument = async () => {

        const { userData , documentUploadprops } = this.state;
        let userCloneObj = _.clone(userData);
        let documents = _.clone(this.props.data);
        documents.drivingLicence.path = this.state.uploadDocument;
        userCloneObj.documents = _.clone(documents);


        let uploadOption = _.clone(documentUploadprops);
        uploadOption.fileList = [];

        if (userData.id) {
            try {
                const data = await axios.put(`admin/user/${userData.id}`, userCloneObj)
                if (data.code === 'OK') {
                    this.setState({ userData: userCloneObj , documentUploadprops: uploadOption,uploadDocument:''});
                    message.success("Document Upload Successfully.");
                }
            } catch (error) {
                console.log('Error****:', error.message);
                // message.error(`${error.message}`);
            }
        }
    }

    handleSubmit = async (data) => {
        console.log(data);
        let obj = {};
        obj.userId = this.props.id;
        obj.imageStatus = data;
        let dl = 'drivingLicence';
        obj.documentTypes = [dl];
        try {
            let response = await axios.post('admin/user/approve-documents', obj);
            if (response) {
                message.success(response.message);
            }
        } catch (error) {
            console.log(error);
        }
        this.handleCancel();
    }
    handleCancel = () => {
        this.setState({ showModal: false });
    }
    render() {
        const { documentUploadprops, uploadDocument } = this.state;
        const { data } = this.state;

        return (
            data && data.drivingLicence && data.drivingLicence.path ?
                <>
                    <Row type="flex" justify="space-between" className="gx-p-2">
                        {/* <Col span={12}>
                            <h3><b style={{ marginRight: 10 }}><IntlMessages id="app.user.drivingLicence" /></b></h3>
                        </Col> */}
                        <Col span={12}>
                            {data.drivingLicence && _.isNumber(data.drivingLicence.imageStatus) ?
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                        this.onVerification(data.drivingLicence.imageStatus)
                                    }}
                                    className={data.drivingLicence &&
                                        data.drivingLicence.imageStatus === DOCUMENT_VERIFICATION_STATUS.APPROVED ?
                                        'active-btn' :
                                        'deactive-btn'}
                                    disabled={data.drivingLicence.imageStatus === DOCUMENT_VERIFICATION_STATUS.APPROVED}
                                >
                                    {_.map(this.verification, (item) => {
                                        if (data.drivingLicence.imageStatus === item.value) {

                                            return item.label;
                                        }
                                    })}
                                </a> :
                                ''}
                            {this.state.showModal ?
                                <ActionButton
                                    onCreate={this.handleSubmit}
                                    onCancel={this.handleCancel}
                                /> :
                                null}
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" className="gx-p-2">
                        <Col span={12}>
                            <h3><b style={{ marginRight: 10 }}><IntlMessages id="app.user.drivingLicenceNumber" /></b> :{data.drivingLicence.number}</h3>
                        </Col>
                        <Col span={12}>
                            {data.drivingLicence && _.isNumber(data.drivingLicence.status) ?
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                    className={data.drivingLicence &&
                                        data.drivingLicence.status === DOCUMENT_VERIFICATION_STATUS.APPROVED ?
                                        'active-btn' :
                                        'deactive-btn'}
                                    disabled={data.drivingLicence.status === DOCUMENT_VERIFICATION_STATUS.APPROVED}
                                >
                                    {_.map(this.verification, (item) => {
                                        if (data.drivingLicence.status === item.value) {

                                            return item.label;
                                        }
                                    })}
                                </a> :
                                ''}
                        </Col>
                    </Row>
                    <Row>
                        {data.drivingLicence.path &&
                            <>
                                <Col span={8} >
                                    <img alt="" src={`${BASE_URL}/${data.drivingLicence.path}`} style={{ width: '100%', height: 300 }} />
                                </Col>
                                <Col span={12} >
                                      <Row className="m-v-15">
                                        <Col span={8} >
                                            <Upload {...documentUploadprops}>
                                                <Button style={{padding: "0 5px"}}>
                                                    <Icon type="upload" /> <IntlMessages id="app.user.changePictureLabel" />
                                                </Button>
                                            </Upload>

                                        </Col>
                                        </Row>
                                        <Row className="m-v-15">
                                        <Col span={12} >
                                            <Button onClick={this.updateDocument} style={{padding: "0 30px"}} disabled={!uploadDocument}>
                                                <IntlMessages id="app.user.updateDocumentLabel" />
                                            </Button>
                                        </Col>
                                       </Row>
                                </Col>
                            </>
                        }
                        {data.drivingLicence.backPath &&
                            <Col span={8} >
                                <img alt="" src={`${BASE_URL}/${data.drivingLicence.backPath}`} style={{ width: '100%', height: 300 }} />
                            </Col>
                        }
                        {data.drivingLicence.selfie &&
                            <Col span={8} >
                                <img alt="" src={`${BASE_URL}/${data.drivingLicence.selfie}`} style={{ width: '100%', height: 300 }} />
                            </Col>
                        }
                    </Row>
                </> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        );
    }

}
export default Documents;
