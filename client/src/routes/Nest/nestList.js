import {
    FILTER_BY_NEST_TYPE,
    PAGE_PERMISSION,
    ADD_VEHICLE_INTO_NEST,
    NEST_LABEL,
    NEST_TYPE,
    NEST_LABEL_STRING
} from "../../constants/Common";
import {
    Empty, Spin, Icon
} from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import ESTag from "../../components/ESTag";
import Search from "../../components/ESSearch";
import CustomScrollbars from "util/CustomScrollbars";
import FilterDropdown from "../../components/FilterDropdown";
import ESToolTip from "../../components/ESToolTip";
import ESPagination from "../../components/ESPagination";

class NestList extends Component {
    constructor() {
        super();
        this.state = {
        }
    }
    render() {
        const { nestList, loading } = this.props;
        return (
            <>
                <div style={{ padding: 10, borderBottom: 'solid 1px #e8e8e8', backgroundColor: '#fbfbfb' }}>
                    <div className="zoneFilter">
                        {this.props.FilterArray.map(filter => {
                            return (
                                filter.visible && (
                                    <FilterDropdown
                                        title1={filter.title}
                                        list={filter.list}
                                        defaultSelected={filter.defaultSelected}
                                        handleSelection={(val) => {
                                            this.props.handleSelection(val, filter.key, filter.list);
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
                            placeholder={`Search by ${NEST_LABEL_STRING}  Name`}
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
                            {nestList.length ? (
                                <div className="gx-module-side-nav">
                                    <ul className="gx-module-nav">
                                        {nestList.map((option, index) => {
                                            return (
                                                <li key={option.id} className="gx-nav-item zoneList">
                                                    <div
                                                        className={`gx-chat-user-item ${this.props.selectedNestId === option.id ? "active" : ""}`}
                                                    >
                                                        <div className="gx-chat-user-row nest-index ">
                                                            <div className="gx-chat-avatar" style={{ paddingTop: 5 }}>
                                                                <div className="gx-status-pos ">
                                                                    ( {index + 1} )
                                                            </div>
                                                            </div>
                                                            <div className="gx-chat-info">
                                                                <div
                                                                    className="gx-flex-row"
                                                                    style={{ marginTop: "5px" }}
                                                                >
                                                                    <span
                                                                        className="gx-chat-info-des"
                                                                        onClick={() => { return this.props.viewNest(option); }}
                                                                    >
                                                                        <a href="/#" onClick={(e) => { e.preventDefault(); }} className="gx-name h4 gx-text-capitalize"> {option.name} </a>
                                                                        {(option.type === NEST_TYPE.NEST_REPAIR || option.type === NEST_TYPE.NEST_DOCKING_STATION) &&
                                                                            option.capacity &&
                                                                            <h4 className="gx-name">Max Capacity: {option.capacity}</h4>
                                                                        }
                                                                        {option.type === NEST_TYPE.SLOW_SPEED &&
                                                                            option.speedLimit &&
                                                                            <h4 className="gx-name">Speed Limit: {option.speedLimit}</h4>
                                                                        }
                                                                    </span>
                                                                    <span className="zoneActionButton" style={{ textAlign: 'end' }}>
                                                                        <ActiveDeactive
                                                                            onSuccess={this.props.fetch.bind(this)}
                                                                            key={option.id}
                                                                            documentId={option.id}
                                                                            isActive={option.isActive}
                                                                            model="nest"
                                                                        />
                                                                        <span className="gx-chat-date">
                                                                            <ActionButtons
                                                                                pageId={PAGE_PERMISSION.NEST}
                                                                                edit={() => { return this.props.editNest(option); }}
                                                                                deleteObj={{
                                                                                    documentId: option.id,
                                                                                    page: 'nest'
                                                                                }}
                                                                                deleteMsg={`Sure to delete this ${NEST_LABEL}?`}
                                                                                deleteFn={res => { this.props.deleteNest(res.documentId) }}
                                                                            // displayAfter={ADD_VEHICLE_INTO_NEST &&
                                                                            //     <ESToolTip placement="top" text="Add Vehicle">
                                                                            //         <div className="scooterIC">
                                                                            //             <a href="/#" onClick={(e) => e.preventDefault()}>
                                                                            //                 <Icon
                                                                            //                     style={{ marginLeft: 15 }}
                                                                            //                     type="plus"
                                                                            //                     onClick={() => { return this.props.addVehicle(option.id, option.capacity - option.totalVehicles); }}
                                                                            //                 />
                                                                            //             </a>
                                                                            //         </div>
                                                                            //     </ESToolTip>
                                                                            // }
                                                                            />
                                                                        </span><br />
                                                                        <span style={{ paddingTop: 9 }}>
                                                                            {option.type && <ESTag
                                                                                status={option.type}
                                                                                filterArray={FILTER_BY_NEST_TYPE}
                                                                            />}
                                                                            {/* {index === 1
                                                                                ? <Tag color='green'> Available</Tag>
                                                                                : index === 2
                                                                                    ? <Tag color='purple'> Partially Occupied</Tag>
                                                                                    : index === 3
                                                                                        ? <Tag color='orange'> Occupied </Tag>
                                                                                        : <Tag color='red'>Over-occupied</Tag>
                                                                            } */}

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
                            ) : (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                        </Spin>
                    </CustomScrollbars>
                </div>
            </>
        );
    }
}
export default NestList;