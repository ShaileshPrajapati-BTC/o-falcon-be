import { Avatar, Button, Card, Col,message, Modal,Input,Spin, Tabs, Upload, Form, Tag ,Icon } from 'antd';
import React, { Component } from 'react';
import BasicInfo from './basicInfo';
// import Cards from './cards';
import { DOCUMENT_VERIFICATION_REQUIRED, FILE_TYPES, SUBSCRIPTION_VISIBLE, GUEST_USER, BASE_URL, RIDER_ROUTE, PAGE_PERMISSION, WALLET_CONFIG_VISIBLE, FEEDER_VISIBLE, FEEDER_ROUTE, FEEDER_LABEL, BOOKING_PASS_LABEL, SUBSCRIPTION_LABEL, BOOKING_PASS_VISIBLE , REFERRAL_CODE_VISIBLE, IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY } from '../../constants/Common';
import Documents from './documents';
import { Link } from 'react-router-dom';
import UtilService from '../../services/util';
import WalletDetails from './walletDetails';
import axios from 'util/Api';
import { connect } from 'react-redux'
import BookPlanList from './BookPlanList';
import { USER_TYPES } from '../../constants/Common';
import WalletModel from './walletModel';
import BookingPassList from './BookingPassList';
import IntlMessages from '../../util/IntlMessages';
const { confirm } = Modal;
const _ = require('lodash')
const TabPane = Tabs.TabPane;

