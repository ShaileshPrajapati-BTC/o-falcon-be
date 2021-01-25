import { Affix, Row, Table, Tag, DatePicker } from 'antd';
import React, { Component } from 'react';
import {
    BOOK_PLAN_EXPIRATION_TYPES_FILTER,
    BOOK_PLAN_EXPIRATION_FILTER,
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    BOOK_PLAN_LIMIT_TYPES,
    SUBSCRIPTION_LABEL,
    BOOK_PLAN_LIMIT_FILTER
} from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import AddButton from '../../components/ESAddButton';
import ESPagination from '../../components/ESPagination';
import FilterDropdown from '../../components/FilterDropdown';
import Search from '../../components/ESSearch';
import AddPlan from './upsert';
import PlanView from './view';
import UtilService from '../../services/util';
import axios from 'util/Api';
import moment from 'moment';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
class BookingPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            addPlan: false,
            loading: false,
            paginate: false,
            viewPlan: false,
            editId: 0,
            viewId: 0,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    isDeleted: false,
                    startDateTimeToBuy: {
                        '>=': UtilService.getStartOfTheDay(moment().toISOString())
                    },
                    endDateTimeToBuy: { '<=': UtilService.getEndOfTheDay(moment().add(1, 'years').toISOString()) }
                },
            },
            total: 0,
            date: [moment(), moment().add(1, 'years'),]
        };
        this.planType = 0;
        this.isActive = 1;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (text, record) => {
                    return (record.description.substr(0, 40) + '...')
                }
            },
            {
                title: 'Usage Limit',
                dataIndex: 'limitValue',
                render: (text, record) => {
                    let limitType = BOOK_PLAN_LIMIT_FILTER.find((el) => { return el.type === record.limitType; })
                    return (
                        <>
                            {record.limitValue} {'  '}
                            {limitType && <span style={{ textTransform: 'capitalize' }}>
                                {limitType.label}
                            </span>}
                        </>
                    )
                }
            },
            {
                title: 'Expiration Time',
                dataIndex: 'planValue',
                render: (text, record) => {
                    let planType = BOOK_PLAN_EXPIRATION_FILTER.find((el) => { return el.type === record.planType; })
                    return (
                        <>
                            {record.planValue} {'  '}
                            {planType && <span style={{ textTransform: 'capitalize' }}>
                                {planType.label}
                            </span>}
                        </>
                    )
                }
            },
            {
                title: 'price',
                dataIndex: 'price',
                key: 'price',
            },
            {
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {record.isRenewable ? <Tag color="green">Renewable</Tag> : <Tag color="red">Not Renewable</Tag>}
                            {record.isTrialPlan ? <Tag color="green">Trial Plan</Tag> : <Tag color="red">Not Trial Plan</Tag>}
                        </span>
                    );
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
                                model="bookplan"
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
                                pageId={PAGE_PERMISSION.SUBSCRIPTION}
                                view={() => {
                                    return this.showViewModal(record);
                                }}
                                edit={() => {
                                    return this.showEditModal(record);
                                }}
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
            let response = await axios.post(
                'admin/book-plan/paginate',
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
    showEditModal = (record) => {
        this.setState({
            addPlan: true,
            editId: record.id
        });
    }
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
    addPlan = () => {
        this.setState({ addPlan: true })
    }
    addModellCancel = () => {
        this.setState({ addPlan: false, editId: 0 })
    }
    handleSubmit = () => {
        this.addModellCancel();
        this.fetch();
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
    dateChange = (date) => {
        let from = UtilService.getStartOfTheDay(moment(date[0]).startOf('day')
            .toISOString());
        let to = UtilService.getEndOfTheDay(date[1].toISOString());
        let value = [moment(date[0]), moment(date[1])]
        let range = [{ '>=': from }, { '<=': to }];

        this.setState((state) => {
            state.filter.filter.startDateTimeToBuy = range[0];
            state.filter.filter.endDateTimeToBuy = range[1];
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        });
        this.fetch();
    }

    render() {
        let FilterArray = [
            {
                title: 'Status',
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive'
            },
            {
                title: 'Type',
                list: BOOK_PLAN_EXPIRATION_TYPES_FILTER,
                defaultSelected: this.planType,
                key: 'planType'
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
                                <h1 className="pageHeading">{SUBSCRIPTION_LABEL}</h1>
                                <div className="SearchBarwithBtn">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['name']}
                                        placeholder="Search by Name "
                                    />
                                    <AddButton
                                        onClick={this.addPlan}
                                        text="Add Plan"
                                        pageId={PAGE_PERMISSION.SUBSCRIPTION}
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

                                <div className="graphFilterWithCalander gx-d-flex" style={{ marginLeft: '40%' }}>
                                    Plan Availability
                                    <div className="dateRanges">
                                        <RangePicker
                                            defaultValue={[moment().subtract(1, 'months'), moment()]}
                                            value={this.state.date}
                                            format={dateFormat}
                                            onChange={this.dateChange.bind(this)}
                                        />
                                    </div>
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
                    {this.state.addPlan &&
                        <AddPlan
                            onCancel={this.addModellCancel.bind(this)}
                            id={this.state.editId}
                            handleSubmit={this.handleSubmit}
                        />}
                    {this.state.viewPlan &&
                        <PlanView
                            id={this.state.viewId}
                            onCancel={this.hideViewModal.bind(this)}
                        />
                    }
                </div>
            </>
        );
    }
}
export default BookingPlan;
