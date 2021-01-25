import { CHARGE_TYPE, FILTER_BY_PAYMENT_STATUS } from '../../constants/Common';
import { Empty, Table, Tag, message, Tooltip } from 'antd';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import UtilService from '../../services/util';
import axios from 'util/Api';
import ESTag from '../../components/ESTag';

class FeederEarning extends Component {
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

    fetch = async () => {
        try {
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
            message.warning('No more data');
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

    inItTableColumns = () => {
        this.columns = [
            {
                title: 'Sr. No',
                dataIndex: 'index',
                align: 'center',
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: 'Remark',
                dataIndex: 'remark',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>{record.remark}</div>
                    );
                }
            },
            {
                title: 'Transaction',
                dataIndex: 'transaction',
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>{UtilService.displayDate(record.createdAt)}</div>
                    );
                }
            },
            {
                title: 'Payment Id',
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
                title: 'Status',
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
                title: 'Amount',
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

export default FeederEarning;
