import {
    Button, Col, Form, Input, Row, Select, Typography, message, Affix
} from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_LANGUAGE, FEEDBACK_CONTROL_TYPE, QUESTION_TYPE, USER_TYPES, FILTER_BY_QUESTION_TYPES, FEEDBACK_CONTROL_TYPE_FILTER
} from '../../constants/Common';
import React, { Component } from 'react';
import LanguagesList from '../../components/LanguagesList';
import { Link } from 'react-router-dom';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const { Title } = Typography;
const { TextArea } = Input;
const _ = require("lodash");

class ActionQuestionnaireUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.match.params.id,
            recordData: {},
            language: DEFAULT_LANGUAGE,
            fields: ['question']
        };
        this.questionType = FILTER_BY_QUESTION_TYPES;
        this.questionType = FILTER_BY_QUESTION_TYPES.filter((ele) => { return ele.value !== 1 })
        if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
            this.questionType = FILTER_BY_QUESTION_TYPES.filter((ele) => { return ele.type !== QUESTION_TYPE.SERVICE_REQUEST })
        }
    }
    componentDidMount() {
        if (this.state.id) {
            this.fetch(this.state.id);

            return;
        }
        const { form } = this.props;
        form.setFieldsValue({ feedbackControlType: Object.values(FEEDBACK_CONTROL_TYPE)[0] });
    }
    fetch = async (id) => {
        const { form } = this.props;
        try {
            let response = await axios.get(`admin/actionquestionnaire/${id}`);
            if (response.code === 'OK') {
                let formVal = response.data;
                form.setFieldsValue(formVal);
                this.setState({
                    recordData: response.data
                });
            }

        } catch (error) {
            console.log(' ERROR  MESSAGE ', error);
        }
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            let url = `admin/actionquestionnaire/create`;
            let method = `post`;
            let { id } = this.state;
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
                url = `admin/actionquestionnaire/update/${id}`;
                method = `put`;
            }
            try {
                let response = await axios[method](url, obj);
                console.log('  response ', response);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    this.props.history.push({
                        pathname: `/e-scooter/general-settings/actionquestionnairemaster`,
                        filter: this.props.location.filter
                    });
                } else {
                    message.error(`${response.message}`);
                }
            } catch (error) {
                console.log('error', error);
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
    handleReset = () => {
        this.props.form.resetFields();
        this.props.form.setFieldsValue({ feedbackControlType: Object.values(FEEDBACK_CONTROL_TYPE)[0] });
    };
    render() {
        const { recordData, language } = this.state;
        const { form } = this.props;
        const { getFieldDecorator } = form;

        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <div>
                                <Title level={4}
                                    className="gx-mb-0 gx-d-inline-block">
                                    {recordData.id ? <IntlMessages id="app.actionquestionnairemaster.updateQuestioner" /> : <IntlMessages id="app.actionquestionnairemaster.addQuestioner" />}
                                </Title>
                            </div>
                            <div>
                                <LanguagesList onSelect={this.handleLanguageChange.bind(this)}
                                    selected={language}
                                />

                                <Link className="gx-ml-2 topbarCommonBtn"
                                    to={{
                                        pathname: `/e-scooter/general-settings/actionquestionnairemaster`,
                                        filter: this.props.location.filter
                                    }}>
                                    <Button className="gx-mb-0" style={{ display: 'inline-flex' }}><IntlMessages id="app.list" /> </Button>
                                </Link>
                            </div>
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content">

                    <div className="gx-mt-3">
                        <Form layout="vertical"
                            onSubmit={this.handleSubmit}>
                            <Row type="flex" justify="start">
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.actionquestionnairemaster.feedbackControlType" />}
                                        hasFeedback>
                                        {getFieldDecorator('feedbackControlType', {
                                            rules: [{
                                                required: true,
                                                message: <IntlMessages id="app.actionquestionnairemaster.pleaseSelectFeedbackControlType" />
                                            }]
                                        })(
                                            <Select placeholder="Select Type"
                                            >
                                                {
                                                    FEEDBACK_CONTROL_TYPE_FILTER.map((val) => {
                                                        return <Select.Option
                                                            key={val.value}
                                                            value={val.type}>
                                                            {val.label}
                                                        </Select.Option>;
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row type="flex" justify="start">
                                <Col lg={12} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.question" />} hasFeedback className="actionquest-textarea">
                                        {getFieldDecorator('question', {
                                            rules: [{
                                                required: true,
                                                message: <IntlMessages id="app.pleaseEnterYourQue" />
                                            }]
                                        })(
                                            <TextArea multiline="true"
                                                rows={3}
                                                placeholder="Question"
                                                margin="none" />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row type="flex" justify="start">
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item label={<IntlMessages id="app.questionType" />}
                                        hasFeedback>
                                        {getFieldDecorator('type', {
                                            rules: [{
                                                required: true,
                                                message: <IntlMessages id="app.pleaseEnterYourQueType" />
                                            }]
                                        })(
                                            <Select placeholder="Select Type"
                                            >
                                                {
                                                    this.questionType.map((val) => {
                                                        return <Select.Option
                                                            key={val.value}
                                                            value={val.type}>
                                                            {val.label}
                                                        </Select.Option>;
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} className="gx-text-right">
                                    <Button style={{ marginTop: 15 }} onClick={this.handleReset}>
                                        <IntlMessages id="app.clear" />
                                    </Button>
                                    <span className="topbarCommonBtn">
                                        <Button style={{ display: 'inline-flex' }} type="primary" htmlType="submit">
                                            {this.state.id ? <IntlMessages id="app.update" /> : <IntlMessages id="app.add" />}
                                        </Button>
                                    </span>
                                </Col>
                            </Row>
                        </Form>
                    </div>

                </div>
            </div >

        );
    }
}
const WrappedActionQuestionnaireUpsert = Form.create({ name: 'ActionQuestionnaireUpsertForm' })(ActionQuestionnaireUpsert);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedActionQuestionnaireUpsert);
