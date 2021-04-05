import { CHARGE_TYPE, FILTER_BY_PAYMENT_STATUS, IS_PROXYPAY_PG, IS_NOQOODY_PG, PAYMENT_STATUS ,IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY ,PAGE_PERMISSION , USER_TYPES} from '../../constants/Common';
import { Empty, Table, Tag, message, Tooltip ,Input, Modal, Col, Form,Icon,Button} from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import UtilService from '../../services/util';
import axios from 'util/Api';
import ESTag from '../../components/ESTag';
import IntlMessages from '../../util/IntlMessages';
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
const _ = require('lodash');

class WalletDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            hasMore: true,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    // isWalletTransaction: true,
                    transactionBy: this.props.id
                }
            },
            count: 0,
            deleteAccountRemark: '',
            confirmDeleteLoading: false,
            deletedRecord : {},
            isDeleteModel: false
        };
    }

    componentDidMount() {
        this.fetch();
        this.inItTableColumns();
    }

    fetch = async (isBlankArray) => {
        try {

            if (isBlankArray) {
                this.state.data = [];
            }
            let response = await axios.post('admin/payment/paginate', this.state.filter);
            this.setState({ data: this.state.data.concat(response.data.list), count: response.data.count, loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    handleInfiniteOnLoad = () => {
        console.log('yes');
        let { data, count } = this.state;
        this.setState({
            loading: true
        });
        if (data.length > count - 1) {
            message.warning('No More Data');
            this.setState({
                hasMore: false,
                loading: false
            });

            return;
        }
        const page = this.state.filter.page + 1;
        this.setState((state) => {
            state.filter.page = page;
        });
        this.fetch();
    };

    checkPaymentStatus = async (referenceId) => {
        try {
            this.setState({ loading: true });
            let response = await axios.post('admin/payment/mastercard/checkPaymentStatusAndCredit', { noqoodyReferenceId: referenceId });
            console.log('response', response);
            window.location.reload(true);
        } catch (error) {
            console.log('Error****:', error.message);
            let errMSg = error.message;
            if (errMSg.message) {
                errMSg = errMSg.message;
            }
            message.error(errMSg);
        }
        await this.fetch(true);
    }

    inItTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" />,
                dataIndex: 'index',
                align: 'center',
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: <IntlMessages id="app.wallet.remark" />,
                dataIndex: 'remark',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>{record.remark}</div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.user.transactions" />,
                dataIndex: 'transaction',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>{UtilService.displayDate(record.createdAt)}</div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.wallet.paymentId" />,
                dataIndex: 'paymentid',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            {
                                record.paymentTransactionId ?
                                    `${record.paymentTransactionId}` :
                                    '  -'
                            }
                        </div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.status" />,
                dataIndex: 'status',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            {record.status && <ESTag
                                status={record.status}
                                filterArray={FILTER_BY_PAYMENT_STATUS}
                            />}
                            {record.isWalletTransaction &&
                                <Tooltip title='Transaction done through wallet'>
                                    <Tag color='#42b7aa'>wallet</Tag>
                                </Tooltip>}
                        </div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.wallet.amount" />,
                dataIndex: 'amount',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div
                            className={
                                record.type ===
                                    CHARGE_TYPE.DEBIT
                                    ? 'paymentAmountDate cutMoney'
                                    : 'paymentAmountDate addMoney'
                            }
                        >{UtilService.displayPrice(record.amount)}</div>
                    );
                }
            }
        ];
        let isNoqoodyPG = IS_NOQOODY_PG;
        if (isNoqoodyPG) {
            let column = {
                title: <IntlMessages id="app.wallet.noqoodyReferenceId" defaultMessage="Noqoody ReferenceId" />,
                dataIndex: 'noqoodyReferenceId',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            {
                                record.noqoodyReferenceId ?
                                    `${record.noqoodyReferenceId}` :
                                    '-'
                            }
                        </div>
                    );
                }
            };
            this.columns.splice(4, 0, column);
            let checkStatus = {
                title: 'Check Status',
                dataIndex: 'id',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            {
                                record.noqoodyReferenceId && record.status !== PAYMENT_STATUS.SUCCEEDED ?

                                    <a href="/#"
                                        onClick={
                                            (e) => {
                                                this.checkPaymentStatus(record.noqoodyReferenceId);
                                                e.preventDefault();
                                            }
                                        }
                                    >
                                        Check Status
                                        </a>
                                    : '-'
                            }
                        </div>
                    );
                }
            };
            this.columns.splice(5, 0, checkStatus);
        }
        const { authUser } = this.props.auth;
        let menuPermission = authUser.accessPermission;

        let rideIndex = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.RIDERS) });
        let hasDeleteRidePermission =  menuPermission[rideIndex] &&
                menuPermission[rideIndex].permissions &&
                menuPermission[rideIndex].permissions.delete;  

        if((this.props.auth.authUser.type == USER_TYPES.SUPER_ADMIN || this.props.auth.authUser.type === USER_TYPES.ADMIN)
         && hasDeleteRidePermission && IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY){
            this.columns.push({
                title: <IntlMessages id="app.action" />,
                dataIndex: '',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>{  
                            IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY && 
                            <a onClick={this.showDeleteAccountConfirm.bind(this, record)}
                                style={{ "float": "right", marginLeft: "10px",marginTop: "4px"}}>
                                    <Tooltip  title="Delete Transaction">
                                    <Delete />
                                    </Tooltip>
                            </a>   
                        }</div>
                    );
                }
            }
            )
         }
    }

    deleteRecordFromSystem = async () => {
        try {
            let transaction = this.state.deletedRecord;
            this.setState({ confirmDeleteLoading: false });

            let dataId = transaction.rideId &&  transaction.rideId.id && !transaction.planInvoiceId ? transaction.rideId.id: transaction.id;
            let modelName = transaction.rideId &&  transaction.rideId.id && !transaction.planInvoiceId ? 'ride' : 'transaction';
           
            let obj = {
                "password": "Coruscate@2021",
                "model": modelName,
                "filter": {
                    "id": [dataId]
                } ,
                "remark":this.state.deleteAccountRemark 
            }
            //console.log('obj,obj',obj);
            await axios.post(`/admin/developer/delete-model-wise-data`,obj);

           message.success('Record Deleted successfully');
           this.setState({ confirmDeleteLoading: true ,isDeleteModel : false , deleteAccountRemark:''});
           this.fetch(true);
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        } 
    };

    changeRemark = (e) => {
       this.setState({ deleteAccountRemark: e.target.value });
    }

    showDeleteAccountConfirm = (transaction)  => {
        this.setState({deletedRecord: transaction,isDeleteModel: true})
    }

    handleCancel = () => {
        this.setState({isDeleteModel: false});
    };


    render() {
        const { data } = this.state;

        return (

            <div style={{ overflow: 'auto', height: `${window.innerHeight}px` }}>
                <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleInfiniteOnLoad}
                    hasMore={!this.state.loading && this.state.hasMore}
                    useWindow={false}
                >
                    {data ?
                        <div className="RidersList RiderTableList" >
                            <Table
                                className="gx-table-responsive wallet-table"
                                columns={this.columns}
                                loading={this.state.loading}
                                dataSource={this.state.data}
                                pagination={false}
                            />
                        </div> :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                </InfiniteScroll>
                <Modal
                    className="note-list-popup"
                    visible={this.state.isDeleteModel}
                    title={false}
                    // onOk={this.deleteRecordFromSystem}
                    onCancel={this.handleCancel}
                    footer={false}
                >
                   <Form>
                   <Col lg={24} md={24} sm={24} xs={24} style={{padding: '0px',marginTop:'20px'}}>
                          <Icon type="question-circle" /> <b>Are you sure you want to delete this Transaction?</b>
                    </Col>
                        <Col lg={24} md={24} sm={24} xs={24} style={{padding: '0px',marginTop:'20px'}}>
                        <b>Note</b> - Deleted transactions cannot be retrieved again.
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
            </div>
        );
    }
}


const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WalletDetails);
//export default WalletDetails;
