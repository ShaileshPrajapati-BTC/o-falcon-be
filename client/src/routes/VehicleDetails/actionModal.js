import { Col, Form, InputNumber, Modal, Row, Input } from 'antd';
import React, { Component } from 'react';
import { SET_IOT_COMMAND_STATUS, IOT_BUTTON_INFO, IOT_COMMANDS } from '../../constants/Common';
import ESTag from '../../components/ESTag';

class ActionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        if (this.props.value) {
            this.props.form.setFieldsValue({ setValue: this.props.value.actualValue });
        }
    }
    onOk = () => {
        const { form } = this.props;
        let obj = {};
        form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            obj.value = values.setValue;
            if (this.props.isNewMethod) {
                this.props.handleIotNewButton(obj.value);
            } else {
                this.props.onOk(obj);
            }
        });
    }

    render() {
        const { onCancel, form, visible, command, value, isNewMethod, manufacturer } = this.props;
        const { getFieldDecorator } = form;
        let status = value ? SET_IOT_COMMAND_STATUS[value.status] : '-';
        const modalData = IOT_COMMANDS[manufacturer].find((o) => {
            return o.command === command
                ;
        }) || { label: '' };
        let label = <>
            {`Action: ${modalData.label} `}
            <ESTag label={status} />
        </>;

        return (
            <Modal
                title={label}
                visible={visible}
                onOk={this.onOk}
                onCancel={onCancel}
            >

                <Form>
                    {!isNewMethod ?
                        <Row className="m-b-20">
                            <Col span={12}>{`Current ${modalData.label} : `}<b>{value ? value.actualValue : '-'}</b></Col>
                            <Col span={12}>{`Requested ${modalData.label} : `}<b>{value ? value.requestedValue : '-'}</b></Col>
                        </Row> : null
                    }
                    <Row>
                        <Col span={24}>
                            {
                                isNewMethod ?
                                    <Form.Item className="gx-p-1" label={`${modalData.label}`}>
                                        {getFieldDecorator('setValue', {
                                            rules: [
                                                { required: true, message: `Please enter value for ${modalData.label}!` }
                                            ]
                                        })(
                                            <Input placeholder={'eg: ' + IOT_BUTTON_INFO[modalData.command].eg} />
                                        )}
                                    </Form.Item> :
                                    <Form.Item className="gx-p-1" label={`Set ${modalData.label}`}>
                                        {getFieldDecorator('setValue', {
                                            rules: [
                                                { required: true, message: `Please set ${modalData.label}!` }
                                            ]
                                        })(
                                            <InputNumber
                                                min={1}
                                                placeholder={modalData.label}
                                            />
                                        )}
                                    </Form.Item>
                            }
                        </Col>
                    </Row>
                    {
                        isNewMethod ?
                            <Row>
                                <Col span={24}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>
                                        {IOT_BUTTON_INFO[modalData.command] && IOT_BUTTON_INFO[modalData.command].desription}
                                    </p>
                                </Col>
                            </Row> : null
                    }
                </Form>
            </Modal>
        );
    }
}

const WrappedActionModal = Form.create('actionModal')(ActionModal);

export default WrappedActionModal;
