/* eslint-disable no-nested-ternary */
import { Row, Affix, Tabs } from "antd";
import React, { Component } from "react";
import Zone from '../Zone/index';
import { connect } from 'react-redux';
import { PAGE_PERMISSION, ZONE_LABEL } from "../../constants/Common";
import IntlMessages from "../../util/IntlMessages";
const _ = require('lodash');
const { TabPane } = Tabs;
const isMultiTab = false;
class GeoLocation extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let menuPermission = this.props.auth.authUser.accessPermission;
        let zoneindex = _.findIndex(menuPermission, {
            module: Number(PAGE_PERMISSION.ZONES)
        });
        let hasZonePermission =
            menuPermission[zoneindex] &&
            menuPermission[zoneindex].permissions &&
            menuPermission[zoneindex].permissions.list;

        // let locationindex = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.LOCATION) });
        // let hasLocationPermission =
        //     menuPermission[locationindex] &&
        //     menuPermission[locationindex].permissions &&
        //     menuPermission[locationindex].permissions.list;
        return (
            <div className="gx-module-box gx-mw-100">
                {isMultiTab ? (
                    <>
                        <Affix offsetTop={1}>
                            <div className="gx-module-box-header">
                                <Row
                                    type="flex"
                                    align="middle"
                                    justify="space-between"
                                >
                                    <h1 className="pageHeading">
                                        <IntlMessages id="app.zone.geoLocation" />
                                    </h1>
                                </Row>
                            </div>
                        </Affix>
                        <div className="RidersList RidersListingWithWidth project-config-tab">
                            <Tabs>
                                {hasZonePermission &&
                                    <TabPane tab={ZONE_LABEL} key={2}>
                                        <Zone isMultiTab={isMultiTab} />
                                    </TabPane>
                                }
                                {/* {hasLocationPermission &&
                                    <TabPane tab='Location' key={1}>
                                        <Location />
                                    </TabPane>
                                } */}
                            </Tabs>
                        </div>
                    </>
                ) : (
                        <div style={{ padding: "10px" }}>
                            <Zone isMultiTab={isMultiTab} />
                        </div>
                    )}
            </div>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(GeoLocation);
