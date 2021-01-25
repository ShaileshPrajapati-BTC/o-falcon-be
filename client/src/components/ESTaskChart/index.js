import { Card, Spin, Empty, Radio } from 'antd';
import React, { Component } from 'react';
import AmCharts from '@amcharts/amcharts3-react';
import axios from 'util/Api';
import IntlMessages from "../../util/IntlMessages";
import _ from 'lodash';

class ChartData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            height: props.height || 500,
            dataProvider: [],
            filter: this.props.filter,
            chartType: 'pie'
        };
    }
    async componentWillReceiveProps(nextProps) {
        if (nextProps.filter) {
            await this.setState((state) => {
                state.filter = nextProps.filter;
            });
            await this.fetchRideSummary();
            this.changeChartType("");
        }
    }
    componentDidMount = async () => {
        await this.fetchRideSummary();
        this.changeChartType("");
    }
    fetchRideSummary = async () => {
        this.setState({ loading: true });
        let url = this.props.id === 'TaskByUser' ? '/admin/task/task-by-user' : '/admin/task/task-by-vehicle'
        try {
            let response = await axios.post(url, this.state.filter);
            if (response && response.code === 'OK') {
                if (response.data) {
                    if (this.props.id === 'TaskByUser') {
                        this.setState({ dataProvider: response.data.taskByUser });
                    } else {
                        this.setState({ dataProvider: response.data.taskByVehicle });
                    }
                }
                this.setState({ loading: false, firstLoading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    changeChartType = (e) => {
        this.setState({ loading: true });
        if (this.state.dataProvider && this.state.dataProvider.length) {
            let type = e && e.target ? e.target.value : this.state.chartType;
            this.setState({ chartType: type })
            if (type === "pie") {
                let chart = AmCharts.makeChart(this.props.id, {
                    type: "pie",
                    theme: "light",
                    dataProvider: this.state.dataProvider,
                    radius: 100,
                    valueField: "count",
                    titleField: "name",
                    // colorField: "color",
                    // labelColorField: 'color',
                    balloon: {
                        fixedPosition: true
                    },
                    export: {
                        enabled: true,
                        menu: []
                    },
                    pullOutRadius: 15,
                });
                this.chart = chart;
            } else {
                let chart = AmCharts.makeChart(this.props.id, {
                    type: "serial",
                    theme: "light",
                    dataProvider: this.state.dataProvider,
                    valueAxes: [{
                        axisAlpha: 0,
                        position: "left",
                        title: "Tasks"
                    }],
                    graphs: [{
                        balloonText: "<b>[[category]]: [[value]]</b>",
                        // fillColorsField: "color",
                        fillAlphas: 0.9,
                        lineAlpha: 0.2,
                        type: "column",
                        valueField: "count"
                    }],
                    chartCursor: {
                        categoryBalloonEnabled: false,
                        cursorAlpha: 0,
                        zoomable: false
                    },
                    categoryField: "name",
                    categoryAxis: {
                        gridPosition: "start",
                        labelRotation: 45
                    },
                    startDuration: 1,
                    balloon: {
                        hideBalloonTime: 1000, // 1 second
                        disableMouseEvents: false, // allow click
                        fixedPosition: true
                    },
                    // colorField: "color",
                    // labelColorField: 'color',
                    export: {
                        enabled: true,
                        menu: []
                    },
                });
                this.chart = chart;
            }
        }
        this.setState({ loading: false });
    };

    render() {
        const { loading } = this.state;
        return (<>
            <Spin spinning={loading} delay={100}>
                <Card className="cardPaddingLess chartCard" style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <div className="cardInnerHead" style={{ marginBottom: 0, padding: 20 }}>
                        <h3 className="dashboardCardTitle">
                            {this.props.title}
                        </h3>
                        <div>
                            <Radio.Group
                                disabled={this.state.loading}
                                defaultValue="pie"
                                buttonStyle="solid"
                                onChange={(e) => {
                                    return this.changeChartType(e);
                                }}
                            >
                                <Radio.Button key="pie" value="pie"><IntlMessages id="app.dashboard.pie" /></Radio.Button>
                                <Radio.Button key="bar" value="bar"><IntlMessages id="app.dashboard.bar" /></Radio.Button>
                            </Radio.Group>
                        </div>
                    </div>
                    {this.state.dataProvider.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        : <div className="graphCanvas">
                            <div
                                id={this.props.id}
                                style={{ width: "100%", height: this.state.height }}
                            />
                        </div>}
                </Card>
            </Spin>
        </>
        );
    }
}
export default ChartData;
