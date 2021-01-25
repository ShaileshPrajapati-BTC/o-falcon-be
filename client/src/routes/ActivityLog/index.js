import {
    ACTIVITY_TYPES,
    MENU_LIST_MODULES,
    ACTIVITY_TYPES_ARRAY,
    USER_TYPES_ARRAY
} from "../../constants/Common";
import { Affix, Icon, Row, Table } from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ESPagination from "../../components/ESPagination";
import Search from "../../components/ESSearch";

import axios from "util/Api";
import InfoModal from "./Info";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
const _ = require("lodash");

class ActivityLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            paginate: false,
            data: [],
            total: 0,
            filter: {
                page: 1,
                limit: 20,
                filter: {}
            },
            modalData: {},
            modalVisible: false
        };
        this.action = ACTIVITY_TYPES_ARRAY[0].value;
        this.defaultUserType = USER_TYPES_ARRAY[0].value;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: "Sr. No",
                key: "index",
                width: "7%",
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: "Action",
                dataIndex: "action",
                render: (text) => {
                    return _.map(Object.keys(ACTIVITY_TYPES), val => {
                        return text === ACTIVITY_TYPES[val]
                            ? _.capitalize(_.lowerCase(val))
                            : null;
                    });
                }
            },
            {
                title: "Performed By",
                dataIndex: "userId.name"
            },
            {
                title: "Module",
                dataIndex: "module",
                render: (text) => {
                    return _.map(MENU_LIST_MODULES, value => {
                        return value.module === text ? value.name : null;
                    });
                }
            },
            {
                title: "Data Info",
                dataIndex: "details",
                render: (text, record) => {
                    return _.map(MENU_LIST_MODULES, value => {
                        if (value.module === record.module) {
                            let details = _.pick(text, value.keys);

                            return _.map(Object.keys(details), item => {
                                return (
                                    <span>
                                        {` ${_.capitalize(
                                            _.lowerCase(item)
                                        )} : ${details[item]} `}
                                        <br />
                                    </span>
                                );
                            });
                        }
                    });
                }
            },
            {
                title: "Time",
                dataIndex: "createdAt",
                render: (text) => {
                    return UtilService.displayDate(text)
                }
            },
            {
                title: "Detail",
                dataIndex: "details",
                align: "center",
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                displayBefore={
                                    <div className="scooterIC">
                                        <a href="/#" onClick={(e) => e.preventDefault()}>
                                            <Icon
                                                type="info-circle"
                                                style={{ marginRight: 0 }}
                                                onClick={this.showModal.bind(
                                                    this,
                                                    record
                                                )}
                                            />
                                        </a>
                                    </div>
                                }
                            />
                        </span>
                    );
                }
            }
        ];
    };
    componentDidMount() {
        this.fetch();
        this.initializeTableColumns();
    }
    fetch = async page => {
        this.setState({ loading: true, data: [] });
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                "admin/activitylog/paginate",
                this.state.filter
            );
            if (response && response.data) {
                this.setState({
                    total: response.data.count,
                    data: response.data.list,
                    loading: false,
                    paginate: true
                });
            }
        } catch (error) {
            console.log("Error****:", error.message);
        }
    };
    showModal = value => {
        this.setState({
            modalVisible: true,
            modalData: value
        });
        console.log("TCL: ActivityLog -> showModal -> value", value);
    };
    handleCancel = () => {
        this.setState({
            modalVisible: false
        });
    };
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

        //     if (key === 'type') {
        //     let data = _.find(USER_TYPES_ARRAY, { value: selectedVal });
        //     this.defaultUserType = selectedVal;
        //     this.setState((state) => {
        //         if (data && data.type) {
        //             state.filter.filter.userId.type = data.value;
        //         } else {
        //             delete state.filter.filter.userId;
        //         }
        //     });

        // }
    };

    render() {
        const { modalVisible } = this.state;

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Activity Log</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    filter={this.state.filter}
                                    keys={[
                                        "name",
                                        "emails.email",
                                        "mobiles.mobile"
                                    ]}
                                    handelSearch={this.handleSearch}
                                    placeholder="Search by name, email or mobile"
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
                                <FilterDropdown
                                    title1="Action"
                                    defaultSelected={this.action}
                                    list={ACTIVITY_TYPES_ARRAY}
                                    handleSelection={val => {
                                        return this.handleSelection(
                                            val,
                                            "action",
                                            ACTIVITY_TYPES_ARRAY
                                        );
                                    }}
                                />
                                {/* <FilterDropdown
                                    title1="User Type"
                                    defaultSelected={this.defaultUserType}
                                    list={USER_TYPES_ARRAY}
                                    handleSelection={(val) => {
                                        return this.handleSelection(val, 'type');
                                    }}
                                /> */}
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
                <div className="RidersList RiderTableList">
                    <Table
                        className="gx-table-responsive"
                        columns={this.columns}
                        loading={this.state.loading}
                        dataSource={this.state.data}
                        rowKey="id"
                        pagination={false}
                    />
                </div>
                {modalVisible && (
                    <InfoModal
                        data={this.state.modalData}
                        onCancel={this.handleCancel.bind(this)}
                    />
                )}
            </div>
        );
    }
}
export default ActivityLog;
