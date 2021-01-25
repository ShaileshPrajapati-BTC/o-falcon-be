import { PAGE_PERMISSION, NEST_VISIBLE, NEST_ROUTE, NEST_LABEL, USER_TYPES, FRANCHISEE_LABEL, FILTER_BY_FLEET_TYPE, DEALER_LABEL, FRANCHISEE_VISIBLE, ZONE_LABEL, CLIENT_VISIBLE } from "../../constants/Common";
import { Empty, Icon, Spin, Tag } from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import Search from "../../components/ESSearch";
import CustomScrollbars from "util/CustomScrollbars";
import FilterDropdown from "../../components/FilterDropdown";
import { Link } from "react-router-dom";
import ESPagination from "../../components/ESPagination";
import ESToolTip from "../../components/ESToolTip";
import ESTag from "../../components/ESTag";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import IntlMessages from "../../util/IntlMessages";
const _ = require("lodash");

class ZoneList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { zoneList, loading, authUser } = this.props;
        const isDealer = authUser.type === USER_TYPES.DEALER
        let menuPermission = authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, {
            module: Number(PAGE_PERMISSION.NEST)
        });
        let hasNestListPermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.list;
        let zoneIndex = _.findIndex(menuPermission, {
            module: Number(PAGE_PERMISSION.ZONES)
        });
        let hasZoneDeletePermission =
            menuPermission[zoneIndex] &&
            menuPermission[zoneIndex].permissions &&
            menuPermission[zoneIndex].permissions.delete;
        let hasZoneClonePermission = menuPermission[zoneIndex] &&
            menuPermission[zoneIndex].permissions &&
            menuPermission[zoneIndex].permissions.add;
        return (
            <>
                <div
                    style={{
                        padding: 10,
                        borderBottom: "solid 1px #e8e8e8",
                        backgroundColor: "#fbfbfb"
                    }}
                >
                    <div className="zoneFilter">
                        {this.props.FilterArray.map((filter, index) => {
                            return (
                                filter.visible && (
                                    <FilterDropdown
                                        title1={filter.title}
                                        list={filter.list}
                                        defaultSelected={filter.defaultSelected}
                                        key={filter.key}
                                        handleSelection={val => {
                                            this.props.handleSelection(
                                                val,
                                                filter.key,
                                                filter.list
                                            );
                                        }}
                                    />
                                )
                            );
                        })}
                    </div>
                    <div className="SearchBarwithBtn riderSearchBar gx-mt-4">
                        <Search
                            handelSearch={this.props.onSearch}
                            filter={this.props.filter}
                            keys={["name"]}
                            placeholder={`Search by Name`}
                            width="100%"
                        />
                    </div>
                    <div
                        className="SearchBarwithBtn riderSearchBar gx-mt-4"
                        style={{ paddingLeft: 230 }}
                    >
                        {this.props.paginate ? (
                            <ESPagination
                                limit={this.props.limit}
                                total={this.props.total}
                                fetch={this.props.fetch.bind(this)}
                                page={this.props.page}
                            />
                        ) : null}
                    </div>
                </div>
                <div className="gx-module-side-content">
                    <CustomScrollbars>
                        <Spin spinning={loading} delay={100}>
                            {zoneList.length ? (
                                <div className="gx-module-side-nav">
                                    <ul className="gx-module-nav">
                                        {zoneList.map((option, index) => {
                                            return (
                                                <li
                                                    key={option.id}
                                                    className="gx-nav-item zoneList"
                                                >
                                                    <div
                                                        className={`gx-chat-user-item ${this.props.selectedZoneId === option.id ? "active" : ""}`}
                                                    >
                                                        <div className="gx-chat-user-row nest-index ">
                                                            <div
                                                                className="gx-chat-avatar"
                                                                style={{
                                                                    paddingTop: 5
                                                                }}
                                                            >
                                                                <div className="gx-status-pos ">
                                                                    ({" "}
                                                                    {index + 1}{" "}
                                                                    )
                                                                </div>
                                                            </div>
                                                            <div className="gx-chat-info">
                                                                <div
                                                                    className="gx-flex-row"
                                                                    style={{
                                                                        marginTop:
                                                                            "5px"
                                                                    }}
                                                                >
                                                                    <span
                                                                        className="gx-chat-info-des"
                                                                        onClick={() => {
                                                                            return this.props.viewZone(
                                                                                option
                                                                            );
                                                                        }}
                                                                    >
                                                                        <a href="/#"
                                                                            onClick={e => { e.preventDefault(); }}
                                                                            className="gx-name h4 gx-text-capitalize"
                                                                        > {" "} {option.name}{" "}</a>
                                                                        {this.props.authUser.type !== USER_TYPES.DEALER &&
                                                                            option.franchiseeId &&
                                                                            option.franchiseeId.id !== this.props.authUser.id &&
                                                                            option.franchiseeId.name &&
                                                                            FRANCHISEE_VISIBLE &&
                                                                            <h5 className="gx-name" style={{ margin: 0 }}><b>{FRANCHISEE_LABEL}:</b> {option.franchiseeId.name ? option.franchiseeId.name : ''}</h5>
                                                                        }
                                                                        {this.props.authUser.type === USER_TYPES.FRANCHISEE &&
                                                                            option.dealerId &&
                                                                            option.dealerId.name &&
                                                                            CLIENT_VISIBLE &&
                                                                            <h5 className="gx-name" style={{ margin: 0 }}><b>{DEALER_LABEL}:</b> {option.dealerId.name ? option.dealerId.name : ''}</h5>
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className="zoneActionButton"
                                                                        style={{
                                                                            textAlign:
                                                                                "end"
                                                                        }}
                                                                    >
                                                                        <ActiveDeactive
                                                                            onSuccess={this.props.fetch.bind(
                                                                                this
                                                                            )}
                                                                            key={
                                                                                option.id
                                                                            }
                                                                            documentId={
                                                                                option.id
                                                                            }
                                                                            isActive={
                                                                                option.isActive
                                                                            }
                                                                            model="zone"
                                                                        />
                                                                        <span className="gx-chat-date">
                                                                            <ActionButtons
                                                                                pageId={
                                                                                    PAGE_PERMISSION.ZONES
                                                                                }
                                                                                displayBefore={
                                                                                    <>
                                                                                        {!isDealer && hasZoneClonePermission && <div className="scooterIC">
                                                                                            <a
                                                                                                href="/#"
                                                                                                onClick={e => {
                                                                                                    e.preventDefault();
                                                                                                }}
                                                                                            >
                                                                                                <ESToolTip
                                                                                                    placement="top"
                                                                                                    text={<IntlMessages id="app.zone.clone" />}
                                                                                                >
                                                                                                    <Icon
                                                                                                        type="copy"
                                                                                                        style={{
                                                                                                            marginRight: 0
                                                                                                        }}
                                                                                                        onClick={() => {
                                                                                                            return this.props.editZone(
                                                                                                                option,
                                                                                                                "clone"
                                                                                                            );
                                                                                                        }}
                                                                                                    />
                                                                                                </ESToolTip>
                                                                                            </a>
                                                                                        </div>}
                                                                                        {NEST_VISIBLE &&
                                                                                            hasNestListPermission && (
                                                                                                <div className="scooterIC">
                                                                                                    <div
                                                                                                        onClick={e => {
                                                                                                            e.preventDefault();
                                                                                                        }}
                                                                                                    >
                                                                                                        <Link
                                                                                                            to={{
                                                                                                                pathname: `/e-scooter/${NEST_ROUTE}/${option.id}`,
                                                                                                                filter: this
                                                                                                                    .props
                                                                                                                    .filter
                                                                                                            }}
                                                                                                        >
                                                                                                            <ESToolTip
                                                                                                                placement="top"
                                                                                                                text={NEST_LABEL}
                                                                                                            >
                                                                                                                <Icon
                                                                                                                    type="man"
                                                                                                                    style={{
                                                                                                                        marginRight: 0
                                                                                                                    }}
                                                                                                                />
                                                                                                            </ESToolTip>
                                                                                                        </Link>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        {hasZoneDeletePermission && (
                                                                                            <div className="scooterIC">
                                                                                                <div
                                                                                                    onClick={e => {
                                                                                                        e.preventDefault();
                                                                                                    }}
                                                                                                >
                                                                                                    <a
                                                                                                        href="/#"
                                                                                                        onClick={event => {
                                                                                                            event.preventDefault();
                                                                                                            event.stopPropagation();
                                                                                                            this.props.handleDelete(option.id);
                                                                                                        }}
                                                                                                    >
                                                                                                        <ESToolTip
                                                                                                            placement="top"
                                                                                                            text={<IntlMessages id="app.delete" />}
                                                                                                        >
                                                                                                            <Delete />
                                                                                                        </ESToolTip>
                                                                                                    </a>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                }
                                                                                edit={() => {
                                                                                    return this.props.editZone(
                                                                                        option,
                                                                                        "edit"
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </span>
                                                                        <br />
                                                                        <span style={{ paddingTop: 9 }}>
                                                                            {(this.props.authUser.type === USER_TYPES.FRANCHISEE || this.props.authUser.type === USER_TYPES.DEALER) &&
                                                                                option.fleetType &&
                                                                                option.fleetType !== 0 ?
                                                                                < ESTag
                                                                                    status={option.fleetType}
                                                                                    filterArray={FILTER_BY_FLEET_TYPE}
                                                                                /> : ''}
                                                                            {option.isAutoCreated ?
                                                                                <Tag color="green"> <IntlMessages id="app.zone.autoCreated" />  </Tag>
                                                                                : null
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />)}
                        </Spin>
                    </CustomScrollbars>
                </div>
            </>
        );
    }
}
export default ZoneList;
