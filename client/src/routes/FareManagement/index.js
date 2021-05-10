import { Icon, Row, Table, Affix } from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ESPagination from "../../components/ESPagination";
import Search from "../../components/ESSearch";

import StatusTrack from "./statusTrack";
import axios from "util/Api";
import { connect } from "react-redux";
import {
    FILTER_VISIBLE,
    DEFAULT_VEHICLE,
    FILTER_BY_VEHICLE_TYPE,
    PAGE_PERMISSION,
    USER_TYPES,
    isSuperAdminViewPartnerFare,
    isPartnerViewDealerFare,
    VEHICLE_TYPE_FILTER,
    ZONE_LABEL,
    DEFAULT_BASE_CURRENCY,
    DEFAULT_DISTANCE_UNIT,
    ZONE_ROUTE
} from "../../constants/Common";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import IntlMessages from "../../util/IntlMessages";

const _ = require("lodash");

class FareManagement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            loading: false,
            data: [],
            total: 0,
            filter: {
                page: 1,
                limit: 20,
                //  filter: {
                //      vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type
                //  }
            },
            paginate: false,
            statusTrack: ""
        };
        let redirectFilter = this.props.location.filter;
        this.vehicleType =
            redirectFilter &&
                redirectFilter.filter &&
                redirectFilter.filter.vehicleType
                ? _.find(FILTER_BY_VEHICLE_TYPE, f =>
                    _.isEqual(f.type, redirectFilter.filter.vehicleType)
                ).value
                : DEFAULT_VEHICLE;

        this.columns = [
            {
                title: ZONE_LABEL,
                dataIndex: "name"
            },
            {
                title: <IntlMessages id="app.type" defaultMessage="Type" />,
                dataIndex: "scooterType",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return (
                        <div className="fare-columns-inner">
                            {_.map(fare, fareData => {
                                let resultObj = VEHICLE_TYPE_FILTER.find(e => {
                                    return e.type === fareData.vehicleType;
                                });
                                let typeLabel = resultObj
                                    ? resultObj.label
                                    : "";
                                return (
                                    <div>
                                        <tr>{typeLabel}</tr>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
            },
            {
                title: <span><IntlMessages id="app.timeFare" defaultMessage="Time Fare" />({DEFAULT_BASE_CURRENCY}/<IntlMessages id="app.min" defaultMessage="min" />)</span>,
                dataIndex: "timeFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getTimeFareData(fare);
                }
            },
            {
                title: <span><IntlMessages id="app.distanceFare" defaultMessage="Distance Fare" />({DEFAULT_BASE_CURRENCY}/{DEFAULT_DISTANCE_UNIT})</span>,
                dataIndex: "distanceFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getColumnData(fare, "distanceFare");
                }
            },

            {
                title: <span><IntlMessages id="app.ridePauseFare" defaultMessage="Ride Pause Fare" />({DEFAULT_BASE_CURRENCY}/<IntlMessages id="app.min" defaultMessage="min" />)</span>,
                dataIndex: "ridePauseFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getColumnData(fare, "ridePauseFare");
                }
            },
            {
                title: <span><IntlMessages id="app.rideReserveFare" defaultMessage="Ride Reserve Fare" />({DEFAULT_BASE_CURRENCY}<IntlMessages id="app.min" defaultMessage="min" />)</span>,
                dataIndex: "rideReserveFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getColumnData(fare, "rideReserveFare");
                }
            },
            {
                title: <span><IntlMessages id="app.minimumFare" defaultMessage="Minimum Fare" />({DEFAULT_BASE_CURRENCY})</span>,
                dataIndex: "baseFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getColumnData(fare, "baseFare");
                }
            },
            {
                title: <span><IntlMessages id="app.cancellationFare" defaultMessage="Canecellation Fare" />({DEFAULT_BASE_CURRENCY})</span>,
                dataIndex: "cancellationFare",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return this.getColumnData(fare, "cancellationFare");
                }
            },
            {
                title: <IntlMessages id="app.action" defaultMessage="Action" />,
                key: "action",
                className: "fare-columns",
                align: "center",
                render: (text, record) => {
                    let fare = record.fares;
                    fare.sort((a, b) =>
                        a.vehicleType > b.vehicleType ? 1 : -1
                    );
                    return (
                        <div className="fare-columns-inner">
                            {_.map(fare, fareData => {
                                return (
                                    <tr>
                                        <ActionButtons
                                            pageId={
                                                PAGE_PERMISSION.FARE_MANAGEMENT
                                            }
                                            displayBefore={
                                                <div className="scooterIC">
                                                    <a
                                                        href="/#"
                                                        onClick={e =>
                                                            e.preventDefault()
                                                        }
                                                    >
                                                        <Icon
                                                            type="profile"
                                                            onClick={this.statusTrack.bind(
                                                                this,
                                                                fareData.statusTrack
                                                            )}
                                                        />
                                                    </a>
                                                </div>
                                            }
                                            edit={`/e-scooter/general-settings/fare-management/upsert/${fareData.id}`}
                                            filter={this.state.filter}
                                        />
                                    </tr>
                                );
                            })}
                        </div>
                    );
                }
            }
        ];
    }

    componentDidMount() {
        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            this.setState({ filter: filter, paginate: false }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
    }
    onCancel = () => {
        this.setState({ showModal: false });
    };
    statusTrack = value => {
        console.log("status track", value);
        this.setState({ showModal: true, statusTrack: value });
    };
    getTimeFareData = (fare) => {
        return (
            <div className="fare-columns-inner">
                {_.map(fare, fareData => {
                    return (
                        <div>
                            <tr>{fareData['timeFare']}{DEFAULT_BASE_CURRENCY} / {fareData['perXBaseMinute']}min</tr>
                        </div>
                    );
                })}
            </div>
        );
    };
    getColumnData = (fare, key) => {
        return (
            <div className="fare-columns-inner">
                {_.map(fare, fareData => {
                    return (
                        <div>
                            <tr>{fareData[key]}</tr>
                        </div>
                    );
                })}
            </div>
        );
    };

    onSearch = newState => {
        this.setState(
            {
                filter: newState,
                paginate: false
            },
            () => {
                this.fetch();
            }
        );
    };

    fetch(page) {
        this.setState({ loading: true });

        const { authUser } = this.props.auth;
        let key;
        if (!isSuperAdminViewPartnerFare && authUser.type === USER_TYPES.SUPER_ADMIN) {
            key = 'franchiseeId'
        }
        if (!isPartnerViewDealerFare && authUser.type === USER_TYPES.FRANCHISEE) {
            key = 'dealerId'
        }
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        localStorage.removeItem("pageFilter");
        let self = this;

        axios
            .post("/admin/fare-management/paginate", self.state.filter)
            .then(data => {
                if (data.code === "OK") {
                    let fareData = data.data.list.filter(el => el[key] === null)
                    self.setState({
                        total: fareData.length > 0 ? fareData.length : data.data.count,
                        loading: false,
                        data: fareData.length > 0 ? fareData : data.data.list,
                        paginate: true
                    });
                } else {
                    self.setState({
                        total: 0,
                        data: []
                    });
                }

                self.setState({ loading: false });
            })
            .catch(error => {
                console.log(error);
                self.setState({
                    total: 0,
                    loading: false,
                    data: []
                });
            });
    }
    handleSelection = (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });

        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => self.fetch()
        );
    };

    render() {
        const { loading } = this.state;
        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Fare</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["name"]}
                                    placeholder={`Search By ${ZONE_ROUTE} Name`}
                                />
                                {/* <AddButton link='/e-scooter/fare-management/upsert' text="Add Fare" pageId={PAGE_PERMISSION.FARE_MANAGEMENT} filter={this.state.filter}/> */}

                                {/* <div className="topbarCommonBtn">
                                <Link
                                    to={`/e-scooter/fare-management/upsert`}
                                >
                                    <Button type="primary" >
                                        <span>
                                            <AddButton />
                                        </span>
                                        <span>Add Fare</span>
                                    </Button>
                                </Link>
                            </div> */}
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {/* {FILTER_VISIBLE && (
                                    <FilterDropdown
                                        title1="Vehicle Type"
                                        defaultSelected={this.vehicleType}
                                        list={FILTER_BY_VEHICLE_TYPE}
                                        handleSelection={val => {
                                            return this.handleSelection(
                                                val,
                                                "vehicleType",
                                                FILTER_BY_VEHICLE_TYPE
                                            );
                                        }}
                                    />
                                )} */}
                            </div>
                            {this.state.paginate ? (
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                    page={this.state.filter.page}
                                />
                            ) : null}
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList RiderTableList FarePage">
                    <Table
                        columns={this.columns}
                        dataSource={this.state.data}
                        loading={loading}
                        rowKey="id"
                        pagination={false}
                    />
                    <StatusTrack
                        data={this.state.statusTrack}
                        onCancel={this.onCancel}
                        visible={this.state.showModal}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(FareManagement);
