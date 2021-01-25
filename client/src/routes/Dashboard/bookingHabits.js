/* eslint-disable multiline-ternary */
/* eslint-disable no-nested-ternary */
import './dashboard.less';
import { Card, DatePicker, Icon, Popover, Spin, Row } from 'antd';
import { DAYS, DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, DEFAULT_BASE_CURRENCY, FRANCHISEE_VISIBLE, ZONE_LABEL, CLIENT_VISIBLE, DAYS_FILTER ,DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE, DISPLAY_AFTER_SPECIFIC_DATE } from '../../constants/Common';
import React from 'react';
import UtilService from '../../services/util';
import ESToolTip from '../../components/ESToolTip'
import axios from 'util/Api';
import moment from 'moment';
import FilterDropdown from '../../components/FilterDropdown';
import IntlMessages from "../../util/IntlMessages";
const { RangePicker } = DatePicker;
const _ = require('lodash');
const slots = _.range(0, 24);
// eslint-disable-next-line max-len
const slotsTime = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
const dateFormat = 'DD/MM/YYYY';
const  moment_tz = require('moment-timezone');

class BookingHabits extends React.Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
            zoneId: '',
            // franchiseeId: null
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            data: [],
            loading: false,
            zones: [],
            filter: {
                startDate: UtilService.getStartOfTheDay(moment().subtract(1, 'year').toISOString()),
                endDate: UtilService.getEndOfTheDay(moment().toISOString()),
                filter: filter
            },
            zoneDropdownVisible: false
        };
    }

    async componentDidMount() {
        this.fetchZoneList();
        this.fetchBookinghabits();
    }
    componentWillReceiveProps(nextProps) {
        if ((this.props.filter.type !== nextProps.filter.type) || (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.filter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetchZoneList();
                this.fetchBookinghabits();
            });
        }
        if (CLIENT_VISIBLE && this.props.filter.dealerId !== nextProps.filter.dealerId) {
            this.setState((state) => {
                state.filter.filter.dealerId = nextProps.filter.dealerId;
            }, () => {
                this.fetchBookinghabits();
            });
        }
    }

    fetchZoneList = async () => {
        this.setState((state) => {
            state.zoneDropdownVisible = false;
        });
        const { filter } = this.state.filter;
        let reqObj = {};
        // if (filter.franchiseeId && FRANCHISEE_VISIBLE) {
        //     reqObj.franchiseeId = filter.franchiseeId;
        // } else {
        //     reqObj.franchiseeId = null;
        // }
        let data = await axios.post('/admin/zone/zone-list', reqObj);
        if (data.code === 'OK') {
            let response = [{ label: 'All', value: '' }]
            _.each(data.data, (zone) => {
                response.push({ label: zone.name, value: zone.id, type: zone.id })
            });
            this.setState({ zones: response, loading: false, zoneDropdownVisible: true })
            const defaultSelectedZoneFound = _.find(this.state.zones, e => e.value === this.state.filter.filter.zoneId);
            if (!defaultSelectedZoneFound) {
                this.setState((state) => {
                    state.filter.filter.zoneId = ''
                })
            }
        } else {
            this.setState({ zones: [], loading: false, zoneDropdownVisible: true })
        }
    }

    fetchBookinghabits = async () => {
        this.setState({ loading: true });
        try {
            let timezone = moment_tz.tz.guess();
            if(this.state.filter && this.state.filter.startDate){
                if(DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE && DISPLAY_AFTER_SPECIFIC_DATE){ 
                    let defaultDate =  moment(DISPLAY_AFTER_SPECIFIC_DATE).tz(timezone).utc().toISOString();
                    if(moment(this.state.filter.startDate).isBefore(defaultDate)){
                        this.state.filter.startDate =  defaultDate; 
                        
                   }
                }
            }
            this.state.filter.timezone = timezone; 
            let response = await axios.post('admin/dashboard/get-booking-habits', this.state.filter);
            if (response && response.code === 'OK') {
                // if (response.data && _.size(response.data)) {
                this.setState({ data: response.data, loading: false });
                // } 
            } else {
                this.setState({ data: {}, loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    updateChart = async (dates) => {
        let { filter } = this.state;
        filter.startDate = UtilService.getStartOfTheDay(dates[0].toISOString());
        filter.endDate = UtilService.getEndOfTheDay(dates[1].toISOString());


        this.setState({ filter: filter }, () => {
            this.fetchBookinghabits();
        });
    }

    handleSelection = async (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };

        let data = UtilService.commonFilter(obj);
        this[key] = selectedVal;

        this.setState((state) => {
            if (data !== 'error') {
                if (key === 'zoneId' && data.type === undefined) {
                    state.filter.filter[key] = '';
                    return;
                }
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        }, () => { this.fetchBookinghabits() });
    };
    // eslint-disable-next-line max-lines-per-function
    render() {
        const { data, loading, filter, zones, zoneDropdownVisible } = this.state;
        let FilterArray = [
            {
                title: ZONE_LABEL,
                list: zones,
                defaultSelected: filter.filter.zoneId,
                visible: zoneDropdownVisible,
                key: 'zoneId'
            }
        ];
        return (
            <Card className="CardTwoSec">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        <IntlMessages id="app.dashboard.bookingHabbit" />
                        <ESToolTip text={<IntlMessages id="app.dashboard.bookingHabbitTooltip" />} placement="top">
                            <Icon type="info-circle" />
                        </ESToolTip>
                    </h3>
                    <div className="graphFilterWithCalander gx-d-flex">

                        <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
                            {/* <div className="DropdownWidth d-block-xs"> */}

                            <div style={{ marginRight: 30 }}>
                                {FilterArray.map((filter) => {
                                    return (
                                        filter.visible && <FilterDropdown
                                            showScroll={true}
                                            title1={filter.title}
                                            list={filter.list}
                                            defaultSelected={
                                                filter.defaultSelected
                                            }
                                            key={filter.key}
                                            handleSelection={(
                                                val
                                            ) => {
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

                            {/* </div> */}
                            <div className="dateRanges">
                                <RangePicker
                                    value={[
                                        moment(filter.startDate),
                                        moment(filter.endDate)
                                    ]}
                                    format={dateFormat}
                                    onChange={this.updateChart}
                                />
                            </div>
                        </Row>
                    </div>
                </div>
                <div className="habitTable">
                    <Spin spinning={loading} delay={100}>
                        <table>
                            <tbody>
                                {DAYS_FILTER.map((ele) => {
                                    let record = ele.type;
                                    return <tr key={record}>
                                        <td>{ele.label}</td>
                                        {
                                            slots.map((slot) => {
                                                return <td key={slot}>
                                                    {data[record] && _.size(data[record]) && data[record][slot] && _.size(data[record][slot]) ?
                                                        <Popover className="habitPopover"
                                                            content={<div>
                                                                <p><IntlMessages id="app.dashboard.revenue" />: <span>{DEFAULT_BASE_CURRENCY}{UtilService.roundOff(data[record][slot].revenue)}</span></p>
                                                                <p><IntlMessages id="app.rides" />: <span>{data[record][slot].totalRides}</span></p>
                                                            </div>}>
                                                            <div className={`habitDots ${data[record][slot].isHigh ? 'habitActiveDot' : data[record][slot].isAverage ? 'habitActiveAverageDot' :
                                                                data[record][slot].isLow ? 'habitActiveLowDot' : ''}`}>
                                                            </div>
                                                        </Popover> :
                                                        <div className="habitDots"></div>}
                                                </td>;
                                            })}
                                    </tr>;
                                })}
                                <tr>
                                    <td></td>
                                    {slotsTime.map((slot) => {
                                        return <td key={slot}>{slot}</td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </Spin>
                </div>
            </Card >
        );
    }

}


export default BookingHabits;

