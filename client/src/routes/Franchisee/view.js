import React, { Component } from 'react';
import { Avatar, Button, Card, Spin, Tabs, Upload, message, Form, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { FILE_TYPES, FRANCHISEE_ROUTE, RENTAL_VISIBLE, STAFF_VISIBLE, DEALER_LABEL, CLIENT_VISIBLE } from '../../constants/Common';
import UtilService from '../../services/util';
import axios from 'util/Api';
import BankDetail from './bankDetail';
import Document from './document';
import Staff from '../Users/index';
import Vehicle from './Vehicle';
import Zone from '../Zone/index';

import { connect } from 'react-redux'
import BasicInfo from './basicInfo';
import ESBankDetail from '../../components/ESBankDetail'
import ESDocument from '../../components/ESDocument'
import IntlMessages from '../../util/IntlMessages';
import Dealer from '../Dealer';
const _ = require('lodash')
const TabPane = Tabs.TabPane;

class FranchiseeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            id: props.match.params.id,
            image: '',
            accountReceivable: 0,
            accountPayable: 0,
            activetab: this.props.location && this.props.location.tab ? this.props.location.tab : "1",
            imageUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                showUploadList: false,
                action: '/upload-file',
                fileList: [],
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'image' })
                        ;
                },
                onChange: (info) => {
                    return this.onFileChange(info, {
                        fieldName: 'image',
                        stateKeyName: 'imageUploadprops'
                    })
                        ;
                }
            }
        }
    }
    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error(<IntlMessages id="app.invalidFileType" />);
            return
        }
        let FileSize = file.size / 1024 / 1024; // in MB
        if (FileSize > 5) {
            message.error(<IntlMessages id="app.fileSizeMsg" />);
            return false
        }
        return file.isValid;
    };


    onFileChange(info, option) {
        console.log(info, option);

        if (info.file.status === 'removed') {
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }

        if (info.file && info.file.response && info.file.response.code === 'OK') {
            let { data } = info.file.response;
            this.setState({ image: data.files[0].absolutePath });
        }

        const validFiles = _.filter(info.fileList, { isValid: true }) || [];
        this.setState((state) => {
            state[option.stateKeyName].fileList = validFiles;

            return state;
        }, async () => { await this.updateImage() })
    }

    updateImage = async () => {
        const { data, image } = this.state
        await this.setState({ data: { ...data, image } })
        if (this.state.data) {
            try {
                const data = await axios.put(`admin/user/${this.state.data.id}`, this.state.data)
                if (data.code === 'OK') {
                    await this.setState({ image: data.data[0].image })
                    // message.success(`${data.message}`);
                }
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(`${error.message}`);
            }
        }
    }
    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        try {
            this.setState({ loading: true });
            let response = await axios.get(`admin/user/${this.state.id}`);
            let payemntData = await axios.get(`/admin/rent-payment/summary/${this.state.id}`);
            const { accountReceivable, accountPayable } = payemntData.data;
            this.setState({ data: response.data, accountReceivable, accountPayable, loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {
        const { imageUploadprops, loading, data, image, accountReceivable, accountPayable } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-content">
                    <Spin spinning={loading} delay={100}>
                        {data && data.id ?
                            <div className={'gx-p-5'}>
                                <div className="gx-profile-banner">
                                    <div className="gx-profile-container">
                                        <div className="gx-profile-banner-top">
                                            <div className="gx-profile-banner-top-left">
                                                <div className="gx-profile-banner-avatar">
                                                    <Form layout="vertical" className="m-v-15">
                                                        <Form.Item
                                                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                                            {getFieldDecorator('file')(
                                                                <Upload {...imageUploadprops}>
                                                                    <Avatar className="gx-size-90"
                                                                        alt="..."
                                                                        src={image ? image : data.image}
                                                                        icon="user" >
                                                                    </Avatar>
                                                                </Upload>
                                                            )}
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                                <div className="gx-profile-banner-avatar-info">
                                                    <h2 className="gx-mb-2 gx-mb-sm-3 gx-fs-xxl gx-font-weight-light gx-text-capitalize">
                                                        {data.name}
                                                    </h2>
                                                    <Row>
                                                        <Col span={12}>
                                                            <b><IntlMessages id="app.email" />: </b>{UtilService.getPrimaryValue(data.emails, 'email')}<br />
                                                            <b><IntlMessages id="app.mobile" />: </b>{UtilService.getPrimaryValue(data.mobiles, 'mobile')}<br />
                                                            {data.dob.length > 0 &&
                                                                <>
                                                                    <b><IntlMessages id="app.dob" />: </b>{UtilService.displayDOB(data.dob)} <br />
                                                                </>
                                                            }
                                                        </Col>
                                                        <Col span={12}>
                                                            {RENTAL_VISIBLE && <div>
                                                                <b><IntlMessages id="app.partner.virtualBalance" />: </b>
                                                                <span
                                                                    className={
                                                                        data.walletAmount > 0
                                                                            ? 'paymentAmountDate addMoney'
                                                                            : 'paymentAmountDate cutMoney'
                                                                    }
                                                                >
                                                                    {UtilService.displayPrice(data.walletAmount)}
                                                                </span>
                                                                <br />
                                                                <b><IntlMessages id="app.partner.payable" />: </b>
                                                                <span
                                                                    className={
                                                                        accountReceivable < 0
                                                                            ? 'paymentAmountDate addMoney'
                                                                            : 'paymentAmountDate cutMoney'
                                                                    }
                                                                >
                                                                    {UtilService.displayPrice(accountReceivable)}
                                                                </span>
                                                                <br />
                                                                <b><IntlMessages id="app.partner.receivable" />: </b>
                                                                <span
                                                                    className={
                                                                        accountPayable > 0
                                                                            ? 'paymentAmountDate addMoney'
                                                                            : 'paymentAmountDate cutMoney'
                                                                    }
                                                                >
                                                                    {UtilService.displayPrice(accountPayable)}
                                                                </span>
                                                            </div>}
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </div>
                                            <div className="gx-profile-banner-top-right">
                                                <div>
                                                    <Link
                                                        to={{
                                                            pathname: `/e-scooter/${FRANCHISEE_ROUTE}`,
                                                            filter: this.props.location.filter
                                                        }}
                                                    >
                                                        <Button className="gx-mb-0"><IntlMessages id="app.list" /></Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="gx-profile-content">
                                    <div className="RiderInfo">
                                        <Card title=""
                                            className="gx-card-tabs gx-card-tabs-left gx-card-profile" >
                                            <Tabs defaultActiveKey={this.state.activetab}>
                                                <TabPane tab={<IntlMessages id="app.user.basicInfo" />} key="1">
                                                    <BasicInfo id={data.id} />
                                                </TabPane>
                                                <TabPane tab={<IntlMessages id="app.partner.bankDetail" />} key="2">

                                                    {/* <BankDetail id={this.state.id} /> */}

                                                    <ESBankDetail id={this.state.id} />

                                                </TabPane>
                                                <TabPane tab={<IntlMessages id="app.partner.document" />} key="3">

                                                    {/* <Document id={this.state.id} /> */}

                                                    <ESDocument id={this.state.id} />
                                                </TabPane>
                                                {
                                                    STAFF_VISIBLE &&
                                                    <TabPane tab={<IntlMessages id="app.staff" />} key="4">
                                                        <Staff franchiseeId={this.state.id} />
                                                    </TabPane>
                                                }
                                                <TabPane tab={<IntlMessages id="app.vehicle" />} key="5">
                                                    <Vehicle id={data.id} />
                                                </TabPane>
                                                <TabPane tab={<IntlMessages id="app.sidebar.zone" />} key="6">
                                                    <Zone franchiseeId={this.state.id} />
                                                </TabPane>
                                                {CLIENT_VISIBLE &&
                                                    <TabPane tab={DEALER_LABEL} key="7">
                                                        <Dealer franchiseeId={this.state.id} />
                                                    </TabPane>
                                                }
                                            </Tabs>
                                        </Card>
                                    </div >
                                </div >
                            </div > :
                            null
                        }
                    </Spin>
                </div >
            </div >
        );
    }
}
const mapStateToProps = (props) => {
    return props
};

const WrappedImageUpsert = Form.create()(FranchiseeView);
export default connect(mapStateToProps)(WrappedImageUpsert);