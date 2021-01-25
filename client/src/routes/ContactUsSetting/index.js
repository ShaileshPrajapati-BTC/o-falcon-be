/* eslint-disable max-lines-per-function */
import { Button, Col, Form, Input, Row, Spin, message, InputNumber } from 'antd';
import React, { Component } from 'react';
import { PAGE_PERMISSION, USER_TYPES } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');

class ContactUsSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: { addedBy: null },
            record: {}
        };
    }

    async componentDidMount() {
        if (this.state.loginUser.type === USER_TYPES.FRANCHISEE || this.state.loginUser.type === USER_TYPES.DEALER) {
            await this.setState((state) => { state.filter.addedBy = this.state.loginUser.id; })
        }
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/contact-us-setting/get', this.state.filter);
            if (response.code === 'OK') {
                let record = response.data[0];
                this.setState({ record })
                const formObj = _.pick(record, ['email', 'cell', 'address']);
                const { form } = this.props;
                form.setFieldsValue(formObj);
            }
            else {
                message.error(`${response.message}`);
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    handleUpsert = async () => {
        const { form } = this.props;

        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            this.setState({ loading: true })
            let obj = values;
            obj.id = this.state.record.id;
            // obj.addedBy = this.state.filter.addedBy;
            try {
                let response = await axios.put(`/admin/contact-us-setting/update`, obj);
                if (response.code === 'OK') {
                    this.setState({ loading: false })
                    message.success(`${response.message}`);
                    this.fetch();
                }
                else {
                    this.setState({ loading: false })
                    message.error(`${response.message}`);
                }
            } catch (error) {
                this.setState({ loading: false })
                message.error(`${error.message}`);
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading } = this.state;

        const menuPermission = this.props.auth.authUser.accessPermission;
        const indexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.SUPPORT) });
        const hasUpdatePermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.update;
        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading"><IntlMessages id="app.supportInformation" defaultMessage="Support Information" /></h1>
                        {hasUpdatePermission && <Row>
                            <div >
                                <Button type="primary" style={{ marginRight: '10px' }}
                                    onClick={this.handleUpsert}><IntlMessages id="app.update" defaultMessage="Update" />
                                </Button>
                            </div>
                        </Row>}
                    </Row>
                </div>

                <br></br>

                <Spin spinning={loading} delay={100}>
                    <div className="gx-module-box-content">
                        <div className="gx-mt-3">
                            <Form layout="vertical"
                            >
                                <Row type="flex" justify="start">
                                    {/* User*/}
                                    <Col lg={8} md={8} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.email2" defaultMessage="Email" />}  >
                                            {getFieldDecorator('email', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: <IntlMessages id="app.support.addEmail" defaultMessage="Please add email!" />
                                                    },
                                                    { type: 'email', message: <IntlMessages id="app.support.notValidEmail" defaultMessage="This is not a valid E-mail!" /> },
                                                ]
                                            })(
                                                <Input type="email" placeholder="abc@gmail.com" disabled={!hasUpdatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="start">
                                    <Col lg={8} md={8} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.mobile" defaultMessage="Mobile" />} >
                                            {getFieldDecorator('cell', {
                                                type: 'number',
                                                rules: [
                                                    {
                                                        transform: value => { return (value && value.trim()); }
                                                    },
                                                    { required: true, message: <IntlMessages id="app.support.addValidMobile" defaultMessage="Please add valid mobile!" /> },
                                                    // {
                                                    //     pattern: new RegExp('^[1-9][0-9]*$'),
                                                    //     message: <IntlMessages id="app.support.firstDigitCantBeZero" defaultMessage="First digit can't be zero!" />
                                                    // },
                                                    // {
                                                    //     pattern: new RegExp('^[0-9]{1,10}$'),
                                                    //     message: <IntlMessages id="app.user.invalidMobile" defaultMessage="Invalid Mobile!" />
                                                    // }
                                                ]
                                            })(
                                                <Input placeholder="1234567890" disabled={!hasUpdatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="start">
                                    <Col lg={8} md={8} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.address" defaultMessage="Address" />} >
                                            {getFieldDecorator('address', {
                                                rules: [{ required: false, message: '' }]
                                            })(
                                                <Input placeholder="Address" disabled={!hasUpdatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </Spin>
            </div >
        );
    }
}


const WrappedContactSettingModal = Form.create({ name: 'contactussettingform' })(ContactUsSetting);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedContactSettingModal);
