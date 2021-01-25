import {
    Form, Modal, Radio
} from 'antd';
import React, { Component } from 'react';
import { FEEDER_LABEL } from '../../constants/Setup';

class ActionButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: true
        };
    }
    onChange = (e) => {
        this.setState({
            value: e.target.value
        });
    };
    onCreate = () => {
        this.props.onCreate(this.state.value);
    }
    render() {
        const { onCancel } = this.props;

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
                    <h3>What action you want to perform for selected {FEEDER_LABEL}(s)?</h3>
                    <Form.Item style={{ marginLeft: 15 }}>
                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                            <Radio value={true}>Active</Radio>
                            <Radio value={false}>Deactive</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}
export default ActionButton;
