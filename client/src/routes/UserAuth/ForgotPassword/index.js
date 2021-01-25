import React, { Component } from "react";
import { Link } from "react-router-dom";

import { Button, Form, Input, message, Spin } from "antd";
import IntlMessages from "util/IntlMessages";
import axios from "util/Api";
import { connect } from "react-redux";
const FormItem = Form.Item;

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                axios
                    .post("admin/auth/forgot-password", { username: values.email })
                    .then((data) => {
                        if (data.code === "OK") {
                            message.success(`${data.message}`);
                            this.props.form.resetFields();
                            this.props.history.push("/e-scooter/reset-password");
                        }
                        this.setState({
                            loading: false
                        });
                    })
                    .catch(error => {
                        console.log("Error****:", error.message);
                        this.setState({
                            loading: false
                        });
                        message.error(`${error.message}`);
                    });
            }
        });
    };

    render() {
        const { loading } = this.state;
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-login-container">
                <div className="gx-login-content">
                    <div className="gx-login-header">
                        {/* <img src={require("assets/images/logo-black.png")} alt="wieldy" title="wieldy" /> */}
                    </div>
                    <div className="gx-mb-4">
                        <h2><IntlMessages id="app.forgotPass.forgotPass" defaultMessage="Forgot Your Password ?" /></h2>
                        <p><IntlMessages id="app.forgotPass.tellEmail" defaultMessage="Don't worry. Recovering the password is easy. Just
                            tell us the email." />
                        </p>
                    </div>
                    <Spin spinning={loading} delay={100}>
                        <Form
                            layout="vertical"
                            onSubmit={this.handleSubmit}
                            className="gx-login-form gx-form-row0"
                        >
                            <FormItem>
                                {getFieldDecorator("email", {
                                    rules: [
                                        {
                                            type: "email",
                                            message: <IntlMessages id="app.invalidEmail" defaultMessage="Invalid E-mail Id!" />
                                        },
                                        {
                                            required: true,
                                            message: <IntlMessages id="app.emailRequiredMsg" defaultMessage="Please add email!" />
                                        }
                                    ]
                                })(
                                    <Input
                                        type="email"
                                        placeholder="E-Mail Address"
                                    />
                                )}
                            </FormItem>

                            <FormItem>
                                <Button
                                    type="primary"
                                    className="gx-mb-0"
                                    htmlType="submit"
                                >
                                    <IntlMessages id="app.notification.send" defaultMessage="Send" />
                                </Button>
                                <Link to="/e-scooter/signin">
                                    <span className="gx-signup-form-forgot gx-link">
                                        <IntlMessages id="app.forgotPass.backToLogin" defaultMessage="Back to login." />
                                    </span>
                                </Link>
                            </FormItem>
                        </Form>
                    </Spin>
                </div>
            </div>
        );
    }
}

const WrappedForgotPasswordForm = Form.create()(ForgotPassword);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedForgotPasswordForm);

