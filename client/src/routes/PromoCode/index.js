import { Affix, Row, Table, Tag } from 'antd';
import React, { Component } from 'react';
import {
    DEFAULT_VEHICLE,
    FILTER_BY_ACTIVE,
    FILTER_BY_VEHICLE_TYPE,
    FILTER_VISIBLE,
    PAGE_PERMISSION,
    DISCOUNT_TYPE,
    DISCOUNT_TYPE_ARRAY
} from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import AddButton from '../../components/ESAddButton';
import ESPagination from '../../components/ESPagination';
import FilterDropdown from '../../components/FilterDropdown';
import Search from '../../components/ESSearch';
import PromoCodeView from './view';
import UtilService from '../../services/util';
import axios from 'util/Api';
import ESToolTip from '../../components/ESToolTip';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');
class PromoCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            // total: 0,
            loading: false,
            paginate: false,
            filter: {
                page: 1,
                limit: 20,
                filter: {
                    vehicleType: FILTER_BY_VEHICLE_TYPE[0].type
                    // isDelete: false
                },
                showViewModal: false
            }
        };
        let redirectFilter = this.props.location.filter;
        this.vehicleType = redirectFilter && redirectFilter.filter && redirectFilter.filter.vehicleType ?
            _.find(FILTER_BY_VEHICLE_TYPE,
                (f) => {
                    return _.isEqual(f.type, redirectFilter.filter.vehicleType);
                }).value :
            DEFAULT_VEHICLE;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive ?
            _.find(FILTER_BY_ACTIVE, (f) => {
                return f.type === redirectFilter.filter.isActive;
            }).value :
            1;
        this.type = redirectFilter && redirectFilter.filter && redirectFilter.filter.type ?
            _.find(DISCOUNT_TYPE_ARRAY, (f) => {
                return f.type === redirectFilter.filter.type;
            }).value :
            0;
    }
    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" />,
                key: 'index',
                width: '7%',
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: <IntlMessages id="app.promocode.createdOn" />,
                dataIndex: 'createdAt',
                render: (text, record) => {
                    return UtilService.displayDate(record.createdAt);
                }
            },
            {
                title: <IntlMessages id="app.name" />,
                dataIndex: 'name',
                render: (text, report) => {
                    let type = _.find(DISCOUNT_TYPE_ARRAY,
                        (f) => { return f.type === report.type; })
                    return <>{text}{type && <span style={{ marginLeft: 5 }}><Tag color="green">{type.label}</Tag></span>}</>
                }
            },
            {
                title: <IntlMessages id="app.user.codeLabel" />,
                dataIndex: 'code'
            },
            {
                title: <IntlMessages id="app.promocode.redeemCount" />,
                dataIndex: 'redeemCount'
            },
            {
                title: <IntlMessages id="app.description" />,
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
            {
                title: <IntlMessages id="app.status" />,
                dataIndex: 'isActive',
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            <ActiveDeactive
                                onSuccess={this.fetch.bind(this)}
                                documentId={record.id}
                                isActive={text}
                                model="promocode"
                            />
                        </span>
                    );
                }
            },
            {
                title: <IntlMessages id="app.staticpage.actions" />,
                align: 'center',
                width: '120px',
                render: (text, record) => {
                    return (
                        <span>
                            <ActionButtons
                                pageId={PAGE_PERMISSION.PROMOTIONS}
                                view={() => {
                                    return this.showViewModal(record);
                                }}
                                edit={`/e-scooter/promocode/upsert/${record.id}`}
                                filter={this.state.filter}
                            />
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
                'admin/promo-code/paginate',
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
    handleEdit = () => { };
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
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive',
                visible: true
            },
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: 'vehicleType',
                visible: FILTER_VISIBLE
            },
            {
                title: <IntlMessages id="app.type" />,
                list: DISCOUNT_TYPE_ARRAY,
                defaultSelected: this.type,
                key: 'type',
                visible: true
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
                                <h1 className="pageHeading"><IntlMessages id="app.payment.promoCode" /> </h1>
                                <div className="SearchBarwithBtn">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['name', 'code']}
                                        placeholder="Search by Name / Code"
                                    />
                                    <AddButton
                                        link="/e-scooter/promocode/upsert"
                                        text={<IntlMessages id="app.promocode.addPromoCode" />}
                                        pageId={PAGE_PERMISSION.PROMOTIONS}
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
                                            filter.visible &&
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                key={filter.key}
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
                            onChange={this.handleChange}
                            pagination={false}
                        />
                    </div>
                    {this.state.showViewModal &&
                        <PromoCodeView
                            id={this.state.viewId}
                            onCancel={this.hideViewModal.bind(this)}
                        />
                    }
                </div>
            </>
        );
    }
}
export default PromoCode;
