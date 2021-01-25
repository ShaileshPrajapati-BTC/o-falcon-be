import { Button, Col, Form, Input, InputNumber, Row, message, Spin } from 'antd';
import React, { Component } from 'react';
import axios from 'util/Api';
import CustomScrollbars from '../../util/CustomScrollbars';
import { PAGE_PERMISSION, DEFAULT_API_ERROR } from '../../constants/Common';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');


const RowForm = (props) => {
    return (
        <Row type="flex" justify="start">
            <Col span={12}>
                <Form.Item label={<IntlMessages id="app.title" defaultMessage="Title"/> }>
                    {props.form.getFieldDecorator(`title[${props.id.id}]`, {
                        rules: [{ required: true, message: <IntlMessages id="app.walletconfig.addTitleValidation" defaultMessage="Please add title"/> }]
                    })(<Input placeholder="Title" />)}
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item label={<IntlMessages id="app.wallet.amount" defaultMessage="Amount"/>}>
                    {props.form.getFieldDecorator(`amount[${props.id.id}]`, {
                        rules: [
                            { required: true, message: <IntlMessages id="app.walletconfig.pleaseAddAmount" defaultMessage="Please add amount"/> },
                            { pattern: /^[0-9]*$/, message: <IntlMessages id="app.walletconfig.pleaseEnterNumber" defaultMessage="Please Enter Number!"/> }
                        ]
                    })(<InputNumber min={0} placeholder="Amount" />)}
                </Form.Item>
            </Col>
            <Form.Item label={<IntlMessages id="app.walletconfig.bonusAmount" defaultMessage="Bonus Amount"/>} style={{ display: 'none' }}>
                {props.form.getFieldDecorator(`bonusAmount[${props.id.id}]`, {
                    rules: [
                        { required: true, message: <IntlMessages id="app.walletconfig.pleaseAddBonusAmount" defaultMessage="Please add bonus amount"/> },
                        { pattern: /^[0-9]*$/, message: <IntlMessages id="app.walletconfig.pleaseEnterNumber" defaultMessage="Please Enter Number!"/> }
                    ]
                })(<InputNumber min={0} placeholder="Bonus Amount" />)}
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
                {props.form.getFieldDecorator(`id[${props.id.id}]`, {
                    initialValue: props.id.id
                })(<Input />)}
            </Form.Item>
        </Row>

    )
}
class ProjectSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: false,
            data: [],
            loading: false
        };
    }
    componentDidMount() {
        this.fetch();
    }
    fetch = async () => {
        const { form } = this.props;

        this.setState({ loading: true });
        try {
            let response = await axios.get(`/admin/config/project?a=${Math.random() * 10}`);
            console.log("TCL: ProjectSetup -> fetch -> response", response)
            if (response.code === 'OK') {
                this.setState({
                    loading: false,
                    data: response.data,
                    isEdit: !!response.data
                });
                let data = response.data;

                let formVal = data;
                form.setFieldsValue(formVal);
                if (formVal.walletTopUps && formVal.walletTopUps.length > 0) {
                    let id = 0;
                    let data = { title: [], amount: [], bonusAmount: [], id: [], updatedWalletTopUps: [] }
                    for (let value of formVal.walletTopUps) {
                        let IncrementId = id++
                        data.updatedWalletTopUps.push({ ...value, id: IncrementId })
                        data.title.push(...[value.title])
                        data.amount.push(...[value.amount])
                        data.bonusAmount.push(...[value.bonusAmount])
                        data.id.push(...[IncrementId])
                    }
                    form.setFieldsValue({ walletTopUps: data.updatedWalletTopUps })
                    form.setFieldsValue({ title: data.title, amount: data.amount, bonusAmount: data.bonusAmount, id: data.id })
                }
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false, isEdit: false });
            console.log('ERROR   ', error);
        }
    };
    handleSubmit = async (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            let obj = values;
            if (obj.walletTopUps.length > 0) {
                const { title, amount, bonusAmount, id } = obj
                const newUpdatedData = title.map((value, i) => {
                    return {
                        title: value,
                        amount: amount[i],
                        bonusAmount: bonusAmount[i],
                        id: id[i]
                    }
                })
                const nonEmptyData = newUpdatedData.filter(el => el.id !== undefined)
                let removeIdFromWalletTopUps = nonEmptyData.map(el => {
                    return {
                        title: el.title,
                        amount: el.amount,
                        bonusAmount: el.bonusAmount
                    }
                })
                obj = _.omit(obj, ['title', 'amount', 'bonusAmount', 'id'])
                obj = { ...obj, walletTopUps: removeIdFromWalletTopUps }
            }
            let url = `/admin/config/project`;
            let method = `put`;

            try {
                let data = await axios[method](url, obj);
                if (data.code === 'OK') {
                    message.success(`${data.message}`);
                    this.fetch();
                } else {
                    message.error(`${data.message}`);
                }
            } catch (error) {
                console.log('error', error);
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    };

    render() {
        const { isEdit, loading } = this.state;
        const { getFieldDecorator } = this.props.form;
        //update permission
        const hasPermission = this.props.auth.authUser.accessPermission;
        const pageIndex = PAGE_PERMISSION.WALLET_CONFIG;
        const getIndex = (el) => el.module === pageIndex;
        const index = hasPermission.findIndex(getIndex);
        const updatePermission = pageIndex && hasPermission[index] && hasPermission[index].permissions ? hasPermission[index].permissions.update : false;
        let walletTopUpsData = this.props.form.getFieldValue('walletTopUps')

        return <>
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading"><IntlMessages id="app.sidebar.walletConfig" defaultMessage="Wallet Config"/></h1>
                        {updatePermission && <Row>
                            <div >
                                <Button type="primary" style={{ marginRight: '10px' }}
                                    onClick={this.handleSubmit}>
                                    {isEdit ? <IntlMessages id="app.update" defaultMessage="Update"/> : <IntlMessages id="app.save" defaultMessage="Save"/>}
                                </Button>
                            </div>
                        </Row>}
                    </Row>
                </div>

                <br></br>

                <Spin spinning={loading} delay={100}>
                    <div className="gx-module-box-content">
                        <div className="gx-mt-3">
                            <Form layout="vertical">
                                <Row type="flex" justify="start">
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.walletconfig.defaultWalletAmount" defaultMessage="Default Wallet Amount"/>}>
                                            {getFieldDecorator(
                                                'defaultWalletAmount'
                                            )(
                                                <InputNumber placeholder="Default Wallet Amount" disabled={!updatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.walletconfig.minAmountWalletCredit" defaultMessage="Min Amount For Wallet Credit"/>}>
                                            {getFieldDecorator(
                                                'minWalletCreditAmount'
                                            )(
                                                <InputNumber placeholder="Min Wallet Credit Amount" disabled={!updatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.walletconfig.maxAmountWalletCredit" defaultMessage="Max Amount For Wallet Credit"/>}>
                                            {getFieldDecorator(
                                                'maxWalletCreditAmount'
                                            )(
                                                <InputNumber placeholder="Max Wallet Credit Amount" disabled={!updatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={12} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.walletconfig.minAmountWalletForRide" defaultMessage="Min Wallet Amount For Ride"/>}>
                                            {getFieldDecorator(
                                                'minWalletAmountForRide'
                                            )(
                                                <Input placeholder="Min Wallet Amount For Ride" disabled={!updatePermission} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item label={<IntlMessages id="app.walletconfig.walletTopUps" defaultMessage="Wallet Top-ups"/>} style={{ margin: 0 }}>
                                            {
                                                this.props.form.getFieldDecorator('walletTopUps',
                                                    { initialValue: [], rules: [{ required: false }] }
                                                )
                                            }
                                        </Form.Item>
                                        {
                                            (walletTopUpsData && walletTopUpsData.length > 0) &&
                                            walletTopUpsData.map((key, i) => <RowForm form={this.props.form} id={key} />)
                                        }
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </Spin>
            </div >
        </>;
    }
}
const WrappedProjectSetup = Form.create({ name: 'PromoCodeUpsertForm' })(ProjectSetup);

const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(WrappedProjectSetup);

