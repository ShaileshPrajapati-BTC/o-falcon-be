import {
    Col, Form, Input, Modal, Row, Select, Switch, message, Spin
} from 'antd';
import {
    DEFAULT_API_ERROR
} from '../../constants/Common';
import React from 'react';
import axios from 'util/Api';

class CommunityModeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            editData: [],
            isVehicleId: false,
            isComment: false,
            isPhoto: false,
            isLocation: false,
            categoryList: []
        };
    }
    componentDidMount = async () => {
        await this.getCategory();
        if (this.props.id) {
            this.fetch(this.props.id);
            return;
        }
    }
    getCategory = async () => {
        let filter = {
            filter: {
                isDeleted: false
            }
        }
        try {
            let response = await axios.post(`admin/report-category/report-category`, filter);
            if (response.code === 'OK') {
                this.setState({ categoryList: response.data.list })
            } else {
                message.error(response.message)
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    fetch = async (id) => {
        const { form } = this.props;
        this.setState({ loading: true })
        try {
            let response = await axios.get(`/admin/report-form-setting/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                let formVal = recordData;
                this.setState({
                    isVehicleId: recordData.vehicleId,
                    isComment: recordData.comment,
                    isPhoto: recordData.photo,
                    isLocation: recordData.location,
                    editData: recordData,
                    loading: false
                });
                form.setFieldsValue(formVal);
            } else {
                this.setState({ loading: false })
                message.error(response.message)
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false })
        }
    }

    handleSubmit = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            this.setState({ loading: true });
            let { id } = this.state.editData;
            let url = '/admin/report-form-setting/add';
            let method = `post`;
            let obj = values;
            obj.vehicleId = this.state.isVehicleId;
            obj.comment = this.state.isComment;
            obj.photo = this.state.isPhoto;
            obj.location = this.state.isLocation;
            if (id) {
                url = `/admin/report-form-setting/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ loading: false })
                    this.props.handleSubmit();
                } else {
                    message.error(`${response.message}`);
                    this.setState({ loading: false })
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
                this.setState({ loading: false })
            }
        });
    }
    onChange = (value) => {
        console.log(value);
    }
    displayRender = (label) => {
        return label[label.length - 1];
    }
    render() {
        const {
            onCancel, form, id
        } = this.props;
        const { loading, isVehicleId, isComment, isPhoto, isLocation, categoryList } = this.state;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={true}
                title={id ? `Edit Community Mode ` : `Add Community Mode `}
                okText={id ? 'Update' : 'Add'}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={600}
            >
                <Spin spinning={loading} delay={100}>
                    <Form layout="vertical">
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Form Title" hasFeedback>
                                    {getFieldDecorator('title', {
                                        rules: [
                                            { transform: (value) => { return value && value.trim(); } },
                                            { max: 25, message: 'Title cannot be longer than 25 character!' },
                                            { required: true, message: 'Please add title!' },
                                            { pattern: /^[a-z\d\-_\s]+$/i, message: 'Please enter title include alphanumeric,space,-,_!' }
                                        ]
                                    })(
                                        <Input placeholder="Enter title" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Vehicle" >
                                    {getFieldDecorator('vehicleId', {})(
                                        <Switch checked={isVehicleId} onChange={(checked) => { return this.setState({ isVehicleId: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Comment">
                                    {getFieldDecorator('comment', {})(
                                        <Switch checked={isComment} onChange={(checked) => { return this.setState({ isComment: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start">
                            <Col lg={12} md={12} sm={12} xs={24}>
                                <Form.Item label="Report Category" style={{ paddingLeft: '5px' }} hasFeedback>
                                    {getFieldDecorator('categoryId', {
                                        rules: [
                                            { required: true, message: 'Please select Report Category!' }
                                        ]
                                    })(
                                        <Select placeholder='Select Report Category!' disabled={this.props.id}>
                                            {categoryList.map(cat => {
                                                return (
                                                    <Select.Option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.name}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>

                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Vehicle Photo" >
                                    {getFieldDecorator('photo', {})(
                                        <Switch checked={isPhoto} onChange={(checked) => { return this.setState({ isPhoto: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={12}>
                                <Form.Item label="Location" >
                                    {getFieldDecorator('location', {})(
                                        <Switch checked={isLocation} onChange={(checked) => { return this.setState({ isLocation: checked }) }} />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        );
    }
}

const WrappedCommunityModeForm = Form.create({ name: 'CommunityMode' })(CommunityModeForm);

export default WrappedCommunityModeForm;
