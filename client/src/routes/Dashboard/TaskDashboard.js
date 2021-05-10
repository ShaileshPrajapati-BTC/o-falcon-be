import './dashboard.less';
import { Card, Icon, Radio, Tooltip, Row, Col } from 'antd';

import TaskChart from '../../components/ESTaskChart';

import React from 'react';
import UtilService from '../../services/util';
import _ from 'lodash';
import moment from 'moment';

import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE } from '../../constants/Common';
import TaskSummary from './TaskSummary';
import IntlMessages from "../../util/IntlMessages";

const filterData = [
    {
        value: 1,
        name: <IntlMessages id="app.dashboard.today" />,
        dateRange: {
            from: UtilService.getStartOfTheDay(moment().startOf('day')
                .toISOString()),
            to: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    },
    {
        value: 2,
        name: <IntlMessages id="app.dashboard.weekly" />,
        dateRange: {
            from: UtilService.getStartOfTheDay(moment().add(-7, 'days')
                .startOf('day')
                .toISOString()),
            to: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    },
    {
        value: 3,
        name: <IntlMessages id="app.dashboard.monthly" />,
        dateRange: {
            from: UtilService.getStartOfTheDay(moment().add(-1, 'month')
                .startOf('day')
                .toISOString()),
            to: UtilService.getEndOfTheDay(moment().endOf('day')
                .toISOString())
        }
    }
];

class TaskDashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filter: {
                filter: {
                    vehicleType: FILTER_BY_VEHICLE_TYPE[0].type,
                    dateRange: {
                        from: UtilService.getStartOfTheDay(moment().startOf('day')
                            .toISOString()),
                        to: UtilService.getEndOfTheDay(moment().endOf('day')
                            .toISOString()),
                    }
                }
            },
            loading: false,
            firstLoading: true,
            status: 0,
            taskVisible: true
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.filter !== nextProps.filter) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter;
            });
        }
    }

    filterChange = async (e) => {
        await this.setState({ taskVisible: false })
        let filterSummary = _.find(filterData, { value: e.target.value });
        this.setState((state) => {
            state.filter.filter.dateRange.from = filterSummary.dateRange.from;
            state.filter.filter.dateRange.to = filterSummary.dateRange.to;
            state.title = filterSummary.name;
            state.taskVisible = true;
        });
    }

    render() {
        const { loading, filter } = this.state;

        return (
            <Card className="CardTwoSec">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        <IntlMessages id="app.dashboard.taskSummary" />
                        <Tooltip title="Summary of all tasks">
                            <Icon type="info-circle" />
                        </Tooltip>
                    </h3>
                    <div>
                        <Radio.Group disabled={loading} defaultValue={1} buttonStyle="solid"
                            onChange={(e) => {
                                return this.filterChange(e);
                            }}>
                            {filterData.map((data) => {
                                return (
                                    <Radio.Button
                                        key={data.value}
                                        value={data.value}>
                                        {data.name}
                                    </Radio.Button>
                                );
                            })}
                        </Radio.Group>
                    </div>
                </div>
                <Row>
                    <Col span={24}>
                        <TaskSummary filter={this.state.filter} />
                    </Col>
                </Row>
                <Row type="flex" align="middle" justify="space-around" style={{ paddingTop: 15 }}>
                    <Col span={12} style={{ padding: 5 }}>
                        <TaskChart id='TaskByUser' title='Task By User' height={300} filter={this.state.filter} />
                    </Col>
                    <Col span={12} style={{ padding: 5 }}>
                        <TaskChart id='TaskByVehicle' title='Task by Vehicle' height={300} filter={this.state.filter} />
                    </Col>
                </Row>
            </Card >
        );
    }
}
export default TaskDashboard;

