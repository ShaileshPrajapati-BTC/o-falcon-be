import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    PAGE_PERMISSION,
    SUBSCRIPTION_VISIBLE,
    WALLET_CONFIG_VISIBLE,
    NEST_VISIBLE,
    RENTAL_VISIBLE,
    TASK_MODULE_VISIBLE,
    COMMUNITY_MODE_VISIBLE,
    FEEDER_VISIBLE,
    BOOKING_PASS_VISIBLE,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    REFERRAL_CODE_VISIBLE
} from '../constants/Common';

const _ = require('lodash');

class CustomRoute extends Component {
    render() {
        const { auth, path, component, exact, insert, update, deleted, view } = this.props;
        let { pageId } = this.props;
        if (!auth || !auth.authUser) {
            return true;
        }
        let staticPage = this.props.computedMatch.params.pageCode;
        if (staticPage && staticPage === 'privacy-policy') {
            pageId = PAGE_PERMISSION.PRIVACY_POLICY;
        } else if (staticPage && staticPage === 'terms-and-conditions') {
            pageId = PAGE_PERMISSION.TERMS_AND_CONDITIONS;
        } else if (staticPage && staticPage === 'about-us') {
            pageId = PAGE_PERMISSION.ABOUT_US;
        }


        let id = this.props.computedMatch.params.id;

        let pagePermission = auth.authUser.accessPermission;
        let indexes = _.findIndex(pagePermission, { module: pageId });
        let hasPermission = pagePermission[indexes] && pagePermission[indexes].permissions &&
            pagePermission[indexes].permissions.list;

        if (!id && insert) {
            hasPermission = hasPermission && pagePermission[indexes] && pagePermission[indexes].permissions &&
                pagePermission[indexes].permissions.insert;
        }
        if (view) {
            hasPermission = hasPermission && pagePermission[indexes] && pagePermission[indexes].permissions &&
                pagePermission[indexes].permissions.view;
        }
        if (id && update) {
            hasPermission = hasPermission && pagePermission[indexes] && pagePermission[indexes].permissions &&
                pagePermission[indexes].permissions.update;
        }
        if (deleted) {
            hasPermission = hasPermission && pagePermission[indexes] && pagePermission[indexes].permissions &&
                pagePermission[indexes].permissions.delete;
        }
        if (pageId === PAGE_PERMISSION.SUBSCRIPTION) {
            hasPermission = hasPermission && SUBSCRIPTION_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.RENTAL ||
            pageId === PAGE_PERMISSION.RENTAL_PAYMENT) {
            hasPermission = hasPermission && RENTAL_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.WALLET_CONFIG) {
            hasPermission = hasPermission && WALLET_CONFIG_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.TASKSETUP ||
            pageId === PAGE_PERMISSION.CREATE_TASK) {
            hasPermission = hasPermission && TASK_MODULE_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.COMMUNITY_MODE ||
            pageId === PAGE_PERMISSION.VEHICLE_REPORT) {
            hasPermission = hasPermission && COMMUNITY_MODE_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.NEST) {
            hasPermission = hasPermission && NEST_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.FEEDER) {
            hasPermission = hasPermission && FEEDER_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.BOOKING_PASS) {
            hasPermission = hasPermission && BOOKING_PASS_VISIBLE;
        }
        let franchiseeTabs = [
            PAGE_PERMISSION.SERVICE_REQUEST,
            PAGE_PERMISSION.COMMISSION,
            PAGE_PERMISSION.COMMISSION_PAYOUT,
            PAGE_PERMISSION.COMMISSION_REPORT,
            PAGE_PERMISSION.LOCATION,
            PAGE_PERMISSION.FRANCHISEE,
            PAGE_PERMISSION.RENTAL,
            PAGE_PERMISSION.RENTAL_PAYMENT,
            PAGE_PERMISSION.RENTAL_PAYMENT_CLIENT
        ]
        if (franchiseeTabs.includes(pageId) && !FRANCHISEE_VISIBLE) {
            hasPermission = false;
        }
        if (pageId === PAGE_PERMISSION.DEALER) {
            hasPermission = hasPermission && CLIENT_VISIBLE;
        }
        if (pageId === PAGE_PERMISSION.REFERRAL_CODE) {
            hasPermission = hasPermission && REFERRAL_CODE_VISIBLE;
        }
        return hasPermission ?
            <Route
                {...exact}
                path={path}
                component={component}
            /> : <Redirect from='*' to='/404' />;
    }
}
const mapStateToProps = ({ auth }) => {
    return { auth };
};

export default connect(mapStateToProps)(CustomRoute);