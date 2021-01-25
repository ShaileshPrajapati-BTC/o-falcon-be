import { Table, Tag, Empty, Tooltip } from 'antd';
import React, { Component } from 'react';
import {
    PAGE_PERMISSION,
    BOOKING_PASS_LIMIT_TYPES,
    BOOKING_PASS_LIMIT_TYPES_FILTER,
} from '../../constants/Common';
import moment from "moment";
import ActionButtons from '../../components/ActionButtons';
import axios from 'util/Api';
import PlanRides from './PlanRides';
import BookingPassView from '../BookingPass/view';
import IntlMessages from '../../util/IntlMessages';

class BookingPass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            ridesModel: false,
            isViewModel: false,
            viewId: null,
            ridesObj: {},
            filter: {
                filter: {
                    userId: this.props.id,
                }
            },
            count: 0,
        };
    }
    componentDidMount() {
        this.fetch();
        this.initializeTableColumns();
    }
    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post(
                'admin/user/plan-invoice-list',
                this.state.filter
            );
            if (response && response.code === 'OK') {
                this.setState({
                    count: response.data.count,
                    loading: false,
                    data: response.data.list,
                });
            } else {
                this.setState({
                    count: 0,
                    loading: false,
                    data: [],
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };

    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.name" />,
                dataIndex: 'name',
                width: 200,
                render: (text, record) => {
                    return <div>
                        {record.planData && record.planData.name ? record.planData.name : '-'}
                    </div>
                }
            },
            {
                title: <IntlMessages id="app.bookingpass.expirationTime" />,
                dataIndex: 'expirationStartDateTime',
                width: 350,
                render: (text, record) => {
                    return (
                        (this.props.nextPlan && this.props.nextPlan === record.id) ?
                            <div>-</div>
                            :
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div>
                                    {this.displayTime(record.expirationStartDateTime)}
                                </div>
                                <div> &nbsp;&nbsp;{'   -   '}&nbsp;&nbsp;</div>
                                <div>
                                    {this.displayTime(record.expirationEndDateTime)}
                                </div>
                            </div>
                    )
                }
            },
            {
                title: <IntlMessages id="app.bookingpass.price" />,
                dataIndex: 'price',
                render: (text, record) => {
                    const planDetails = record.planData && record.planData.vehicleTypes && record.planData.vehicleTypes.filter((e) => e.vehicleType === record.vehicleType);
                    return planDetails && planDetails[0] ? planDetails[0].price : '-';
                }
            },
            {
                title: <IntlMessages id="app.bookingpass.timeLimit" />,
                dataIndex: 'totalTimeLimit',
                render: (text, record) => {
                    let limitType = BOOKING_PASS_LIMIT_TYPES_FILTER.find((el) => { return el.type === record.limitType; })
                    return (
                        <>
                            {record.limitValue} {'  '}
                            <span style={{ textTransform: 'capitalize' }}>
                                {limitType && limitType.label}
                            </span>
                        </>
                    )
                }
            },
            {
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {(this.props.currentPlans && this.props.currentPlans.includes(record.id)) ?
                                <Tooltip title={<IntlMessages id="app.bookingpass.currentPlan" />}>
                                    <Tag color="green"><IntlMessages id="app.bookingpass.curren" /></Tag></Tooltip>
                                : ''}
                        </span >
                    );
                }
            },
            {
                title: <IntlMessages id="app.view" />,
                dataIndex: 'view',
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.BOOKING_PASS}
                                view={() => {
                                    return this.handleModel(record);
                                }}
                            />
                        </span >
                    );
                }
            },
        ];
    };
    displayTime = (date) => {
        return date ? moment(date).format('DD-MM-YYYY hh:mm a') : ``;
    }
    handleModel = (record) => {
        this.setState({ isViewModel: true, viewId: record.planData.id })
    }
    handleCancel = () => {
        this.setState({ isViewModel: false })
    }

    info = (e) => {
        let ridesData = { userId: this.props.id, planInvoiceId: e.id }
        this.setState({ ridesModel: true, ridesObj: ridesData })
    }
    onCancel = () => {
        this.setState({ ridesModel: false, ridesObj: {} })
    }

    render() {

        return (
            <>
                {this.state.data ?
                    <div>
                        <div className="RidersList RiderTableList bookPlanList" >
                            <Table
                                className="gx-table-responsive"
                                columns={this.columns}
                                loading={this.state.loading}
                                dataSource={this.state.data}
                                rowKey="id"
                                pagination={false}
                                onRowClick={(record) => this.info(record)}

                            />
                        </div>
                    </div>
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                {this.state.ridesModel &&
                    <PlanRides
                        onCancel={this.onCancel}
                        ridesObj={this.state.ridesObj}
                    />}
                {
                    this.state.isViewModel &&
                    <BookingPassView id={this.state.viewId} onCancel={this.handleCancel} />
                }
            </>
        );
    }
}
export default BookingPass;
