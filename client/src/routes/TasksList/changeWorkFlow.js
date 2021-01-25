import {
    Form, Modal, Radio, message, Upload, Button, Icon, Spin
} from 'antd';
import React, { Component } from 'react';
import { FILTER_BY_WORK_FLOW, FILE_TYPES, WORK_FLOW, DEFAULT_API_ERROR } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import CrudService from '../../services/api';
import TextArea from 'antd/lib/input/TextArea';

const _ = require('lodash');

class ChangeWorkFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            taskWorkFlow: '',
            statusArray: [],
            formFields: [],
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
                    return this.onFileChange(info, { fieldName: 'images', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        };
        this.defaultValue = '';
    }
    componentDidMount() {
        if (this.props.taskWorkFlow !== WORK_FLOW.COMPLETE) {
            let obj = {
                level: this.props.obj.level,
                taskType: this.props.obj.taskType
            }
            this.getFormFields(obj);
        }
        let object = {
            taskWorkFlow: this.props.taskWorkFlow,
        };
        this.setState({ data: object });
        let taskWorkFlow = this.props.taskWorkFlow;
        let statusArray = _.filter(FILTER_BY_WORK_FLOW, (data) => { return data.type !== taskWorkFlow })
        this.setState({ statusArray: statusArray, taskWorkFlow: statusArray[0].value })
        this.defaultValue = statusArray[0].value;
    }
    getFormFields = async (obj) => {
        this.setState({ loading: true })
        try {
            let data = await axios.post(`/admin/task-form-setting/get-task-form`, obj);
            if (data.code === 'OK' && data.data) {
                this.setState({ formFields: data.data, loading: false })
            }
            else {
                this.setState({ loading: false })
                message.error(`${data.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false })
        }
    }
    onCreate = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            this.setState({ loading: true })
            let obj = this.state.data;
            obj.taskWorkFlow = this.state.taskWorkFlow;
            obj = { ...obj, ...values }
            try {
                let response = await axios.put(`admin/task/update-status/${this.props.obj.id}`, obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                    this.setState({ loading: false })
                }
                else {
                    this.setState({ loading: false })
                    message.error(`${response.message}`);
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
                this.setState({ loading: false })
            }
            this.props.onCreate();
        })
    }
    onClick = (e) => {
        let taskWorkFlow = Number(e.target.value);
        this.setState({ taskWorkFlow: taskWorkFlow });
    }
    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error('Invalid file type');
        }
        return file.isValid;
    };
    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }
        this.setState((state) => {
            state.imageUploadprops.fileList = _.filter(info.fileList, { isValid: true });
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
    render() {
        const { onCancel, form } = this.props;
        const { statusArray, taskWorkFlow, formFields, loading } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title=""
                okText="Submit"
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <h3>Change WorkFlow</h3>
                <Spin spinning={loading} delay={100}>
                    <Form layout="vertical" className="m-v-15">
                        <Form.Item style={{ marginLeft: 5 }}>
                            <div className="CustomRadio">
                                <Radio.Group buttonStyle="solid" defaultValue={this.defaultValue}>
                                    {statusArray.map((item, index) => {
                                        return <Radio.Button
                                            key={index}
                                            value={item.value}
                                            onClick={this.onClick.bind(this)}>
                                            {item.label}
                                        </Radio.Button>;
                                    })}
                                </Radio.Group>
                            </div>
                        </Form.Item>
                        {(formFields.taskCompletionReq && taskWorkFlow === WORK_FLOW.COMPLETE) &&
                            <Form.Item label="Name">
                                {getFieldDecorator('images', {
                                    rules: [{ required: true, message: 'Please upload Image!' }],
                                    getValueFromEvent: this.getSingleFilePath
                                })(
                                    <Upload key="images" {...this.state.imageUploadprops}>
                                        <Button>
                                            <Icon type="upload" /> Upload Image
                                        </Button>
                                    </Upload>
                                )}
                            </Form.Item>
                        }
                        <Form.Item label="Remark" hasFeedback>
                            {getFieldDecorator('remark', {
                                rules: [
                                    { required: true, message: 'Please add remark!' },
                                    { max: 200, message: 'Remark cannot be longer than 200 character!' },
                                ]
                            })(
                                <TextArea
                                    rows={3}
                                    className="width-100"
                                    placeholder="Add Remark"
                                />
                            )}
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal >
        );
    }
}
const WrappedChangeWorkFlow = Form.create({ name: 'ChangeWorkFlow' })(ChangeWorkFlow);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedChangeWorkFlow);
