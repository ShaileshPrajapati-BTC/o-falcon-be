/* eslint-disable no-nested-ternary */
import { Row, message, Affix, Tabs, DatePicker } from "antd";
import {
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    COMMISSION_PAYOUT_TYPE
} from "../../constants/Common";
import React, { Component } from "react";
import CommissionUpsertRequest from "./CommissionUpsertRequest";
import AddButton from "../../components/ESAddButton";
import ESPagination from "../../components/ESPagination";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import axios from "util/Api";
import Search from "../../components/ESSearch";
import CommissionPayoutTable from './CommissionPayoutTable';
import moment from "moment";

const _ = require("lodash");
const { TabPane } = Tabs;
const dateFormat = "DD/MM/YYYY";
const { RangePicker } = DatePicker;


class CommissionPayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            total: 0,
            fileUploadProcess: false,
            loading: false,
            showModal: false,
            disabled: false,
            selectedRecord: [],
            paginate: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    status: COMMISSION_PAYOUT_TYPE.REQUESTED,
                    createdAt: {
                        ">=": UtilService.getStartOfTheDay(moment().subtract(1, "months").toISOString()),
                        "<=": UtilService.getEndOfTheDay(moment().toISOString())
                    }
                },
                sort: "dateTime DESC"
            },
            statusWiseCount: [],
            date: [moment().subtract(1, "months"), moment()]
        };
        let redirectFilter = this.props.location.filter;
        this.SORT_BY_ARRAY = [
            {
                label: "Amount",
                key: "amount",
                value: 1,
                type: "amount"
            },
            {
                label: "Request Date",
                key: "dateTime",
                value: 2,
                type: "dateTime"
            }
        ];
        this.defaultFilterBy = 1;
        this.sort = 2;
        this.isDesc = redirectFilter && redirectFilter.sort ? (redirectFilter.sort.split(" ")[1] === 'ASC' ? false : true) : true;
        // this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
        //     ? _.find(FILTER_BY_ACTIVE, f => f.type === redirectFilter.filter.isActive).value
        //     : 1;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
            ? UtilService.getDefaultValue(FILTER_BY_ACTIVE, redirectFilter.filter.isActive)
            : 1;
    }
    componentDidMount() {
        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            let datevalue = [moment(filter.filter.createdAt['>=']), moment(filter.filter.createdAt['<='], 'YYYY/MM/DD')];
            this.setState({ filter: filter, paginate: false, date: datevalue }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
    }

    fetch = async page => {
        this.setState({ loading: true, data: [] });
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        localStorage.removeItem("pageFilter");
        try {
            console.log('this.state.filter.filter - ', this.state.filter.filter);
            let response = await axios.post("/admin/franchisee/commission-payout/get-requests", this.state.filter);

            if (response.code === "OK") {
                this.setState({
                    total: response.data.count,
                    statusWiseCount: response.data.statusWiseCount,
                    loading: false,
                    data: response.data.list,
                    paginate: true
                });
            }

            this.setState({ loading: false });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };
    handleClick = () => {
        this.setState({
            showModal: true
        });
    };
    handleSubmit = data => {
        let obj = {};
        obj.ids = this.state.selectedRecord;
        obj.isActive = data;
        let self = this;
        axios
            .put("/admin/user/active-deactive", obj)
            .then(data => {
                if (data.code === "OK") {
                    _.each(this.state.data, val => {
                        val.selected = false;
                    });
                    message.success(data.message);
                    this.setState(
                        state => {
                            state.selectRecord = [];
                            state.filter.page = 1;
                            state.paginate = false;
                            state.selectedRecord = [];
                        },
                        () => {
                            self.fetch();
                        }
                    );
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
            });
        this.handleCancel();
    };
    handleAddCommissionRequest = async obj => {
        let self = this;
        let reqObj = {
            franchiseeId: obj.franchiseeId,
            amount: obj.amount
        }
        await axios
            .post("/admin/franchisee/commission-payout/add", reqObj)
            .then(async data => {
                if (data.code === "OK") {
                    message.success(data.message);
                    await self.fetch();
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
                message.error(error.message);
            });
        this.hideCommissionPayoutAdd();
    };
    handleCancel = () => {
        this.setState({
            showModal: false,
            disabled: false
        });
    };
    selectRecord = id => {
        // set state selected
        if (id) {
            this.setState({
                disabled: true
            });

            let index = _.findIndex(this.state.data, { id: id });
            if (index >= 0) {
                this.state.data[index].selected = !this.state.data[index]
                    .selected;

                if (this.state.data[index].selected) {
                    this.state.selectedRecord.push(id);
                } else {
                    let existId = _.indexOf(this.state.selectedRecord, id);
                    this.state.selectedRecord.splice(existId, 1);
                }
            }
        }
    };
    handleSelection = (selectedVal, isAscending, key, listData) => {
        let self = this;

        let obj = {
            selectedVal: selectedVal,
            isAscending: isAscending,
            key: key,
            listData: listData
        };

        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                if (key === "sort") {
                    state.filter[key] = data;
                } else {
                    state.filter.filter[key] = data.type;
                }
            } else {
                if (key === "sort") {
                    delete state.filter[key];
                } else {
                    delete state.filter.filter[key];
                }
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
    selectAll = () => {
        let self = this;
        this.setState({ disabled: true });
        if (this.state.selectedRecord.length !== this.state.data.length) {
            _.each(this.state.data, data => {
                data.selected = true;
                let existId = _.indexOf(self.state.selectedRecord, data.id);
                if (existId < 0) {
                    self.state.selectedRecord.push(data.id);
                }
            });
        } else {
            this.setState({
                selectedRecord: []
            });
            _.each(this.state.data, data => {
                data.selected = false;
            });
        }
    };
    handleSearch = newState => {
        console.log('newState - ', newState);
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
    getAddress = data => {
        if (data) {
            let address = {};
            let addressString = "";
            address = _.find(data, { isPrimary: true });
            if (!address && !_.size(address)) {
                address = _.first(address);
            }

            if (address && (address.line1 || address.state || address.city)) {
                addressString = `${address.line1}, ${address.state}, ${address.city}.`;
            }

            return addressString;
        }
    };

    dateChange = async (date, dateString) => {
        let from = UtilService.getStartOfTheDay(moment(date[0]).startOf("day").toISOString());
        let to = UtilService.getEndOfTheDay(moment(date[1]).toISOString());
        let range = { ">=": from, "<=": to };
        let value = [moment(date[0]), moment(date[1])]
        this.setState(state => {
            state.filter.filter.createdAt = range;
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        }, async () => {
            await this.fetch();
        });
    };

    tabCallback = async (key) => {
        this.setState({
            filter: {
                ...this.state.filter,
                page: 1,
                filter: {
                    ...this.state.filter.filter,
                    status: parseInt(key)
                }
            },
            paginate: false,
        }, async () => {
            await this.fetch();
        })
    }

    showCommissionPayoutAdd = () => {
        this.setState({
            commissionPayoutAddVisible: true
        });
    }

    hideCommissionPayoutAdd = () => {
        this.setState({
            commissionPayoutAddVisible: false
        });
    }

    getStatusWiseCount = () => {
        const { statusWiseCount } = this.state;
        let requestedCount = 0;
        let transferredCount = 0;
        let cancelledCount = 0;

        let requestedCountObj = _.find(statusWiseCount, e => e.status === COMMISSION_PAYOUT_TYPE.REQUESTED);
        if (requestedCountObj) {
            requestedCount = requestedCountObj.count;
        }

        let transferredCountObj = _.find(statusWiseCount, e => e.status === COMMISSION_PAYOUT_TYPE.TRANSFERRED);
        if (transferredCountObj) {
            transferredCount = transferredCountObj.count;
        }

        let cancelledCountObj = _.find(statusWiseCount, e => e.status === COMMISSION_PAYOUT_TYPE.REJECTED);
        if (cancelledCountObj) {
            cancelledCount = cancelledCountObj.count;
        }

        return {
            requestedCount,
            transferredCount,
            cancelledCount
        }
    }

    render() {
        const {
            data,
            loading,
            // selectedRecord,
            filter,
            commissionPayoutAddVisible
        } = this.state;
        let FilterArray = [
            {
                title: "Sort by",
                list: this.SORT_BY_ARRAY,
                sorter: true,
                isDesc: this.isDesc,
                defaultSelected: this.sort,
                key: "sort"
            }
        ];

        const { requestedCount, transferredCount, cancelledCount } = this.getStatusWiseCount();

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Commission Payout</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    // width={350}
                                    filter={filter}
                                    keys={[
                                        "requestId"
                                    ]}
                                    handelSearch={this.handleSearch}
                                    placeholder="Search by Request ID"
                                />
                                <AddButton
                                    onClick={this.showCommissionPayoutAdd}
                                    text="Add"
                                    pageId={PAGE_PERMISSION.COMMISSION_PAYOUT}
                                />
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {FilterArray.map(filter => {
                                    return (
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            sorter={filter && filter.sorter}
                                            isDesc={filter && filter.isDesc}
                                            defaultSelected={
                                                filter.defaultSelected
                                            }
                                            handleSelection={(
                                                val,
                                                isAscending
                                            ) => {
                                                this.handleSelection(
                                                    val,
                                                    isAscending,
                                                    filter.key,
                                                    filter.list
                                                );
                                            }}
                                        />
                                    );
                                })}
                                <div className="graphFilterWithCalander gx-d-flex">
                                    <div className="dateRanges">
                                        <RangePicker
                                            defaultValue={[
                                                moment().subtract(1, "months"),
                                                moment()
                                            ]}
                                            value={this.state.date}
                                            format={dateFormat}
                                            onChange={this.dateChange.bind(this)}
                                        />
                                    </div>
                                </div>
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
                {/* `Requested (${requestedCount})` */}
                <div className="RidersList RidersListingWithWidth project-config-tab">
                    <Tabs onChange={this.tabCallback}>
                        <TabPane tab={<div>Requests <span className="payout-tab-count">{requestedCount}</span></div>}
                            key={COMMISSION_PAYOUT_TYPE.REQUESTED}
                        >
                            <CommissionPayoutTable
                                tab="request"
                                data={data}
                                filter={filter}
                                fetch={this.fetch}
                                loading={loading}
                            />
                        </TabPane>
                        <TabPane tab={<div>Transferred <span className="payout-tab-count">{transferredCount}</span></div>}
                            key={COMMISSION_PAYOUT_TYPE.TRANSFERRED}>
                            <CommissionPayoutTable
                                tab="transfer"
                                data={data}
                                filter={filter}
                                fetch={this.fetch}
                                loading={loading}
                            />
                        </TabPane>
                        <TabPane tab={<div>Cancelled <span className="payout-tab-count">{cancelledCount}</span></div>}
                            key={COMMISSION_PAYOUT_TYPE.REJECTED}>
                            <CommissionPayoutTable
                                tab="cancel"
                                data={data}
                                filter={filter}
                                fetch={this.fetch}
                                loading={loading}
                            />
                        </TabPane>
                    </Tabs>
                </div>
                {commissionPayoutAddVisible && (
                    <CommissionUpsertRequest
                        title="Add a new request for franchisee"
                        onCreate={this.handleAddCommissionRequest}
                        onCancel={this.hideCommissionPayoutAdd}
                    />
                )}
            </div>
        );
    }
}

export default CommissionPayout;
