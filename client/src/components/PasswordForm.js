import React from 'react';
import { connect } from 'react-redux';
import { Col, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { PASSWORD_MIN_LENGTH } from '../constants/Common';
import UtilService from '../services/util';
import IntlMessages from '../util/IntlMessages';

const propTypes = {
    baseForm: PropTypes.any.isRequired,
    layout: PropTypes.string,
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
    xs: PropTypes.number,
    updatePassword: PropTypes.bool,
    currentPasswordLabel: PropTypes.string,
    currentPasswordField: PropTypes.string,
    currentPasswordPlaceholder: PropTypes.string,
    currentPasswordErrMsg: PropTypes.string,
    passwordLabel: PropTypes.string,
    passwordField: PropTypes.string,
    passwordPlaceholder: PropTypes.string,
    passwordErrMsg: PropTypes.string,
    confirmLabel: PropTypes.string,
    confirmField: PropTypes.string,
    confirmPlaceholder: PropTypes.string,
    confirmErrReqMsg: PropTypes.string,
    confirmErrMsg: PropTypes.string,
    passwordLengthMsg: PropTypes.string,
    passwordAlphaNumMsg: PropTypes.string,
};

const defaultProps = {
    layout: 'default',
    lg: 8,
    md: 12,
    sm: 12,
    xs: 24,
    updatePassword: false,
    currentPasswordLabel: <IntlMessages id="app.currentPassword" defaultMessage="Current Password" />,
    currentPasswordField: 'currentPassword',
    currentPasswordPlaceholder: 'Enter current password',
    currentPasswordErrMsg: <IntlMessages id="app.currentPasswordRequiredMsg" defaultMessage="Please add your current password!" />,
    passwordLabel: <IntlMessages id="app.password" defaultMessage="Password" />,
    passwordField: 'password',
    passwordPlaceholder: 'Enter Password',
    passwordErrMsg: <IntlMessages id="app.addPasswordMsg" defaultMessage="Please add your password!" />,
    confirmLabel: <IntlMessages id="app.confirmPassword" defaultMessage="Confirm Password" />,
    confirmField: 'confirmPassword',
    confirmPlaceholder: 'Enter Confirm Password',
    confirmErrReqMsg: <IntlMessages id="app.confirmPasswordMsg" defaultMessage="Please confirm your password!" />,
    confirmErrMsg: <IntlMessages id="app.passwordNotMatch" defaultMessage="Password does not match" />,
    passwordLengthMsg: <><IntlMessages id="app.passwordShouldMin" defaultMessage="Password should be of minimum" /> {PASSWORD_MIN_LENGTH} <IntlMessages id="app.characters" defaultMessage="characters" /></>,
    passwordAlphaNumMsg: <IntlMessages id="app.passwordValidationMsg" defaultMessage="Password should be alphanumeric" />
};

const CurrentPasswordTemplate = ({ baseForm, currentPasswordLabel, currentPasswordField, currentPasswordErrMsg, currentPasswordPlaceholder }) => {
    const { getFieldDecorator } = baseForm;

    return (
        <Form.Item label={currentPasswordLabel}>
            {getFieldDecorator(currentPasswordField, {
                rules: [{
                    required: true, message: currentPasswordErrMsg
                }]
            })(
                <Input.Password placeholder={currentPasswordPlaceholder} />
            )}
        </Form.Item>
    );
};

const PasswordTemplate = ({ baseForm, passwordLabel, passwordField, passwordErrMsg, passwordPlaceholder, parent, passwordLengthMsg, passwordAlphaNumMsg }) => {
    const { getFieldDecorator } = baseForm;

    return (
        <Form.Item label={passwordLabel}>
            {getFieldDecorator(passwordField, {
                rules: [{
                    required: true, message: passwordErrMsg
                }, {
                    validator: parent.validateToNextPassword
                }, {
                    min: PASSWORD_MIN_LENGTH, message: passwordLengthMsg
                }, {
                    validator: parent.validateAlphaNumPassword, message: passwordAlphaNumMsg
                }]
            })(
                <Input.Password placeholder={passwordPlaceholder} />
            )}
        </Form.Item>
    );
};

const ConfirmPasswordTemplate = ({ baseForm, confirmLabel, confirmField, confirmErrReqMsg, confirmPlaceholder, parent }) => {
    const { getFieldDecorator } = baseForm;

    return (
        <Form.Item label={confirmLabel}>
            {getFieldDecorator(confirmField, {
                rules: [{
                    required: true, message: confirmErrReqMsg
                }, {
                    validator: parent.compareToFirstPassword
                }]
            })(
                <Input.Password
                    onBlur={parent.handleConfirmBlur}
                    placeholder={confirmPlaceholder}
                />
            )}
        </Form.Item>
    );
};

class PasswordForm extends React.Component {
    state = {
        confirmDirty: false
    };

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { baseForm, passwordField, confirmErrMsg } = this.props;

        if (value && value !== baseForm.getFieldValue(passwordField)) {
            callback(confirmErrMsg);
        }
        else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { baseForm, confirmField } = this.props;

        if (value && this.state.confirmDirty) {
            baseForm.validateFields([confirmField], { force: true });
        }
        callback();
    };

    validateAlphaNumPassword = (rule, value, callback) => {
        if (value && value.length >= PASSWORD_MIN_LENGTH && !UtilService.checkAlphaNumericPassword(value)) {
            callback(<IntlMessages id="app.passwordAlphanumericMsg" defaultMessage="password is not alphanumeric" />)
        }
        callback();
    }

    render() {
        const { layout, lg, md, sm, xs, updatePassword } = this.props;

        return (
            layout === 'horizontal' ? (
                <React.Fragment>
                    {
                        updatePassword ? (
                            <Col lg={lg} md={md} sm={sm} xs={xs}>
                                <CurrentPasswordTemplate {...this.props} />
                            </Col>
                        ) : null
                    }

                    <Col lg={lg} md={md} sm={sm} xs={xs}>
                        <PasswordTemplate {...this.props} parent={this} />
                    </Col>

                    <Col lg={lg} md={md} sm={sm} xs={xs}>
                        <ConfirmPasswordTemplate {...this.props} parent={this} />
                    </Col>
                </React.Fragment>
            ) : (
                    <React.Fragment>
                        {updatePassword ? <CurrentPasswordTemplate {...this.props} /> : null}

                        <PasswordTemplate {...this.props} parent={this} />

                        <ConfirmPasswordTemplate {...this.props} parent={this} />
                    </React.Fragment>
                )
        );
    }
}

PasswordForm.propTypes = propTypes;
PasswordForm.defaultProps = defaultProps;

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(PasswordForm);
