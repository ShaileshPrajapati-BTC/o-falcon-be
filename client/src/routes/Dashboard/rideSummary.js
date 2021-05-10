import './dashboard.less';
import { Card, Icon, Radio, Spin, Tooltip, message } from 'antd';
import { Redirect } from 'react-router-dom';

import React from 'react';
import UtilService from '../../services/util';
import _ from 'lodash';
import axios from 'util/Api';
import moment from 'moment';
import VehicleSvg from '../../components/ESVehicleSvg';
import IntlMessages from "../../util/IntlMessages";
import { CSVLink } from "react-csv";
import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, RIDE_STATUS, FILTER_VISIBLE, PAGE_PERMISSION, VEHICLE_TYPE_FILTER_FOR_EXCEL, FRANCHISEE_VISIBLE, CLIENT_VISIBLE, USER_TYPES, RIDE_STATUS_ARRAY_FOR_EXCEL, EXPORT_EXCEL , DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE, DISPLAY_AFTER_SPECIFIC_DATE } from '../../constants/Common';
const  moment_tz = require('moment-timezone');
let exportRef = null;
const filterData = [
    {
        value: 1,
        name: <IntlMessages id="app.dashboard.today" />,
        dateFilter: {
            startDate: UtilService.getStartOfTheDay(moment().startOf('day')
                .toISOString()),
            endDate: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    },
    {
        value: 2,
        name: <IntlMessages id="app.dashboard.weekly" />,
        dateFilter: {
            startDate: UtilService.getStartOfTheDay(moment().add(-7, 'days')
                .startOf('day')
                .toISOString()),
            endDate: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    },
    {
        value: 3,
        name: <IntlMessages id="app.dashboard.monthly" />,
        dateFilter: {
            startDate: UtilService.getStartOfTheDay(moment().add(-1, 'month')
                .startOf('day')
                .toISOString()),
            endDate: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    }
];

class RideSummary extends React.Component {
    constructor(props) {
        super(props);

        let filter = { vehicleType: FILTER_BY_VEHICLE_TYPE[0].type };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            summaryData: [
                { name: <IntlMessages id="app.dashboard.cpmpleteRide" />, key: 'compltedRides', value: 0, status: RIDE_STATUS.COMPLETED },
                { name: <IntlMessages id="app.dashboard.ongoingRide" />, key: 'ongoingRides', value: 0, status: RIDE_STATUS.ON_GOING },
                { name: <IntlMessages id="app.dashboard.cancelledRide" />, key: 'cancelledRides', value: 0, status: RIDE_STATUS.CANCELLED },
                { name: <IntlMessages id="app.dashboard.reservedRide" />, key: 'reservedRides', value: 0, status: RIDE_STATUS.RESERVED },
                { name: <IntlMessages id="app.dashboard.totalRevenue" />, key: 'totalFare', value: 0 }
            ],
            title: <IntlMessages id="app.dashboard.today" />,
            filter: {
                startDate: UtilService.getStartOfTheDay(moment().startOf('day')
                    .toISOString()),
                endDate: UtilService.getEndOfTheDay(moment().endOf('day')
                    .toISOString()),
                filter: filter
            },
            loading: false,
            firstLoading: true,
            status: 0,
            data: []
        };

        this.amountKeys = ['totalFare', 'totalCommission'];

    }

    componentDidMount() {
        this.fetchRideSummary();
        // if (FILTER_VISIBLE && FRANCHISEE_VISIBLE) {
        //     this.state.summaryData.push({ name: 'Total Commission', key: 'totalCommission', value: 0 })
        // }
    }


    componentWillReceiveProps(nextProps) {
        // console.log(this.props.filter, nextProps.filter)
        if ((this.props.filter.type !== nextProps.filter.type) || (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.filter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetchRideSummary();
            });
        }
        if (CLIENT_VISIBLE && this.props.filter.dealerId !== nextProps.filter.dealerId) {
            this.setState((state) => {
                state.filter.filter.dealerId = nextProps.filter.dealerId;
            }, () => {
                this.fetchRideSummary();
            });
        }
    }
    fetchRideSummary = async () => {
        this.setState({ loading: true });
        try {
            if(this.state.filter && this.state.filter.startDate){
                if(DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE && DISPLAY_AFTER_SPECIFIC_DATE){ 
                    let timezone = moment_tz.tz.guess();
                    let defaultDate =  moment(DISPLAY_AFTER_SPECIFIC_DATE).tz(timezone).utc().toISOString();
                    if(moment(this.state.filter.startDate).isBefore(defaultDate)){
                        this.state.filter.startDate =  defaultDate; 
                   }
                }
            }
            let response = await axios.post('admin/dashboard/get-ride-summary', this.state.filter);
            if (response && response.code === 'OK') {
                if (response.data && _.size(response.data)) {
                    let tempData = [...this.state.summaryData];
                    _.each(tempData, (data) => {
                        data.value = response.data[data.key];
                    });

                    this.setState({ summaryData: tempData });
                }
                this.setState({ loading: false, firstLoading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    filterChange = (e) => {
        let filterSummary = _.find(filterData, { value: e.target.value });
        this.setState((state) => {
            state.filter.startDate = filterSummary.dateFilter.startDate;
            state.filter.endDate = filterSummary.dateFilter.endDate;
            state.title = filterSummary.name;
        }, () => {
            return this.fetchRideSummary();
        });
    }
    exportExcel = () => {
        axios
            .post('admin/dashboard/export-ride-summary', this.state.filter)
            .then(async (data) => {
                if (data && data.data.length === 0) {
                    message.error('List not Found!');
                    return;
                }
                if (data.code === 'OK' && data && data.data) {
                    let rideSummaryData = data.data;
                    rideSummaryData.map((data) => {
                        for (let key in data) {
                            if (['StartDateTime', 'EndDateTime', 'ReservationTime'].includes(key)) {
                                data[key] = UtilService.displayDate(data[key]);
                            }
                            if (key === 'Status' && data[key]) {
                                let status = RIDE_STATUS_ARRAY_FOR_EXCEL.find((f) => f.type === data[key])
                                data[key] = status ? status.label : data[key]
                            }
                            if (key === 'VehicleType' && data[key]) {
                                let type = VEHICLE_TYPE_FILTER_FOR_EXCEL.find((f) => f.type === data[key])
                                data[key] = type ? type.label : data[key]
                            }
                        }
                    });
                    await this.setState({
                        data: rideSummaryData
                    });
                    exportRef.link.click();
                } else {
                    message.error(data.message)
                }
            })
            .catch((error) => {
                message.error(error.message)
                console.log('ERROR   ', error);
            });
    }
    render() {
        const { firstLoading, summaryData, title, loading, filter, status } = this.state;
        let menuPermission = this.props.authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.RIDES) });
        let hasRidePermission = menuPermission[indexes] && menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.list;
        if (status !== 0 && hasRidePermission) {
            return <Redirect to={{
                pathname: '/e-scooter/rides',
                vehicleStatus: status,
                filter: filter
            }} />;
        }

        return (
            <Card loading={firstLoading} className="CardTwoSec gx-pointer">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        {title} &nbsp;<IntlMessages id="app.dashboard.summary" />
                        <Tooltip title={<IntlMessages id="app.dashboard.summaryTooltip" />}>
                            <Icon type="info-circle" />
                        </Tooltip>
                    </h3>
                    <div>
                        <Radio.Group disabled={loading} defaultValue={1} buttonStyle="solid"
                            onChange={(e) => {
                                return this.filterChange(e);
                            }}>
                            {filterData.map((data) => {
                                return (
                                    <Radio.Button
                                        key={data.value}
                                        value={data.value}>
                                        {data.name}
                                    </Radio.Button>
                                );
                            })}
                        </Radio.Group>
                        {EXPORT_EXCEL && this.props.authUser.type === USER_TYPES.SUPER_ADMIN &&
                            <span
                                className="ant-radio-button-wrapper"
                                style={{ marginLeft: 5, borderRadius: 5 }}
                                onClick={this.exportExcel}>
                                <Icon type="download" />
                            </span>}
                        <CSVLink
                            data={this.state.data}
                            filename={'rideSummary.csv'}
                            className="hidden"
                            ref={(ref) => {
                                exportRef = ref;
                            }}
                            target="_blank"
                        />
                    </div>
                </div>
                <Spin spinning={loading} delay={100}>
                    <div className="cardSummeryInsight">
                        {summaryData.map((data, index) => {
                            return < div className="cardSummeryInsightInsight" key={data.key} onClick={() => { return data.status ? this.setState({ status: data.status }) : ' ' }}>
                                {filter.filter.vehicleType && <VehicleSvg
                                    type={filter.filter.vehicleType}
                                    name="VehicleType"
                                    status={index + 1} />}

                                <div className="countBox">
                                    <h4>{this.amountKeys.includes(data.key) ? UtilService.displayPrice(data.value) : UtilService.displayNumber(data.value)}</h4>
                                    <div className="countLabel">{data.name}</div>
                                </div>
                            </div >;
                        })
                        }
                    </div>
                </Spin>
            </Card >
        );
    }

}
export default RideSummary;

