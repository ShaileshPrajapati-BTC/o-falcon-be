import { Col, List, Row, Table, Affix } from "antd";
import {
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    USER_TYPES,
} from "../../constants/Common";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import AddButton from "../../components/ESAddButton";
import CustomScrollbars from "../../util/CustomScrollbars";
import ESPagination from "../../components/ESPagination";
import FilterDropdown from "../../components/FilterDropdown";
import IsDefault from "../../components/custom/IsDefault";
import SubMasterUpsertForm from "./SubMasterUpsertForm";
import SubMasterView from "./SubMasterView";
import Search from "../../components/ESSearch";

import axios from "util/Api";
import { connect } from "react-redux";

import { getList } from "../../appRedux/actions/Master";
import UtilService from "../../services/util";
import IntlMessages from "../../util/IntlMessages";

const _ = require("lodash");
const disableFieldFor=[USER_TYPES.DEALER]
class SubMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            masterId: props.match.params.id,
            masterData: [],
            sortedInfo: null,
            data: [],
            masterName: null,
            id: null,
            loading: false,
            masterLoading: false,
            total: 0,
            masterFilter: {
                isOnlyParents: true,
                isDeleted: false
            },
            filter: {
                parentId: props.match.params.id,
                include: ["subMasters"],
                isDeleted: false,
                filter: {}
            },
            fileUploadProcess: false,
            modalVisible: false,
            loginUser:
                this.props.auth && this.props.auth.authUser
                    ? this.props.auth.authUser
                    : null
        };

        this.isActive = 1;
    }
    initializeTableColumns = () => {
        // let { sortedInfo } = this.state;
        // sortedInfo = sortedInfo || {};
        const { authUser } = this.props.auth;
        const isDisable = disableFieldFor.some(el => el === authUser.type)
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" defaultMessage="Sr. No"/>,
                key: "index",
                width: "10%",
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: "",
                dataIndex: "icon",
                width: "10%",
                align: "center",
                render: (text, record) => {
                    return (
                        <div
                            className="totalRideCounter"
                            style={{
                                height: "40px",
                                width: "40px",
                                fontSize: "18px",
                                marginLeft: "19px"
                            }}
                        >
                            {record.name.charAt(0).toUpperCase()}
                        </div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.name" defaultMessage="Name"/>,
                dataIndex: "name"
                // sorter: (a, b) => {
                //     if (a.name < b.name) {
                //         return -1;
                //     }
                //     if (a.name > b.name) {
                //         return 1;
                //     }

                //     return 0;
                // },
                // sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
            },
            {
                title: <IntlMessages id="app.code" defaultMessage="Code"/>,
                dataIndex: "code"
                // sorter: (a, b) => {
                //     if (a.code < b.code) {
                //         return -1;
                //     }
                //     if (a.code > b.code) {
                //         return 1;
                //     }

                //     return 0;
                // },
                // sortOrder: sortedInfo.columnKey === 'code' && sortedInfo.order
            },
            {
                title: <IntlMessages id="app.default" defaultMessage="Default"/>,
                dataIndex: "isDefault",
                align: "center",
                render: (text, record) => {
                    return (
                        <span>
                            <IsDefault
                                documentId={record.id}
                                isActive={record.isActive}
                                isDefault={text}
                                onSuccess={this.fetch}
                                filterBy={{ parentId: record.parentId }}
                                model="master"
                            />
                        </span>
                    );
                }
            },
            {
                title: <IntlMessages id="app.active" defaultMessage="Active"/>,
                dataIndex: "isActive",
                align: "center",
                render: (text, record) => {
                    return (
                        <span>
                            <ActiveDeactive
                                documentId={record.id}
                                isActive={text}
                                isDefault={record.isDefault}
                                onSuccess={this.fetch.bind(this)}
                                model="master"
                            />
                        </span>
                    );
                }
            },
            {
                title: <IntlMessages id="app.action" defaultMessage="Actions"/>,
                align: "center",
                width: "120px",
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.DATABANK}
                                view={() => {
                                    return this.showViewModal(record);
                                }}
                                edit={() => {
                                    return this.handleEdit(record);
                                }}
                                deleteObj={{
                                    documentId: record.id,
                                    model: "master",
                                    isSoftDelete: true
                                }}
                                deleteFn={res => {
                                    if (res === "success") {
                                        this.fetch();
                                    }
                                }}
                            />
                        </span>
                    );
                }
            }
        ];
        if (isDisable) {
            this.columns = this.columns.filter(el => el.dataIndex !== 'isActive')
        }
    };
    async componentDidMount() {
        this.initializeTableColumns();
        await this.fetchMasters();
        this.fetch();
    }
    fetchMasters = async () => {
        this.setState({
            masterLoading: true,
            loading: true,
            masterData: []
        });

        try {
            let response = await axios.post(
                "admin/master/paginate",
                this.state.masterFilter
            );
            if (
                response.code === "OK" &&
                _.isArray(response.data) &&
                response.data.length
            ) {
                this.setState(state => {
                    state.masterData = response.data;

                    let master = _.first(response.data);
                    if (this.state.masterId) {
                        master = response.data.find(v => {
                            return v.id === this.state.masterId;
                        });
                    }
                    state.filter.parentId = master.id;
                    state.masterName = master.name;
                    state.masterLoading = false;

                    return state;
                });
            }
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ masterLoading: false });
        }
    };

    fetch = async () => {
        this.setState({
            loading: true,
            data: [],
            count: 0
        });
        try {
            let response = await axios.post(
                "admin/master/paginate",
                this.state.filter
            );
            if (response.code === "OK") {
                this.setState(state => {
                    state.data = response.data;
                    state.total = response.data.length;
                    state.loading = false;

                    return state;
                });
            } else {
                this.setState({
                    data: response.data,
                    total: response.data.length,
                    loading: false
                });
            }
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };

    masterChange = master => {
        this.setState(
            {
                masterName: master.name,
                sortedInfo: null,
                filteredInfo: null,
                filter: Object.assign(this.state.filter, {
                    parentId: master.id
                })
            },
            () => {
                this.fetch();
            }
        );
    };

    onSearch = newState => {
        this.setState(
            {
                filter: newState
            },
            () => {
                this.fetch();
            }
        );
    };

    showViewModal(record) {
        this.setState({
            showViewModal: true,
            viewId: record.id
        });
    }

    hideViewModal() {
        this.setState({
            showViewModal: false
        });
    }
    handleEdit = record => {
        this.setState({
            id: record.id,
            modalVisible: true
        });
    };
    createPageRequest = () => {
        this.setState({
            modalVisible: true,
            isEdit: false
        });
    };
    handleSubmit = () => {
        this.fetch();
        this.handleCancel();
    };
    handleCancel = () => {
        this.setState({
            modalVisible: false,
            id: null
        });
    };

    handleChange = (pagination, filters, sorter) => {
        console.log("Various parameters", pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter,
            filteredInfo: filters
        });
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
        const masterId = this.state.filter.parentId;
        let { masterLoading } = this.state;
        let FilterArray = [
            {
                title: <IntlMessages id="app.status" defaultMessage="Status"/>,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive"
            }
        ];

        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.sidebar.dataBank" defaultMessage="Data Bank"/></h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["name", "code"]}
                                    placeholder="Search by Name / Code"
                                />
                                <AddButton
                                    onClick={this.createPageRequest}
                                    text={<IntlMessages id="app.dataBank.addDataBank" defaultMessage="Add Data Bank"/>}
                                    pageId={PAGE_PERMISSION.DATABANK}
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
                                            key={filter.key}
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
                            </div>
                            {this.state.paginate ? (
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                />
                            ) : null}
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content">
                    <Row type="flex" className="no-gutter">
                        <Col span={6}>
                            <CustomScrollbars className="gx-module-content-scroll">
                                <List
                                    bordered
                                    itemLayout="horizontal"
                                    dataSource={this.state.masterData}
                                    loading={masterLoading}
                                    renderItem={item => {
                                        return (
                                            <List.Item
                                                className={`gx-pointer gx-text-capitalize ${
                                                    item.id === masterId
                                                        ? "gx-bg-primary"
                                                        : ""
                                                    }`}
                                                onClick={this.masterChange.bind(
                                                    this,
                                                    item
                                                )}
                                            >
                                                {item.name}
                                            </List.Item>
                                        );
                                    }}
                                />
                            </CustomScrollbars>
                        </Col>

                        <Col span={18}>
                            <CustomScrollbars className="gx-module-content-scroll">
                                <div className="RidersList RiderTableList">
                                    <Table
                                        className="gx-table-responsive"
                                        columns={this.columns}
                                        loading={this.state.loading}
                                        dataSource={this.state.data}
                                        rowKey="id"
                                        onChange={this.handleChange}
                                        pagination={false}
                                    />
                                </div>
                            </CustomScrollbars>
                        </Col>
                    </Row>

                    {this.state.modalVisible && (
                        <SubMasterUpsertForm
                            onCancel={this.handleCancel}
                            handleSubmit={this.handleSubmit}
                            id={this.state.id}
                            parentId={this.state.filter.parentId}
                        />
                    )}

                    {this.state.showViewModal && (
                        <SubMasterView
                            id={this.state.viewId}
                            onCancel={this.hideViewModal.bind(this)}
                        />
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps, { getList })(SubMaster);
