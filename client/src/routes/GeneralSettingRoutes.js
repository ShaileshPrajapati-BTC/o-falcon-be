/* eslint-disable max-lines-per-function */
import { Redirect, Route, Switch } from "react-router-dom";
import React from "react";
import { PAGE_PERMISSION } from "../constants/Common";
import asyncComponent from "util/asyncComponent";
import CustomRoute from "./CustomRoute";

const GeneralSettingRoutes = ({ match }) => {
    return (
        <Switch>
            <Route path={`${match.url}/`} exact />
            <CustomRoute
                pageId={PAGE_PERMISSION.VERSION}
                path={`${match.url}/version-apk`}
                component={asyncComponent(() => import("./Version"))}
            />
            <CustomRoute
                pageId={PAGE_PERMISSION.MASTER}
                path={`${match.url}/master`}
                component={asyncComponent(() => {
                    return import("./Master");
                })}
            />
            <CustomRoute
                pageId={PAGE_PERMISSION.DATABANK}
                path={`${match.url}/sub-master/:id?`}
                component={asyncComponent(() => {
                    return import("./SubMaster");
                })}
            />
            <CustomRoute
                pageId={PAGE_PERMISSION.WALLET_CONFIG}
                path={`${match.url}/wallet-config`}
                component={asyncComponent(() => {
                    return import("./WalletConfig");
                })}
            />
            <CustomRoute
                exact
                insert
                update
                pageId={PAGE_PERMISSION.FARE_MANAGEMENT}
                path={`${match.url}/fare-management/upsert/:id?`}
                component={asyncComponent(() => {
                    return import("./FareManagement/upsert");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.FARE_MANAGEMENT}
                path={`${match.url}/fare-management`}
                component={asyncComponent(() => {
                    return import("./FareManagement");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.CANCELLATION_REASON}
                path={`${match.url}/ride-cancellation-reason`}
                component={asyncComponent(() => {
                    return import("./RideCancellationReason");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.RIDE_SETTING}
                path={`${match.url}/ride-setting`}
                component={asyncComponent(() => {
                    return import("./RideSetting");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.SUPPORT}
                path={`${match.url}/support`}
                component={asyncComponent(() => {
                    return import("./ContactUsSetting");
                })}
            />
            <CustomRoute
                pageId={PAGE_PERMISSION.LOCATION}
                path={`${match.url}/location`}
                component={asyncComponent(() => {
                    return import("./Location");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.PROCEDURE}
                path={`${match.url}/procedure`}
                component={asyncComponent(() => {
                    return import("./Procedure");
                })}
            />
            <CustomRoute
                insert
                update
                pageId={PAGE_PERMISSION.PROCEDURE}
                path={`${match.url}/procedure/upsert`}
                component={asyncComponent(() => {
                    return import("./Procedure/upsert");
                })}
            />
            <CustomRoute
                exact
                pageId={PAGE_PERMISSION.FAQS}
                path={`${match.url}/faqs`}
                component={asyncComponent(() => {
                    return import("./Faqs");
                })}
            />
            <CustomRoute
                pageId={PAGE_PERMISSION.ACTION_QUESTIONNAIRE}
                path={`${match.url}/actionquestionnairemaster`}
                exact
                component={asyncComponent(() => {
                    return import("./ActionQuestionnaireMaster");
                })}
            />
            <CustomRoute
                exact
                insert
                update
                pageId={PAGE_PERMISSION.ACTION_QUESTIONNAIRE}
                path={`${match.url}/actionquestionnairemaster/upsert/:id?`}
                component={asyncComponent(() => {
                    return import("./ActionQuestionnaireMaster/upsert");
                })}
            />

            <CustomRoute
                pageId={PAGE_PERMISSION.OPERATIONAL_HOURS}
                path={`${match.url}/operational-hours`}
                component={asyncComponent(() => {
                  return import("./OperationalHours");
                })}
            />
            <Redirect from="*" to="/404" />
        </Switch>
    );
};
export default GeneralSettingRoutes;
