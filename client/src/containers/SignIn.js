import React from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "../assets/images/logo.svg";
import { userSignIn } from "../appRedux/actions/Auth";
import IntlMessages from "util/IntlMessages";

const FormItem = Form.Item;

class SignIn extends React.Component {
    state = { isLoading: false }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ isLoading: true })
                this.props.userSignIn(values);
            }
        });
    };

    componentDidUpdate() {
        if (
            this.props.token !== null ||
            (this.props.defaultPassword && this.props.defaultPassword.userId)
        ) {
            this.props.history.push("/");
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.commonData.error !== this.props.commonData.error) {
            this.setState({ isLoading: false })
            // if (nextProps.commonData.error && !nextProps.commonData.loading) {
            //     message.error(nextProps.commonData.error)
            // }
        }
        if (nextProps.token !== this.props.token) {
            if (nextProps.token !== null) {
                this.setState({ isLoading: false })
            }
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-app-login-wrap loginWrapper">
                <Spin spinning={this.state.isLoading}>
                    <div className="logIn_bgSection">
                        <div className="loginTwoSec">
                            <div className="contentLogin">
                                <div className="logoLogin">
                                    <Logo />
                                </div>
                                <h4><IntlMessages id="app.signin.newWayToMove" defaultMessage="There's a new way to move around" /></h4>
                                <p><IntlMessages id="app.signin.letsChanging"
                                    defaultMessage="Let's changing the future of transportation by providing an on-demand personal electric vehicle sharing network." />
                                </p>
                            </div>
                        </div>
                        <div className="loginTwoSec">
                            <div className="login-form">
                                <h3><IntlMessages id="app.signin.welcome" defaultMessage="Welcome" /></h3>
                                <p><IntlMessages id="app.signin.stayConnected"
                                    defaultMessage="To stay connected please login with your  email address and password" />
                                </p>

                                <div className="loginFormField">
                                    <Form onSubmit={this.handleSubmit} className="gx-signin-form gx-form-row0">
                                        <FormItem>
                                            <label><IntlMessages id="app.signin.emailAddress" defaultMessage="Email Address" /></label>
                                            {getFieldDecorator("email", {
                                                rules: [
                                                    {
                                                        required: true,
                                                        type: "email",
                                                        message: <IntlMessages id="app.invalidEmail" defaultMessage="Invalid E-mail Id!" />
                                                    }
                                                ]
                                            })(<Input placeholder="Your email address" />)}
                                        </FormItem>
                                        <FormItem>
                                            <label><IntlMessages id="app.password" defaultMessage="Password" /></label>
                                            {getFieldDecorator("password", {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: <IntlMessages id="app.signin.enterPassword" defaultMessage="Please input your Password!" />
                                                    }
                                                ]
                                            })(
                                                <Input type="password" placeholder="Your password" />
                                            )}
                                        </FormItem>

                                        <FormItem>
                                            <div className="buttonlinkCombain">
                                                <Button type="primary" className="gx-mb-0" htmlType="submit">
                                                    <IntlMessages id="app.signin.signIn" defaultMessage="Sign In" />
                                                </Button>
                                                <Link to="/e-scooter/forgot-password">
                                                    <span className="gx-signup-form-forgot gx-link">
                                                        <IntlMessages id="app.signin.forgotPassword" defaultMessage="Forgot Password" />{" "}?
                                                </span>
                                                </Link>
                                            </div>

                                        </FormItem>
                                    </Form>
                                </div>

                                {/*<div className="gx-app-login-container">
                                <div className="gx-app-login-main-content">
                                    <div className="gx-app-logo-content">
                                        <div className="gx-app-logo-content-bg">
                                             <img src="https://via.placeholder.com/272x395" alt='Neature' />
                                        </div>
                                        <div className="gx-app-logo-wid">
                                            <h1>Sign In</h1>
                                             <p>
                                             By Signing Up, you can avail full features
                                             of our services.
                                             </p>
                                        </div>
                                        <div className="gx-app-logo signinlogo">
                                             <img alt="example" src={require("assets/images/logo-white.png")} />
                                        </div>
                                    </div>
                                    <div className="gx-app-login-content">
                                        <Form
                                            onSubmit={this.handleSubmit}
                                            className="gx-signin-form gx-form-row0"
                                        >
                                            <FormItem>
                                                {getFieldDecorator("email", {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            type: "email",
                                                            message:
                                                                "Invalid E-mail Id!"
                                                        }
                                                    ]
                                                })(<Input placeholder="Email" />)}
                                            </FormItem>
                                            <FormItem>
                                                {getFieldDecorator("password", {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message:
                                                                "Please input your Password!"
                                                        }
                                                    ]
                                                })(
                                                    <Input
                                                        type="password"
                                                        placeholder="Password"
                                                    />
                                                )}
                                            </FormItem>
                                             <FormItem>
                                             {getFieldDecorator("remember", {
                                             valuePropName: "checked",
                                             initialValue: true
                                             })(
                                             <Checkbox>
                                             by signing up, I accept terms and
                                             conditions
                                             </Checkbox>
                                             )}
                                             </FormItem>
                                            <FormItem>
                                                <Button
                                                    type="primary"
                                                    className="gx-mb-0"
                                                    htmlType="submit"
                                                >
                                                    <IntlMessages id="app.userAuth.signIn" />
                                                </Button>
                                                <Link to="/e-scooter/forgot-password">
                                        <span className="gx-signup-form-forgot gx-link">
                                            <IntlMessages id="app.userAuth.forgotPassword" />{" "}
                                            ?
                                        </span>
                                                </Link>
                                            </FormItem>
                                        </Form>
                                    </div>
                                    <InfoView />
                                </div>
                            </div>*/}
                            </div>

                        </div>

                    </div>
                </Spin>
            </div>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(SignIn);

const mapStateToProps = ({ auth, commonData }) => {
    const { defaultPassword, token } = auth;
    return { defaultPassword, token, commonData };
};

export default connect(
    mapStateToProps,
    { userSignIn }
)(WrappedNormalLoginForm);
