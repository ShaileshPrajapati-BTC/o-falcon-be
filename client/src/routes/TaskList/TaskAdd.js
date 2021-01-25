import React, { Component } from "react";

import { Select, Avatar, Dropdown, Tooltip, DatePicker } from "antd";
import { ReactComponent as Attachment } from "./svg/attachment.svg";
import TaskAssign from "./TaskAssign";
import { ReactComponent as UserAssign } from "./svg/user-assign.svg";
import PriorityAddForm from "./PriorityAddForm ";

function onOk(value) {
    console.log("onOk: ", value);
}

const { Option } = Select;

class TaskAdd extends Component {
    render() {
        return (
            <div>
                <div className="notes-list-top-block">
                    <span className="task_top-title">Riders Name :</span>
                    <span className="task_top-name">John Rambo</span>
                </div>
                <div className="new_task_add_popup">
                    <div className="task_title_popup mb-20">
                        <Select
                            showSearch
                            placeholder="Title"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Option value="jack">Jack</Option>
                            <Option value="lucy">Lucy</Option>
                            <Option value="tom">Tom</Option>
                        </Select>
                    </div>
                    <div className="task-comment">
                        <textarea placeholder="Description or type '/' for commands"></textarea>
                    </div>
                    <div className="d-flex justify-content-between mb-20">
                        <div className="attach-image-block">
                            <span className="task_add_label">Attachments</span>
                            <span className="attach-_icon_block">
                                <Attachment />
                                <span>
                                    Drag & Drop files to attach or{" "}
                                    <label for="attch-img">Browse</label>
                                </span>
                                <input type="file" id="attch-img" />
                            </span>
                        </div>
                        <div className="attach-image-block">
                            <span className="task_add_label">Assign To</span>
                            <span className="">
                                <span className="d-flex flex-align-center">
                                    <Avatar className="assign-task-avatar">
                                        M
                                    </Avatar>

                                    <Dropdown
                                        overlay={<TaskAssign />}
                                        trigger={["click"]}
                                        className="task-priority-dropdown"
                                    >
                                        <Tooltip
                                            title="AssignedTo"
                                            placement="top"
                                            className="ant-dropdown-link"
                                            href="#"
                                        >
                                            <UserAssign />
                                        </Tooltip>
                                    </Dropdown>
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <div className="attach-image-block due-datepicker">
                            <span className="task_add_label">Due Date</span>
                            <span className="">
                                <DatePicker
                                    showTime
                                    placeholder="Select Date and  Time"
                                    onOk={onOk}
                                />
                            </span>
                        </div>
                        <div className="attach-image-block">
                            <span className="task_add_label">Set Priority</span>
                            <span className="">
                                <PriorityAddForm />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TaskAdd;
