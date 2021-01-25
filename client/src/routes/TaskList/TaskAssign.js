import React, { Component } from "react";
import { Menu, Input, Avatar } from "antd";
const { Search } = Input;
const taskAssignArray = [
    {
        name: "john doe",
        desc: "Testing data"
    },
    {
        name: "yante konal",
        desc: "Testing data"
    },
    {
        name: "duret grio",
        desc: "Testing data"
    },
    {
        name: "lekmo olfe",
        desc: "Testing data"
    }
];

class TaskAssign extends Component {
    render() {
        return (
            <Menu className="priority-dropdown assign-user-dropdown">
                <div>
                    <div className="assign-block search-assign-block SearchBarwithBtn">
                        <Search placeholder="Search" />
                    </div>
                </div>
                {taskAssignArray.map((d, index) => {
                    return (
                        <Menu.Item key={index}>
                            <a href="" className="assign-block">
                                .
                                <Avatar className="assign-task-avatar">
                                    {d.name}
                                </Avatar>
                                <span className="avatar-user-name">
                                    {d.name}
                                </span>
                            </a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    }
}

export default TaskAssign;
