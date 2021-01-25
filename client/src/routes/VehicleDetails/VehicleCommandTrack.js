import { CHARGE_TYPE, FILTER_BY_PAYMENT_STATUS } from '../../constants/Common';
import { Empty, Table, Tag, message, Tooltip, Anchor, Collapse, Card } from 'antd';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import UtilService from '../../services/util';
import axios from 'util/Api';
import ESTag from '../../components/ESTag';
import { Link } from 'react-router-dom';
import IntlMessages from '../../util/IntlMessages';
const { Panel } = Collapse;
const _ = require('lodash');

class VehicleCommandTrack extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.IOTLogTrack,
            loading: false,
            hasMore: true,
            filter: {
                page: 1,
                limit: 10,
                sort: "createdAt DESC",
                filter: {
                    imei: props.data && props.data.imei ? props.data.imei : ''
                }
            },
            count: props.IOTLogTrackCount
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.IOTLogTrack !== !this.props.data) {
            this.setState({ data: nextProps.IOTLogTrack });
        }
        if (nextProps.IOTLogTrackCount !== !this.props.count) {
            this.setState({ count: nextProps.IOTLogTrackCount });
        }
        if (nextProps.data) {
            this.setState((state) => state.filter.filter.imei = nextProps.data.imei)
        }
    }
    fetch = async () => {
        try {
            let response = await axios.post('admin/IOTCommandTrack/paginate', this.state.filter);
            this.setState({ data: this.state.data.concat(response.data.list), count: response.data.count, loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    handleInfiniteOnLoad = () => {
        console.log('yes');
        let { data, count } = this.state;
        this.setState({
            loading: true
        });
        if (data.length > count - 1) {
            message.warning('No more data');
            this.setState({
                hasMore: false,
                loading: false
            });

            return;
        }
        const page = this.state.filter.page + 1;
        this.setState((state) => {
            state.filter.page = page;
        });
        this.fetch();
    };

    render() {
        const { data, loading } = this.state;

        return (
            <Card
                title={<IntlMessages id="app.vehicle.commandTrack" defaultMessage="Command Track" />}
                // loading={this.state.loading}
                className="cardPaddingLess vehicleStatusCard"
            >

                <div style={{ overflow: 'auto', height: '300px' }}>
                    <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loadMore={this.handleInfiniteOnLoad.bind(this)}
                        hasMore={!this.state.loading && this.state.hasMore}
                        useWindow={false}
                    >
                        {data && data.length ?
                            <Collapse
                                // style={{ display: 'flex' }}
                                defaultActiveKey={['0']}>
                                {_.map(data, (item, index) => {
                                    let header = <div>
                                        {item.logType === 1 ? <IntlMessages id="app.vehicle.request" defaultMessage="Request : " />  : <IntlMessages id="app.vehicle.response" defaultMessage="Response : " /> }
                                        <b>{item.commandName}</b>
                                        <span style={{ paddingLeft: 20 }}>
                                            <i>{UtilService.displayDate(item.createdAt)}</i>
                                        </span>
                                    </div>
                                    return (
                                        <Panel
                                            header={header}
                                            key={index}
                                        >
                                            {item.logType === 1 &&
                                                <>
                                                    {item.sentCommand &&
                                                        <>
                                                            <div className="iotCommandResponse">
                                                                <pre >{
                                                                    item.sentCommand
                                                                }</pre>
                                                            </div>
                                                        </>}
                                                </>}
                                            {item.logType === 2 &&
                                                <>
                                                    {item.actualCallback &&
                                                        <>
                                                            <h4>Actual Callback : </h4>
                                                            <div className="iotCommandResponse">
                                                                <pre >{
                                                                    item.actualCallback
                                                                }</pre>
                                                            </div>
                                                        </>}
                                                    {item.decodedCallback &&
                                                        <>
                                                            <h4>Decoded Callback : </h4>
                                                            <div className="iotCommandResponse">
                                                                <pre >{
                                                                    JSON.stringify(item.decodedCallback, null, 2)
                                                                }</pre>
                                                            </div>
                                                        </>}
                                                </>}
                                        </Panel>
                                    );
                                })}
                            </Collapse>
                            :
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </InfiniteScroll>
                </div>
            </Card>

        );
    }
}

export default VehicleCommandTrack;
