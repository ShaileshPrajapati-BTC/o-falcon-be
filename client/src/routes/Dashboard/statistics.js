import './dashboard.less';
import { Icon, Spin, Tooltip } from 'antd';
import React from 'react';
import UtilService from '../../services/util';
import _ from 'lodash';
import moment from 'moment';
import axios from 'util/Api';
import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, FILTER_VISIBLE, FRANCHISEE_VISIBLE, CLIENT_VISIBLE ,DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE, DISPLAY_AFTER_SPECIFIC_DATE } from '../../constants/Common';
import IntlMessages from "../../util/IntlMessages";
const  moment_tz = require('moment-timezone');
class Statics extends React.Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleType: FILTER_BY_VEHICLE_TYPE[0].type,
            // franchiseeId: null
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            data: {},
            loading: false,
            filter: {
                filter: filter
            }
        };
    }

    componentDidMount() {
        this.fetchStatatics();
    }
    componentWillReceiveProps(nextProps) {
        if ((this.props.filter.type !== nextProps.filter.type) || (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.filter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetchStatatics();
            });
        }
        if (CLIENT_VISIBLE && this.props.filter.dealerId !== nextProps.filter.dealerId) {
            this.setState((state) => {
                state.filter.filter.dealerId = nextProps.filter.dealerId;
            }, () => {
                this.fetchStatatics();
            });
        }
    }

    fetchStatatics = async () => {
        this.setState({ loading: true });
        try {
            if(DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE && DISPLAY_AFTER_SPECIFIC_DATE){ 
                let timezone = moment_tz.tz.guess();
                let defaultDate =  moment(DISPLAY_AFTER_SPECIFIC_DATE).tz(timezone).utc().toISOString();
                this.state.filter.startDate =  defaultDate;        
            }
            let response = await axios.post('admin/dashboard/get-statisctics', this.state.filter);
            if (response && response.code === 'OK') {
                if (response.data && _.size(response.data)) {
                    this.setState({ data: response.data });
                }
                this.setState({ loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {

        const { data, loading } = this.state;

        return (
            <div className="dashboardRightInner">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        <IntlMessages id="app.dashboard.statistics" />
                        <Tooltip title={<IntlMessages id="app.dashboard.statisticsTooltip" />}>
                            <Icon type="info-circle" />
                        </Tooltip>
                    </h3>
                </div>
                <Spin spinning={loading} delay={100}>
                    <div className="statisticsBox">
                        <div className="statisticLeft"><IntlMessages id="app.dashboard.totalRevenue" /></div>
                        <div className="statisticCenter">
                            <div className="statisticInnerGradient">
                                <div className="statisticInnerWhite">
                                    {UtilService.displayPrice(data.totalFare)}
                                </div>
                            </div>
                        </div>
                        {/* <div className="statisticRight">Revenue</div> */}
                    </div>
                    <div className="statisticsBox">
                        <div className="statisticLeft"><IntlMessages id="app.dashboard.totalRides" /></div>
                        <div className="statisticCenter">
                            <div className="statisticInnerGradient">
                                <div className="statisticInnerWhite">
                                    {data.totalRide}
                                </div>
                            </div>
                        </div>
                        {/* <div className="statisticRight">Rides</div> */}
                    </div>
                    <div className="statisticsBox">
                        <div className="statisticLeft"><IntlMessages id="app.dashboard.cancelledRide" /></div>
                        <div className="statisticCenter">
                            <div className="statisticInnerGradient">
                                <div className="statisticInnerWhite">
                                    {data.totalCancelledRide}
                                </div>
                            </div>
                        </div>
                        {/* <div className="statisticRight">Rides</div> */}
                    </div>
                    <div className="statisticsBox">
                        <div className="statisticLeft"><IntlMessages id="app.dashboard.openDisputes" /></div>
                        <div className="statisticCenter">
                            <div className="statisticInnerGradient">
                                <div className="statisticInnerWhite">
                                    {data.totalOpenDispute}
                                </div>
                            </div>
                        </div>
                        {/* <div className="statisticRight">Disputes</div> */}
                    </div>
                    {
                        FILTER_VISIBLE ?
                            <div className="statisticsBox">
                                <div className="statisticLeft"><IntlMessages id="app.dashboard.openTickets" /></div>
                                <div className="statisticCenter">
                                    <div className="statisticInnerGradient">
                                        <div className="statisticInnerWhite">
                                            {data.openTicket}
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="statisticRight">Disputes</div> */}
                            </div> : null
                    }
                </Spin>
            </div>

        );
    }


}

export default Statics;
