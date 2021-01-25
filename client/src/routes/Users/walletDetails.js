import { CHARGE_TYPE, FILTER_BY_PAYMENT_STATUS, IS_NOQOODY_PG, PAYMENT_STATUS } from '../../constants/Common';
import { Empty, Table, Tag, message, Tooltip } from 'antd';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import UtilService from '../../services/util';
import axios from 'util/Api';
import ESTag from '../../components/ESTag';
import IntlMessages from '../../util/IntlMessages';

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
            count: 0
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
            let response = await axios.post('admin/payment/noqoody/checkPaymentStatusAndCredit', { noqoodyReferenceId: referenceId });
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
    }

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
            </div>
        );
    }
}

export default WalletDetails;
