import { Form, Modal, Radio } from 'antd';
import React, { Component } from 'react';
import IntlMessages from '../../util/IntlMessages';

class ActionButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: true
        };
    }
    onChange = (e) => {
        console.log('radio checked', e.target.value);
        this.setState({
            value: e.target.value
        });
    };
    onCreate = () => {
        console.log('on create');
        this.props.onCreate(this.state.value);
    }
    render() {
        const { onCancel } = this.props;

        return (
            <Modal
                visible={true}
                title=""
                okText={<IntlMessages id="app.submit" />}
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <Form>
                    <h3><IntlMessages id="app.user.userAction" /></h3>
                    <Form.Item style={{ marginLeft: 15 }}>
                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                            <Radio value={true}><IntlMessages id="app.active" /></Radio>
                            <Radio value={false}><IntlMessages id="app.deactive" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}
export default ActionButton;
