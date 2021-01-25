import React, { Component } from "react";

class TaskListHeader extends Component {
    render() {
        return (
            <div className="task_list_top">
                <div className="task_list-col">
                    <span className="status-block">open</span>5 Task
                </div>
                <div className="task_list-col_1">
                    <div className="task_list_col_sub">Assignee</div>
                    <div className="task_list_col_sub">Due Date</div>
                    <div className="task_list_col_sub">Priority</div>
                    <div className="task_list_col_sub">Progress</div>
                </div>
            </div>
        );
    }
}
export default TaskListHeader;
