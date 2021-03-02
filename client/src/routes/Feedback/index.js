import { Input, Row, Table, Affix } from 'antd';
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import ESPagination from '../../components/ESPagination';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import { GUEST_USER, RIDER_ROUTE } from '../../constants/Setup';
import { USER_TYPES } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');

const Search = Input.Search;

class Feedback extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            dealerList: [],
            filter: {
                page: 1,
                limit: 20,
                filter: {}
            },
            dealerFilterVisible: false
        };
        this.franchiseeId = 0;
        this.dealerId = 0;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" />,
                key: 'index',
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: <IntlMessages id="app.name" />,
                dataIndex: 'addedBy.name',
                render: (text, record, index) =>
                    record.addedBy && record.addedBy.name.trim() ? 
                    <Link to={{pathname: `/e-scooter/${RIDER_ROUTE}/view/${record.addedBy.id}`}}> 
                       {record.addedBy.name.trim()}
                    </Link> : GUEST_USER               
            },
            {
                title: <IntlMessages id="app.mobile" />,
                dataIndex: 'addedBy.mobiles',
                render: (text) =>
                { return text &&  _.size(text) > 0 &&
                    UtilService.getPrimaryValue(text,'mobile')}
            },
            {
                title: <IntlMessages id="app.email" />,
                dataIndex: 'addedBy.emails',
                render: (text) =>
                {return text &&  _.size(text) > 0 &&
                    UtilService.getPrimaryValue(text,'email')}
            },
            {
                title: <IntlMessages id="app.feedback.feeback" />,
                dataIndex: 'feedback'
            },
            {
                title: <IntlMessages id="app.feedback.receivedOn" />,
                dataIndex: 'createdAt',
                render: (text) => {
                    return UtilService.displayDate(text);
                }
            },
            // {
            //     title: 'Language',
            //     dataIndex: 'language',
            //     render: (text, record) => {
            //         _.each(LANGUAGES, (item) => {
            //             console.log('testing-----', text, record);
            //             if (item.id == text) {
            //                 text = item.name;
            //             }
            //         });

            //         return text;
            //     }
            // }
        ];
    }
    componentDidMount() {
        // this.getDealerList();
        this.fetch();
        this.initializeTableColumns();
    }
    fetch = async (page) => {
        this.setState((state) => {
            state.loading = true;
            state.total = 0;
            state.data = [];

            return state;
        });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                'admin/feedback/paginate',
                this.state.filter
            );
            this.setState({
                total: response.data.count,
                loading: false,
                data: response.data.list,
                paginate: true
            });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    getDealerList = async (franchiseeId) => {
        let filter = {
            filter: {
                addOwnUser: true,
                isDeleted: false,
                isActive: true,
            }
        }
        if (franchiseeId) {
            if (franchiseeId.type === null) {
                filter.filter.dealerId = null;
                filter.filter.addOwnUser = false;
            }
            filter.filter.franchiseeId = franchiseeId.type;
        }
        try {
            let data = await axios.post('admin/user/dealer-list', filter);
            if (data.code === 'OK') {
                let response = [{ label: <IntlMessages id="app.all" />, value: 0 }];

                _.each(data.data.list, (value, index) => {
                    response.push({ label: value.name, value: index + 1, type: value.id });
                });
                this.setState({ dealerList: response, dealerFilterVisible: true })
            } else {
                console.log('payload: data.error', data.error);
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    onSearch = () => {

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
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });
        if (key === 'franchiseeId') {
            this.setState({ dealerFilterVisible: false })
            this.getDealerList(data);
        }
        self.setState(
            (state) => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => { return self.fetch() }
        );
    };

    render() {
        const { authUser } = this.props.auth;
        let isFranchisee = authUser && authUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = authUser && authUser.type === USER_TYPES.DEALER;
        // let FilterArray = [
        //     {
        //         title: `${FRANCHISEE_LABEL}`,
        //         list: this.props.franchisee.franchisee,
        //         defaultSelected: this.franchiseeId,
        //         key: 'franchiseeId',
        //         visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer
        //     },
        //     {
        //         title: `${DEALER_LABEL}`,
        //         list: this.state.dealerList,
        //         defaultSelected: this.dealerId,
        //         key: 'dealerId',
        //         visible: this.state.dealerList.length > 2 && !isFranchisee && !isDealer && this.state.dealerFilterVisible
        //     }
        // ];

        return (<>
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.feedback.feeback" /></h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    placeholder="Search by reason"
                                    onSearch={this.onSearch}
                                    className="gx-mb-0"
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
                                {/* {FilterArray.map(filter => {
                                    return (filter.visible &&
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            defaultSelected={filter.defaultSelected}
                                            handleSelection={(val) => {
                                                this.handleSelection(
                                                    val,
                                                    filter.key,
                                                    filter.list
                                                );
                                            }}
                                        />
                                    );
                                })} */}
                            </div>
                            {this.state.paginate ?
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                /> :
                                null}
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList RiderTableList">
                    <Table className="gx-table-responsive"
                        columns={this.columns}
                        loading={this.state.loading}
                        dataSource={this.state.data}
                        rowKey="id"
                        onChange={this.handleChange}
                        pagination={false} />
                </div>
            </div>

        </>);
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(Feedback);
