import { Table, Tag, Empty, Tooltip, DatePicker, Row } from 'antd';
import React, { Component } from 'react';
import {
    DEFAULT_BASE_CURRENCY,
    PAGE_PERMISSION,
    FILTER_BY_CANCEL_BOOK_PLAN,
} from '../../constants/Common';
import moment from "moment";
import UtilService from '../../services/util';
import ActionButtons from '../../components/ActionButtons';
import axios from 'util/Api';
import FilterDropdown from '../../components/FilterDropdown';
import PlanRides from './PlanRides';
import BookingPlanView from '../BookingPlan/view';
import IntlMessages from '../../util/IntlMessages';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
class BookingPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            paginate: false,
            ridesModel: false,
            isViewModel: false,
            viewId: null,
            ridesObj: {},
            filter: {
                filter: {
                    userId: this.props.id,
                    isCancelled: false,
                    expirationStartDateTime: {
                        '>=': UtilService.getStartOfTheDay(moment()
                            .subtract(1, "months")
                            .startOf("day")
                            .toISOString())
                    },
                    expirationEndDateTime: { '<=': UtilService.getEndOfTheDay(moment().toISOString()) }
                },
            },
            count: 0,
            date: [moment().subtract(1, 'months'), moment()]
        };
        this.isCancelled = 3;
    }

    handleModel = (record) => {
        this.setState({ isViewModel: true, viewId: record.planData.id })
    }
    handleCancel = () => {
        this.setState({ isViewModel: false })
    }

    displayTime = (date) => {
        return date ? moment(date).format('DD-MM-YYYY hh:mm a') : ``;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.name" />,
                dataIndex: 'name',
                width: 200,
                render: (text, record) => {
                    return <div>
                        {record.planId.name}
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
                    return record.planId.price + DEFAULT_BASE_CURRENCY;
                }
            },
            {
                title: <IntlMessages id="app.bookingpass.totalTimeLimit" />,
                dataIndex: 'totalTimeLimit',
                render: (text, record) => {
                    return record.totalTimeLimit === 0 ? 0 : UtilService.getSecondsToTime(record.totalTimeLimit);
                }
            },
            {
                title: <IntlMessages id="app.bookingpass.remainingTime" />,
                dataIndex: 'remainingTimeLimit',
                render: (text, record) => {
                    return record.remainingTimeLimit === 0 ? 0 : UtilService.getSecondsToTime(record.remainingTimeLimit);
                }
            },
            {
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {(this.props.currentPlan && this.props.currentPlan === record.id) ?
                                <Tooltip title={<IntlMessages id="app.bookingpass.currentPlan" />}><Tag color="purple"><IntlMessages id="app.bookingpass.current" /></Tag></Tooltip>
                                : ''}
                            {(this.props.nextPlan && this.props.nextPlan === record.id) ?
                                <Tooltip title={<IntlMessages id="app.bookingpass.nextPlan" />}><Tag color="purple"><IntlMessages id="app.bookingpass.next" /></Tag></Tooltip>
                                : ''}
                            {record.planId.isRenewable ? <Tag color="green"><IntlMessages id="app.bookingpass.renewable" /></Tag> : <Tag color="red"><IntlMessages id="app.bookingpass.notRenewable" /></Tag>}
                            {record.planId.isTrialPlan ? <Tag color="green"><IntlMessages id="app.bookingpass.trialPlan" /></Tag> : <Tag color="red"><IntlMessages id="app.bookingpass.notTrialPlan" /></Tag>}
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
                                pageId={PAGE_PERMISSION.SUBSCRIPTION}
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
    handleSelection = (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        }, () => {
            return self.fetch();
        });
    };
    info = (e) => {
        let ridesData = { userId: this.props.id, planInvoiceId: e.id }
        this.setState({ ridesModel: true, ridesObj: ridesData })
    }
    onCancel = () => {
        this.setState({ ridesModel: false, ridesObj: {} })
    }

    dateChange = (date) => {
        let from = UtilService.getStartOfTheDay(moment(date[0]).startOf('day')
            .toISOString());
        let to = UtilService.getEndOfTheDay(date[1].toISOString());
        let value = [moment(date[0]), moment(date[1])]
        let range = [{ '>=': from }, { '<=': to }];
        this.setState((state) => {
            state.filter.filter.expirationStartDateTime = range[0];
            state.filter.filter.expirationEndDateTime = range[1];
            state.date = value;
        });
        this.fetch();
    }
    render() {
        let FilterArray = [
            {
                title: <IntlMessages id="app.bookingpass.cancelledPlan" />,
                list: FILTER_BY_CANCEL_BOOK_PLAN,
                defaultSelected: this.isCancelled,
                key: 'isCancelled'
            },

        ];
        return (
            <>
                <Row>
                    <div className="DropdownWidth" style={{ paddingLeft: '18px' }}>
                        {FilterArray.map((filter) => {
                            return (
                                <FilterDropdown
                                    title1={filter.title}
                                    list={filter.list}
                                    defaultSelected={
                                        filter.defaultSelected
                                    }
                                    handleSelection={(val) => {
                                        this.handleSelection(
                                            val,
                                            filter.key,
                                            filter.list
                                        );
                                    }}
                                />

                            );
                        })}
                    </div>

                    <div className="graphFilterWithCalander gx-d-flex" style={{ marginLeft: '55%' }}>
                        <IntlMessages id="app.bookingpass.planExpiration" />
                        <div className="dateRanges">
                            <RangePicker
                                defaultValue={[moment().subtract(1, 'months'), moment()]}
                                value={this.state.date}
                                format={dateFormat}
                                onChange={this.dateChange.bind(this)}
                            />
                        </div>
                    </div>
                </Row>
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
                    <BookingPlanView id={this.state.viewId} onCancel={this.handleCancel} />
                }
            </>
        );
    }
}
export default BookingPlan;
