import { List, Row, Affix, Icon } from "antd";
import {
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    SORT_BY_ARRAY_USER,
    USER_TYPES,
    USER_TYPES_ARRAY,
    BASE_URL
} from '../../constants/Common';
import { Redirect } from 'react-router-dom';
import React, { Component } from 'react';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import { ReactComponent as ChangePassword } from '../../assets/svg/change-password.svg';
import ESPagination from '../../components/ESPagination';
import { ReactComponent as Email } from '../../assets/svg/email.svg';
import FilterDropdown from '../../components/FilterDropdown';
import { ReactComponent as DOB } from "../../assets/svg/dob.svg";
import { ReactComponent as Mobile } from '../../assets/svg/mobile.svg';
import ResetPasswordForm from './resetPassword';
import UserInfo from './UserInfo';
import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import axios from 'util/Api';
import { connect } from 'react-redux';
import AddButton from '../../components/ESAddButton';
import ESToolTip from "../../components/ESToolTip";
import IntlMessages from "../../util/IntlMessages";
const _ = require('lodash');

class Users extends Component {
    constructor(props) {
        super(props);
        let userTypes = USER_TYPES_ARRAY;
        const { authUser } = props.auth;

        //userType wise listing in dropdown
        if (authUser.type === USER_TYPES.ADMIN) {
            userTypes = userTypes.slice(2, 4);
        }
        if (authUser.type === USER_TYPES.SUB_ADMIN) {
            userTypes = userTypes.slice(3, 4);
        }

        // if (
        //     authUser.type === USER_TYPES.SUB_ADMIN ||
        //     authUser.type === USER_TYPES.STAFF
        // ) {
        //     userTypes.splice(
        //         userTypes.findIndex(v => {
        //             return v.type === USER_TYPES.ADMIN;
        //         })
        //     );
        // }

        // if (authUser.type === USER_TYPES.STAFF) {
        //     userTypes.splice(
        //         userTypes.findIndex(v => {
        //             return v.type === USER_TYPES.SUB_ADMIN;
        //         })
        //     );
        // }

        this.state = {
            // defaultTab: userType,
            loading: false,
            filterVisible: false,
            resetPasswordModalVisible: false,
            filterApplied: false,
            data: [],
            total: 0,
            paginate: false,
            filter: {
                page: 1,
                limit: 20,
                sort: 'createdAt DESC',
                filter: {
                    type: userTypes[0].type,
                    isDeleted: false,
                    franchiseeId: null
                }
            },
            isTypeRedirect: false,
            showModal: false,
            modalData: '',
            permission: null
        };

        this.userTypes = userTypes;
        let redirectFilter = this.props.location;
        this.type = redirectFilter && redirectFilter.filter && redirectFilter.filter.filter && !_.isArray(redirectFilter.filter.filter.type) ?
            _.find(userTypes, (f) => { return f.value === redirectFilter.filter.filter.type }).value :
            userTypes[0].value;

        // default sort by signup, no need to find from array, because all values are static
        this.sort = redirectFilter && redirectFilter.filter && redirectFilter.filter.sort ?
            _.find(SORT_BY_ARRAY_USER, (f) => { return f.type === redirectFilter.filter.sort.split(" ")[0] }).value :
            3;
        this.isDesc = redirectFilter && redirectFilter.filter && redirectFilter.filter.sort ? redirectFilter.filter.sort.split(" ")[1] === 'ASC' ? false : true : true;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.filter && redirectFilter.filter.filter.isActive ?
            _.find(FILTER_BY_ACTIVE, (f) => { return f.type === redirectFilter.filter.filter.isActive }).value :
            1;
    }

    componentDidMount() {
        const { franchiseeId } = this.props;
        console.log("TCL: Users -> componentDidMount -> franchiseeId", franchiseeId)
        let self = this;
        let filter = this.props.location;
        if (filter && filter.filter) {
            this.setState({ filter: filter.filter, paginate: false }, () => {
                self.fetch();
            });
        } else if (franchiseeId) {
            this.setState((state) => {
                state.filter.filter.franchiseeId = franchiseeId;
            }, () => {
                this.fetch();
            });
        }
        this.fetch();

    }

