/* eslint-disable no-nested-ternary */
/* eslint-disable */
/* eslint-disable multiline-ternary */
/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import CrudService from "../services/api";
import { ReactComponent as Delete } from "../assets/svg/delete.svg";
import { ReactComponent as Edit } from "../assets/svg/edit.svg";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Modal } from "antd";
import PropTypes from "prop-types";
import React from "react";
import { ReactComponent as View } from "../assets/svg/view.svg";
import ESToolTip from "../components/ESToolTip";
import IntlMessages from "../util/IntlMessages";
const _ = require("lodash");

const propTypes = {
    add: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    view: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    viewTarget: PropTypes.string,
    edit: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    softDelete: PropTypes.bool,
    deleteMsg: PropTypes.string
};

const defaultProps = {
    addTitle: "Add",
    viewTitle: "View",
    viewTarget: null,
    editTitle: "Edit",
    deleteTitle: "Delete",
    softDelete: false,
    deleteMsg: "Sure to delete this record?"
};

const handleDelete = (options, deleteMsg, deleteFn) => {
    options.noConfirmation ? deleteFn(options) :
        Modal.confirm({
            title: deleteMsg,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                if (options.page) {
                    deleteFn(options);
                } else {
                    CrudService.removeDocument(options, res => {
                        deleteFn(res);
                    });
                }
            }
        });
};
// const storeFilter = filter => {
//     if (filter) {
//         localStorage.setItem("pageFilter", JSON.stringify(filter));
//     }
// };

const ActionButtons = props => {
    const {
        view,
        viewTarget,
        edit,
        filter,
        deleteObj,
        deleteMsg,
        deleteFn,
        displayBefore,
        displayAfter,
        auth,
        pageId,
        franchiseeId
    } = props;
    let hasEditPermission, hasDeletePermission, hasViewPermission;
    if (!pageId) {
        hasEditPermission = true;
        hasDeletePermission = true;
        hasViewPermission = true;
    } else {
        let menuPermission = auth.authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(pageId) });
        hasEditPermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.update;
        hasDeletePermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.delete;
        hasViewPermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.view;
    }
    return (
        <div className="scooterActionItem" style={{ float: "right" }}>
            {displayBefore}
            <ESToolTip placement="top" text={<IntlMessages id="app.view" />}>
                {hasViewPermission && view ? (
                    typeof view === "function" ? (
                        <div className="scooterIC">
                            <a href="/#"
                                onClick={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    view();
                                }}
                            >
                                <View />
                            </a>
                        </div>
                    ) : (
                            <div className="scooterIC">
                                <Link
                                    to={{
                                        pathname: view,
                                        filter: filter
                                    }}
                                    // to={view}
                                    target={viewTarget}
                                    onClick={event => {
                                        event.stopPropagation();
                                        // storeFilter(filter);
                                    }}
                                >
                                    <View />
                                </Link>
                            </div>
                        )
                ) : null}
            </ESToolTip>
            <ESToolTip placement="top" text={<IntlMessages id="app.edit" />}>
                {hasEditPermission && edit ? (
                    typeof edit === "function" ? (
                        <div className="scooterIC">
                            <a href="/#"
                                onClick={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    edit();
                                }}
                            >
                                <Edit />
                            </a>
                        </div>
                    ) : (
                            <div className="scooterIC">
                                <Link
                                    to={{
                                        pathname: edit,
                                        filter: filter,
                                        franchiseeId: franchiseeId ? franchiseeId : ''
                                    }}
                                    // to={edit}
                                    onClick={event => {
                                        event.stopPropagation();
                                        // storeFilter(filter);
                                    }}
                                >
                                    <Edit />
                                </Link>
                            </div>
                        )
                ) : null}
            </ESToolTip>
            <ESToolTip placement="top" text={<IntlMessages id="app.delete" />}>
                {hasDeletePermission && deleteObj && deleteObj.documentId ? (
                    <div className="scooterIC">
                        <a
                            href="/#"
                            onClick={event => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleDelete(deleteObj, deleteMsg, deleteFn);
                            }}
                        >
                            <Delete />
                        </a>
                    </div>
                ) : null}
            </ESToolTip>
            {displayAfter}
        </div>
        //     <React.Fragment>
        //         {
        //             add ?
        //                 <Tooltip title={addTitle}>
        //                     {
        //                         typeof add === 'function' ? (
        //                             <Icon type="plus" className="gx-text-success-dark"
        //                                 onClick={event => {
        //                                     event.stopPropagation();
        //                                     add();
        //                                 }}
        //                             />
        //                         ) : (
        //                                 <Link to={add}>
        //                                     <Icon type="plus" className="gx-text-success-dark" />
        //                                 </Link>
        //                             )
        //                     }
        //                 </Tooltip>
        //                 : null
        //         }

        //         {
        //             view ?
        //                 <React.Fragment>
        //                     {add ? <Divider type="vertical" /> : null}

        //                     <Tooltip title={viewTitle}>
        //                         {
        //                             typeof view === 'function' ? (
        //                                 <Icon type="eye" className="gx-text-primary"
        //                                     onClick={event => {
        //                                         event.stopPropagation();
        //                                         view();
        //                                     }}
        //                                 />
        //                             ) : (
        //                                     <Link to={view} target={viewTarget}>
        //                                         <Icon type="eye" className="gx-text-primary" />
        //                                     </Link>
        //                                 )
        //                         }
        //                     </Tooltip>
        //                 </React.Fragment>
        //                 : null
        //         }

        //         {
        //             edit ?
        //                 <React.Fragment>
        //                     {add || view ? <Divider type="vertical" /> : null}

        //                     <Tooltip title={editTitle}>
        //                         {
        //                             typeof edit === 'function' ? (
        //                                 <Icon type="edit" className="gx-text-purple"
        //                                     onClick={event => {
        //                                         event.stopPropagation();
        //                                         edit();
        //                                     }}
        //                                 />
        //                             ) : (
        //                                     <Link to={edit}>
        //                                         <Icon type="edit" className="gx-text-purple" />
        //                                     </Link>
        //                                 )
        //                         }
        //                     </Tooltip>
        //                 </React.Fragment>
        //                 : null
        //         }

        //         {
        //             deleteObj && deleteObj.documentId ?
        //                 <React.Fragment>
        //                     {add || view || edit ? <Divider type="vertical" /> : null}

        //                     <Tooltip title={deleteTitle}>
        //                         <a className="gx-text-danger"
        //                             onClick={event => {
        //                                 event.stopPropagation();

        //                                 handleDelete(deleteObj, deleteMsg, deleteFn);
        //                             }}>
        //                             <Icon type="delete" />
        //                         </a>
        //                     </Tooltip>
        //                 </React.Fragment>
        //                 : null
        //         }
        //     </React.Fragment>
        // );
    );
};

ActionButtons.propTypes = propTypes;
ActionButtons.defaultProps = defaultProps;

const mapStateToProps = ({ auth }) => {
    return { auth };
};

export default connect(mapStateToProps)(ActionButtons);
