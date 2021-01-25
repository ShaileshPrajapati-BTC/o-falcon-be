import {
  Col, Form, Input, Modal, Row, message, Select
} from 'antd';
import {
  DEFAULT_API_ERROR, MASTER_CODES
} from '../../constants/Common';

import React from 'react';
import axios from 'util/Api';
import { connect } from 'react-redux';

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
          callback('Account Number does not match!');
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
              title={this.props.data ? 'Update Bank Details' : 'Add Bank Details'}
              okText={this.props.data ? 'Update' : 'Add'}
              onCancel={onCancel}
              onOk={this.handleSubmit.bind(this)}
              width={750}
          >
              <Form layout="vertical">
                  <Row type="flex" justify="start">
                      <Col lg={12} md={12} sm={12} xs={24}>
                          <Form.Item label="Bank Name" hasFeedback>
                              {getFieldDecorator("bankId", {
                                  rules: [{
                                      required: true,
                                      message: "Please select Bank Name!"
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
                          <Form.Item label="Name" hasFeedback>
                              {getFieldDecorator('accountHolderName', {
                                  rules: [{
                                      transform: (value) => { return value && value.trim(); }
                                  },
                                  { max: 20, message: 'Account Holder Name cannot be longer than 20 characters.' },
                                  { min: 5, message: 'Account Holder Name must be at least 5 characters.' },
                                  { required: true, message: 'Please add name!' },
                                  {
                                      pattern: /^[A-Za-z]+$/,
                                      message: 'Account Holder Name must be in Alphabet.'
                                  },
                                  {
                                      pattern: /^([a-zA-Z0-9]+)$/,
                                      message: 'No space allowed!'
                                  }
                                  ]
                              })(
                                  <Input placeholder="Name" />
                              )}
                          </Form.Item>
                      </Col>
                      <Col lg={12} md={12} sm={12} xs={24}>
                          <Form.Item label="Routing Number"
                              style={{ paddingLeft: '5px' }}
                              hasFeedback>
                              {getFieldDecorator('routingNumber', {
                                  rules: [{
                                      required: true,
                                      message: 'Please add Routing Number!'
                                  }, {
                                      pattern: /^[0-9]{9}$/,
                                      message: 'Routing Number must be 9 digits!'
                                  }]
                              })(
                                  <Input placeholder="Routing Number" />
                              )}
                          </Form.Item>
                      </Col>
                  </Row>
                  <Row type="flex" justify="start">
                      <Col lg={12} md={12} sm={12} xs={24}>
                          <Form.Item label="Bank Account Number"
                              // className="inlineRow"
                              style={{ paddingLeft: '5px' }}
                              hasFeedback>
                              {getFieldDecorator('accountNumber', {
                                  rules: [{
                                      required: true, message: 'Please Enter Password.'
                                  },
                                  {
                                      validator: this.validateToNextAccountNumber,
                                  },
                                  {
                                      pattern: /^[0-9]+$/,
                                      message: 'Account Number must be Numeric !'
                                  },
                                  { max: 20, message: 'Account Holder Name cannot be longer 20 characters.' },
                                  { min: 5, message: 'Account Holder Name must be at least 5 characters.' },
                                  ]
                          })(
                                  <Input placeholder="Bank Account Number." />
                              )}
                          </Form.Item>
                      </Col>
                      <Col lg={12} md={12} sm={12} xs={24}>
                          <Form.Item label="Retype Bank Account Number"
                              // className="inlineRow"
                              style={{ paddingLeft: '5px' }}
                              hasFeedback>
                              {getFieldDecorator('retypeaccountNumber', {
                                  rules: [{
                                      required: true,
                                      message: 'Please add code!'
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
