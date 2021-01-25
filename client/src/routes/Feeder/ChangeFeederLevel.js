import {
    Form, Modal, Radio, Select, message, Spin
} from 'antd';
import React, { Component } from 'react';
import { FEEDER_LABEL } from '../../constants/Setup';
import { TASK_LEVEL, DEFAULT_API_ERROR, FILTER_BY_TASK_LEVEL } from '../../constants/Common';
import axios from "util/Api";

class CHnageFeederLevel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            level: props.level,
            loading: false
        };
    }
    onChange = (e) => {
        this.setState({
            level: e
        });
    };
    onCreate = () => {
        console.log(this.state.level)
        if (this.props.level === this.state.level) {
            message.error("Please update level!")
            return;
        }
        let reqObj = { level: this.state.level }
        this.setState({ loading: true })
        axios
            .put(`admin/user/${this.props.id}`, reqObj)
            .then(data => {
                if (data.code === "OK") {
                    message.success(`${data.message}`);
                    this.props.onCreate();
                } else {
                    message.error(`${data.message}`);
                }
                this.setState({ loading: false })
            })
            .catch(data => {
                let msg =
                    data && data.message
                        ? data.message
                        : DEFAULT_API_ERROR;
                message.error(msg);
                this.setState({ loading: false })
            });
    }
    render() {
        const { onCancel } = this.props;
        let taskLevelFilter = FILTER_BY_TASK_LEVEL.filter((ele) => { return ele.value !== 0 })

        return (
            <Modal
                visible={true}
                title=""
                okText="Submit"
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <Spin spinning={this.state.loading} delay={100}>
                    <Form>
                        <h3>Change {FEEDER_LABEL} Level</h3>
                        <br />
                        <span style={{ marginLeft: 15 }}>
                            Current Level: {this.props.level}
                        </span>
                        <br />
                        <br />
                        <Form.Item style={{ marginLeft: 15 }} label="Change Level">
                            <Select placeholder="Change Level" value={this.state.level} onChange={this.onChange}>
                                {taskLevelFilter.map(
                                    val => {
                                        return (
                                            <Select.Option
                                                key={val.value}
                                                value={val.type}
                                            >
                                                {val.label}
                                            </Select.Option>
                                        );
                                    }
                                )}
                            </Select>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        );
    }
}
export default CHnageFeederLevel;
