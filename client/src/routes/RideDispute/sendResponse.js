import { Modal, Form, Input, Row, Col, message } from 'antd';
import React, { Component } from 'react';
import axios from 'util/Api';
import { connect } from 'react-redux';
const { TextArea } = Input;

class SendResponse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remark: ''
        }
    }
    componentDidMount() {
    }
    onCreate = () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let obj = {
                disputeId: this.props.id,
                remark: values.remark
            };
            console.log("SendResponse -> onCreate -> obj", obj)
            try {
                let response = await axios.post('admin/ride-complaint-dispute/send-conversation', obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                }

            } catch (err) {
                console.log('Error****:', err.message);
            }
            this.props.onCreate();
        });
    }

    render() {
        const { onCancel, form } = this.props;

        return (
            <Modal
                visible={true}
                title=""
                okText={<IntlMessages id="app.submit" />}
                onOk={this.onCreate}
                onCancel={onCancel}
                width={500}
                title={<IntlMessages id="app.dispute.sendResponse" />}
            >
                <Form layout='vertical'>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={<IntlMessages id="app.dispute.message" />}>
                                {form.getFieldDecorator('remark', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.dispute.messageRequiredMsg" />
                                    }]
                                })(
                                    <TextArea multiline="true"
                                        rows={4}
                                        placeholder="Enter the message you want to send!"
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
const WrappedSendResponse = Form.create({ name: 'SendResponse' })(SendResponse);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedSendResponse);