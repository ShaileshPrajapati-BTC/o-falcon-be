import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, message } from 'antd';

import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');


class ResetPasswordForm extends React.Component {
    state = {
        confirmDirty: false
    };

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback(<IntlMessages id="app.passwordInconsistent" />);
        }
        else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    handleCancel() {
        const { onCancel, form } = this.props;
        form.resetFields();
        onCancel();
    }

    resetPassword() {
        const { resetPasswordId, form } = this.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            let obj = {
                id: resetPasswordId,
                newPassword: values.newPassword
            };

            axios.post('admin/user/reset-password', obj)
                .then((data) => {
                    if (data.code === 'OK') {
                        this.handleCancel();
                        form.resetFields();
                        message.success(`${data.message}`);
                    }
                }).catch(function (error) {
                    console.log('Error****:', error.message);
                    message.success(`${error.message}`);
                });
        });
    };

    render() {
        const { visible, form } = this.props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                title={<IntlMessages id="app.resetPassword" />}
                okText={<IntlMessages id="app.resetPassword" />}
                onCancel={this.handleCancel.bind(this)}
                onOk={this.resetPassword.bind(this)}>
                <Form layout="vertical">
                    <Form.Item label={<IntlMessages id="app.password" />}>
                        {getFieldDecorator('newPassword', {
                            rules: [{
                                required: true, message: <IntlMessages id="app.addPasswordMsg" />
                            }, {
                                validator: this.validateToNextPassword
                            }]
                        })(
                            <Input type="password" placeholder="Enter Password" />
                        )}
                    </Form.Item>
                    <Form.Item label={<IntlMessages id="app.confirmPassword" />}>
                        {getFieldDecorator('confirm', {
                            rules: [{
                                required: true, message: <IntlMessages id="app.confirmPasswordMsg" />
                            }, {
                                validator: this.compareToFirstPassword
                            }]
                        })(
                            <Input type="password"
                                onBlur={this.handleConfirmBlur}
                                placeholder="Enter Confirm Password"
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const WrappedResetPasswordForm = Form.create({ name: 'resetPasswordForm' })(ResetPasswordForm);
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(WrappedResetPasswordForm);