/* eslint-disable no-nested-ternary */
import { Row, message, Affix, Tabs, DatePicker } from "antd";
import { WORK_FLOW, DEFAULT_API_ERROR, OVERDUE_TASK_FILTER, SORT_BY_CREATED_AT_TASK, FEEDER_LABEL, FEEDER_ROUTE, FEEDER_VISIBLE, USER_TYPES } from "../../constants/Common";
import React, { Component } from "react";
import axios from "util/Api";
import Search from "../../components/ESSearch";
import TaskStatusTable from './TaskStatusTable';
import moment from "moment";
import ESCreateTask from "../../components/ESCreateTask";
import ViewTask from './view';
import ESPagination from "../../components/ESPagination";
import UtilService from "../../services/util";
import FilterDropdown from "../../components/FilterDropdown";
import StatusTrack from "./statusTrack";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const dateFormat = "DD/MM/YYYY";
const _ = require("lodash");
class TasksList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            total: 0,
            fileUploadProcess: false,
            loading: false,
            viewModel: false,
            viewId: '',
            disabled: false,
            selectedRecord: [],
            paginate: false,
            changeWorkFlowModel: false,
            workflowObj: {},
            editModel: false,
            viewStatusTrack: false,
            statusTrack: [],
            editId: '',
            filter: {
                page: 1,
                limit: 20,
                sort: "createdAt DESC",
                isDeleted: false,
                filter: {
                    taskWorkFlow: WORK_FLOW.OPEN,
                    createdAt: {
                        ">=": UtilService.getStartOfTheDay(moment().subtract(1, "months").toISOString()),
                        "<=": UtilService.getEndOfTheDay(moment().toISOString())
                    }
                },
            },
            statusWiseCount: [],
            date: [moment().subtract(1, "months"), moment()],
            activeKey: WORK_FLOW.OPEN.toString(),
            feederList: []
        };
        this.isOverDue = 0;
        this.sort = 1;
        this.isDesc = true;
        this.assignedTo = 0;
    }
    async componentDidMount() {
        if (this.props.location && this.props.location.taskId) {
            let response = await axios.post("/admin/task/paginate", { isDeleted: false, filter: { taskNumber: this.props.location.taskId } });
            if (response && response.code === "OK" && response.data.list.length > 0) {
                this.setState((state) => {
                    state.filter.filter.taskWorkFlow = response.data.list[0].taskWorkFlow;
                    state.viewModel = true;
                    state.viewId = response.data.list[0].id;
                    state.activeKey = response.data.list[0].taskWorkFlow.toString();
                });
            }
            else {
                message.error(response.message);
            }
        }
        if (this.props.assignedTo) {
            await this.setState((state) => {
                state.filter.filter.assignedTo = this.props.assignedTo;
                state.activeKey = WORK_FLOW.IN_PROGRESS.toString();
                state.filter.filter.taskWorkFlow = WORK_FLOW.IN_PROGRESS;
            })
        } else {
            await this.getFeederList();
        }
        this.fetch();
    }
    getFeederList = async () => {
        let filter = {
            filter: {
                type: USER_TYPES.FEEDER,
                isDeleted: false
            }
        }
        this.setState({ loading: true })
        try {
            let response = await axios.post('admin/feeder/paginate', filter);
            if (response && response.code === 'OK') {
                let feederFilter = [{ label: 'All', value: 0 }];
                _.each(response.data.list, (value, index) => {
                    feederFilter.push({ label: value.name, value: index + 1, type: value.id });
                });
                this.setState({ feederList: feederFilter, loading: false });
            } else {
                this.setState({ feederList: [], loading: false });
            }
        } catch (error) {
            this.setState({ loading: false })
            console.log('Error****:', error.message);
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
        try {
            let response = await axios.post("/admin/task/paginate", this.state.filter);
            if (response.code === "OK") {
                this.setState({
                    total: response.data.count,
                    // statusWiseCount: response.data.statusWiseCount,
                    loading: false,
                    data: response.data.list,
                    paginate: true
                });
            }
            else {
                message.error(response.message);
            }
            this.setState({ loading: false });
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false });
        }
    };
    handelSearch = (search) => {
        this.setState({
            filter: search,
            paginate: false
        }, () => this.fetch());
    };
    dateChange = (date) => {
        let from = UtilService.getStartOfTheDay(moment(date[0])
            .startOf("day")
            .toISOString());
        let to = UtilService.getEndOfTheDay(date[1].toISOString());
        let range = { ">=": from, "<=": to };
        let value = [moment(date[0]), moment(date[1])]
        this.setState(state => {
            state.filter.filter.createdAt = range;
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        });
        this.fetch();
    };
    handleSelection = (selectedVal, isAscending, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            isAscending: isAscending,
            key: key,
            listData: listData
        };
        let self = this;
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
    tabCallback = async (key) => {
        this.setState({
            filter: {
                ...this.state.filter,
                page: 1,
                filter: {
                    ...this.state.filter.filter,
                    taskWorkFlow: parseInt(key)
                }
            },
            paginate: false,
            activeKey: key.toString()
        }, async () => {
            await this.fetch();
        })
    }
    deleteTask = async (id) => {
        try {
            let data = await axios.delete(`/admin/task/${id}`);
            if (data.code === "OK") {
                message.success(`${data.message}`);
                this.fetch();
            } else {
                message.error(`${data.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    changeWorkFlow = () => {
        this.setState({ paginate: false });
        this.fetch();
    }
    handelEdit = (id) => {
        this.setState({ editModel: true, editId: id })
    }
    handleSubmitTask = () => {
        this.handelEditCancel();
        this.fetch();
    }
    handelEditCancel = () => {
        this.setState({ editModel: false, editId: '' })
    }
    handleView = (id) => {
        this.setState({ viewModel: true, viewId: id })
    }
    handleViewCancel = () => {
        this.setState({ viewModel: false, viewId: '' })
    }
    statusTrack = (data) => {
        this.setState({ viewStatusTrack: true, statusTrack: data })
    }
    onCancelStatusTrack = () => {
        this.setState({ viewStatusTrack: false, statusTrack: [] })
    }
    render() {
        const { data, loading, filter, changeWorkFlowModel, editModel, editId, viewId, viewModel, viewStatusTrack, statusTrack } = this.state;
        let FilterArray = [
            {
                title: "Type",
                list: OVERDUE_TASK_FILTER,
                defaultSelected: this.isOverDue,
                key: "isOverDue",
                visible: true,
            },
            {
                title: "Sort by",
                list: SORT_BY_CREATED_AT_TASK,
                sorter: true,
                isDesc: this.isDesc,
                defaultSelected: this.sort,
                key: "sort",
                visible: true,
            },
            {
                title: FEEDER_LABEL,
                list: this.state.feederList,
                defaultSelected: this.assignedTo,
                key: 'assignedTo',
                visible: !this.props.assignedTo && this.state.feederList.length > 1 && FEEDER_VISIBLE
            }
        ];

        // const { requestedCount, transferredCount, cancelledCount } = this.getStatusWiseCount();
        let tabObj = [
            {
                title: 'Open',
                key: WORK_FLOW.OPEN,
                tab: 'open'
            },
            {
                title: 'In Progress',
                key: WORK_FLOW.IN_PROGRESS,
                tab: 'inprogress'
            },
            {
                title: 'Complete',
                key: WORK_FLOW.COMPLETE,
                tab: 'complete'
            },
            {
                title: 'Cancelled',
                key: WORK_FLOW.CANCELLED,
                tab: 'cancelled'
            }
        ]
        if (this.props.assignedTo) {
            tabObj = tabObj.filter((el) => el.key !== WORK_FLOW.OPEN)
        }
        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header" style={{ paddingBottom: this.props.assignedTo && 35 }}>
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Task List</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    filter={filter}
                                    keys={["taskHeading", "taskNumber"]}
                                    handelSearch={this.handelSearch}
                                    placeholder="Search by Task Id, Task Heading"
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
                                    return (filter.visible &&
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            sorter={filter && filter.sorter}
                                            isDesc={filter && filter.isDesc}
                                            defaultSelected={
                                                filter.defaultSelected
                                            }
                                            key={filter.key}
                                            handleSelection={(val, isAscending) => {
                                                this.handleSelection(val, isAscending, filter.key, filter.list);
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
                <div className="RidersList RidersListingWithWidth project-config-tab">
                    <Tabs onChange={this.tabCallback} activeKey={this.state.activeKey}>
                        {tabObj.map((item) => {
                            return (
                                <TabPane tab={<div>{item.title}
                                    {/* <span className="payout-tab-count">{item.count}</span> */}
                                </div>}
                                    key={item.key}
                                >
                                    <TaskStatusTable
                                        tab={item.tab}
                                        data={data}
                                        filter={filter}
                                        deleteTask={this.deleteTask}
                                        changeWorkFlow={this.changeWorkFlow}
                                        fetch={this.fetch}
                                        handelEdit={this.handelEdit}
                                        handleView={this.handleView}
                                        loading={loading}
                                        statusTrack={this.statusTrack}
                                    />
                                </TabPane>
                            )
                        })}
                    </Tabs>
                </div>
                {editModel && (
                    <ESCreateTask
                        visible={editModel}
                        editId={editId}
                        onCancel={this.handelEditCancel}
                        onSubmit={() => this.handleSubmitTask()}
                    />
                )}
                {viewModel && (
                    <ViewTask
                        visible={viewModel}
                        viewId={viewId}
                        onCancel={this.handleViewCancel}
                    />
                )}
                {viewStatusTrack && (
                    <StatusTrack
                        data={statusTrack}
                        visible={viewStatusTrack}
                        onCancel={this.onCancelStatusTrack}
                    />
                )}
            </div>
        );
    }
}

export default TasksList;
