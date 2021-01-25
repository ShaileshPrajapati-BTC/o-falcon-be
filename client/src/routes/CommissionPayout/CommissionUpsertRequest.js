import {
    Form, Modal, message, Select, InputNumber, Statistic
} from 'antd';
import React, { Component } from 'react';
import {
    USER_TYPES
} from '../../constants/Common';
import axios from 'util/Api';
import { connect } from "react-redux";
import { DEFAULT_BASE_CURRENCY, FRANCHISEE_LABEL } from "../../constants/Setup";

class CommissionUpsertRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: true,
            amount: 0,
            franchiseeList: [],
            remainedAmountToRequest: 0,
            selectedFranchisee: null,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null
        };
    }
    componentDidMount() {
        this.initialize();
        const { loginUser } = this.state;
        if (loginUser.type === USER_TYPES.FRANCHISEE) {
            this.setState({
                selectedFranchisee: loginUser.id
            });
            this.getPendingCommissionValue(loginUser.id)
        }
    }
    initialize = async () => {
        await this.getFranchiseeList();
        const { data } = this.props;
        if (data) {
            const { franchiseeId, amount } = data;
            await this.getPendingCommissionValue(franchiseeId.id);
            this.onAmountChange(amount);
        }
    }
    getFranchiseeList = async () => {
        let data = await axios.post('admin/user/franchisee-list', {
            filter: { type: USER_TYPES.FRANCHISEE, isDeleted: false, isActive: true, addOwnUser: false }
        });
        if (data && data.code === 'OK') {
            data = data.data;
            this.setState({
                franchiseeList: data.list
            });
        }
    };
    getPendingCommissionValue = async (franchiseeId) => {
        this.setState({
            selectedFranchisee: franchiseeId
        })
        let data = await axios.post('/admin/franchisee/commission-payout/get-pending-commission', {
            franchiseeId: franchiseeId
        });
        if (data && data.code === 'OK') {
            data = data.data;
            this.setState({
                remainedAmountToRequest: data.remainedAmountToRequest
            });
        }
    }
    onChange = (e) => {
        this.setState({
            value: e.target.value
        });
    };
    onAmountChange = (value) => {
        console.log("amount", value);
        this.setState({
            amount: value
        })
    }
    franchiseeListHandler = async (franchiseeId) => {
        await this.getPendingCommissionValue(franchiseeId);
    }
    onCreate = () => {
        const { amount, selectedFranchisee } = this.state;
        if (!selectedFranchisee) {
            message.error(`Please select ${FRANCHISEE_LABEL}!`);
            return;
        }
        if (!amount) {
            message.error("Amount is required!");
            return;
        }
        let reqObj = {
            amount: amount,
            franchiseeId: selectedFranchisee
        };
        if (this.props.data) {
            reqObj.id = this.props.data.id;
        }
        this.props.onCreate(reqObj);
    }
    render() {
        const { onCancel, title, data } = this.props;
        const { franchiseeList, loginUser, amount } = this.state;
        const isFranchiseeType = loginUser.type === USER_TYPES.FRANCHISEE;

        const hideDropdown = isFranchiseeType || data;

        return (
            <Modal
                visible={true}
                title=""
                okText="Submit"
                onOk={this.onCreate}
                onCancel={onCancel}
                width={600}
            >
                <Form layout="vertical">
                    <h3>{title}</h3>
                    <Form.Item style={{ width: "100%", display: hideDropdown ? 'none' : 'inline-block' }} label={`${FRANCHISEE_LABEL}`} >
                        <Select placeholder={`Select ${FRANCHISEE_LABEL}`} onChange={this.franchiseeListHandler} >
                            {franchiseeList.map((val) => {
                                return (
                                    <Select.Option key={val.id}
                                        value={val.id}
                                    >
                                        {`${val.name}`}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                    {this.state.selectedFranchisee &&
                        <React.Fragment>
                            <Statistic title="Remained Amount to request" value={
                                `${this.state.remainedAmountToRequest.toFixed(2)} ${DEFAULT_BASE_CURRENCY}`
                            } />
                            <br />
                            <Form.Item label={`Amount (${DEFAULT_BASE_CURRENCY})`} >
                                <InputNumber
                                    min={0}
                                    placeholder="Amount"
                                    onChange={this.onAmountChange}
                                    value={amount}
                                />
                            </Form.Item>
                        </React.Fragment>
                    }
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(CommissionUpsertRequest);
