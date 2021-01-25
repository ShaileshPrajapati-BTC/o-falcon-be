import { Card, DatePicker, Spin, Statistic, Empty, Icon, message } from 'antd';
import {
    DEFAULT_BASE_CURRENCY,
    DEFAULT_VEHICLE,
    FILTER_BY_VEHICLE_TYPE,
    FRANCHISEE_VISIBLE,
    PAGE_PERMISSION,
    CLIENT_VISIBLE,
    USER_TYPES,
    RIDE_STATUS_ARRAY_FOR_EXCEL,
    VEHICLE_TYPE_FILTER_FOR_EXCEL,
    EXPORT_EXCEL,
    DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE, 
    DISPLAY_AFTER_SPECIFIC_DATE
} from '../../constants/Common';
import React, { Component } from 'react';
import AmCharts from '@amcharts/amcharts3-react';
import UtilService from '../../services/util';
import _ from 'lodash';
import axios from 'util/Api';
import moment from 'moment';
import IntlMessages from "../../util/IntlMessages";
import { CSVLink } from "react-csv";
const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const  moment_tz = require('moment-timezone');

let exportRef = null;

class ChartData extends Component {
    constructor(props) {
        super(props);
        let filter = { vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            loading: false,
            summaryData: [],
            chartFilter: {
                ...props.filterBy,
                startDate: UtilService.getStartOfTheDay(moment().subtract(1, 'year')
                    .toISOString()),
                endDate: UtilService.getEndOfTheDay(moment().toISOString()),
                filter: filter
            },
            chartData: [],
            currentFilter: <IntlMessages id="app.dashboard.1y" />,
            currentFilterType: '',
            height: props.height || 500,
            data: []
        };
        this.chartFilterBy = [
            { text: <IntlMessages id="app.dashboard.1w" />, unit: 'week', value: 1 },
            { text: <IntlMessages id="app.dashboard.2w" />, unit: 'week', value: 2 },
            { text: <IntlMessages id="app.dashboard.1m" />, unit: 'month', value: 1 },
            { text: <IntlMessages id="app.dashboard.3m" />, unit: 'month', value: 3 },
            { text: <IntlMessages id="app.dashboard.1y" />, unit: 'year', value: 1 },
            { text: <IntlMessages id="app.dashboard.all" />, unit: 'year', value: 0 }
        ];
    }
    componentDidMount() {
        this.fetchChartData();
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.page === PAGE_PERMISSION.VEHICLES) {
            return;
        }
        if (this.props.filter && (
            this.props.filter.type !== nextProps.filter.type ||
            (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)
        )) {
            // if () {
            this.setState((state) => {
                state.chartFilter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.chartFilter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetchChartData();
            });
            // }
        }
        if (this.props.filter && CLIENT_VISIBLE && this.props.filter.dealerId !== nextProps.filter.dealerId) {
            this.setState((state) => {
                state.chartFilter.filter.vehicleType = nextProps.filter.type;
                if (CLIENT_VISIBLE) {
                    state.chartFilter.filter.dealerId = nextProps.filter.dealerId;
                }
            }, () => {
                this.fetchChartData();
            });
        }
    }
    fetchChartData = async () => {
        this.setState({ loading: true });
        // if (this.props.filterBy) {
        //     let chartFilter = _.clone(this.state.chartFilter);
        //     _.merge
        //     this.setState({ chartFilter: chartFilter });
        // }

        try {
            if(this.state.chartFilter && this.state.chartFilter.startDate){
                if(DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE && DISPLAY_AFTER_SPECIFIC_DATE){ 
                    let timezone = moment_tz.tz.guess();
                    let defaultDate =  moment(DISPLAY_AFTER_SPECIFIC_DATE).tz(timezone).utc().toISOString();
                    if(moment(this.state.chartFilter.startDate).isBefore(defaultDate)){
                        this.state.chartFilter.newStartDate =  defaultDate; 
                   }
                }
            }
            let response = await axios.post(this.props.url, this.state.chartFilter);
            if (response && response.code === 'OK') {
                if (response.data && _.size(response.data)) {
                    this.setState({
                        chartData: response.data,
                        currentFilterType: response.data[0].code
                    });
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
        this.setState({ loading: false });
    }
    updateChart = async (dates) => {
        let { chartFilter } = this.state;
        chartFilter.startDate = UtilService.getStartOfTheDay(dates[0].toISOString());
        chartFilter.endDate = UtilService.getEndOfTheDay(dates[1].toISOString());


        this.setState({ chartFilter: chartFilter }, () => {
            this.fetchChartData();
        });
    }

    updateChartByFilterBy = async (filterBy) => {
        let { chartFilter } = this.state;
        chartFilter.startDate = UtilService.getStartOfTheDay(moment().subtract(filterBy.value, filterBy.unit)
            .toISOString());
        chartFilter.endDate = UtilService.getEndOfTheDay(moment().toISOString());

        if (filterBy.value === 0) {
            chartFilter.startDate = UtilService.getStartOfTheDay(moment('01/01/2019', dateFormat).toISOString());
        }
        this.setState({ chartFilter: chartFilter, currentFilter: filterBy.text }, () => {
            this.fetchChartData();
        });
    }

    updateChartByFilterType = async (filterType) => {
        if (this.state.currentFilterType === filterType.code) {
            return;
        }

        this.setState({ currentFilterType: filterType.code });
    }
    exportExcel = () => {
        let api = 'admin/dashboard/export-total-rider-summary';
        console.log('this.state.chartData :>> ', this.state.chartData);
        if (this.state.currentFilterType === "ride") {
            api = 'admin/dashboard/export-ride-summary';
        } else if (this.state.currentFilterType === "revenue") {
            api = 'admin/dashboard/export-total-revenue-summary';
        } else {
            api = 'admin/dashboard/export-total-rider-summary';
        }
        axios
            .post(api, this.state.chartFilter)
            .then(async (data) => {
                if (data && data.data.length === 0) {
                    message.error('List not Found!');
                    return;
                }
                if (data.code === 'OK' && data && data.data) {
                    let rideSummaryData = data.data;
                    rideSummaryData.map((data) => {
                        for (let key in data) {
                            if (['StartDateTime', 'SignUpDate', 'EndDateTime', 'ReservationTime'].includes(key)) {
                                data[key] = UtilService.displayDate(data[key]);
                            }
                            if (key === 'RiderName') {
                                data[key] = data[key] ? data[key] : 'Guest User';
                            }
                            if (key === 'Emails' && data[key]) {
                                data[key] = data[key][0].email;
                            }
                            if (key === 'Mobiles' && data[key]) {
                                data[key] = data[key][0].countryCode + ' ' + data[key][0].mobile;
                            }
                            if (key === 'Status' && data[key]) {
                                console.log('data[key] :>> ', data[key]);
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
        const { height, loading, currentFilter, currentFilterType, chartFilter, chartData } = this.state;
        let dataProvider = [];
        let isPrice = false;
        let balloonText = '';
        if (currentFilterType) {
            dataProvider = _.find(chartData, { code: currentFilterType }).data;
            isPrice = _.find(chartData, { code: currentFilterType }).isPrice;
            let value = isPrice ? `${DEFAULT_BASE_CURRENCY} [[value]]` : '[[value]]';
            balloonText = '<span style=\'font-size:18px\'>' + value + '</span>';
        }
        this.config = {
            type: 'serial',
            theme: 'light',
            marginRight: 40,
            marginLeft: 80,
            autoMarginOffset: 20,
            mouseWheelZoomEnabled: false,
            dataDateFormat: 'YYYY-MM-DD',
            valueAxes: [{
                id: 'v1',
                axisAlpha: 0,
                position: 'left',
                ignoreAxisWidth: true,
                integersOnly: true,
                minimum: '[value]',
                // minimum: 0, // y-axis point will be start from zero
            }],
            balloon: {
                borderThickness: 1,
                shadowAlpha: 0
            },
            graphs: [{
                id: 'g1',
                balloon: {
                    drop: true,
                    adjustBorderColor: false,
                    color: '#FFFFFF'
                },
                bullet: 'round',
                bulletBorderAlpha: 1,
                bulletColor: 'var(--es--chart--bullet)',
                bulletSize: 5,
                hideBulletsCount: 50,
                lineThickness: 2,
                title: 'red line',
                useLineColorForBulletBorder: true,
                valueField: 'value',
                balloonText: balloonText,
                fillOpacity: 0.5,
                fillAlphas: 0.3
            }],
            chartCursor: {
                pan: true,
                valueLineEnabled: true,
                valueLineBalloonEnabled: true,
                cursorAlpha: 1,
                cursorColor: 'var(--es--chart--bullet)',
                limitToGraph: 'g1',
                valueLineAlpha: 0.2,
                valueZoomable: true
            },
            categoryField: 'date',
            categoryAxis: {
                parseDates: true,
                dashLength: 1,
                minorGridEnabled: true,
                startOnAxis: true,
                inside: true,
                labelsEnabled: false
            },
            colors: ['var(--es--db--vehicle)'],
            dataProvider: dataProvider
        };
        let isGraphTwoVisible = false
        let graph = _.pick(dataProvider[0], ['value', 'value2'])
        if (graph.value && graph.value2) {
            isGraphTwoVisible = true
        }
        if (isGraphTwoVisible) {
            this.config.graphs.push(
                {
                    id: 'g2',
                    balloon: {
                        drop: true,
                        adjustBorderColor: false,
                        color: '#FF0000'
                    },
                    bullet: 'round',
                    bulletBorderAlpha: 1,
                    bulletColor: 'var(--es--chart--bullet)',
                    bulletSize: 5,
                    hideBulletsCount: 50,
                    lineThickness: 2,
                    title: 'red line',
                    useLineColorForBulletBorder: true,
                    valueField: 'value2',
                    balloonText: balloonText,
                    fillOpacity: 0.5,
                    fillAlphas: 0.3
                }
            )
        }
        return (
            <Spin spinning={loading} delay={100}>
                <Card className="cardPaddingLess chartCard">
                    <div className="graphFilterWithCalander gx-d-flex">
                        <div className="filterChart">
                            <ul>
                                {
                                    this.chartFilterBy.map((filterBy, i) => {
                                        return <li key={i}
                                            className={currentFilter === filterBy.text ? 'active' : ''}
                                            onClick={this.updateChartByFilterBy.bind(this, filterBy)}
                                        >
                                            {filterBy.text}
                                        </li>;
                                    })
                                }
                            </ul>
                        </div>
                        <div className="dateRanges">
                            <RangePicker
                                value={[
                                    moment(chartFilter.startDate),
                                    moment(chartFilter.endDate)
                                ]}
                                format={dateFormat}
                                onChange={this.updateChart}
                            />
                        </div>
                        {EXPORT_EXCEL && this.props.authUser.type === USER_TYPES.SUPER_ADMIN &&
                            <span
                                className="ant-radio-button-wrapper"
                                style={{ marginLeft: 5, borderRadius: 5 }}
                                onClick={this.exportExcel}
                            >
                                <Icon type="download" />
                            </span>}
                        <CSVLink
                            data={this.state.data}
                            filename={`${this.state.currentFilterType}.csv`}
                            className="hidden"
                            ref={(ref) => {
                                exportRef = ref;
                            }}
                            target="_blank"
                        />
                    </div>
                    <div className="statisticUi">
                        {
                            chartData.map((filterType, index) => {
                                let className = 'StatisticCard gx-pointer';
                                if (filterType.code === this.state.currentFilterType) {
                                    className += ' active disable';
                                }

                                return <div key={filterType.code} className={className}
                                    onClick={this.updateChartByFilterType.bind(this, filterType)}
                                >
                                    <Statistic
                                        title={(filterType.text)}
                                        value={filterType.isPrice ?
                                            UtilService.displayPrice(filterType.total) :
                                            filterType.total}
                                    />
                                </div>;
                            })
                        }
                    </div>
                    {dataProvider.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        : <div className="graphCanvas">
                            <AmCharts.React
                                style={{ width: '100%', height: height }}
                                options={this.config}
                            />
                        </div>}
                </Card>
            </Spin>
        );
    }
}
export default ChartData;
