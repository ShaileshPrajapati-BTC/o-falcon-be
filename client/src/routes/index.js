/* eslint-disable max-lines-per-function */
import { Redirect, Route, Switch } from "react-router-dom";
import React from "react";
import {
    PAGE_PERMISSION,
    PAGE_PATHS,
    FRANCHISEE_ROUTE,
    DEALER_ROUTE,
    NEST_ROUTE,
    RIDER_ROUTE,
    FEEDER_ROUTE,
    SUBSCRIPTION_ROUTE,
    BOOKING_PASS_ROUTE
} from "../constants/Common";
import asyncComponent from "util/asyncComponent";
import CustomRoute from "./CustomRoute";

const App = ({ match }) => {
    return (
        <div className="gx-main-content-wrapper">
            <Switch>
                <CustomRoute
                    pageId={PAGE_PERMISSION.DASHBOARD}
                    path={`${match.url}e-scooter/dashboard`}
                    component={asyncComponent(() => {
                        return import("./Dashboard");
                    })}
                />
                <CustomRoute
                    // exact
                    pageId={PAGE_PERMISSION.GENERAL_SETTINGS}
                    path={`${match.url}e-scooter/general-settings`}
                    component={asyncComponent(() => {
                        return import("./GeneralSettings");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.GEO_LOCATION}
                    path={`${match.url}e-scooter/geo-location`}
                    component={asyncComponent(() => {
                        return import("./GeoLocation");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.USERS}
                    path={`${match.url}e-scooter/users`}
                    component={asyncComponent(() => {
                        return import("./Users");
                    })}
                />
                <CustomRoute
                    exact
                    insert
                    update
                    pageId={PAGE_PERMISSION.USERS}
                    path={`${match.url}e-scooter/users/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Users/UserUpsert");
                    })}
                />
                <CustomRoute
                    exact
                    view
                    pageId={PAGE_PERMISSION.USERS}
                    path={`${match.url}e-scooter/users/view/:id`}
                    component={asyncComponent(() => {
                        return import("./Users/UserInfo");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.FRANCHISEE}
                    path={`${match.url}e-scooter/${FRANCHISEE_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./Franchisee");
                    })}
                />
                <CustomRoute
                    exact
                    insert
                    update
                    pageId={PAGE_PERMISSION.FRANCHISEE}
                    path={`${match.url}e-scooter/${FRANCHISEE_ROUTE}/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Franchisee/upsert");
                    })}
                />
                <CustomRoute
                    exact
                    view
                    pageId={PAGE_PERMISSION.FRANCHISEE}
                    path={`${match.url}e-scooter/${FRANCHISEE_ROUTE}/view/:id?`}
                    component={asyncComponent(() => {
                        return import("./Franchisee/view");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.DEALER}
                    path={`${match.url}e-scooter/${DEALER_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./Dealer");
                    })}
                />
                <CustomRoute
                    exact
                    insert
                    update
                    pageId={PAGE_PERMISSION.DEALER}
                    path={`${match.url}e-scooter/${DEALER_ROUTE}/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Dealer/upsert");
                    })}
                />
                <CustomRoute
                    exact
                    view
                    pageId={PAGE_PERMISSION.DEALER}
                    path={`${match.url}e-scooter/${DEALER_ROUTE}/view/:id?`}
                    component={asyncComponent(() => {
                        return import("./Dealer/view");
                    })}
                />
                <CustomRoute
                    exact
                    view
                    pageId={PAGE_PERMISSION.RIDERS}
                    path={`${match.url}e-scooter/${RIDER_ROUTE}/view/:id?`}
                    component={asyncComponent(() => {
                        return import("./Users/view");
                    })}
                />
                <CustomRoute
                    insert
                    update
                    pageId={PAGE_PERMISSION.RIDERS}
                    path={`${match.url}e-scooter/${RIDER_ROUTE}/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Users/UserUpsert");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.RIDERS}
                    path={`${match.url}e-scooter/${RIDER_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./Riders");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.RIDES}
                    path={`${match.url}e-scooter/rides`}
                    component={asyncComponent(() => {
                        return import("./Rides");
                    })}
                />
                <CustomRoute
                    exact
                    view
                    pageId={PAGE_PERMISSION.FEEDER}
                    path={`${match.url}e-scooter/${FEEDER_ROUTE}/view/:id?`}
                    component={asyncComponent(() => {
                        return import("./Feeder/view");
                    })}
                />
                <CustomRoute
                    insert
                    update
                    pageId={PAGE_PERMISSION.FEEDER}
                    path={`${match.url}e-scooter/${FEEDER_ROUTE}/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Users/UserUpsert");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.FEEDER}
                    path={`${match.url}e-scooter/${FEEDER_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./Feeder");
                    })}
                />
                <CustomRoute
                    exact
                    insert
                    update
                    pageId={PAGE_PERMISSION.VEHICLES}
                    path={`${match.url}e-scooter/vehicle/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./Vehicle/upsert");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.VEHICLES}
                    path={`${match.url}e-scooter/vehicle`}
                    component={asyncComponent(() => {
                        return import("./Vehicle");
                    })}
                />
                <CustomRoute
                    view
                    pageId={PAGE_PERMISSION.VEHICLES}
                    path={`${match.url}e-scooter/vehicle-details/:id?`}
                    component={asyncComponent(() => {
                        return import("./VehicleDetails");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.DISPUTE}
                    path={`${match.url}e-scooter/ride-dispute`}
                    component={asyncComponent(() => {
                        return import("./RideDispute");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.SERVICE_REQUEST}
                    path={`${match.url}e-scooter/service-request`}
                    component={asyncComponent(() => {
                        return import("./RideDispute");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.STATIC_PAGE}
                    path={`${match.url}e-scooter/static-page`}
                    component={asyncComponent(() => {
                        return import("./StaticPage");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.PAYMENT}
                    path={`${match.url}e-scooter/payment`}
                    component={asyncComponent(() => {
                        return import("./Payment");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.NOTIFICATIONS}
                    path={`${match.url}e-scooter/notification`}
                    component={asyncComponent(() => {
                        return import("./Notification");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.NOTIFICATIONS}
                    path={`${match.url}e-scooter/notification/notifyUser`}
                    component={asyncComponent(() => {
                        return import("./Notification/notifyUser");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.PROMOTIONS}
                    path={`${match.url}e-scooter/promocode`}
                    component={asyncComponent(() => {
                        return import("./PromoCode");
                    })}
                />
                <CustomRoute
                    insert
                    update
                    pageId={PAGE_PERMISSION.PROMOTIONS}
                    path={`${match.url}e-scooter/promocode/upsert`}
                    component={asyncComponent(() => {
                        return import("./PromoCode/upsert");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.FEEDBACK}
                    path={`${match.url}e-scooter/feedback`}
                    component={asyncComponent(() => {
                        return import("./Feedback");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.SUBSCRIPTION}
                    path={`${match.url}e-scooter/${SUBSCRIPTION_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./BookingPlan");
                    })}
                />
                <CustomRoute
                    exact
                    pageId={PAGE_PERMISSION.BOOKING_PASS}
                    path={`${match.url}e-scooter/${BOOKING_PASS_ROUTE}`}
                    component={asyncComponent(() => {
                        return import("./BookingPass");
                    })}
                />
                <CustomRoute
                    insert
                    update
                    pageId={PAGE_PERMISSION.BOOKING_PASS}
                    path={`${match.url}e-scooter/${BOOKING_PASS_ROUTE}/upsert/:id?`}
                    component={asyncComponent(() => {
                        return import("./BookingPass/upsert");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.TASKSETUP}
                    path={`${match.url}e-scooter/task-setup`}
                    component={asyncComponent(() => {
                        return import("./TaskSetup");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.COMMUNITY_MODE}
                    path={`${match.url}e-scooter/community-mode`}
                    component={asyncComponent(() => {
                        return import("./CommunityMode");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.VEHICLE_REPORT}
                    path={`${match.url}e-scooter/vehicle-report`}
                    component={asyncComponent(() => {
                        return import("./VehicleReport");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.CREATE_TASK}
                    path={`${match.url}e-scooter/task-list`}
                    component={asyncComponent(() => {
                        return import("./TasksList");
                    })}
                />
                <CustomRoute
                    pageId={9}
                    exact
                    path={`${match.url}e-scooter/roles`}
                    component={asyncComponent(() => {
                        return import("./Roles");
                    })}
                />
                <CustomRoute
                    insert
                    update
                    pageId={9}
                    path={`${match.url}e-scooter/roles/upsert`}
                    component={asyncComponent(() => {
                        return import("./Roles/upsert");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.NEST}
                    path={`${match.url}e-scooter/${NEST_ROUTE}/:id?`}
                    component={asyncComponent(() => {
                        return import("./Nest");
                    })}
                />
                {/* <CustomRoute
                    pageId={PAGE_PERMISSION.LOCATION}
                    path={`${match.url}e-scooter/location`}
                    component={asyncComponent(() => {
                        return import("./Location");
                    })}
                /> */}
                <CustomRoute
                    pageId={PAGE_PERMISSION.COMMISSION}
                    path={`${match.url}e-scooter/commission`}
                    component={asyncComponent(() => {
                        return import("./Commission");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.COMMISSION_PAYOUT}
                    path={`${match.url}e-scooter/commission-payout`}
                    component={asyncComponent(() => {
                        return import("./CommissionPayout");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.COMMISSION_REPORT}
                    path={`${match.url}e-scooter/commission-report`}
                    component={asyncComponent(() => {
                        return import("./CommissionReport");
                    })}
                />
                <CustomRoute
                    path={`${match.url}e-scooter/:pageCode(${PAGE_PATHS})`}
                    component={asyncComponent(() => {
                        return import("./PrivacyPolicy");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.CONTACT_US}
                    path={`${match.url}e-scooter/contact-us`}
                    component={asyncComponent(() => {
                        return import("./ContactUs");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.REFERRAL_CODE}
                    path={`${match.url}e-scooter/referral-code`}
                    component={asyncComponent(() => {
                        return import("./ReferralCode");
                    })}
                />
                {/* static pages */}
                <Route
                    path={`${match.url}e-scooter/sample`}
                    component={asyncComponent(() => {
                        return import("./SamplePage");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/profile`}
                    component={asyncComponent(() => {
                        return import("./Profile");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.RENTAL}
                    path={`${match.url}e-scooter/rental`}
                    component={asyncComponent(() => {
                        return import("./Rental");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.RENTAL_PAYMENT}
                    path={`${match.url}e-scooter/rental-payment`}
                    component={asyncComponent(() => {
                        return import("./RentalPayment");
                    })}
                />
                <CustomRoute
                    pageId={PAGE_PERMISSION.RENTAL_PAYMENT_CLIENT}
                    path={`${match.url}e-scooter/client-payments`}
                    component={asyncComponent(() => {
                        return import("./RentalClientPayments");
                    })}
                />

                <Route
                    path="/styleGuide"
                    component={asyncComponent(() => {
                        return import("./StyleGuide");
                    })}
                />
                <Route
                    path="/temp"
                    component={asyncComponent(() => {
                        return import("./Temp");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/table-demo`}
                    component={asyncComponent(() => {
                        return import("./TableDemo");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/heatMap`}
                    component={asyncComponent(() => {
                        return import("./heatMap");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/language`}
                    component={asyncComponent(() => {
                        return import("./Language");
                    })}
                />
                <Route
                    path="/404"
                    component={asyncComponent(() => {
                        return import("./404");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/task`}
                    component={asyncComponent(() => {
                        return import("./TaskList");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/activity-log`}
                    component={asyncComponent(() => {
                        return import("./ActivityLog");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/project-config`}
                    component={asyncComponent(() => {
                        return import("./ProjectConfig");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/setup-config`}
                    component={asyncComponent(() => {
                        return import("./SetupConfig");
                    })}
                />
                <Route
                    path={`${match.url}e-scooter/device-config`}
                    component={asyncComponent(() => {
                        return import("./DeviceConfig");
                    })}
                />
                <Redirect from="*" to="/404" />
            </Switch>
        </div>
    );
};
export default App;
