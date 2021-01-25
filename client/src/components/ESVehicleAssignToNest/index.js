import {
    Modal, Row, message, List
} from 'antd';
import React from 'react';
import axios from 'util/Api';
import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import { ReactComponent as SelectCheck } from "../../assets/svg/selectCheck.svg";
import ESPagination from '../../components/ESPagination';
import { DEFAULT_API_ERROR, NEST_ROUTE, NEST_LABEL } from '../../constants/Common';
import CustomScrollbars from '../../util/CustomScrollbars';
const _ = require("lodash");

class AssignVehicle extends React.Component {   //componentName
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedRecord: [],
            total: 0,
            loading: false,
            paginate: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {}
            },
        }
    }
    componentDidMount() {
        this.fetch();
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
            let response = await axios.post('/admin/nest/paginate', this.state.filter);
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
    onSearch = (newState) => {
        this.setState({
            filter: newState,
            paginate: false
        }, () => { this.fetch(); }
        );
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
            () => { return self.fetch() }
        );
    };
    handleSubmit = async () => {
        if (this.state.selectedRecord.length === 0) {
            message.error(`Please select ${NEST_ROUTE}!`);
            return;
        }
        if (this.state.selectedRecord.length > 1) {
            message.error(`Please select only one ${NEST_ROUTE}!`);
            return;
        }
        let url = `/admin/nest/assign-vehicle`;
        let method = `post`;
        let obj = { vehicleId: [this.props.vehicleId], nestId: this.state.selectedRecord[0] }

        try {
            let response = await axios[method](url, obj);
            if (response.code === 'OK') {
                message.success(`${response.message}`);
                this.setState({ selectedRecord: [] })
                this.props.onSubmit();
            } else {
                message.error(`${response.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    selectRecord = id => {
        if (id) {
            let selectedRecord = [];
            this.setState({ selectedRecord: [] })
            let data = [...this.state.data]
            _.map(data, function (e) { e.selected = false });
            let index = _.findIndex(data, { id: id });
            if (index >= 0) {
                data[index].selected = !data[index].selected;
                if (data[index].selected) {
                    selectedRecord.push(id);
                } else {
                    let existId = _.indexOf(this.state.selectedRecord, id);
                    this.state.selectedRecord.splice(existId, 1);
                }
            }
            this.setState({ selectedRecord })
        }
    };
    render() {
        const { onCancel } = this.props;
        const { data, loading } = this.state;
        return (
            <Modal
                visible={true}
                title={`Add Vehicle to ${NEST_LABEL}`}      //Modal title
                okText='Add'      //add button text
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Row type="flex" align="middle" justify="space-between">
                    {this.state.paginate ?
                        <ESPagination
                            limit={this.state.filter.limit}
                            total={this.state.total}
                            fetch={this.fetch.bind(this)}
                            page={this.state.filter.page}
                        />
                        : null}
                    <div className="SearchBarwithBtn" >
                        <Search
                            handelSearch={this.onSearch}
                            filter={this.state.filter}
                            keys={['name']}
                            placeholder="Search by Name"
                        />
                    </div>
                </Row>
                <div className="RidersList" style={{ padding: '20px 0px', height: 350, overflow: 'hidden' }}>
                    <CustomScrollbars className="gx-module-content-scroll" >
                        <List
                            itemLayout="horizontal"
                            dataSource={data}
                            loading={loading}
                            renderItem={(item) => {
                                return (
                                    <List.Item className={item.selected ? "list-item-selected" : ""}>
                                        <div className="ant-list-item-meta">
                                            <div className="ant-list-item-meta-avatar gx-pointer">
                                                <div className="totalRideCounter" onClick={() => this.selectRecord(item.id)}>
                                                    <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                                        {item.selected ?
                                                            <SelectCheck /> :
                                                            <h2 style={{ lineHeight: "70px" }}  >
                                                                {item.name.charAt(0).toUpperCase()}
                                                            </h2>
                                                        }</span>
                                                </div>
                                            </div>
                                            <div className="ant-list-item-meta-content">
                                                <div className="ant-list-item-meta">
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        <b>{item.name} </b>{' '}
                                                    </div>
                                                    <div className="ant-list-item-meta-description">
                                                        <div className="connectionStatus">
                                                            <div className="lbl">
                                                                {/* {item.connectionStatus ?
                                                                <Tag color="green">Connected</Tag>
                                                                : <Tag color="red">Not Connected</Tag>
                                                            }
                                                            {item.isActive ?
                                                                <Tag color="green">Active</Tag>
                                                                : <Tag color="red">Deactive</Tag>
                                                            } */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-list-item-meta-content">
                                                    <div className="gx-flex-row d-block-xs">
                                                        <div className="signupDate" style={{ marginTop: '0px' }}>
                                                            Capacity:{' '}
                                                            <b>{item.capacity} </b>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cardRightThumb">
                                                <div className="cardRightContainer flex-align-center">
                                                    <div className="action-btnsWithSignupDate">
                                                        <div className="signupDate">
                                                            Available Slots of Vehicle:{' '}
                                                            <b>{item.capacity - item.totalVehicles} </b>
                                                        </div>
                                                        <div className="signupDate">
                                                            Rides:{' '}
                                                            <b>{item.totalRides} </b>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </CustomScrollbars>
                </div>
            </Modal>
        );
    }
}


export default AssignVehicle; 