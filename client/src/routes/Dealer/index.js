/* eslint-disable max-lines-per-function */
import { Affix, List, Row } from 'antd';
import { PAGE_PERMISSION, USER_TYPES, SORT_BY_ARRAY_USER, FILTER_BY_ACTIVE, DEALER_LABEL, DEALER_ROUTE, BASE_URL } from '../../constants/Common';
import React, { Component } from 'react';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import AddButton from '../../components/ESAddButton';
import { ReactComponent as ChangePassword } from '../../assets/svg/change-password.svg';
import ESPagination from '../../components/ESPagination';
import { ReactComponent as Email } from '../../assets/svg/email.svg';
import FilterDropdown from '../../components/FilterDropdown';
import { ReactComponent as Mobile } from '../../assets/svg/mobile.svg';
import { Link } from 'react-router-dom';
import ResetPasswordForm from '../Users/resetPassword';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';
import { getFranchisee } from "../../appRedux/actions/franchisee";
import { getDealer } from "../../appRedux/actions/dealer";
import ESToolTip from '../../components/ESToolTip';
import Search from '../../components/ESSearch';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
class Dealer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
      paginate: false,
      filter: {
        page: 1,
        limit: 20,
        sort: 'createdAt DESC',
        filter: {
          type: USER_TYPES.DEALER,
          isDeleted: false
        }
      },
      isResetPasswordModalVisible: false,
      resetPasswordId: null
    };
    this.sort = 3;
    this.isDesc = true;
    this.isActive = 1;
  }

  async componentDidMount() {
    if (this.props.franchiseeId) {
      this.setState((state) => {
        state.filter.filter.franchiseeId = this.props.franchiseeId;
      })
    }
    this.fetch()
  }
  async fetch(page) {
    await this.props.getFranchisee();
    await this.props.getDealer();
    this.setState({ loading: true });
    if (page) {
      this.setState((state) => {
        state.filter.page = page;
        return state;
      });
    }
    try {
      let response = await axios.post('admin/dealer/paginate', this.state.filter);
      if (response.code === 'OK') {
        this.setState({
          total: response.data.count,
          loading: false,
          data: response.data.list,
          paginate: true
        });
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      console.log('ERROR   ', error);
    }
  }
  handleSelection = (selectedVal, isAscending, key, listData) => {
    let self = this;

    let obj = {
      selectedVal: selectedVal,
      isAscending: isAscending,
      key: key,
      listData: listData
    };
    let data = UtilService.commonFilter(obj);
    self[key] = selectedVal;
    self.setState((state) => {
      if (data !== 'error') {
        if (key === 'sort') {
          state.filter[key] = data;
        } else {
          state.filter.filter[key] = data.type;
        }
      } else if (key === "sort") {
        delete state.filter[key];
      } else {
        delete state.filter.filter[key];
      }
    });

    self.setState((state) => {
      state.filter.page = 1;
      state.paginate = false;
    }, () => self.fetch());
  };

  onSearch = (newState) => {
    this.setState({
      filter: newState,
      paginate: false
    }, () => this.fetch());
  };

  handleResetPassword = (id) => {
    this.setState(prevState => ({
      isResetPasswordModalVisible: !prevState.isResetPasswordModalVisible,
      resetPasswordId: id ? id : null
    }))
  }
  render() {
    const { loading, data, isResetPasswordModalVisible, resetPasswordId } = this.state;
    let FilterArray = [
      {
        title: <IntlMessages id="app.sortBy" defaultMessage="Sort by" />,
        list: SORT_BY_ARRAY_USER,
        sorter: true,
        isDesc: this.isDesc,
        defaultSelected: this.sort,
        key: 'sort'
      },
      {
        title: <IntlMessages id="app.status" defaultMessage="Status" />,
        list: FILTER_BY_ACTIVE,
        defaultSelected: this.isActive,
        key: 'isActive'
      }
    ];
    return (
      <div className="gx-module-box gx-mw-100">
        <Affix offsetTop={1}>
          <div className="gx-module-box-header">
            <Row type="flex" align="middle" justify="space-between">
              <h1 className="pageHeading">{DEALER_LABEL}</h1>
              <div className="SearchBarwithBtn">
                <Search
                  handelSearch={this.onSearch}
                  filter={this.state.filter}
                  keys={[
                    'name',
                    'emails.email',
                    'mobiles.mobile'
                  ]}
                  placeholder="Search by name, email or mobile"
                />
                {!this.props.franchiseeId && <AddButton
                  link={`/e-scooter/${DEALER_ROUTE}/upsert`}
                  text={<span style={{ display: "flex" }}><IntlMessages id="app.add" defaultMessage="Add" /> {DEALER_LABEL}</span>}
                  pageId={PAGE_PERMISSION.DEALER}
                // filter={this.state.filter}
                />}
              </div>
            </Row>
            <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
              <div className="DropdownWidth">
                {FilterArray.map((filter, index) => {

                  return <FilterDropdown
                    key={index}
                    title1={filter.title}
                    list={filter.list}
                    sorter={filter && filter.sorter}
                    isDesc={filter && filter.isDesc}
                    defaultSelected={filter.defaultSelected}
                    handleSelection={(val, isAscending) => {
                      this.handleSelection(val, isAscending, filter.key, filter.list);
                    }} />;
                })
                }
              </div>
              {this.state.paginate && <ESPagination
                limit={this.state.filter.limit}
                total={this.state.total}
                fetch={this.fetch.bind(this)}
                page={this.state.filter.page}
              />}
            </Row>
          </div>
        </Affix>
        <div className="RidersList RidersListingWithWidth">
          <List itemLayout="horizontal"
            dataSource={data}
            loading={loading}
            renderItem={(item) => {
              return (
                <List.Item>
                  <div className="ant-list-item-meta">
                    <div className="totalRideCounter ant-list-item-meta-avatar" style={{ marginRight: 16 }}>
                      <span className="ant-avatar ant-avatar-circle ant-avatar-image">
                        {item.image ?
                          <img alt="" src={`${BASE_URL}/${item.image}`} /> :
                          <h2>{item.name.charAt(0).toUpperCase()}</h2>
                        }
                      </span>
                      <span>
                        <IntlMessages id="app.dealer.numberOfScooterAssigned" defaultMessage="Number of scooter assigned" />
                        : {item.vehicleSummary ? item.vehicleSummary.totalScooter : '-'}
                      </span>
                    </div>
                    <div className="ant-list-item-meta-content">
                      {this.props.franchiseeId ?
                        <div>
                          <h3 style={{ textTransform: 'capitalize' }}>
                            <b style={{ color: 'black' }}>{item.name}</b>
                          </h3>
                        </div >
                        : <div className="gx-pointer">
                          <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }}>
                            <Link to={`/e-scooter/${DEALER_ROUTE}/view/${item.id}`}>
                              <b style={{ color: 'black' }}>{item.name}</b></Link>
                          </h3>
                        </div >}
                      {/* <UserId name={item.name} userId={item.id} /> */}
                      <div className="gx-flex-row" style={{ marginTop: '-5px' }}>
                        <div className="ant-list-item-meta-description" style={{ marginRight: '50px' }}>
                          <Mobile />
                          {item.mobiles && _.size(item.mobiles) > 0 &&
                            UtilService.getPrimaryValue(item.mobiles, 'mobile')}
                        </div>
                        <div className="ant-list-item-meta-description">
                          <Email />
                          {item.emails && _.size(item.emails) > 0 &&
                            UtilService.getPrimaryValue(item.emails, 'email')}
                        </div>
                      </div>
                    </div>
                    <div className="cardRightThumb">
                      <div className="cardRightContainer">
                        <div className="action-btnsWithSignupDate">
                          <div className="ActionNotification">
                            {!this.props.franchiseeId && <ActiveDeactive
                              onSuccess={this.fetch.bind(
                                this
                              )}
                              key={item.id}
                              documentId={item.id}
                              isActive={
                                item.isActive
                              }
                              model="user"
                            />}

                            <div className="scooterActionItem">
                              {!this.props.franchiseeId && <ActionButtons
                                pageId={
                                  PAGE_PERMISSION.DEALER
                                }
                                edit={`/e-scooter/${DEALER_ROUTE}/upsert/${item.id}`}
                                view={`/e-scooter/${DEALER_ROUTE}/view/${item.id}`}
                                filter={this.state.filter}
                              />}
                              {!this.props.franchiseeId && <div className="scooterIC">
                                <a
                                  href="/#" onClick={(e) => {
                                    e.preventDefault();
                                    this.handleResetPassword(item.id)
                                  }}
                                >
                                  <ESToolTip placement="top" text={<IntlMessages id="app.resetPassword" defaultMessage="Reset Password" />}>
                                    <ChangePassword />
                                  </ESToolTip>
                                </a>
                              </div>}
                            </div>
                          </div>
                          <div className="signupDate">
                            <IntlMessages id="app.signUpDate" defaultMessage="Signup Date" />: {UtilService.displayDate(item.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>);
            }}
          />
        </div>
        {
          isResetPasswordModalVisible &&
          <ResetPasswordForm
            visible={isResetPasswordModalVisible}
            onCancel={this.handleResetPassword}
            resetPasswordId={resetPasswordId}
          />
        }
      </div>
    );
  }
}


const mapStateToProps = function (props) {
  return props;
};
export default connect(mapStateToProps, { getFranchisee, getDealer })(Dealer);