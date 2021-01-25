/* eslint-disable max-lines-per-function */
import './dashboard.less';
import {
    Card, DatePicker, Icon, Popover, Radio, Row, Statistic
} from 'antd';
import React from 'react';
import { ReactComponent as Rides } from './rides.svg';
import moment from 'moment';
const { RangePicker } = DatePicker;

const dateFormat = 'DD/MM/YYYY';
console.log(process.env);
const content = 
    <div>
        <p>Revenue: <span>$500</span></p>
        <p>Rides: <span>17</span></p>
    </div>
;
class Dashboard extends React.Component {

    render() {

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header headerRadius">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">Dashboard</h1>
                    </Row>
                </div>
                <div className="dashboardMain">

                    <div className="dashboardLeft">
                        <Row type="flex" align="middle" justify="space-between">
                            <Card className="CardTwoSec">
                                <div className="cardInnerHead">
                                    <h3 className="dashboardCardTitle">
                                        Today's Summary <Icon type="info-circle" />
                                    </h3>
                                    <div>
                                        <Radio.Group defaultValue="a" buttonStyle="solid">
                                            <Radio.Button value="a">Weekly</Radio.Button>
                                            <Radio.Button value="b">Monthly</Radio.Button>
                                            <Radio.Button value="c">Yearly</Radio.Button>
                                        </Radio.Group>
                                    </div>
                                </div>

                                <div className="cardSummeryInsight">
                                    <div className="cardSummeryInsightInsight">
                                        <div className="iconBox">
                                            <Rides />
                                        </div>
                                        <div className="countBox">
                                            <h4>25</h4>
                                            <div className="countLabel">Completed Rides</div>
                                        </div>
                                    </div>
                                    <div className="cardSummeryInsightInsight">
                                        <div className="iconBox">
                                            <Rides />
                                        </div>
                                        <div className="countBox">
                                            <h4>53</h4>
                                            <div className="countLabel">Ongoing Rides</div>
                                        </div>
                                    </div>
                                    <div className="cardSummeryInsightInsight">
                                        <div className="iconBox">
                                            <Rides />
                                        </div>
                                        <div className="countBox">
                                            <h4>19</h4>
                                            <div className="countLabel">Cancelled Rides</div>
                                        </div>
                                    </div>
                                    <div className="cardSummeryInsightInsight">
                                        <div className="iconBox">
                                            <Rides />
                                        </div>
                                        <div className="countBox">
                                            <h4>57</h4>
                                            <div className="countLabel">Reserved Rides</div>
                                        </div>
                                    </div>
                                    <div className="cardSummeryInsightInsight">
                                        <div className="iconBox">
                                            <Rides />
                                        </div>
                                        <div className="countBox">
                                            <h4>$781</h4>
                                            <div className="countLabel">Total Income</div>
                                        </div>
                                    </div>
                                </div>

                            </Card>
                        </Row>
                        <Row type="flex" align="middle" justify="space-between">
                            <Card className="CardTwoSecHalf">
                                <div className="cardInnerHead">
                                    <h3 className="dashboardCardTitle">
                                        Scooter Statistics <Icon type="info-circle" />
                                    </h3>
                                </div>
                                <Row type="flex" align="middle" justify="space-between">
                                    <div className="cardHalfCont">
                                        <div className="cardHalfContInSect">
                                            <h4>Highly used scooters</h4>
                                            <h2>25</h2>
                                        </div>
                                        <div className="cardHalfSeparated"></div>
                                        <div className="cardHalfContInSect">
                                            <h4>Average used scooters</h4>
                                            <h2>31</h2>
                                        </div>
                                        <div className="cardHalfSeparated"></div>
                                        <div className="cardHalfContInSect">
                                            <h4>Unused scooters</h4>
                                            <h2>9</h2>
                                        </div>
                                    </div>
                                    <div className="cardHalfContBorder"></div>
                                    <div className="cardHalfCont">
                                        <div className="cardHalfContInSect">
                                            <h4>Active scooters</h4>
                                            <h2>70<span>/100</span></h2>
                                        </div>
                                        <div className="cardHalfSeparated"></div>
                                        <div className="cardHalfContInSect">
                                            <h4>Average Location</h4>
                                            <h2>0</h2>
                                        </div>
                                        <div className="cardHalfSeparated"></div>
                                        <div className="cardHalfContInSect">
                                            <h4>Active Users</h4>
                                            <h2>900<span>/1000</span></h2>
                                        </div>
                                    </div>
                                </Row>
                            </Card>
                        </Row>
                        <Row type="flex" align="middle" justify="space-between">
                            <Card className="cardPaddingLess chartCard">
                                <div className="graphFilterWithCalander gx-d-flex">
                                    <div className="filterChart">
                                        <ul>
                                            <li>1W</li>
                                            <li>2w</li>
                                            <li>1m</li>
                                            <li>3m</li>
                                            <li className="active">1Y</li>
                                            <li>All</li>
                                        </ul>
                                    </div>
                                    <div className="dateRanges">
                                        <RangePicker
                                            defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
                                            format={dateFormat}
                                        />
                                    </div>
                                </div>
                                <div className="statisticUi">
                                    <div className="active StatisticCard">
                                        <Statistic title="Active Users" value={112893} />
                                    </div>
                                    <div className="StatisticCard">
                                        <Statistic title="Active Users" value={112893} />
                                    </div>
                                    <div className="StatisticCard">
                                        <Statistic title="Active Users" value={112893} />
                                    </div>
                                </div>
                                <div className="graphCanvas">
                                    <img alt="" src={require('assets/images/graph-dashboard.png')}/>
                                </div>
                            </Card>
                        </Row>
                        <Row type="flex" align="middle" justify="space-between">
                            <Card className="CardTwoSec">
                                <div className="cardInnerHead">
                                    <h3 className="dashboardCardTitle">
                                        Booking Habits <Icon type="info-circle" />
                                    </h3>
                                </div>
                                <div className="habitTable">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>Mon</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <Popover className="habitPopover" content={content}>
                                                        <div className="habitDots habitActiveDot"></div>
                                                    </Popover>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <Popover className="habitPopover" content={content}>
                                                        <div className="habitDots habitActiveDot"></div>
                                                    </Popover>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Tue</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Wed</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <Popover className="habitPopover" content={content}>
                                                        <div className="habitDots habitActiveDot"></div>
                                                    </Popover>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Thu</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Fri</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Sat</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <Popover className="habitPopover" content={content}>
                                                        <div className="habitDots habitActiveDot"></div>
                                                    </Popover>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Sun</td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <Popover className="habitPopover" content={content}>
                                                        <div className="habitDots habitActiveDot"></div>
                                                    </Popover>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                                <td>
                                                    <div className="habitDots"></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td>
                                                12am
                                                </td>
                                                <td>
                                                1am
                                                </td>
                                                <td>
                                                2am
                                                </td>
                                                <td>
                                                3am
                                                </td>
                                                <td>
                                                4am
                                                </td>
                                                <td>
                                                5am
                                                </td>
                                                <td>
                                                6am
                                                </td>
                                                <td>
                                                7am
                                                </td>
                                                <td>
                                                8am
                                                </td>
                                                <td>
                                                9am
                                                </td>
                                                <td>
                                                10am
                                                </td>
                                                <td>
                                                11am
                                                </td>
                                                <td>
                                                12pm
                                                </td>
                                                <td>
                                                1pm
                                                </td>
                                                <td>
                                                2pm
                                                </td>
                                                <td>
                                                3pm
                                                </td>
                                                <td>
                                                4pm
                                                </td>
                                                <td>
                                                5pm
                                                </td>
                                                <td>
                                                6pm
                                                </td>
                                                <td>
                                                7pm
                                                </td>
                                                <td>
                                                8pm
                                                </td>
                                                <td>
                                                9pm
                                                </td>
                                                <td>
                                                10pm
                                                </td>
                                                <td>
                                                11pm
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </Row>
                    </div>

                    <div className="dashboardRight">
                        <div className="dashboardRightInner">
                            <div className="cardInnerHead">
                                <h3 className="dashboardCardTitle">
                                    Statistics <Icon type="info-circle" />
                                </h3>
                            </div>
                            <div className="statisticsBox">
                                <div className="statisticLeft">Total</div>
                                <div className="statisticCenter">
                                    <div className="statisticInnerGradient">
                                        <div className="statisticInnerWhite">
                                            $260
                                        </div>
                                    </div>
                                </div>
                                <div className="statisticRight">Revenue</div>
                            </div>
                            <div className="statisticsBox">
                                <div className="statisticLeft">Total</div>
                                <div className="statisticCenter">
                                    <div className="statisticInnerGradient">
                                        <div className="statisticInnerWhite">
                                            24
                                        </div>
                                    </div>
                                </div>
                                <div className="statisticRight">Rides</div>
                            </div>
                            <div className="statisticsBox">
                                <div className="statisticLeft">Cancelled</div>
                                <div className="statisticCenter">
                                    <div className="statisticInnerGradient">
                                        <div className="statisticInnerWhite">
                                            04
                                        </div>
                                    </div>
                                </div>
                                <div className="statisticRight">Rides</div>
                            </div>
                            <div className="statisticsBox">
                                <div className="statisticLeft">Open</div>
                                <div className="statisticCenter">
                                    <div className="statisticInnerGradient">
                                        <div className="statisticInnerWhite">
                                           07
                                        </div>
                                    </div>
                                </div>
                                <div className="statisticRight">Disputed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default Dashboard;
