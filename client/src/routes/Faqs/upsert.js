import {
    Col, Form, Input, Modal, Row, message
} from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_LANGUAGE
} from '../../constants/Common';
import LanguagesList from '../../components/LanguagesList';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const { TextArea } = Input;

class UpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: DEFAULT_LANGUAGE,
            fields: ['question', 'answer'],
            recordData: {}
        };
    }
    componentDidMount() {
        if (this.props.id) {
            this.fetch(this.props.id);
        }
    }

    fetch = async (id) => {
        const { form } = this.props;
        let self = this;
        try {
            let response = await axios.get(`admin/faqs/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                let formVal = recordData;
                form.setFieldsValue(formVal);

                self.setState((prevState) => {
                    prevState.recordData = recordData;
                });
            } else {
                console.log(' ELSE ERROR ');
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    handleSubmit = async () => {
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            let url = `admin/faqs/create`;
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
                url = `admin/faqs/${id}`;
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
        const { form } = this.props;
        const { recordData } = this.state;
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
                title={id ? <IntlMessages id="app.faq.editFaqs"/> : <IntlMessages id="app.faq.addFaqs"/>}
                okText={id ? <IntlMessages id="app.update"/> : <IntlMessages id="app.add"/>}
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
                        <Col span={24}>
                            <Form.Item label={<IntlMessages id="app.question"/>} hasFeedback>
                                {getFieldDecorator('question', {
                                    rules: [
                                        {
                                            transform: (value) => {
                                                return value && value.trim();
                                            }
                                        },
                                        { required: true, message: <IntlMessages id="app.faq.pleaseAddQuestion"/> }
                                    ]
                                })(
                                    <Input placeholder="Question" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <Form.Item label={<IntlMessages id="app.answer"/>}>
                                {getFieldDecorator('answer', {
                                    rules: [
                                        {
                                            transform: (value) => {
                                                return value && value.trim();
                                            }
                                        },
                                        { required: true, message: <IntlMessages id="app.faq.pleaseAddAnswer"/> }
                                    ]
                                })(
                                    <TextArea multiline="true"
                                        rows={3}
                                        placeholder="Answer"
                                        margin="none" />
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