class RidersView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            id: props.match.params.id,
            image: '',
            isTransactionTab: true,
            showWalletModel: false,
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
            },
            deleteAccountRemark: '',
            confirmDeleteLoading: false,
            deletedRecord : {},
            isDeleteModel: false
        };
    }

    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error(<IntlMessages id="app.invalidFileType" />);
        }

        return file.isValid;
    };

    onFileChange(info, option) {
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
        if (this.state.data.id) {
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
            let random = Math.random() * 10;
            this.setState({ loading: true, isTransactionTab: false });
            let response = await axios.get(`admin/user/${this.state.id}?a=${random}`);

            // if (data.data.type === USER_TYPES.RIDER) {
            //     this.onTabChange(TABS.VEHICLE);
            // }

            this.setState({ data: response.data, loading: false, isTransactionTab: true });
            // this.setState({ loading: false });

        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    showModel = () => {
        console.log("TCL: showModel -> showWalletModel", this.state.showWalletModel)
        this.setState({ showWalletModel: true })
    }
    handleSubmit = () => {
        this.handleCancel();
        this.fetch();
    }
    handleCancel = () => {
        this.setState({
            showWalletModel: false
        });
    };

    
    deleteRecordFromSystem = async () => {
        try {
            let user = this.state.deletedRecord;
            this.setState({ confirmDeleteLoading: false });
           
            if(user && user.id){
                let obj = {
                    "password": "Coruscate@2021",
                    "model": "user",
                    "filter": {
                        "id": [user.id]
                    } ,
                    "remark":this.state.deleteAccountRemark 
                }
                
                await axios.post(`/admin/developer/delete-model-wise-data`,obj);
                message.success(`User ${user.name} has been removed`);
                this.setState({ confirmDeleteLoading: true ,isDeleteModel : false , deleteAccountRemark:''});
                this.props.history.push(`/e-scooter/${RIDER_ROUTE}`);
            }else{
                message.error('Record Not found');
            }
           

           this.setState({ confirmDeleteLoading: true });
    
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        } 
    };

    changeRemark = (e) => {
       this.setState({ deleteAccountRemark: e.target.value });
    }

    showDeleteAccountConfirm = (user)  => {
        this.setState({deletedRecord: user,isDeleteModel: true})
    }


    handleCancel = () => {
        this.setState({isDeleteModel: false});
    };


    render() {
        const { imageUploadprops, loading, data, image, isTransactionTab } = this.state;
        let isRider = data ? data.type === USER_TYPES.RIDER : false
        const { getFieldDecorator } = this.props.form;
        const { authUser } = this.props.auth;
        let menuPermission = authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.SUBSCRIPTION) });
        let walletIndex = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.WALLET_CONFIG) });
        let hasBookPlanPermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.list;
        let hasWalletPermission =
            menuPermission[walletIndex] &&
            menuPermission[walletIndex].permissions &&
            menuPermission[walletIndex].permissions.list;

        let bookingPassIndex = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.BOOKING_PASS) });
        let hasBookingPassPermission =
            menuPermission[bookingPassIndex] &&
            menuPermission[bookingPassIndex].permissions &&
            menuPermission[bookingPassIndex].permissions.list;

        let rideIndex = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.RIDERS) });
        let hasDeleteRidePermission =  menuPermission[rideIndex] &&
                menuPermission[rideIndex].permissions &&
                menuPermission[rideIndex].permissions.delete;   
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
                                                                        src={image ? image : `${BASE_URL}/${data.image}`}
                                                                        icon="user" >
                                                                    </Avatar>
                                                                </Upload>
                                                            )}
                                                        </Form.Item>
                                                    </Form>

                                                </div>
                                                <div className="gx-profile-banner-avatar-info">
                                                    <h2 className="gx-mb-2 gx-mb-sm-3 gx-fs-xxl gx-font-weight-light gx-text-capitalize">
                                                        {data.name ? data.name : GUEST_USER}
                                                        {FEEDER_VISIBLE && data.feederId && data.feederId.id &&
                                                            <span style={{ marginLeft: 15 }}>
                                                                <Link to={`/e-scooter/${FEEDER_ROUTE}/view/${data.feederId.id}`}>
                                                                    <Tag color="green" className="gx-pointer">{FEEDER_LABEL}</Tag>
                                                                </Link>
                                                            </span>
                                                        }
                                                    </h2>
                                                    {
                                                        data.emails && data.emails.length > 0 &&
                                                        <React.Fragment>
                                                            <b><IntlMessages id="app.email" />: </b>
                                                            {UtilService.getPrimaryValue(data.emails, 'email')
                                                            }
                                                            <br />
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        data.mobiles && data.mobiles.length > 0 &&
                                                        <React.Fragment>
                                                            <b><IntlMessages id="app.mobile" />: </b>{UtilService.getPrimaryValue(data.mobiles, 'mobile')}<br />
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        data.dob.length > 0 &&
                                                        <React.Fragment>
                                                            <b><IntlMessages id="app.dob" />: </b>{UtilService.displayDOB(data.dob)} <br />
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        REFERRAL_CODE_VISIBLE &&
                                                        <>
                                                            {data.senderReferralCode && <React.Fragment>
                                                                <b><IntlMessages id="app.sidebar.referralCode" />: </b>{data.senderReferralCode} <br />
                                                            </React.Fragment>}
                                                            {data.referralCode && <React.Fragment>
                                                                <b><IntlMessages id="app.inviteReferralCode" />: </b>{data.referralCode} <br />
                                                            </React.Fragment>}
                                                            {data.invitedUsersCount > 0 && <React.Fragment>
                                                                <b><IntlMessages id="app.referralCode.invitedUsers" defaultMessage="Invited Users" />: </b>{data.invitedUsersCount} <br />
                                                            </React.Fragment>}
                                                        </>
                                                    }
                                                    {data.currentBookingPlanInvoiceId === null && SUBSCRIPTION_VISIBLE && hasBookPlanPermission &&
                                                        <span>
                                                            <b><IntlMessages id="app.bookingpass.noCurrentPlan" /></b><br />
                                                        </span>
                                                    }
                                                    {data.currentBookingPassIds &&
                                                        data.currentBookingPassIds.length === 0 &&
                                                        BOOKING_PASS_VISIBLE && hasBookingPassPermission &&
                                                        <span>
                                                            <b><IntlMessages id="app.bookingpass.noCurrentPlan" /></b><br />
                                                        </span>
                                                    }
                                                    {WALLET_CONFIG_VISIBLE && hasWalletPermission &&
                                                        <><b><IntlMessages id="app.user.walletBalance" />: </b>
                                                            <span
                                                                className={
                                                                    data.walletAmount > 0
                                                                        ? 'paymentAmountDate addMoney'
                                                                        : 'paymentAmountDate cutMoney'
                                                                }
                                                            >
                                                                {UtilService.displayPrice(data.walletAmount)}
                                                            </span></>
                                                    }
                                                    {WALLET_CONFIG_VISIBLE && hasWalletPermission &&
                                                        <span>
                                                            <b>{UtilService.displayExpiredMessage(data.walletExpiryDate)}</b>
                                                        </span>
                                                    }
                                                    {
                                                        (authUser.type === USER_TYPES.SUPER_ADMIN || authUser.type === USER_TYPES.ADMIN) ?
                                                            <a href="/#" onClick={(e) => {
                                                                e.preventDefault();
                                                                this.showModel();
                                                            }}
                                                                className="add-amount-button"
                                                                style={{ marginLeft: '25px', color: '#000', textDecoration: 'underline' }}><IntlMessages id="app.user.addAmount" /></a> : null
                                                    }
                                                </div>
                                            </div>
                                            <div className="gx-profile-banner-top-right" style={{ display: 'flex' }}>
                                                {/* <div>
                                                    <Link
                                                        to={{
                                                            pathname: `/e-scooter/${RIDER_ROUTE}`,
                                                            filter: this.props.location.filter
                                                        }}>
                                                        <Button className="gx-mb-0">List</Button>
                                                    </Link>
                                                </div> */}
                                               {(this.props.auth.authUser.type == USER_TYPES.SUPER_ADMIN || this.props.auth.authUser.type === USER_TYPES.ADMIN) && hasDeleteRidePermission && IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY && 
                                                 <div style={{ marginLeft: '10px' }}>
                                                    <Button className="gx-mb-0" onClick={this.showDeleteAccountConfirm.bind(this, data)}>
                                                        <IntlMessages id="app.deleteAccount" defaultMessage="Delete Account" />
                                                    </Button>
                                                </div> 
                                              }

                                                <div style={{ marginLeft: '10px' }}>
                                                    <Link
                                                        to={{
                                                            pathname: this.props.location && this.props.location.redirectPath ? this.props.location.redirectPath : `/e-scooter/${RIDER_ROUTE}`,
                                                            filter: this.props.location.filter
                                                        }}>
                                                        <Button className="gx-mb-0"><IntlMessages id="app.back" /></Button>
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
                                            <Tabs defaultActiveKey="1">
                                                <TabPane tab={<IntlMessages id="app.user.basicInfo" />} key="1">
                                                    <BasicInfo info={data} />
                                                </TabPane>
                                                {DOCUMENT_VERIFICATION_REQUIRED ?
                                                    <TabPane tab={<IntlMessages id="app.user.documents" />} key="2">
                                                        <Documents data={data.documents} id={data.id} userData= {data}/>
                                                    </TabPane> :
                                                    null}
                                                {/* <TabPane tab="Cards" key="3">
                                                    <Cards data={data.cards} />
                                                </TabPane> */}
                                                {isRider && isTransactionTab && <TabPane tab={<IntlMessages id="app.user.transactions" />} key="5">
                                                    <WalletDetails
                                                        id={this.state.id}
                                                    />
                                                </TabPane>}
                                                {SUBSCRIPTION_VISIBLE && hasBookPlanPermission && <TabPane tab={SUBSCRIPTION_LABEL} key="6">
                                                    <BookPlanList
                                                        id={this.state.id}
                                                        currentPlan={data.currentBookingPlanInvoiceId}
                                                        nextPlan={data.nextBookingPlanInvoiceId}
                                                    />
                                                </TabPane>}
                                                {BOOKING_PASS_VISIBLE && hasBookingPassPermission &&
                                                    <TabPane tab={BOOKING_PASS_LABEL} key="7">
                                                        <BookingPassList
                                                            id={this.state.id}
                                                            currentPlans={data.currentBookingPassIds}
                                                        />
                                                    </TabPane>}
                                            </Tabs>
                                        </Card>
                                    </div>
                                </div>
                            </div> :
                            null}
                    </Spin>
                </div>
                {this.state.showWalletModel &&
                    <WalletModel
                        onCancel={this.handleCancel}
                        onCreate={this.handleSubmit}
                        userId={this.state.id}
                    />
                }
                <Modal
                    className="note-list-popup"
                    visible={this.state.isDeleteModel}
                    title={false}
                    footer={false}
                    onCancel={this.handleCancel}
                >
                   <Form>
                   <Col lg={24} md={24} sm={24} xs={24} style={{padding: '0px',marginTop:'20px'}}>
                          <Icon type="question-circle" /> <b> Are you sure you want to delete this account?</b>
                    </Col>
                        <Col lg={24} md={24} sm={24} xs={24} style={{padding: '0px',marginTop:'20px'}}>
                        <b>Note</b> - Deleted account cannot be retrieved again.
                        </Col>
                        <Col lg={24} md={24} sm={24} xs={24} style={{padding: '0px',marginTop:'20px'}}>
                            Remark : <Input placeholder="Add Remark" required={true}
                                onChange = {(e) => this.changeRemark(e)}/>
                        </Col>
                    </Form>
                    <div className="notes-add-footer-btn" style={{paddingBottom:'35px'}} >
                        <Button type="primary" className="mb-0"  style={{float:'right',marginTop:'5px'}} 
                          disabled={!this.state.deleteAccountRemark || this.state.deleteAccountRemark === ''}
                        onClick={() => { this.deleteRecordFromSystem()}}>Submit</Button>
                        <Button className="mb-0"  style={{float:'right',marginTop:'5px'}} 
                          onClick={() => {this.handleCancel()}}> Cancel
                        </Button>
                     </div>
                </Modal>
            </div >
        );
    }
}
const mapStateToProps = (props) => {
    return props
};

const WrappedImageUpsert = Form.create()(RidersView);
export default connect(mapStateToProps)(WrappedImageUpsert);
