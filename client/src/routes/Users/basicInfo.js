import "../Dashboard/dashboard.less";
import { Card, Icon, Row, Tooltip } from "antd";
import React, { Component } from "react";
import {
    DEFAULT_DISTANCE_UNIT,
    FILTER_VISIBLE,
    DEFAULT_VEHICLE,
    FILTER_BY_VEHICLE_TYPE
} from "../../constants/Common";
import { ReactComponent as Rides } from "../Dashboard/rides.svg";
import UtilService from "../../services/util";
import _ from "lodash";
import FilterDropdown from "../../components/FilterDropdown";
import IntlMessages from "../../util/IntlMessages";

class BasicInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            summaryData: [
                { name: <IntlMessages id="app.user.time" />, key: "time", value: 0 },
                {
                    name: <> <IntlMessages id="app.user.distance" /> {DEFAULT_DISTANCE_UNIT} )</>,
                    key: "distance",
                    value: 0
                },
                { name: <IntlMessages id="app.dashboard.totalRides" />, key: "booked", value: 0 },
                { name: <IntlMessages id="app.dashboard.cpmpleteRide" />, key: "completed", value: 0 },
                { name: <IntlMessages id="app.dashboard.cancelledRide" />, key: "cancelled", value: 0 }
            ],
        };
        this.vehicleType = DEFAULT_VEHICLE;
    }
    componentDidMount() {
        const { info } = this.props;
        console.log("did mount", this.props);
        if (info && info.rideSummary) {
            let tempData = [...this.state.summaryData];
            _.each(tempData, item => {
                item.value = info.rideSummary[item.key];
            });
            console.log("data-----", tempData);
            this.setState({ summaryData: tempData });
        }
    }
    handleSelection = () => {
        // let obj = {
        //     selectedVal: selectedVal,
        //     key: key,
        //     listData: listData
        // };
        // let self = this;
        // let data = UtilService.commonFilter(obj);
        // self[key] = selectedVal;
        // self.setState(state => {
        //     if (data !== "error") {
        //         state.filter.filter[key] = data.type;
        //     } else {
        //         delete state.filter.filter[key];
        //     }
        // });
        // self.setState(
        //     state => {
        //         state.filter.page = 1;
        //         state.paginate = false;
        //     },
        //     () => self.fetch()
        // );
    };

    render() {
        const { summaryData } = this.state;
        const { info } = this.props;

        return (
            <>
                <Card className="CardTwoSec">
                    <div className="cardInnerHead">
                        <h3 className="dashboardCardTitle">
                            <IntlMessages id="app.user.rideSummary" />
                            <Tooltip title={<IntlMessages id="app.dashboard.summaryTooltip" />}>
                                <Icon type="info-circle" />
                            </Tooltip>
                        </h3>

                        {FILTER_VISIBLE && (
                            <FilterDropdown
                                title1={<IntlMessages id="app.vehicleType" />}
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
                        )}
                    </div>
                    <div className="cardSummeryInsight">
                        {summaryData.map(data => {
                            return (
                                <div
                                    className="cardSummeryInsightInsight"
                                    key={data.key}
                                >
                                    <div className="iconBox">
                                        <Rides />
                                    </div>
                                    <div className="countBox">
                                        <h4>
                                            {data.key === "totalFare"
                                                ? UtilService.displayPrice(data.value)
                                                : data.key === "time"
                                                    ? UtilService.convertSecToMinHr(data.value) //time is in sec
                                                    : UtilService.displayNumber(data.value)}
                                        </h4>
                                        <div className="countLabel">
                                            {data.name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card className="CardTwoSecHalf">
                    <div className="cardInnerHead">
                        <h3 className="dashboardCardTitle">
                            <IntlMessages id="app.user.fareSummary" />
                            <Tooltip title={<IntlMessages id="app.user.fareSummaryTooltip" />}>
                                <Icon type="info-circle" />
                            </Tooltip>
                        </h3>
                    </div>
                    {
                        <Row type="flex" align="middle" justify="space-between">
                            <div
                                className="cardHalfCont"
                                style={{ width: "100%" }}
                            >
                                <div className="cardHalfContInSect">
                                    {
                                        <h2>
                                            {info.fareSummary
                                                ? UtilService.displayPrice(
                                                    info.fareSummary.time
                                                )
                                                : UtilService.displayPrice(0)}
                                        </h2>
                                    }
                                    <h4><IntlMessages id="app.time" /></h4>
                                </div>
                                <div className="cardHalfSeparated"></div>
                                <div className="cardHalfContInSect">
                                    {
                                        <h2>
                                            {info.fareSummary
                                                ? UtilService.displayPrice(
                                                    info.fareSummary.distance
                                                )
                                                : UtilService.displayPrice(0)}
                                        </h2>
                                    }
                                    <h4><IntlMessages id="app.distance" /></h4>
                                </div>
                                <div className="cardHalfSeparated"></div>
                                <div className="cardHalfContInSect">
                                    {
                                        <h2>
                                            {info.fareSummary
                                                ? UtilService.displayPrice(
                                                    info.fareSummary.total
                                                )
                                                : UtilService.displayPrice(0)}
                                        </h2>
                                    }
                                    <h4><IntlMessages id="app.total" /></h4>
                                </div>
                                <div className="cardHalfContInSect">
                                    {
                                        <h2>
                                            {info.fareSummary
                                                ? UtilService.displayPrice(
                                                    info.fareSummary.completed
                                                )
                                                : UtilService.displayPrice(0)}
                                        </h2>
                                    }
                                    <h4><IntlMessages id="app.user.completedRides" /></h4>
                                </div>
                                <div className="cardHalfSeparated"></div>
                                <div className="cardHalfContInSect">
                                    {
                                        <h2>
                                            {info.fareSummary
                                                ? UtilService.displayPrice(
                                                    info.fareSummary.cancelled
                                                )
                                                : UtilService.displayPrice(0)}
                                        </h2>
                                    }
                                    <h4><IntlMessages id="app.user.cancelledRides" /></h4>
                                </div>
                            </div>
                        </Row>
                    }
                </Card>
            </>
        );
    }
}
export default BasicInfo;
