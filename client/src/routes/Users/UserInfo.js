import {
    Col,
    Modal,
    Row,
    Tag
} from 'antd';
import React from 'react';
import { USER_TYPES, GENDER_FILTER, RIDER_LABEL } from '../../constants/Common';
import UtilService from '../../services/util';
import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');
const TABS = {
    INFO: 1,
    VEHICLE: 2,
    CHARGING_STATION: 3,
    BOOKINGS: 4
};

const UserTypeBadge = ({ id }) => {
    let bgColor;
    let tooltipText;

    switch (id) {
        case USER_TYPES.ADMIN:
            bgColor = '#2DB7F5';
            tooltipText = <IntlMessages id="app.admin" />;
            break;
        case USER_TYPES.SUB_ADMIN:
            bgColor = '#87D068';
            tooltipText = <IntlMessages id="app.subadmin" />;
            break;
        case USER_TYPES.STAFF:
            bgColor = '#F50';
            tooltipText = <IntlMessages id="app.staff" />;
            break;
        case USER_TYPES.RIDER:
            bgColor = '#000';
            tooltipText = RIDER_LABEL;
            break;
        default:
            bgColor = '#108EE9';
            tooltipText = <IntlMessages id="app.superAdmin" />;
            break;
    }

    return (
        <Tag color={bgColor} className="gx-m-0">
            {tooltipText}
        </Tag>
    );
};

class UserInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            id: props.data.id,
            defaultTab: props.data.type,
            data: {}
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.get(`admin/user/${this.state.id}`);
            if (response.data.type === USER_TYPES.RIDER) {
                this.onTabChange(TABS.VEHICLE);
            }
            this.setState({
                data: response.data
            });
            this.setState({ loading: false });

        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {
        const { data } = this.state;
        const { onCancel } = this.props;
        const expired = false;
        const primaryEmail = UtilService.getPrimaryValue(data.emails, 'email');
        const title = <div style={{ textTransform: 'capitalize' }}>
            <div
                className="totalRideCounter"
                style={{ marginRight: 16, float: 'left' }}
            >
                <span className="ant-avatar ant-avatar-circle ant-avatar-image" style={{ width: '100%', height: '100%' }}>
                    {data.image ?
                        <img
                            alt=""
                            src={`${data.image}`}
                        /> :
                        <h2>
                            {data.name ? data.name
                                .charAt(0)
                                .toUpperCase() : ''}
                            {console.log("TCL: UserInfo -> render -> data.name", data)}
                        </h2>
                    }
                </span>
            </div>
            <div style={{ lineHeight: '65px' }}> {data.name}   <UserTypeBadge id={data.type} /></div></div>;

        return (
            <Modal
                title={title}
                footer=""
                width={600}
                onCancel={onCancel}
                visible={true}
            >
                <div className="gx-module-box gx-mw-100">
                    <Row type="flex" align="middle" justify="space-between">
                        {expired ?
                            <img
                                src={require('assets/images/expired.png')}
                                alt="Expired"
                            /> :
                            null}
                    </Row>


                    <div className="gx-p-2">
                        <Row type="flex" align="middle" justify="space-between">

                            <Col span={12}>
                                <div><b><IntlMessages id="app.email" /> :</b></div>
                                <div className="gx-text-muted gx-text-truncate">
                                    {primaryEmail || '-'}
                                </div>
                            </Col>

                            <Col span={12}>
                                <div><b><IntlMessages id="app.mobile" /> :</b></div>
                                <span className="gx-text-muted">
                                    {UtilService.getPrimaryValue(
                                        data.mobiles,
                                        'mobile'
                                    ) || '-'}
                                </span>
                            </Col>
                        </Row>
                        <Row type="flex" className="gx-mt-4" align="middle" justify="space-between">

                            <Col span={12}>
                                <div><b><IntlMessages id="app.dob" /> :</b></div>
                                <div className="gx-text-muted gx-text-truncate">
                                    {UtilService.displayDOB(data.dob) || '-'}
                                </div>
                            </Col>

                            <Col span={12}>
                                <div><b><IntlMessages id="app.gender" /> :</b></div>
                                <span className="gx-text-muted">
                                    {GENDER_FILTER.map(
                                        (val) => {
                                            return val.type === data.gender ? val.label : '';
                                        }
                                    ) || '-'}
                                </span>
                            </Col>
                        </Row>
                        <Row type="flex" className="gx-mt-4" align="middle" justify="space-between">

                            <Col span={12}>
                                <div><b><IntlMessages id="app.signUpDate" /> :</b></div>
                                <div className="gx-text-muted gx-text-truncate">
                                    {UtilService.displayDate(
                                        data.createdAt
                                    ) || '-'}
                                </div>
                            </Col>

                            <Col span={12}>
                                <div><b><IntlMessages id="app.uniqueIdentityNumber" />  :</b></div>
                                <span className="gx-text-muted">
                                    {data.uniqueIdentityNumber || '-'}
                                </span>
                            </Col>
                        </Row>
                        <Row type="flex" className="gx-mt-4" align="middle" justify="space-between">
                            <Col span={24}>
                                <div><b><IntlMessages id="app.address" /> :</b></div>
                                {
                                    data.addresses ?
                                        <div>{data.addresses.map((val, index) => {
                                            const content = <div>
                                                <p>
                                                    {val.line1 ? `${_.trim(val.line1)}, ` : ''}
                                                    {val.line2 ? `${_.trim(val.line2)},` : ''}<br />
                                                    {val.state ? `${_.trim(val.state)}, ` : ''}
                                                    {val.city ? `${_.trim(val.city)}, ` : ''}
                                                    {val.pinCode ? `${val.pinCode} ` : ''}
                                                </p>
                                            </div>;

                                            return (
                                                <div key={index}>{content}</div>
                                            );
                                        })}
                                        </div> :
                                        null
                                }
                            </Col>
                        </Row>
                    </div>
                </div>
            </Modal>
        );
    }
}
export default UserInfo;
