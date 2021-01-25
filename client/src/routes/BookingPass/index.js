import { Affix, Row, Table, Tag, DatePicker } from 'antd';
import React, { Component } from 'react';
import {
    BOOK_PLAN_EXPIRATION_TYPES_FILTER,
    BOOKING_PASS_LIMIT_TYPES,
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    BOOKING_PASS_TIME_TYPES,
    SUBSCRIPTION_LABEL,
    BOOKING_PASS_LABEL,
    BOOKING_PASS_ROUTE,
    BOOKING_PASS_TYPE,
    BOOKING_PASS_LIMIT_TYPES_FILTER,
    BOOKING_PASS_TYPE_FILTER
} from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import AddButton from '../../components/ESAddButton';
import ESPagination from '../../components/ESPagination';
import FilterDropdown from '../../components/FilterDropdown';
import Search from '../../components/ESSearch';
import AddPlan from './upsert';
import PassView from './view';
import UtilService from '../../services/util';
import axios from 'util/Api';
import moment from 'moment';
import ESToolTip from '../../components/ESToolTip';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
class BookingPass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            paginate: false,
            viewPlan: false,
            viewId: 0,
            filter: {
                page: 1,
                limit: 10,
                filter: {},
            },
            total: 0,
        };
        this.isActive = 1;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: 'Name',
                dataIndex: 'name',
            },
            {
                title: 'Code',
                dataIndex: 'code',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                render: (text, record) => {
                    let description = record.description.substring(0, 15) + '...';
                    return (
                        record.description.length > 15 ?
                            <ESToolTip placement="top" text={record.description}>
                                {description}
                            </ESToolTip>
                            : record.description
                    )
                }
            },
            // {
            //     title: 'price',
            //     dataIndex: 'price',
            // },
            {
                title: 'Charged On',
                dataIndex: 'passType',
                render: (text, record) => {
                    // let type = BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type })
                    return (
                        text
                            ? text.map((type, i) => {
                                return i !== 0 ?
                                    BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }) &&
                                    ', ' + BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }).label
                                    : BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }) &&
                                    BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }).label;
                            })
                            : '-'
                    )
                }
            },
            {
                title: 'Usage Limit',
                dataIndex: 'limitValue',
                render: (text, record) => {
                    let limitType = BOOKING_PASS_LIMIT_TYPES_FILTER.find((el) => { return el.type === record.limitType; })
                    return (
                        <>
                            {record.limitValue} {'  '}
                            <span style={{ textTransform: 'capitalize' }}>
                                {limitType && limitType.label}
                            </span>
                        </>
                    )
                }
            },
            {
                title: 'Max ride per day',
                dataIndex: 'maxRidePerDay',
                align: 'center',
                render: (text, record) => {
                    return (
                        text === 0 ? '-' : text
                    )
                }
            },
            {
                title: 'Active',
                dataIndex: 'isActive',
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            <ActiveDeactive
                                onSuccess={this.fetch.bind(this)}
                                documentId={record.id}
                                isActive={text}
                                model="bookingpass"
                            />
                        </span>
                    );
                }
            },
            {
                title: 'Actions',
                align: 'center',
                width: "120px",
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.BOOKING_PASS}
                                view={() => {
                                    return this.showViewModal(record);
                                }}
                                edit={`/e-scooter/${BOOKING_PASS_ROUTE}/upsert/${record.id}`}
                            />
                        </span>
                    );
                }
            },
        ];
    };
    componentDidMount() {
        this.fetch();
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
            let response = await axios.post('admin/booking-pass/paginate', this.state.filter);
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
    showViewModal(record) {
        this.setState({
            viewPlan: true,
            viewId: record.id
        });
    }
    hideViewModal() {
        this.setState({
            viewPlan: false
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
        self.setState(
            (state) => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => {
                return self.fetch();
            }
        );
    };

    render() {
        let FilterArray = [
            {
                title: 'Status',
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive'
            },
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
                                <h1 className="pageHeading">{BOOKING_PASS_LABEL}</h1>
                                <div className="SearchBarwithBtn">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['name', 'code']}
                                        placeholder="Search by Name, Code "
                                    />
                                    <AddButton
                                        link={`/e-scooter/${BOOKING_PASS_ROUTE}/upsert`}
                                        text={<span style={{ display: 'flex' }}>Add &nbsp;{BOOKING_PASS_LABEL}</span>}
                                        pageId={PAGE_PERMISSION.BOOKING_PASS}
                                        filter={this.state.filter}
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
                                    {FilterArray.map((filter) => {
                                        return (
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                handleSelection={(val) => {
                                                    this.handleSelection(
                                                        val,
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
                    {this.state.viewPlan &&
                        <PassView
                            id={this.state.viewId}
                            onCancel={this.hideViewModal.bind(this)}
                        />
                    }
                </div>
            </>
        );
    }
}
export default BookingPass;
