import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form } from 'antd';

import PasswordForm from '../../components/PasswordForm';
import CrudService from '../../services/api';
import IntlMessages from '../../util/IntlMessages';

class ResetPasswordForm extends React.Component {
    handleCancel() {
        const { onCancel, form } = this.props;
        form.resetFields();
        onCancel();
    }

    resetPassword() {
        const { resetPasswordId, form } = this.props;

        let self = this;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            let obj = {
                id: resetPasswordId,
                newPassword: values.newPassword
            };

            CrudService.resetPassword(obj, (res) => {
                if (res.code === "OK") {
                    self.handleCancel();
                }
            }, (err) => {
                console.log('Error****:', err.message);
            });
        });
    };

    render() {
        const { visible, form } = this.props;

        return (
            <Modal
                visible={visible}
                title={<IntlMessages id="app.resetPassword" />}
                okText={<IntlMessages id="app.resetPassword" />}
                onCancel={this.handleCancel.bind(this)}
                onOk={this.resetPassword.bind(this)}>
                <Form layout="vertical">
                    <PasswordForm
                        baseForm={form}
                        passwordField="newPassword"
                        confirmField="confirm"
                    />
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