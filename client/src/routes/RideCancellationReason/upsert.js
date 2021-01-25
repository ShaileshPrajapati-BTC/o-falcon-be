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


class UpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: DEFAULT_LANGUAGE,
            fields: ['reason'],
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
            let response = await axios.get(`admin/cancellation-reasons/${id}`);
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

    handleSubmit = async () => {
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            let url = `admin/cancellation-reasons/add`;
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
                url = `admin/cancellation-reasons/${id}`;
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
                title={id ? <IntlMessages id="app.editReason" defaultMessage="Edit Reason"/>  : <IntlMessages id="app.addReason" defaultMessage="Add Reason"/>}
                okText={id ? <IntlMessages id="app.update" defaultMessage="Update"/> : <IntlMessages id="app.add" defaultMessage="Add"/>}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="space-around">
                        <Col span={24}>
                            <LanguagesList
                                onSelect={this.handleLanguageChange.bind(this)}
                                selected={this.state.language}
                            />
                        </Col>
                    </Row>
                    <Row type="flex" className="gx-mt-4" justify="space-around">
                        <Col span={24}>
                            <Form.Item label={<IntlMessages id="app.reason" defaultMessage="Reason"/>}
                                hasFeedback>
                                {getFieldDecorator('reason', {
                                    rules: [
                                        {
                                            transform: (value) => {
                                                return value && value.trim();
                                            }
                                        },
                                        { required: true, message: <IntlMessages id="app.rideCancellationReason.addReason" defaultMessage="Please add reason!"/>  }
                                    ]
                                })(
                                    <Input placeholder="Reason" />
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
