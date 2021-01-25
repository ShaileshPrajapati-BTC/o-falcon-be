import React from "react";
import { Affix, Row, Table, Icon, message } from "antd";
import AddButton from "../../components/ESAddButton";
import { PAGE_PERMISSION, DEFAULT_API_ERROR } from '../../constants/Common';
import UpsertForm from './upsert';
import axios from "util/Api";
import ActionButtons from "../../components/ActionButtons";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import Search from "../../components/ESSearch";
import ESPagination from '../../components/ESPagination';
const _ = require("lodash");
class CommunityModeList extends React.Component {
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
                filter: {}
            },
            categoryList: [],
            paginate: false,
        }
        this.categoryId = 0;
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
                title: "Category",
                dataIndex: "categoryId.name",
                render: text => {
                    return (
                        <span style={{ textTransform: "capitalize" }}>
                            {text}
                        </span>
                    );
                }
            },
            {
                title: "Vehicle Id",
                dataIndex: "vehicleId",
                align: 'center',
                render: text => {
                    return (
                        <Icon type={text ? 'check-circle' : 'close-circle'}
                            style={{ color: text ? '#008000' : '#CC0000' }}
                            theme="outlined"
                        />
                    );
                }
            },
            {
                title: "Comment",
                dataIndex: "comment",
                align: 'center',
                render: text => {
                    return (
                        <Icon type={text ? 'check-circle' : 'close-circle'}
                            style={{ color: text ? '#008000' : '#CC0000' }}
                            theme="outlined"
                        />
                    );
                }
            },
            {
                title: "Photo",
                dataIndex: "photo",
                align: 'center',
                render: text => {
                    return (
                        <Icon type={text ? 'check-circle' : 'close-circle'}
                            style={{ color: text ? '#008000' : '#CC0000' }}
                            theme="outlined"
                        />
                    );
                }
            },
            {
                title: "Location",
                dataIndex: "location",
                align: 'center',
                render: text => {
                    return (
                        <Icon type={text ? 'check-circle' : 'close-circle'}
                            style={{ color: text ? '#008000' : '#CC0000' }}
                            theme="outlined"
                        />
                    );
                }
            },
            {
                title: "Action",
                key: "action",
                align: 'center',
                render: (text, record) => {
                    return (
                        <>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.COMMUNITY_MODE}
                                edit={() => { return this.handleEdit(record.id); }}
                            // deleteObj={{
                            //     documentId: record.id,
                            //     page: "CommunityMode",
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
        this.getCategory();
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
            .post("/admin/report-form-setting/paginate", this.state.filter)
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
    getCategory = async () => {
        let filter = {
            filter: {
                isDeleted: false
            }
        }
        try {
            let response = await axios.post(`admin/report-category/report-category`, filter);
            if (response.code === 'OK') {
                let category = [{ label: 'All', value: 0 }];
                _.each(response.data.list, (value, index) => {
                    category.push({ label: value.name, value: index + 1, type: value.id });
                });
                this.setState({ categoryList: category })
            } else {
                message.error(response.message)
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    handleSelection = (selectedVal, key, listData) => {
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
        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
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
            let data = await axios.delete(`/admin/report-form-setting/${id.documentId}`);
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
        const { loading, editId, data, categoryList } = this.state;
        let FilterArray = [
            {
                title: "Category",
                list: categoryList,
                defaultSelected: this.categoryId,
                key: "categoryId",
                visible: categoryList.length > 0
            }
        ];
        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Community Mode</h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["title"]}
                                    placeholder="Search By title"
                                />
                                {/* <AddButton
                                    onClick={this.onAdd}
                                    text="Add Community Mode"
                                    pageId={PAGE_PERMISSION.COMMUNITY_MODE}
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
                                                key={filter.key}
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
                    <UpsertForm
                        id={editId}
                        handleSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                    />
                )}
            </div>
        );
    }
}
export default CommunityModeList;