import {
    Col, Form, Input, Modal, Row, message, Select
} from 'antd';
import {
    DEFAULT_API_ERROR, MASTER_CODES
} from '../../constants/Common';

import React from 'react';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class BankDataUpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            banks: [],
            recordData: null
        };
    }
    componentDidMount = async () => {
        await this.getBank();
        if (this.props.data) {
            this.setState({
                recordData: this.props.data
            });
            this.props.form.setFieldsValue({ retypeaccountNumber: this.props.data.accountNumber });
            this.props.form.setFieldsValue({ bankId: this.props.data.bankId.id });
            let formVal = _.omit(this.props.data, ['bankId']);
            this.props.form.setFieldsValue(formVal);
        }
    }
    getBank = async () => {
        let obj = {
            masters: [MASTER_CODES.BANK_NAME],
            include: ['subMasters'],
        };
        try {
            let data = await axios.post('admin/master/list-by-code', obj);
            if (data.code === 'OK') {
                let brands = data.data;
                if (brands && brands[MASTER_CODES.BANK_NAME] && brands[MASTER_CODES.BANK_NAME].subMasters) {
                    this.setState({
                        banks: brands[MASTER_CODES.BANK_NAME].subMasters ? brands[MASTER_CODES.BANK_NAME].subMasters : []
                    });
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    validateToNextAccountNumber = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['retypeaccountNumber'], { force: true });
        }
        callback();
    };
    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstAccountNumber = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('accountNumber')) {
            callback(<IntlMessages id="app.partner.accountNumberNotMatch" />);
        } else {
            callback();
        }
    };
    handleSubmit = async () => {
        let self = this;
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            let url = `/admin/payment/add-bank-account`;
            let method = `post`;
            let obj = { bankDetails: {}, userId: self.props.id }
            let reqObj = _.omit(values, [
                "retypeaccountNumber"
            ]);
            obj.bankDetails = reqObj;

            //edit
            if (this.state.recordData) {
                url = `/admin/payment/update-bank-account`;
                method = `put`;
                obj.bankDetails.bankAccountId = this.state.recordData.id
            }
            try {
                let response = await axios[method](url, obj);
                if (response.code === 'OK') {
                    message.success(`${response.message}`);
                    form.resetFields();
                    this.setState({ recordData: null })
                    this.props.handleSubmit();
                } else {
                    message.error(`${response.message}`);
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    }
    render() {
        const { onCancel, form } = this.props;
        const { banks } = this.state;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={true}
                title={this.props.data ? <IntlMessages id="app.partner.upadteBankDetail" /> : <IntlMessages id="app.partner.addBankDetail" />}
                okText={this.props.data ? <IntlMessages id="app.update" /> : <IntlMessages id="app.add" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.partner.bankNameLabel" />} hasFeedback>
                                {getFieldDecorator("bankId", {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.partner.bankNameRequiredMsg" />
                                    }]
                                })(
                                    <Select
                                        placeholder="Select Bank"
                                    >
                                        {
                                            banks.map((banks) => {
                                                return <Select.Option key={banks.id}
                                                    value={banks.id}>
                                                    {banks.name}
                                                </Select.Option>;
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.name" />} hasFeedback>
                                {getFieldDecorator('accountHolderName', {
                                    rules: [{
                                        transform: (value) => { return value && value.trim(); }
                                    },
                                    { max: 20, message: <IntlMessages id="app.partner.accountHolderMaxLimitMsg" /> },
                                    { min: 5, message: <IntlMessages id="app.partner.accountHolderMinLimitMsg" /> },
                                    { required: true, message: <IntlMessages id="app.partner.accountHolderRequiredMsg" /> },
                                    {
                                        pattern: /^[A-Za-z]+$/,
                                        message: <IntlMessages id="app.partner.accountHolderAlphabetValidation" />
                                    },
                                    {
                                        pattern: /^([a-zA-Z0-9]+)$/,
                                        message: <IntlMessages id="app.partner.accountHolderSpaceValidation" />
                                    }
                                    ]
                                })(
                                    <Input placeholder="Name" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.partner.routingNumberLabel" />}
                                style={{ paddingLeft: '5px' }}
                                hasFeedback>
                                {getFieldDecorator('routingNumber', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.partner.routingNumberRequiredMsg" />
                                    }, {
                                        pattern: /^[0-9]{9}$/,
                                        message: <IntlMessages id="app.partner.routingNumberPatternMsg" />
                                    }]
                                })(
                                    <Input placeholder="Routing Number" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.partner.bankAccountNumber" />}
                                // className="inlineRow"
                                style={{ paddingLeft: '5px' }}
                                hasFeedback>
                                {getFieldDecorator('accountNumber', {
                                    rules: [{
                                        required: true, message: <IntlMessages id="app.partner.bankAccountNumberRequiredMsg" />
                                    },
                                    {
                                        validator: this.validateToNextAccountNumber,
                                    },
                                    {
                                        pattern: /^[0-9]+$/,
                                        message: <IntlMessages id="app.partner.bankAccountNumberNumericMsg" />
                                    },
                                    { max: 20, message: <IntlMessages id="app.partner.bankAccountNumberMaxLimitMsg" /> },
                                    { min: 5, message: <IntlMessages id="app.partner.bankAccountNumberMinLimitMsg" /> },
                                    ]
                                })(
                                    <Input placeholder="Bank Account Number." />
                                )}
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.partner.reTypeAccountNumber" />}
                                // className="inlineRow"
                                style={{ paddingLeft: '5px' }}
                                hasFeedback>
                                {getFieldDecorator('retypeaccountNumber', {
                                    rules: [{
                                        required: true,
                                        message: <IntlMessages id="app.partner.reTypeAccountRequiredMsg" />
                                    }, {
                                        validator: this.compareToFirstAccountNumber,
                                    }]
                                })(
                                    <Input placeholder="Retype Bank Account Number" onBlur={this.handleConfirmBlur} />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
            </Modal >
        );
    }
}

const WrappedBankUpsertModal = Form.create({ name: 'bankdataUpsertForm' })(BankDataUpsertModal);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedBankUpsertModal);
