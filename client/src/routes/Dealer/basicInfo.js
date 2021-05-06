import "../Dashboard/dashboard.less";
import { Card, Spin } from "antd";
import React, { Component } from "react";
import {
    FILTER_VISIBLE,
    DEFAULT_VEHICLE,
    FILTER_BY_VEHICLE_TYPE,
    DEALER_LABEL
} from "../../constants/Common";
import axios from 'util/Api';
import { ReactComponent as Rides } from "../Dashboard/rides.svg";
import UtilService from "../../services/util";
import _ from "lodash";
import FilterDropdown from "../../components/FilterDropdown";
import IntlMessages from "../../util/IntlMessages";

class BasicInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            summaryData: [
                { name: <IntlMessages id="app.dashboard.totalRide" defaultMessage="Total Ride" />, key: 'totalRide', value: 0 },
                { name: <IntlMessages id="app.dashboard.totalRevenue" defaultMessage="Total Revenue" />, key: 'totalRevenue', value: 0 },
                { name: <IntlMessages id="app.dashboard.totalVehicle" defaultMessage="Total Vehicle" />, key: 'totalVehicle', value: 0 },
                { name: <IntlMessages id="app.partner.totalCommission" defaultMessage="Total Commission" />, key: 'totalCommission', value: 0 },
                { name: <IntlMessages id="app.partner.payableCommission" defaultMessage="Payable Commission" />, key: 'payableCommission', value: 0 }
            ],
            filter: {
                filter: {
                    vehicleType: FILTER_BY_VEHICLE_TYPE[0].type,
                    dealerId: props.dealerId
                }
            },
        };
        this.vehicleType = DEFAULT_VEHICLE;
    }
    componentDidMount() {
        this.fetch();
    }
    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/dashboard/get-franchisee-summary', this.state.filter);
            if (response && response.code === 'OK') {
                if (response.data && _.size(response.data)) {
                    let tempData = [...this.state.summaryData];
                    _.each(tempData, (data) => {
                        data.value = response.data[data.key];
                    });

                    this.setState({ summaryData: tempData });
                }
                this.setState({ loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
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
        self.fetch()
    };

    render() {
        const { summaryData, loading } = this.state;
        return (
            <>
                <Card className="CardTwoSec">
                    <div className="cardInnerHead">
                        <h3 className="dashboardCardTitle">
                            {DEALER_LABEL} <IntlMessages id="app.dashboard.summary" defaultMessage="Summary" />
                        </h3>

                        {FILTER_VISIBLE && (
                            <FilterDropdown
                                title1={<IntlMessages id="app.vehicleType" defaultMessage="Vehicle Type" />}
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
                    <Spin spinning={loading} delay={100}>
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
                                                {data.key === "totalCommission" || data.key === 'payableCommission'
                                                    ? UtilService.displayPrice(data.value)
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
                    </Spin>
                </Card>
            </>
        );
    }
}
export default BasicInfo;
