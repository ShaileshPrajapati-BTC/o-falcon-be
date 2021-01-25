import './dashboard.less';
import { Spin } from 'antd';

import React from 'react';
import UtilService from '../../services/util';
import _ from 'lodash';
import axios from 'util/Api';
import IntlMessages from "../../util/IntlMessages";

class TaskSummary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            summaryData: [
                { name: <IntlMessages id="app.dashboard.unassignedTask" />, key: 'unassignedCount', value: 0 },
                { name: <IntlMessages id="app.dashboard.totalTask" />, key: 'totalTask', value: 0 },
                { name: <IntlMessages id="app.dashboard.overDueTask" />, key: 'overDueTask', value: 0 },
                { name: <IntlMessages id="app.dashboard.inProgressTask" />, key: 'totalInProgressTask', value: 0 }
            ],
            filter: this.props.filter,
            loading: false,
            status: 0
        };
    }
    componentDidMount() {
        this.fetchRideSummary();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.filter) {
            this.setState((state) => {
                state.filter = nextProps.filter;
            }, () => {
                this.fetchRideSummary();
            });
        }
    }
    fetchRideSummary = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/task/task-summary', this.state.filter);
            if (response && response.code === 'OK') {
                if (response.data && _.size(response.data)) {
                    let tempData = [...this.state.summaryData];
                    _.each(tempData, (data) => {
                        data.value = response.data[data.key];
                    });
                    this.setState({ summaryData: tempData });
                }
                this.setState({ loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    render() {
        const { summaryData, loading } = this.state;

        return (
            <>
                <Spin spinning={loading} delay={100}>
                    <div className="cardSummeryInsight">
                        {summaryData.map((data) => {
                            return < div className="cardSummeryInsightInsight"
                                key={data.key}
                                style={{ width: '24%' }}
                            >
                                <div className="countBox">
                                    <h4>{UtilService.displayNumber(data.value)}</h4>
                                    <div className="countLabel">{data.name}</div>
                                </div>
                            </div >;
                        })
                        }
                    </div>
                </Spin>
            </>
        );
    }
}
export default TaskSummary;

