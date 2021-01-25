import React, { Component } from "react";
import { Tooltip, DatePicker, Dropdown, Progress } from "antd";
import "../TaskList/task.less";
import { ReactComponent as Edit } from "./svg/edit.svg";
import { ReactComponent as Attachment } from "./svg/attachment.svg";
import { ReactComponent as Check } from "./svg/check.svg";
import { ReactComponent as Deleted } from "./svg/deleted.svg";
import { ReactComponent as UserAssign } from "./svg/user-assign.svg";
import { ReactComponent as Priority } from "./svg/priority.svg";
import PriorityMenu from "./PriorityMenu";
import TaskAssign from "./TaskAssign";
function onOk(value) {
    console.log("onOk: ", value);
}

const taskData = [
    {
        name: "1st",
        description: "Schema-Admin user can create"
    },
    {
        name: "2st",
        description: "Schema-Admin user can create"
    },
    {
        name: "3st",
        description: "Schema-Admin user can create"
    },
    {
        name: "4st",
        description: "Schema-Admin user can create"
    },
    {
        name: "5st",
        description: "Schema-Admin user can create"
    }
];

class TaskList extends Component {
    render() {
        return (
            <div>
                {taskData.map((d, index) => {
                    return (
                        <div key={index} className="task_list_detail">
                            <div className="task_detail_col">
                                <div className="task_detail_hover">
                                    <h2 className="task_title">
                                        <div className="status-done">
                                            <Check />
                                        </div>
                                        {d.description}
                                    </h2>
                                    <div className="status_icon_wrapper">
                                        <div className="status_icon">
                                            <Tooltip
                                                title="Edit"
                                                placement="top"
                                            >
                                                <Edit />
                                            </Tooltip>
                                        </div>
                                        <div className="status_icon">
                                            <Tooltip
                                                title="Attachment"
                                                placement="top"
                                            >
                                                <Attachment />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="task_detail_col_1">
                                <div className="task_detail_sub_col">
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
                                </div>
                                <div className="task_detail_sub_col">
                                    <Tooltip title="Due Date" placement="top">
                                        <DatePicker
                                            className="due-date"
                                            showTime
                                            placeholder="Select Time"
                                            onOk={onOk}
                                        ></DatePicker>
                                    </Tooltip>
                                </div>
                                <div className="task_detail_sub_col task_priority">
                                    <Tooltip
                                        title="Set Priority"
                                        placement="top"
                                    >
                                        <Dropdown
                                            overlay={<PriorityMenu />}
                                            trigger={["click"]}
                                            className="task-priority-dropdown"
                                        >
                                            <a
                                                className="ant-dropdown-link"
                                                href="#"
                                            >
                                                <Priority />
                                            </a>
                                        </Dropdown>
                                    </Tooltip>
                                </div>
                                <div className="task_detail_sub_col task_progress_block">
                                    <Tooltip title="Progress" placement="top">
                                        <Progress
                                            className="task_progress"
                                            type="circle"
                                            percent={30}
                                            width={80}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Deleted" placement="top">
                                        <div className="task_more_icon">
                                            <Deleted />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default TaskList;
