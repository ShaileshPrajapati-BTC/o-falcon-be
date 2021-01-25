import { Row, Table, Affix } from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import AddButton from "../../components/ESAddButton";
import FilterDropdown from "../../components/FilterDropdown";
import { Link } from "react-router-dom";
import MasterUpsertForm from "./MasterUpsertForm";
import MasterView from "./MasterView";
import { FILTER_BY_ACTIVE, PAGE_PERMISSION, USER_TYPES } from "../../constants/Common";
import Search from "../../components/ESSearch";

import axios from "util/Api";
import { connect } from "react-redux";
import { getList } from "../../appRedux/actions/Master";
import UtilService from "../../services/util";
import IntlMessages from "../../util/IntlMessages";
const disableFieldFor=[USER_TYPES.DEALER]

class Master extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortedInfo: null,
            data: [],
            id: null,
            loading: false,
            total: 0,
            filter: {
                page: 1,
                isOnlyParents: true,
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

        //view submaster column
        const authpermission = this.props.auth.authUser.accessPermission;
        const masterPageId = PAGE_PERMISSION.MASTER;
        const getIndex = el => el.module === masterPageId;
        const index = authpermission.findIndex(getIndex);
        const submasterViewPermission =
            index && authpermission[index] && authpermission[index].permissions
                ? authpermission[index].permissions.list
                : false;
        const { authUser } = this.props.auth;
        const isDisable = disableFieldFor.some(el => el === authUser.type)
        // sortedInfo = sortedInfo || {};
        this.columns = [
            {
                title: <IntlMessages id="app.srNo"/>,
                key: "index",
                width: "7%",
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: "",
                dataIndex: "icon",
                width: "7%",
                align: "center",
                render: (text, record) => {
                    return (
                        <div
                            className="totalRideCounter"
                            style={{
                                height: "40px",
                                width: "40px",
                                fontSize: "18px",
                                marginLeft: "17px"
                            }}
                        >
                            {record.name.charAt(0).toUpperCase()}
                        </div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.name"/>,
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
                title: <IntlMessages id="app.user.codeLabel"/>,
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
                title: <IntlMessages id="app.active"/>,
                dataIndex: "isActive",
                align: "center",
                render: (text, record) => {
                    return (
                        <span>
                            <ActiveDeactive
                                onSuccess={this.fetch.bind(this)}
                                documentId={record.id}
                                isActive={text}
                                model="master"
                            />
                        </span>
                    );
                }
            },
            /* {
                title    : 'Default',
                dataIndex: 'isDefault',
                render   : (text, record) => (
                    <span>
                        <ActiveDeactive documentId={record.id} isActive={text} model="master" />
                    </span>
                ),
                filters  : [
                    {text: 'Active', value: true},
                    {text: 'De active', value: false}
                ],
                filterMultiple: false,
                onFilter : (value, record) => record.isDefault === value
            },*/
            {
                title: <IntlMessages id="app.subMaster"/>,
                dataIndex: "",
                align: "center",
                render: (text, record) => {
                    return (
                        <Link to={`/e-scooter/general-settings/sub-master/${record.id}`}>
                            <span className="gx-link"><IntlMessages id="app.view"/></span>
                        </Link>
                    );
                }
            },
            {
                title: <IntlMessages id="app.staticpage.actions"/>,
                align: "center",
                width: "120px",
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.MASTER}
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
        if (submasterViewPermission === false) {
            this.columns = this.columns.filter(el => el.title !== "Sub Master");
        }
        if (isDisable) {
            this.columns = this.columns.filter(el => el.dataIndex !== 'isActive')
        }
    };

    componentDidMount() {
        this.fetch();
        this.initializeTableColumns();
    }

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
            this.setState({
                data: response.data,
                total: response.data.length,
                loading: false
            });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };

    handleEdit = record => {
        this.setState({
            modalVisible: true,
            id: record.id
        });
    };
    handleSubmit = () => {
        this.fetch();
        this.handleCancel();
    };
    handleCancel = () => {
        this.setState({
            id: null,
            modalVisible: false
        });
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

    createPageRequest = () => {
        this.setState({
            modalVisible: true
        });
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
    handleChange = (pagination, filters, sorter) => {
        console.log("Various parameters", pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter
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
        self.setState(
            state => {
                if (data !== "error") {
                    state.filter.filter[key] = data.type;
                } else {
                    delete state.filter.filter[key];
                }
            },
            () => self.fetch()
        );
    };

    render() {

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.master.mainMaster"/></h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["name", "code"]}
                                    placeholder="Search By Name / Code"
                                />
                                <AddButton
                                    onClick={this.createPageRequest}
                                    text={<IntlMessages id="app.master.addMaster"/>}
                                    pageId={PAGE_PERMISSION.MASTER}
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
                                    title1={<IntlMessages id="app.status"/>}
                                    list={FILTER_BY_ACTIVE}
                                    defaultSelected={this.isActive}
                                    handleSelection={(val, isAscending) => {
                                        this.handleSelection(
                                            val,
                                            isAscending,
                                            "isActive",
                                            FILTER_BY_ACTIVE
                                        );
                                    }}
                                />
                            </div>
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
                        onChange={this.handleChange}
                        pagination={false}
                    />
                </div>
                {this.state.modalVisible && (
                    <MasterUpsertForm
                        id={this.state.id}
                        handleSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                    />
                )}

                {this.state.showViewModal && (
                    <MasterView
                        id={this.state.viewId}
                        onCancel={this.hideViewModal.bind(this)}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps, { getList })(Master);
