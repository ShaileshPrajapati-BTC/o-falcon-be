import {
    Modal, Empty, Spin, Row, DatePicker
} from 'antd';
import { SUBSCRIPTION_LABEL } from '../../constants/Common';
import React from 'react';
import axios from 'util/Api';
import ESRidesStatusCard from '../../components/ESRidesStatusCard';
import ESPagination from '../../components/ESPagination';
import moment from 'moment';
import UtilService from '../../services/util';
import FilterDropdown from '../../components/FilterDropdown';
import { FILTER_VISIBLE, RIDE_STATUS, RIDE_STATUS_ARRAY, DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
class PlanRides extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            data: [],
            total: 0,
            paginate: false,
            filter: {
                page: 1,
                limit: 5,
                filter: {
                    createdAt: {
                        ">=": UtilService.getStartOfTheDay(moment()
                            .subtract(1, "months")
                            .startOf("day")
                            .toISOString()),
                        "<=": UtilService.getEndOfTheDay(moment().toISOString())
                    },
                    userId: props.ridesObj.userId,
                    planInvoiceId: props.ridesObj.planInvoiceId,
                    status: RIDE_STATUS.ON_GOING,
                    vehicleType: FILTER_BY_VEHICLE_TYPE[0].type,
                }
            },
            date: [moment().subtract(1, 'months'), moment()]
        };

        this.status = RIDE_STATUS.ON_GOING;
        this.vehicleType = DEFAULT_VEHICLE;
    }
    componentDidMount() {
        this.fetch();
    }
    fetch = async (page) => {
        this.setState({ loading: true })
        if (page) {
            this.setState((state) => {
                state.filter.page = page;
                return state;
            });
        }
        try {
            let response = await axios.post('admin/ride-booking/paginate', this.state.filter);
            let updateData = {
                total: response.data.count,
                loading: false,
                data: response.data.list,
                paginate: true
            };
            this.setState(updateData);
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({
                total: 0,
                loading: false,
                paginate: true,
                data: [],
            });
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
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            }
            else {
                delete state.filter.filter[key];
            }
        });
        self.setState(
            (state) => {
                state.filter.page = 1;
                state.paginate = false;
                state.locationTrack = 0;
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
        let range = { '>=': from, '<=': to };
        this.setState((state) => {
            state.filter.filter.createdAt = range;
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        });
        this.fetch();
    }
    render() {
        const { onCancel } = this.props;
        const { data, loading } = this.state;

        let FilterArray = [
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: "vehicleType",
                visible: FILTER_VISIBLE
            },
            {
                title: <IntlMessages id="app.browse" />,
                list: RIDE_STATUS_ARRAY,
                defaultSelected: this.status,
                key: "status",
                visible: true
            }
        ];
        return (
            <Modal
                visible={true}
                title={<>{SUBSCRIPTION_LABEL} <IntlMessages id="app.rides" /></>}
                onCancel={onCancel}
                footer=''
                width={750}>
                <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
                    <div className="DropdownWidth d-block-xs">
                        {FilterArray.map((filter) => {
                            return (
                                filter.visible && <FilterDropdown
                                    title1={filter.title}
                                    list={filter.list}
                                    defaultSelected={
                                        filter.defaultSelected
                                    }
                                    handleSelection={(
                                        val
                                    ) => {
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

                    <div className="graphFilterWithCalander gx-d-flex" style={{ marginLeft: '5%' }}>
                        <div className="dateRanges">
                            <RangePicker
                                defaultValue={[moment().subtract(1, 'months'), moment()]}
                                value={this.state.date}
                                format={dateFormat}
                                onChange={this.dateChange.bind(this)}
                            />
                        </div>
                    </div>
                </Row>
                <Row type="flex" align="middle" justify="space-between">
                    <div className="gx-mt-2 gx-profile-banner-top-right" style={{ marginBottom: '10px' }}>
                        {this.state.paginate && data && data.length > 0 ?
                            <ESPagination
                                limit={this.state.filter.limit}
                                total={this.state.total}
                                fetch={this.fetch.bind(this)}
                                page={this.state.filter.page}
                            /> :
                            null}
                    </div>
                </Row>
                <div style={{ maxHeight: '380px', overflow: 'auto' }}>
                    <Spin spinning={loading} delay={100} >
                        {data && data.length ?
                            <ESRidesStatusCard
                                pageName='planrides'
                                data={data}
                                // handleClick={this.handleClick}
                                // toggleMarker={this.toggleMarker}
                                currentPage={window.location.pathname}
                                filter={this.state.filter} />
                            :
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                    </Spin>
                </div>
            </Modal>
        );
    }
}

export default PlanRides;
