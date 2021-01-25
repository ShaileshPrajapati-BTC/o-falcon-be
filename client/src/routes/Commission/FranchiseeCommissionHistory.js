/* eslint-disable max-lines-per-function */
import {
    Button, Col, Form, Input, InputNumber, Row, Spin, message, Select, Divider,
    Table, Popconfirm
} from 'antd';
import React, { Component } from 'react';
import { COMMISSION_TYPE_ARRAY, COMMISSION_TYPE } from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import UtilService from '../../services/util';

const _ = require('lodash');

class FranchiseeCommissionHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            commissionHistory: [],
            editingKey: '',
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null
        };

        this.columns = [
            {
                title: 'Type',
                dataIndex: 'type',
                width: '25%',
                editable: true,
                render: (text, record) => {
                    let res = _.find(COMMISSION_TYPE_ARRAY, a => a.value === text);
                    return res.label;
                }
            },
            {
                title: 'Commission',
                dataIndex: 'percentage',
                width: '20%',
                editable: true,
                render: (text, record) => {
                    if (record.type === COMMISSION_TYPE.AMOUNT) {
                        return record.amount
                    } else {
                        return record.percentage;
                    }
                }
            },
            {
                title: 'Date/Time',
                dataIndex: 'dateTime',
                width: '20%',
                render: (text, record) => {
                    return UtilService.displayDate(text)
                }
            },
        ];
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/franchisee/commission-list', {});
            let list = response.data.list;
            let loggedInFranchiseeObj = _.find(list, e => e.franchiseeId.id === this.state.loginUser.id);
            // const formObj = _.omit(record, ['id']);
            // const { form } = this.props;
            // form.setFieldsValue(formObj);
            this.setState({ loading: false, commissionHistory: loggedInFranchiseeObj.track });
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    updateFranchiseeCommission = async (req) => {
        try {
            let reqData = {
                franchiseeId: req.franchiseeId.id,
                type: req.type
            }
            if (req.type === COMMISSION_TYPE.AMOUNT) {
                reqData.amount = req.percentage;
            } else if (req.type === COMMISSION_TYPE.PERCENTAGE) {
                reqData.percentage = req.percentage;
            }
            let response = await axios.put('/admin/franchisee/commission/update-commission', reqData);
            console.log('response', response);
            message.success(`${response.message}`);
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
        }
    };

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { loading } = this.state;

        return (
            <div className="RidersList RiderTableList">
                <Table
                    className="gx-table-responsive"
                    dataSource={this.state.commissionHistory}
                    columns={this.columns}
                    rowClassName="franchisee-editable-row"
                    pagination={false}
                />
            </div>
        );
    }
}


const WrappedFranchiseeCommissionHistory = Form.create({ name: 'franchiseeCommissionHistoryForm' })(FranchiseeCommissionHistory);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedFranchiseeCommissionHistory);
