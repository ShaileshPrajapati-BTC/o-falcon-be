import { Form, Input, Modal, message } from 'antd';
import { DECIMAL_NUMBER_REG_EXP, DEFAULT_API_ERROR } from '../../constants/Common';
import React from 'react';
import axios from 'util/Api';
import { connect } from 'react-redux'
import IntlMessages from '../../util/IntlMessages';
const { TextArea } = Input;

class WalletModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      filter: {
        filter: {
        }
      },
      value: ''
    };
  }
  componentDidMount() {
    this.fetch();
    // if (this.props.id) {
    //     this.fetch(this.props.id);
    // }
  }

  fetch = async () => {
  }

  handleSubmit = async () => {
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      let obj = {};
      obj = values;
      let url = `admin/wallet/add-balance`;
      let method = `post`;
      obj.userId = this.props.userId;
      try {
        let response = await axios[method](url, obj);
        if (response.code === 'OK') {
          message.success(`${response.message}`);
          form.resetFields();
          this.props.onCreate();
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
    const {
      onCancel, form
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal
        visible={true}
        title={<IntlMessages id="app.wallet.addWallet" />}
        okText={<IntlMessages id="app.add" />}
        cancelText={<IntlMessages id="app.cancel" />}
        onCancel={onCancel}
        onOk={this.handleSubmit.bind(this)}
        width={750}
      >
        <Form layout="vertical">

          <Form.Item label={<IntlMessages id="app.wallet.amount" />}
            hasFeedback>
            {getFieldDecorator('amount', {
              rules: [{
                required: true,
                message: <IntlMessages id="app.wallet.amountRequiredMsg" />
              }, {
                pattern: new RegExp(DECIMAL_NUMBER_REG_EXP),
                message: <IntlMessages id="app.wallet.amountInvalid" />
              }, {
                max: 5,
                message: <IntlMessages id="app.wallet.amountValidationMsg" />
              }]
            })(
              <Input placeholder="Amount" type="number" />
            )}
          </Form.Item>

          <Form.Item label={<IntlMessages id="app.wallet.remark" />}
            hasFeedback>
            {getFieldDecorator('remark', {
              rules: [{
                max: 100,
                message: <IntlMessages id="app.wallet.remarkValidationMsg" />
              }]
            })(
              <TextArea multiline="true"
                rows={3}
                placeholder="Enter the message for remark!"
                margin="none" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const WrappedMasterUpsertModal = Form.create({ name: 'WalletModel' })(WalletModel);

const mapStateToProps = function (props) {
  return props;
};

export default connect(mapStateToProps)(WrappedMasterUpsertModal);