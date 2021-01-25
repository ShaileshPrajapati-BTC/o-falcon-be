import "../Dashboard/dashboard.less";
import { Card, Icon, Row, Tooltip } from "antd";
import React, { Component } from "react";
import {
    DEFAULT_VEHICLE,
} from "../../constants/Common";
import UtilService from "../../services/util";
// import FilterDropdown from "../../components/FilterDropdown";
import _ from "lodash";

class BasicInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            summaryData: [
                { name: 'In Progress Task', key: 'inProgressTotal', value: 0 },
                { name: 'Complete Task', key: 'completedTotal', value: 0 },
                { name: 'Over Due Task', key: 'overdueTotal', value: 0 },
                { name: 'Cancel Task', key: 'cancelledTotal', value: 0 }
            ],
        };
        this.vehicleType = DEFAULT_VEHICLE;
    }
    componentDidMount() {
        const { info } = this.props;
        console.log("did mount", this.props);
        if (info && info.taskSummery) {
            let tempData = [...this.state.summaryData];
            _.each(tempData, item => {
                item.value = info.taskSummery[item.key];
            });
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
                            Task Summary
                            <Tooltip title="Summary of all tasks">
                                <Icon type="info-circle" />
                            </Tooltip>
                        </h3>

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
                    <div className="cardSummeryInsight">
                        {summaryData.map(data => {
                            return (
                                <div
                                    className="cardSummeryInsightInsight"
                                    key={data.key}
                                >
                                    {/* <div className="iconBox">
                                        <Rides />
                                    </div> */}
                                    <div className="countBox">
                                        <h4>{UtilService.displayNumber(data.value)}</h4>
                                        <div className="countLabel">{data.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </>
        );
    }
}
export default BasicInfo;