    fetch(page) {
        this.setState({ loading: true });

        if (page) {
            this.setState((state) => {
                state.filter.page = page;

                return state;
            });
        }
        let self = this;

        axios
            .post('admin/user/paginate', self.state.filter)
            .then((data) => {
                if (data.code === 'OK') {
                    self.setState({
                        total: data.data.count,
                        loading: false,
                        data: data.data.list,
                        paginate: true
                    });
                }

                self.setState({ loading: false });
            })
            .catch((error) => {
                self.setState({ loading: false });
                console.log('ERROR   ', error);
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
            } else if (key === 'sort') {
                delete state.filter[key];
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
    handleResetPassword(id) {
        this.setState({
            resetPasswordModalVisible: true,
            resetPasswordId: id
        });
    }

    handleCancel = () => {
        this.setState({
            createModalVisible: false,
            resetPasswordModalVisible: false,
            resetPasswordId: null
        });
    };
    onView = (id, type) => {
        let data = { id: id, type: type };
        this.setState({ showModal: true, modalData: data });
    };
    handleViewCancel = () => {
        this.setState({ showModal: false });
    };

    getUserType = (value) => {
        for (let key in USER_TYPES_ARRAY) {
            if (
                USER_TYPES_ARRAY[key].type &&
                USER_TYPES_ARRAY[key].type === value
            ) {
                return USER_TYPES_ARRAY[key].val;
            }
        }
    };
    onAdd = () => {
        this.setState({
            isTypeRedirect: true
        });
    };

    render() {
        const {
            defaultTab,
            data,
            loading,
            permission,
            filter,
            isTypeRedirect
        } = this.state;
        const { authUser } = this.props.auth;
        let FilterArray = [
            {
                title: <IntlMessages id="app.browse" />,
                list: this.userTypes,
                defaultSelected: this.type,
                key: 'type',
                visible: authUser.type !== USER_TYPES.FRANCHISEE && !this.props.franchiseeId && this.userTypes.length > 1
            },
            {
                title: <IntlMessages id="app.sortBy" />,
                list: SORT_BY_ARRAY_USER,
                sorter: true,
                isDesc: this.isDesc,
                defaultSelected: this.sort,
                key: "sort",
                visible: true,
            },
            {
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive",
                visible: true,
            }
        ];

        // if (authUser.type === USER_TYPES.STAFF) {
        //     return <Redirect to={"/e-scooter/dashboard"} />;
        // }
        if (permission !== null) {
            return (
                <Redirect
                    to={{
                        pathname: '/e-scooter/roles/upsert',
                        uid: permission,
                        filter: this.state.filter
                    }}
                />
            );
        }
        if (isTypeRedirect) {
            return (
                <Redirect
                    to={{
                        pathname: '/e-scooter/users/upsert',
                        type: filter.filter.type,
                        filter: filter,
                        franchiseeId: this.props.franchiseeId
                    }}
                />
            );
        }

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">{authUser.type === USER_TYPES.FRANCHISEE || this.props.franchiseeId ? <IntlMessages id="app.staff" /> : <IntlMessages id="app.users" />}</h1>
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
                                <AddButton
                                    // link={linkto}
                                    onClick={this.onAdd}
                                    text={authUser.type === USER_TYPES.FRANCHISEE || this.props.franchiseeId ? <IntlMessages id="app.user.addStaff" /> : <IntlMessages id="app.user.addUser" />}

                                    pageId={PAGE_PERMISSION.USERS}
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
                                {this.userTypes.length > 0
                                    ? FilterArray.map((filter, i) => {
                                        return (filter.visible &&
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                sorter={
                                                    filter && filter.sorter
                                                }
                                                isDesc={
                                                    filter && filter.isDesc
                                                }
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                key={i}
                                                handleSelection={(
                                                    val,
                                                    isAscending
                                                ) => {
                                                    this.handleSelection(
                                                        val,
                                                        isAscending,
                                                        filter.key,
                                                        filter.list
                                                    );
                                                }}
                                            />
                                        );
                                    }) :
                                    ''}
                            </div>
                            {this.state.paginate ?
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                    page={this.state.filter.page}
                                /> :
                                null}
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList RidersListingWithWidth">
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={loading}
                        renderItem={(item) => {
                            return (
                                <List.Item>
                                    <div className="ant-list-item-meta ant-list-item-meta-avatar">
                                        <div
                                            className="totalRideCounter"
                                            style={{ marginRight: 16 }}
                                        >
                                            <span className={`ant-avatar ant-avatar-circle ant-avatar-image ${item.image ? ' full-img-avatar' : ''}`}>
                                                {item.image ?
                                                    <img
                                                        alt=""
                                                        src={`${BASE_URL}/${item.image}`}
                                                    /> :
                                                    <h2>
                                                        {item.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </h2>
                                                }
                                            </span>
                                        </div>
                                        <div className="ant-list-item-meta-content">
                                            <div className="gx-pointer">
                                                <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }} onClick={this.onView.bind(this, item.id, defaultTab)}>
                                                    <b>{item.id ? `${item.name} ` : ''}</b>
                                                </h3>
                                            </div >

                                            <div
                                                className="gx-flex-row"
                                                style={{ marginTop: '-5px' }}
                                            >
                                                <div
                                                    className="ant-list-item-meta-description"
                                                    style={{
                                                        marginRight: '50px'
                                                    }}
                                                >
                                                    <Mobile />{' '}
                                                    {item.mobiles &&
                                                        _.size(item.mobiles) >
                                                        0 &&
                                                        UtilService.getPrimaryValue(
                                                            item.mobiles,
                                                            'mobile'
                                                        )}
                                                </div>
                                                <div className="ant-list-item-meta-description">
                                                    <Email />{' '}
                                                    {item.emails &&
                                                        _.size(item.emails) >
                                                        0 &&
                                                        UtilService.getPrimaryValue(
                                                            item.emails,
                                                            'email'
                                                        )}
                                                </div>
                                            </div>


                                        </div>
                                        {authUser.type === USER_TYPES.FRANCHISEE &&
                                            <div className="ant-list-item-meta-description">
                                                <DOB />
                                                <div className="locationEllipse">
                                                    {UtilService.displayDOB(
                                                        item.dob
                                                    )}
                                                </div>
                                            </div>}

                                        <div className="cardRightThumb">
                                            <div className="cardRightContainer">
                                                <div className="action-btnsWithSignupDate">
                                                    <div className="ActionNotification">
                                                        <ActiveDeactive
                                                            onSuccess={this.fetch.bind(
                                                                this
                                                            )}
                                                            key={item.id}
                                                            documentId={item.id}
                                                            isActive={
                                                                item.isActive
                                                            }
                                                            model="user"
                                                        />

                                                        <div className="scooterActionItem">
                                                            <ActionButtons
                                                                pageId={
                                                                    PAGE_PERMISSION.USERS
                                                                }
                                                                view={this.onView.bind(this, item.id, defaultTab)}
                                                                edit={this.props.franchiseeId ? '' : `/e-scooter/users/upsert/${item.id}`}
                                                                filter={
                                                                    this.state
                                                                        .filter
                                                                }
                                                                franchiseeId={this.props.franchiseeId}
                                                                deleteObj={this.props.franchiseeId ? '' : {
                                                                    documentId:
                                                                        item.id,
                                                                    model:
                                                                        'user',
                                                                    isSoftDelete: true
                                                                }}
                                                                deleteFn={(res) => {
                                                                    if (
                                                                        res ===
                                                                        'success'
                                                                    ) {
                                                                        this.setState(
                                                                            (state) => {
                                                                                state.filter.page = 1;
                                                                                state.paginate = false;
                                                                            }
                                                                        );
                                                                        this.fetch();
                                                                    }
                                                                }}
                                                            />
                                                            {!this.props.franchiseeId && <>
                                                                <div className="scooterIC">
                                                                    <a
                                                                        href="/#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            this.handleResetPassword(item.id)
                                                                        }}
                                                                    >
                                                                        <ESToolTip placement="top" text={<IntlMessages id="app.resetPassword" />}>
                                                                            <ChangePassword />
                                                                        </ESToolTip>
                                                                    </a>
                                                                </div>
                                                                {authUser.type !== USER_TYPES.FRANCHISEE &&
                                                                    <div className="scooterIC">
                                                                        <a href="/#"
                                                                            onClick={
                                                                                (e) => {
                                                                                    e.preventDefault();
                                                                                    this.setState(
                                                                                        {
                                                                                            permission:
                                                                                                item.id
                                                                                        }
                                                                                    )
                                                                                }
                                                                            }
                                                                        >
                                                                            <ESToolTip placement="top" text={<IntlMessages id="app.pagePermission" />}>
                                                                                <Icon type="setting" />
                                                                            </ESToolTip>
                                                                        </a>
                                                                    </div>}
                                                            </>}
                                                        </div>
                                                    </div>

                                                    <div className="signupDate">
                                                        {<IntlMessages id="app.signUpDate" />}:{' '}
                                                        {UtilService.displayDate(
                                                            item.createdAt
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                </div>
                {this.state.showModal &&
                    <UserInfo
                        onCancel={this.handleViewCancel.bind(this)}
                        data={this.state.modalData}
                    />
                }
                <ResetPasswordForm
                    visible={this.state.resetPasswordModalVisible}
                    onCancel={this.handleCancel}
                    resetPasswordId={this.state.resetPasswordId}
                />
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Users);
