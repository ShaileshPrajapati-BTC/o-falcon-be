import {
    Col, Form, Input, Modal, Row, message, Select
} from 'antd';
import {
    DEFAULT_API_ERROR, PRIORITY_FILTER, QUESTION_TYPE, USER_TYPES
} from '../../constants/Common';

import React from 'react';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';


const { TextArea } = Input;

class AddServiceModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            filter: {
                filter: {
                    type: QUESTION_TYPE.SERVICE_REQUEST,
                    addedBy: null
                }
            },
            questions: []
        };
    }
    componentDidMount() {
        if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
            this.setState((state) => {
                state.filter.filter.addedBy = this.props.auth.authUser.franchiseeId;
            })
        }
        this.fetch();
        // if (this.props.id) {
        //     this.fetch(this.props.id);
        // }
    }

    fetch = async () => {
        try {
            let response = await axios.post(
                "admin/actionquestionnaire/paginate",
                this.state.filter
            );
            this.setState({
                questions: response.data,
                loading: false
            });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    }

    handleSubmit = async () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let obj = {};
            obj = values;
            let url = `admin/ride-complaint-dispute/create`;
            let method = `post`;
            let franchiseeId = this.props.auth.authUser.id;
            obj.franchiseeId = franchiseeId;
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

    render() {
        const {
            onCancel, form
        } = this.props;
        const { questions } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.dispute.addRequest" />}
                okText={<IntlMessages id="app.add" />}
                cancelText={<IntlMessages id="app.cancel" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24} >
                            <Form.Item label={<IntlMessages id="app.dispute.questions" />}
                                hasFeedback>
                                {getFieldDecorator('actionQuestionnaireId', {
                                    rules: [
                                        {
                                            required: true,
                                            message: <IntlMessages id="app.dispute.questionsRequiredMsg" />
                                        }
                                    ]
                                })(
                                    <Select
                                        style={{ width: '80%' }}
                                        placeholder="Select Question">
                                        {questions.map((val) => {
                                            return (
                                                <Select.Option
                                                    key={val.id}
                                                    value={val.id}
                                                    disabled={
                                                        !val.isActive
                                                    }
                                                >
                                                    {`${val.question}`}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={8} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.priority" />}
                                hasFeedback>
                                {getFieldDecorator('priority', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.dispute.priorityRequiredMsg" />
                                    }]
                                })(
                                    <Select placeholder="Select priority">
                                        {
                                            PRIORITY_FILTER.map((val) => {
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
                        <Col span={24}>

                            <Form.Item label={<IntlMessages id="app.description" />}>
                                {getFieldDecorator('answer', {})(
                                    <TextArea multiline="true"
                                        rows={3}
                                        placeholder="Description"
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

const WrappedMasterUpsertModal = Form.create({ name: 'AddServiceModel' })(AddServiceModel);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedMasterUpsertModal);
