import React, { Component } from "react";
import { Button, Form, Input, message, Spin } from "antd";
import IntlMessages from "util/IntlMessages";
import { connect } from "react-redux";
import axios from 'util/Api';

const FormItem = Form.Item;


class ResetPassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                if (!err) {
                    axios.post(
                        '/admin/auth/reset-password',
                        { token: values.token, newPassword: values.confirm, username: values.username }
                    ).then((data) => {
                        if (data.code === 'OK') {
                            message.success(`${data.message}`);
                            this.props.form.resetFields();
                            this.props.history.push('/e-scooter/signin');
                        } else if (data.message) {
                            message.error(`${data.message}`);
                        }
                        this.setState({
                            loading: false
                        });
                    }).catch((error) => {
                        console.log('Error****:', error.message);
                        this.setState({
                            loading: false
                        });
                        message.error(`${error.message}`);
                    });
                }
            }
        });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.props.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    render() {
        const { loading } = this.state;
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-login-container">
                <div className="gx-login-content" style={{ paddingTop: 10 }}>

                    <div className="gx-login-header">
                        {/* <img src={require("assets/images/logo-black.png")} alt="wieldy" title="wieldy" /> */}
                    </div>
                    <div className="gx-mb-4">
                        <h2><IntlMessages id="app.resetPassword" defaultMessage="Reset Password" /></h2>
                        <p><IntlMessages id="app.resetPassword.enterPasswordReset"
                            defaultMessage="Enter a new password for your account" />
                        </p>
                    </div>

                    <Spin spinning={loading} delay={100}>
                        <Form onSubmit={this.handleSubmit} className="gx-login-form gx-form-row0">

                            <FormItem style={{ margin: 0 }}>
                                <label><IntlMessages id="app.signin.emailAddress" defaultMessage="Email Address" /></label>
                                {getFieldDecorator('username', {
                                    rules: [
                                        {
                                            required: true,
                                            type: "email",
                                            message: <IntlMessages id="app.invalidEmail" defaultMessage="Invalid E-mail Id!" />
                                        },
                                        {
                                            required: true, message: <IntlMessages id="app.resetPassword.emailRequiredMsg" defaultMessage="Please input your email address!" />,
                                        }
                                    ]
                                })(
                                    <Input placeholder="Your Username" />
                                )}
                            </FormItem>
                            <FormItem style={{ margin: 0 }}>
                                <label><IntlMessages id="app.resetPassword.otp" defaultMessage="OTP" /></label>
                                {getFieldDecorator('token', {
                                    rules: [{
                                        required: true, message: <IntlMessages id="app.resetPassword.otpRequiredMsg" defaultMessage="Please input your otp!" />,
                                    }],
                                })(
                                    <Input placeholder="OTP" />
                                )}
                            </FormItem>
                            <FormItem style={{ margin: 0 }}>
                                <label><IntlMessages id="app.resetPassword.newPass" defaultMessage="New Password" /></label>
                                {getFieldDecorator('newPassword', {
                                    rules: [{
                                        required: true, message: <IntlMessages id="app.signin.enterPassword" defaultMessage="Please input your password!" />,
                                    }, {
                                        validator: this.validateToNextPassword,
                                    }],
                                })(
                                    <Input type="password" placeholder="New Password" />
                                )}
                            </FormItem>

                            <FormItem style={{ margin: 0 }}>
                                <label><IntlMessages id="app.resetPassword.reTypePass" defaultMessage="Retype New Password" /></label>
                                {getFieldDecorator('confirm', {
                                    rules: [{
                                        required: true, message: <IntlMessages id="app.confirmPasswordMsg" defaultMessage="Please confirm your password!" />,
                                    }, {
                                        validator: this.compareToFirstPassword,
                                    }],
                                })(
                                    <Input placeholder="Retype New Password" type="password" onBlur={this.handleConfirmBlur} />
                                )}
                            </FormItem>

                            <FormItem>
                                <Button type="primary" className="gx-mb-0" htmlType="submit">
                                    <IntlMessages id="app.resetPassword.reset" defaultMessage="Reset" />
                                </Button>
                            </FormItem>
                        </Form>
                    </Spin>
                </div>
            </div>
        );
    }
}


const WrappedResetPasswordForm = Form.create()(ResetPassword);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedResetPasswordForm);

