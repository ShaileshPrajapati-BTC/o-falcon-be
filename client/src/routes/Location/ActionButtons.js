/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React                             from 'react';
import PropTypes                         from 'prop-types';
import { Divider, Icon, Modal, Tooltip } from 'antd';
import { Link }                          from 'react-router-dom';
import CrudService                       from '../../services/api';

const propTypes = {
    add       : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    view      : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    viewTarget: PropTypes.string,
    edit      : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    softDelete: PropTypes.bool,
    deleteMsg : PropTypes.string
};

const defaultProps = {
    addTitle   : 'Add',
    viewTitle  : 'View',
    viewTarget : null,
    editTitle  : 'Edit',
    deleteTitle: 'Delete',
    softDelete : false,
    deleteMsg  : 'Sure to delete this record?'
};

const handleDelete = (options, deleteMsg, deleteFn) => {
    Modal.confirm({
        title     : deleteMsg,
        okText    : 'Yes',
        okType    : 'danger',
        cancelText: 'No',
        onOk() {
            CrudService.removeDocument(options, (res) => {
                deleteFn(res);
            });
        }
    });
};

const ActionButtons = (props) => {
    const {
              addTitle, add,
              viewTitle, view, viewTarget, editTitle, edit,
              deleteTitle, deleteObj, deleteMsg, deleteFn
          } = props;

    return (
        <React.Fragment>
            {
                add ?
                    <Tooltip title={addTitle}>
                        {
                            typeof add === 'function' ? (
                                <Icon type="plus" className="gx-text-success-dark"
                                      onClick={event => {
                                          event.stopPropagation();
                                          add();
                                      }}
                                />
                            ) : (
                                <Link to={add}>
                                    <Icon type="plus" className="gx-text-success-dark" />
                                </Link>
                            )
                        }
                    </Tooltip>
                    : null
            }

            {
                view ?
                    <React.Fragment>
                        {add ? <Divider type="vertical" /> : null}

                        <Tooltip title={viewTitle}>
                            {
                                typeof view === 'function' ? (
                                    <Icon type="eye" className="gx-text-primary"
                                          onClick={event => {
                                              event.stopPropagation();
                                              view();
                                          }}
                                    />
                                ) : (
                                    <Link to={view} target={viewTarget}>
                                        <Icon type="eye" className="gx-text-primary" />
                                    </Link>
                                )
                            }
                        </Tooltip>
                    </React.Fragment>
                    : null
            }

            {
                edit ?
                    <React.Fragment>
                        {add || view ? <Divider type="vertical" /> : null}

                        <Tooltip title={editTitle}>
                            {
                                typeof edit === 'function' ? (
                                    <Icon type="edit" className="gx-text-purple"
                                          onClick={event => {
                                              event.stopPropagation();
                                              edit();
                                          }}
                                    />
                                ) : (
                                    <Link to={edit}>
                                        <Icon type="edit" className="gx-text-purple" />
                                    </Link>
                                )
                            }
                        </Tooltip>
                    </React.Fragment>
                    : null
            }

            {
                deleteObj && deleteObj.documentId ?
                    <React.Fragment>
                        {add || view || edit ? <Divider type="vertical" /> : null}

                        <Tooltip title={deleteTitle}>
                            <a className="gx-text-danger"
                               onClick={event => {
                                   event.stopPropagation();

                                   handleDelete(deleteObj, deleteMsg, deleteFn);
                               }}>
                                <Icon type="delete" />
                            </a>
                        </Tooltip>
                    </React.Fragment>
                    : null
            }
        </React.Fragment>
    );
};

ActionButtons.propTypes    = propTypes;
ActionButtons.defaultProps = defaultProps;

export default ActionButtons;