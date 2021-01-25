import './dashboard.less';
import { Card, Icon, Row, Tooltip } from 'antd';
import React from 'react';
import _ from 'lodash';
import axios from 'util/Api';
import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, USER_TYPES, FRANCHISEE_VISIBLE, CLIENT_VISIBLE } from '../../constants/Common';
import IntlMessages from "../../util/IntlMessages";

class ScooterStatistics extends React.Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
            // franchiseeId: null
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            loading: false,
            data: {},
            filter: {
                filter: filter
            }
        };
    }

    componentDidMount() {
        this.fetchScooterStatistcs();
    }
    componentWillReceiveProps(nextProps) {
        if ((this.props.filter.type !== nextProps.filter.type) || (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.filter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetchScooterStatistcs();
            });
        }
        if (CLIENT_VISIBLE && this.props.filter.dealerId !== nextProps.filter.dealerId) {
            this.setState((state) => {
                state.filter.filter.dealerId = nextProps.filter.dealerId;
            }, () => {
                this.fetchScooterStatistcs();
            });
        }
    }

    fetchScooterStatistcs = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/dashboard/get-scooter-statisctics', this.state.filter);
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

        const { authUser } = this.props;
        const { data, loading } = this.state;

        return (

            <Card loading={loading} className="CardTwoSecHalf">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        <IntlMessages id="app.dashboard.scooterStatistocs" />
                        <Tooltip title={<IntlMessages id="app.dashboard.statisticeOfVehicle" />}>
                            <Icon type="info-circle" />
                        </Tooltip>
                    </h3>
                </div>
                <Row type="flex" align="middle" justify="space-between">
                    <div className="cardHalfCont">
                        <div className="cardHalfContInSect">
                            <h4><IntlMessages id="app.dashboard.highlyUsedScooters" /></h4>
                            <h2>{data.highlyUsed}</h2>
                        </div>
                        <div className="cardHalfSeparated"></div>
                        <div className="cardHalfContInSect">
                            <h4><IntlMessages id="app.dashboard.averageUsedScooters" /></h4>
                            <h2>{data.avarageUsed}</h2>
                        </div>
                        <div className="cardHalfSeparated"></div>
                        <div className="cardHalfContInSect">
                            <h4><IntlMessages id="app.dashboard.unUsedScooters" /></h4>
                            <h2>{data.unused}</h2>
                        </div>
                    </div>

                    <div className="cardHalfCont">
                        <div className="cardHalfContInSect" style={{ width: '100%' }}>
                            <h4><IntlMessages id="app.dashboard.activeScooters" /></h4>
                            {data.hasOwnProperty('activeScooter') ? <h2>{data.activeScooter}<span>/{data.totalScooter}</span></h2> : ''}
                        </div>
                        <div className="cardHalfSeparated"></div>
                        <div className="cardHalfSeparated"></div>
                        {authUser.type !== USER_TYPES.FRANCHISEE &&
                            <div className="cardHalfContInSect">
                                <h4><IntlMessages id="app.dashboard.activeUsers" /></h4>
                                {data.hasOwnProperty('activeUser') ? <h2>{data.activeUser}<span>/{data.totalUser}</span></h2> : ''}
                            </div>
                        }
                    </div>
                </Row>
            </Card>
        );
    }

}


export default ScooterStatistics;

