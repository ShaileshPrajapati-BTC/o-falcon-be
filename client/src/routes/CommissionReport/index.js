import { Affix, Row, Table } from 'antd';
import React, { Component } from 'react';
import {
    DEFAULT_BASE_CURRENCY, FRANCHISEE_LABEL
} from '../../constants/Common';
import ESPagination from '../../components/ESPagination';
import Search from '../../components/ESSearch';
import UtilService from '../../services/util';
import FilterDropdown from "../../components/FilterDropdown";
import axios from 'util/Api';

class CommissionReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            total: 0,
            loading: false,
            paginate: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {},
                sort: 'totalCommission DESC'
            }
        };
        this.sort = 1;
        let redirectFilter = this.props.location.filter;
        this.isDesc = redirectFilter && redirectFilter.sort
            ? (redirectFilter.sort.split(" ")[1] === 'ASC' ? false : true)
            : true;
        this.SORT_BY_ARRAY = [
            {
                label: "Total Commission",
                key: "totalCommission",
                value: 1,
                type: "totalCommission"
            },
            {
                label: "Total Paid",
                key: "paidCommission",
                value: 2,
                type: "paidCommission"
            }
        ];
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: `${FRANCHISEE_LABEL} Name`,
                dataIndex: 'franchiseeId.name'
            },
            {
                title: 'Total Commission',
                dataIndex: 'totalCommission',
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {text.toFixed(2)} {DEFAULT_BASE_CURRENCY}
                        </span>
                    );
                }
            },
            {
                title: 'Last Paid On',
                dataIndex: 'lastPayment.dateTime',
                render: (text, record) => {
                    return UtilService.displayDate(text);
                }
            },
            {
                title: 'Last Paid Amount',
                dataIndex: 'lastPayment.amount',
                align: 'center',
                render: (text, record) => {
                    if (text) {
                        return (
                            <span>
                                {text.toFixed(2)} {DEFAULT_BASE_CURRENCY}
                            </span>
                        )
                    } else {
                        return '-'
                    }
                }
            },
            {
                title: 'Total Paid',
                dataIndex: 'paidCommission',
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {text.toFixed(2)} {DEFAULT_BASE_CURRENCY}
                        </span>
                    );
                }
            }
        ];
    };
    componentDidMount() {
        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            this.setState({ filter: filter, paginate: false }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
        this.initializeTableColumns();
    }
    fetch = async (page) => {
        this.setState({ loading: true });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                'admin/franchisee/get-all-franchisee-commission-list',
                this.state.filter
            );
            if (response && response.code === 'OK') {
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list,
                    paginate: true
                });
            } else {
                this.setState({
                    total: 0,
                    loading: false,
                    data: [],
                    paginate: true
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };
    handleEdit = (record) => { };
    handleChange = () => { };
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
    onSearch = (newState) => {
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

    render() {
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
        return (
            <>
                <div className="gx-module-box gx-mw-100">
                    <Affix offsetTop={1}>
                        <div className="gx-module-box-header">
                            <Row
                                type="flex"
                                align="middle"
                                justify="space-between"
                            >
                                <h1 className="pageHeading">Commission Report</h1>
                                <div className="SearchBarwithBtn">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['name']}
                                        // here keys doesn't do anything, cause API has a static key
                                        placeholder={`Search by ${FRANCHISEE_LABEL} Name`}
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
                                </div>
                                {this.state.paginate ?
                                    <ESPagination
                                        limit={this.state.filter.limit}
                                        total={this.state.total}
                                        fetch={this.fetch.bind(this)}
                                        path={this.state.filter.path}
                                    /> :
                                    null}
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
                </div>
            </>
        );
    }
}
export default CommissionReport;
