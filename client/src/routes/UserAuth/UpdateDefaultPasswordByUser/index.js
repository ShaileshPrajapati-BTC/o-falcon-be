import React, { Component } from "react";
import { Button, Form, Input, message, Spin } from "antd";
import IntlMessages from "util/IntlMessages";
import { connect } from "react-redux";

import axios from "util/Api";

const FormItem = Form.Item;

class UpdateDefaultPasswordByUser extends Component {
    constructor(props) {
        super(props);
        if (!props.defaultPassword || !props.defaultPassword.token) {
            props.history.push("/");
        }
        this.state = {
            loading: false,
            token: props.defaultPassword.token,
            isPasswordUpdated: false
        };
    }

    componentDidUpdate() {
        if (this.state.isPasswordUpdated) {
            this.props.history.push("/e-scooter/signin");
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                if (!err) {
                    const headers = {
                        Authorization: this.state.token
                    };
                    axios
                        .post("/auth/reset-password-by-user", values, {
                            headers
                        })
                        .then((data) => {
                            if (data.code === "OK") {
                                message.success(`${data.message}`);
                                // this.props.form.resetFields();
                                // this.props.history.push('/');
                                this.setState({
                                    loading: false,
                                    isPasswordUpdated: true
                                });
                            } else if (data.message) {
                                message.error(`${data.message}`);
                                this.setState({
                                    loading: false
                                });
                            }
                        })
                        .catch(error => {
                            console.log("Error****:", error.message);
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
        if (value && value !== form.getFieldValue("password")) {
            callback("Two passwords that you enter is inconsistent!");
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.props.confirmDirty) {
            form.validateFields(["confirm"], { force: true });
        }
        callback();
    };

    render() {
        const { loading } = this.state;
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-login-container">
                <div className="gx-login-content">
                    <div className="gx-login-header">
                        <img
                            src={require("assets/images/logo-black.png")}
                            alt="wieldy"
                            title="wieldy"
                        />
                    </div>
                    <div className="gx-mb-4">
                        <h2>Reset Password</h2>
                        <p>
                            To access our panel you will have to reset a new
                            password.
                        </p>
                    </div>
                    <Spin spinning={loading} delay={100}>
                        <Form
                            onSubmit={this.handleSubmit}
                            className="gx-login-form gx-form-row0"
                        >
                            <FormItem>
                                {getFieldDecorator("currentPassword", {
                                    rules: [
                                        {
                                            required: true,
                                            message:
                                                "Please input your old password!"
                                        },
                                        {
                                            min: 8,
                                            message:
                                                "Password must be minimum of 8 digit."
                                        }
                                    ]
                                })(
                                    <Input
                                        type="password"
                                        placeholder="Current Password"
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator("password", {
                                    rules: [
                                        {
                                            required: true,
                                            message: "Please input your password!"
                                        },
                                        {
                                            min: 8,
                                            message:
                                                "New Password must be minimum of 8 digit."
                                        },
                                        {
                                            validator: this.validateToNextPassword
                                        }
                                    ]
                                })(
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                    />
                                )}
                            </FormItem>

                            <FormItem>
                                {getFieldDecorator("newPassword", {
                                    rules: [
                                        {
                                            required: true,
                                            message: "Please confirm your password!"
                                        },
                                        {
                                            validator: this.compareToFirstPassword
                                        }
                                    ]
                                })(
                                    <Input
                                        placeholder="Retype New Password"
                                        type="password"
                                        onBlur={this.handleConfirmBlur}
                                    />
                                )}
                            </FormItem>

                            <FormItem>
                                <Button type="primary" htmlType="submit">
                                    <IntlMessages id="app.userAuth.reset" />
                                </Button>
                            </FormItem>
                        </Form>
                    </Spin>
                </div>
            </div>
        );
    }
}
const mapStateToProps = ({ auth }) => {
    const { defaultPassword } = auth;
    return { defaultPassword };
};

const WrappedResetPasswordByUserForm = Form.create()(
    UpdateDefaultPasswordByUser
);

export default connect(mapStateToProps)(WrappedResetPasswordByUserForm);
