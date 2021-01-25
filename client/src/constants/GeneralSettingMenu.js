import { PAGE_PERMISSION } from './PagePermission';
import IntlMessages from '../util/IntlMessages';
import React from 'react';

export const GENERAL_SETTING_MENU = [
    {
        id: 1,
        key: 'menu1',
        title: <IntlMessages id="app.sidebar.userGuidance" />,
        settingsSubMenu: [
            {
                id: PAGE_PERMISSION.PROCEDURE,
                key: 'Procedure',
                title: <IntlMessages id="app.sidebar.procedure" />,
                path: "/e-scooter/general-settings/procedure",
            },
            {
                id: PAGE_PERMISSION.FAQS,
                key: 'Faqs',
                title: <IntlMessages id="app.sidebar.faqs" />,
                path: "/e-scooter/general-settings/faqs",
            },
            {
                id: PAGE_PERMISSION.ACTION_QUESTIONNAIRE,
                key: 'ActionQuestionnaireMaster',
                title: <IntlMessages id="app.sidebar.actionQuestionnaire" />,
                path: "/e-scooter/general-settings/actionquestionnairemaster",
            },
        ]
    },
    {
        id: 2,
        key: 'menu2',
        title: <IntlMessages id="app.sidebar.systemSettings" />,
        settingsSubMenu: [
            {
                id: PAGE_PERMISSION.MASTER,
                key: 'Master',
                title: <IntlMessages id="app.sidebar.master" />,
                path: "/e-scooter/general-settings/master",
            },
            {
                id: PAGE_PERMISSION.DATABANK,
                key: 'SubMaster',
                title: <IntlMessages id="app.sidebar.dataBank" />,
                path: "/e-scooter/general-settings/sub-master",
            },
            {
                id: PAGE_PERMISSION.WALLET_CONFIG,
                key: 'WalletConfig',
                title: <IntlMessages id="app.sidebar.walletConfig" />,
                path: "/e-scooter/general-settings/wallet-config",
            },
            {
                id: PAGE_PERMISSION.FARE_MANAGEMENT,
                key: 'FareManagement',
                title: <IntlMessages id="app.sidebar.fareManagement" />,
                path: "/e-scooter/general-settings/fare-management",
            },
            {
                id: PAGE_PERMISSION.CANCELLATION_REASON,
                key: 'RideCancellationReason',
                title: <IntlMessages id="app.sidebar.cancellationReason" />,
                path: "/e-scooter/general-settings/ride-cancellation-reason",
            },
            {
                id: PAGE_PERMISSION.RIDE_SETTING,
                key: 'RideSetting',
                title: <IntlMessages id="app.sidebar.rideSetting" />,
                path: "/e-scooter/general-settings/ride-setting",
            },
            {
                id: PAGE_PERMISSION.SUPPORT,
                key: 'Support',
                title: <IntlMessages id="app.sidebar.supprtInformation" />,
                path: "/e-scooter/general-settings/support",
            },
            {
                id: PAGE_PERMISSION.LOCATION,
                key: 'Location',
                title: <IntlMessages id="app.sidebar.location" />,
                path: "/e-scooter/general-settings/location",
            },
            {
                id: PAGE_PERMISSION.OPERATIONAL_HOURS,
                key: 'OperationalHours',
                title: <IntlMessages id="app.operationalHours" />,
                path: "/e-scooter/general-settings/operational-hours",
            }
        ]
    },
    {
        id: 3,
        key: 'menu3',
        title: <IntlMessages id="app.sidebar.appContent" />,
        settingsSubMenu: [
            // {
            //   id: 11,
            //   key: 'Language',
            //   title: 'Language',
            // }
            // , {
            //   id: 12,
            //   key: 'ContactUs',
            //   title: 'Contact Us',
            // },
            // {
            //   id: 13,
            //   key: 'T&C',
            //   title: 'Terms & Conditions',
            // },
            {
                title: <IntlMessages id="app.sidebar.version" />,
                id: PAGE_PERMISSION.VERSION,
                key: "Version",
                path: "/e-scooter/general-settings/version-apk",
            }
        ]
    },
    // {
    //   id: 4,
    //   key: 'menu4',
    //   title: 'Services',
    //   settingsSubMenu: [
    //     {
    //       id: 21,
    //       key: 'MailProvider',
    //       title: 'Mail Provider',
    //     }, {
    //       id: 22,
    //       key: 'SMSProvider',
    //       title: 'SMS Provider',
    //     }, {
    //       id: 23,
    //       key: 'OneSignal',
    //       title: 'One Signal',
    //     }, {
    //       id: 24,
    //       key: 'CJS',
    //       title: 'Cron Job Services',
    //     }, {
    //       id: 25,
    //       key: 'Webhook',
    //       title: 'Webhook',
    //     },
    //     {
    //       id: 26,
    //       key: 'IOS',
    //       title: 'iOs App COnfiguration',
    //     },
    //     {
    //       id: 27,
    //       key: 'Android',
    //       title: 'Android App Configuration',
    //     }
    //   ]
    // },


]