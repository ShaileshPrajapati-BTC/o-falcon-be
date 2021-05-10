import './dashboard.less';
import { Card, Spin, Icon } from 'antd';
import { Redirect } from 'react-router-dom';
import ESToolTip from '../../components/ESToolTip'
import React from 'react';
import UtilService from '../../services/util';
import _ from 'lodash';
import axios from 'util/Api';
import VehicleSvg from '../../components/ESVehicleSvg';
import IntlMessages from "../../util/IntlMessages";
import { DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, FRANCHISEE_LABEL } from '../../constants/Common';


class FranchiseeSummary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      summaryData: [
        { name: FRANCHISEE_LABEL, key: 'franchisee', value: 5 },
        { name: <IntlMessages id="app.dashboard.totalRide" />, key: 'totalRide', value: 5 },
        { name: <IntlMessages id="app.dashboard.totalRevenue" />, key: 'totalRevenue', value: 5 },
        { name: <IntlMessages id="app.dashboard.totalVehicle" />, key: 'totalVehicle', value: 5 },
        // { name: 'Total Commission', key: 'totalCommission', value: 5 },
        // { name: 'Payable Commission', key: 'payableCommission', value: 5 }
      ],
      title: FRANCHISEE_LABEL,
      filter: {
        filter: {
          vehicleType: FILTER_BY_VEHICLE_TYPE[0].type,
          // franchiseeId: null
        }
      },
      loading: false,
      firstLoading: true,
      status: 0
    };

  }

  componentDidMount() {
    this.fetchFranchiseeSummary();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      this.setState((state) => {
        state.filter.filter.vehicleType = nextProps.filter.type;
        state.filter.filter.franchiseeId = nextProps.filter.franchisee
      }, () => {
        this.fetchFranchiseeSummary();
      });
    }
  }
  fetchFranchiseeSummary = async () => {
    this.setState({ loading: true });
    try {
      let response = await axios.post('admin/dashboard/get-franchisee-summary', this.state.filter);
      if (response && response.code === 'OK') {
        if (response.data && _.size(response.data)) {
          let tempData = [...this.state.summaryData];
          _.each(tempData, (data) => {
            data.value = response.data[data.key];
          });

          this.setState({ summaryData: tempData });
        }
        this.setState({ loading: false, firstLoading: false });
      }
    } catch (error) {
      console.log('Error****:', error.message);
      this.setState({ loading: false });
    }
  }


  render() {
    const { firstLoading, summaryData, title, loading, filter, status } = this.state;
    if (status !== 0) {
      return <Redirect to={{
        pathname: '/e-scooter/rides',
        vehicleStatus: status,
        filter: filter
      }} />;
    }

    return (
      <Card loading={firstLoading} className="CardTwoSec">
        <div className="cardInnerHead">
          <h3 className="dashboardCardTitle">
            {title}
            <ESToolTip text={<IntlMessages id="app.dashboard.partnerTooltip" />} placement="top">
              <Icon type="info-circle" />
            </ESToolTip>

          </h3>
        </div>
        <Spin spinning={loading} delay={100}>
          <div className="cardSummeryInsight">
            {summaryData.map((data, index) => {
              // const status = data.status;
              return < div className="cardSummeryInsightInsight" key={data.key} onClick={() => { return data.status ? this.setState({ status: data.status }) : ' ' }}>
                {filter.filter.vehicleType && <VehicleSvg
                  type={filter.filter.vehicleType}
                  name="VehicleType"
                  status={1} />}
                <div className="countBox">
                  <h4>{data.key === 'totalFare' ? UtilService.displayPrice(data.value) : UtilService.displayNumber(data.value)}</h4>
                  <div className="countLabel">{data.name}</div>
                </div>
              </div >;
            })
            }
          </div>
        </Spin>
      </Card >
    );
  }

}
export default FranchiseeSummary;
