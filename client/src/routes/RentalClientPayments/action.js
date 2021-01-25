import {
  Form, Modal, Radio, Input, message
} from 'antd';
import React, { Component } from 'react';
const { TextArea } = Input;

class ActionButton extends Component {
  constructor(props) {
      super(props);
      this.state = {
          value: true,
          remark: ''
      };
  }
  onChange = (e) => {this.setState({value: e.target.value});
  };
  onRemarkChange = (e) => {this.setState({remark: e.target.value})
      if (e.target.value.length === 150) { document.getElementById('info').innerText = "* Maximum characters are 150" }
  }
  onCreate = () => {
      if (!this.state.remark) {
          message.error("Remark is required!");
          return;
      }
      this.props.onCreate(this.state);
  }
  render() {
      const { onCancel, receivableRecordSelected } = this.props;

      return (
          <Modal
              visible={true}
              title=""
              okText="Submit"
              onOk={this.onCreate}
              onCancel={onCancel}
              width={600}
          >
              <Form>
                  <h3>What action you want to perform?</h3>
                  <Form.Item style={{ marginLeft: 15 }}>
                      <Radio.Group onChange={this.onChange} value={this.state.value}>
                            <Radio value={true}>Transfer</Radio>
                            <Radio
                                value={false}
                                style={{display: receivableRecordSelected ? 'none': 'auto' }}
                            >
                                Cancel
                            </Radio>
                      </Radio.Group>
                      <TextArea multiline="true"
                          rows={3}
                          maxLength={150}
                          placeholder="Remarks"
                          margin="none"
                          onChange={this.onRemarkChange}
                      />
                      <div id="info" style={{ color: 'red' }}></div>
                  </Form.Item>
              </Form>
          </Modal>
      );
  }
}
export default ActionButton;
