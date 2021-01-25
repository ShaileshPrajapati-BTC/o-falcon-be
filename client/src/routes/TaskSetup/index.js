import React from "react";
import { Affix, Row, Table, Icon, message } from "antd";
import AddButton from "../../components/ESAddButton";
import { PAGE_PERMISSION, TASK_TYPE, DEFAULT_API_ERROR, FILTER_BY_TASK_TYPE, TASK_LEVEL, FILTER_BY_TASK_LEVEL, NEST_LABEL, TASK_TIME_LIMIT_TYPE, TASK_TIME_LIMIT_TYPE_FILTER } from '../../constants/Common';
import TaskSetupForm from './upsert';
import axios from "util/Api";
import ActionButtons from "../../components/ActionButtons";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import Search from "../../components/ESSearch";
import ESPagination from '../../components/ESPagination';

class TaskSetUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            loading: false,
            data: [],
            editId: '',
            total: 0,
            filter: {
                page: 1,
                limit: 20,
                isDeleted: false,
                filter: {}
            },
            paginate: false,
            taskFilter: [],
            taskFilterVisible: false
        }
        this.taskType = 0;
        this.level = 0;
        this.columns = [
            {
                title: "Title",
                dataIndex: "title",
                render: text => {
                    return (
                        <span style={{ textTransform: "capitalize" }}>
                            {text}
                        </span>
                    );
                }
            },
            {
                title: "Level",
                dataIndex: "level",
                render: (text) => {
                    let level = FILTER_BY_TASK_LEVEL.find((ele) => { return ele.type === text })
                    return (
                        <span className='gx-text-capitalize'>{level && level.label}</span>
                    )
                }
            },
            {
                title: "Task Type",
                dataIndex: "taskType",
                render: (text) => {
                    let type = FILTER_BY_TASK_TYPE.filter((e) => e.type === text)
                    return (
                        <span className='gx-text-capitalize'>{type[0].label}</span>
                    )
                }
            },
            {
                title: "Time Limit",
                dataIndex: "timeLimitValue",
                render: (text, record) => {
                    let timeLimitType = TASK_TIME_LIMIT_TYPE_FILTER.find((el) => { return el.type === record.timeLimitType; })
                    return <>
                        {record.timeLimitValue} {'  '}
                        {timeLimitType && <span style={{ textTransform: 'capitalize' }}>
                            {timeLimitType.label}
                        </span>}
                    </>
                }
            },

            {
                title: "Incentive Range",
                dataIndex: "incentiveRange",
                render: (text) => {
                    return text[0] + ' - ' + text[1]
                }
            },
            // {
            //     title: "Snoozer",
            //     dataIndex: "isSnoozer",
            //     align: 'center',
            //     render: text => {
            //         return (
            //             <Icon type={text ? 'check-circle' : 'close-circle'}
            //                 style={{ color: text ? '#008000' : '#CC0000' }}
            //                 theme="outlined"
            //             />
            //         );
            //     }
            // },
            // {
            //     title: `${NEST_LABEL}`,
            //     dataIndex: "nest",
            //     align: 'center',
            //     render: text => {
            //         return (
            //             <Icon type={text ? 'check-circle' : 'close-circle'}
            //                 style={{ color: text ? '#008000' : '#CC0000' }}
            //                 theme="outlined"
            //             />
            //         );
            //     }
            // },
            // {
            //     title: "Task Completion Requirement",
            //     dataIndex: "taskCompletionReq",
            //     align: 'center',
            //     render: text => {
            //         return (
            //             <Icon type={text ? 'check-circle' : 'close-circle'}
            //                 style={{ color: text ? '#008000' : '#CC0000' }}
            //                 theme="outlined"
            //             />
            //         );
            //     }
            // },
            {
                title: "Action",
                key: "action",
                align: 'center',
                render: (text, record) => {
                    return (
                        <>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.TASKSETUP}
                                edit={() => { return this.handleEdit(record.id); }}
                            // deleteObj={{
                            //     documentId: record.id,
                            //     page: "tasksetup",
                            // }}
                            // deleteFn={res => { return this.handleDelete(res); }}
                            />
                        </>
                    );
                }
            }
        ];
    }
    componentDidMount() {
        this.fetch();
    }
    fetch(page) {
        this.setState({ loading: true });
        if (page) {
            this.setState(state => {
                state.filter.page = page;
                return state;
            });
        }
        axios
            .post("/admin/task-form-setting/paginate", this.state.filter)
            .then(data => {
                if (data.code === "OK") {
                    this.setState({
                        total: data.data.count,
                        loading: false,
                        data: data.data.list,
                        paginate: true
                    });
                } else {
                    this.setState({ total: 0, data: [] });
                    message.error(data.message)
                }
                this.setState({ loading: false });
            })
            .catch(error => {
                this.setState({
                    total: 0,
                    loading: false,
                    data: []
                });
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            });
    }
    handleSelection = async (selectedVal, key, listData) => {
        let self = this;
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });
        if (key === 'level') {
            let taskFilterArr = [{ label: 'All', value: 0 }];
            FILTER_BY_TASK_TYPE.forEach((e) => {
                if (e.level === selectedVal) {
                    taskFilterArr.push(e);
                }
            })
            self.taskType = 0;
            await this.setState({ taskFilter: taskFilterArr, taskFilterVisible: false })
            delete self.state.filter.filter['taskType'];
        }
        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
                state.taskFilterVisible = true;
            },
            () => self.fetch()
        );
    };
    onSearch = newState => {
        this.setState(
            { filter: newState, paginate: false },
            () => { this.fetch(); }
        );
    };
    onAdd = () => {
        this.setState({ modalVisible: true });
    }
    handleEdit = (id) => {
        this.setState({ modalVisible: true, editId: id });
    }
    handleDelete = async (id) => {
        try {
            let data = await axios.delete(`/admin/task-form-setting/${id.documentId}`);
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
    handleSubmit = () => {
        this.handleCancel();
        this.fetch();
    };
    handleCancel = () => {
        this.setState({
            modalVisible: false,
            editId: ''
        });
    };

    render() {
        const { loading, editId, data, taskFilter, taskFilterVisible } = this.state;
        let FilterArray = [
            {
                title: "Task Level",
                list: FILTER_BY_TASK_LEVEL,
                defaultSelected: this.level,
                key: "level",
                visible: true
            },
            {
                title: "Task Type",
                list: taskFilter,
                defaultSelected: this.taskType,
                key: "taskType",
                visible: taskFilterVisible && this.level !== 0
            },
        ];
        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Task Set Up</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["title"]}
                                    placeholder="Search By title"
                                />
                                {/* <AddButton
                                    onClick={this.onAdd}
                                    text="Add Task Form"
                                    pageId={PAGE_PERMISSION.TASKSETUP}
                                /> */}
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
                                        filter.visible && (
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                handleSelection={val => {
                                                    this.handleSelection(
                                                        val,
                                                        filter.key,
                                                        filter.list
                                                    );
                                                }}
                                            />
                                        )
                                    );
                                })}
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
                        columns={this.columns}
                        dataSource={data}
                        loading={loading}
                        pagination={false}
                    />
                </div>
                {this.state.modalVisible && (
                    <TaskSetupForm
                        id={editId}
                        handleSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                    />
                )}
            </div>
        );
    }
}
export default TaskSetUp;