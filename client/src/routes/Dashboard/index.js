import './dashboard.less';
import { Col, Row } from 'antd';
import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, FILTER_VISIBLE, TASK_MODULE_VISIBLE, USER_TYPES, FRANCHISEE_LABEL, DEALER_LABEL, FRANCHISEE_VISIBLE, CLIENT_VISIBLE , DISPLAY_DASHBOARD_SCOOTER_STATIC_DATA } from '../../constants/Common';
import BookingHabits from './bookingHabits';
import ChartData from '../../components/ESAmChart/chartData';
// import TaskChart from '../../components/ESTaskChart';
import FilterDropdown from '../../components/FilterDropdown';
import React from 'react';
import RideSummary from './rideSummary';
import ScooterStatistics from './scooterStatistics';
import Statistics from './statistics';
import VehicleChart from './vehicleChart';
import UtilService from '../../services/util';
// import { getFranchisee } from "../../appRedux/actions/franchisee";
import FranchiseeSummary from './franchiseeSummary';
import TaskDashboard from './TaskDashboard';
import { connect } from 'react-redux';
import IntlMessages from "../../util/IntlMessages";

const _ = require('lodash');

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: {
                type: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
                franchisee: ''
            }
        };
        this.defaultLabel = 'Scooter';
        this.type = DEFAULT_VEHICLE;
        this.franchisee = 0;
        this.dealerId = 0;
    }
    componentDidMount = async () => {
        // await this.props.getFranchisee() // called from App/index.js
    }


    handleSelection = async (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };

        let data = UtilService.commonFilter(obj);
        this[key] = selectedVal;
        let newFilter = { ...this.state.filter }
        newFilter[key] = data.type
        // if (key === 'type') {
        //     this.type = selectedVal
        // }
        // if (key === 'franchisee') {
        //     this.franchisee = selectedVal
        // }
        await this.setState({ filter: newFilter })
        // console.log(this.state.filter, this.state.filter)
    };

    // eslint-disable-next-line max-lines-per-function
    render() {
        let url = 'admin/dashboard/get-chart-data';
        const { authUser } = this.props.auth;
        let { loginUser } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;

        let FilterArray = [
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.type,
                visible: FILTER_VISIBLE,
                key: 'type'
            },
            {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchisee,
                visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer && FRANCHISEE_VISIBLE,
                key: 'franchisee'
            },
            {
                title: DEALER_LABEL,
                list: this.props.dealer.dealersList,
                defaultSelected: this.dealerId,
                visible: this.props.dealer.dealersList.length > 2 && isFranchisee && CLIENT_VISIBLE,
                key: 'dealerId'
            }
        ];
        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header headerRadius">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">
                            <IntlMessages id="app.dashboard.dashboard" defaultMessage="Dashboard" />
                        </h1>
                        <div className="DropdownWidth d-block-xs">
                            {FilterArray.map((filter) => {
                                return (
                                    filter.visible && <FilterDropdown
                                        title1={filter.title}
                                        list={filter.list}
                                        defaultSelected={filter.defaultSelected}
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
                    </Row>
                </div>
                <div className="dashboardMain">
                    <div className="dashboardLeft">
                        <Row type="flex" align="middle" justify="space-between">
                            <Col span={24} >
                                <RideSummary filter={this.state.filter} authUser={authUser} />
                            </Col>
                        </Row>
                        {
                            (FILTER_VISIBLE && FRANCHISEE_VISIBLE) ?
                                authUser.type !== USER_TYPES.FRANCHISEE &&
                                authUser.type !== USER_TYPES.DEALER &&
                                <Row type="flex" align="middle" justify="space-between">
                                    <Col span={24} >
                                        <FranchiseeSummary filter={this.state.filter} />
                                    </Col>
                                </Row> : null
                        }
                        <Row type="flex" align="middle" justify="space-between">
                            <Col span={24} >
                                <VehicleChart filter={this.state.filter} />
                            </Col>
                        </Row>
                       { DISPLAY_DASHBOARD_SCOOTER_STATIC_DATA ? <Row type="flex" align="middle" justify="space-between">
                            <Col span={24} >
                                <ScooterStatistics filter={this.state.filter} authUser={authUser} />
                            </Col>
                        </Row> : null}
                        <Row type="flex" align="middle" justify="space-around">
                            <Col span={24}>
                                <ChartData url={url} height={400} filter={this.state.filter} authUser={authUser} />
                            </Col>
                        </Row>
                        {TASK_MODULE_VISIBLE && (
                            <><Row type="flex" align="middle" justify="space-between">
                                <Col span={24} >
                                    <TaskDashboard filter={this.state.filter} />
                                </Col>
                            </Row>
                                {/* <Row type="flex" align="middle" justify="space-around">
                                <Col span={12}>
                                    <TaskChart id='TaskByUser' title='Task By User' height={300} filter={this.state.filter} />
                                </Col>
                                <Col span={12}>
                                    <TaskChart id='TaskByVehicle' title='Task by Vehicle' height={300} filter={this.state.filter} />
                                </Col>
                            </Row> */}
                            </>)}
                        <Row type="flex" align="middle" justify="space-between">
                            <Col span={24} >
                                <BookingHabits filter={this.state.filter} />
                            </Col>
                        </Row>


                    </div>

                    <div className="dashboardRight">
                        <Statistics filter={this.state.filter} />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Dashboard);
