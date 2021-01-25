import React, { Component } from "react";
import { Menu } from "antd";

const prioritySvgArray = [
    {
        name: "Urgent",
        image: require("./svg/urgent-p.svg")
    },
    {
        name: "High",
        image: require("./svg/high-p.svg")
    },
    {
        name: "Normal",
        image: require("./svg/normal-p.svg")
    },
    {
        name: "Low",
        image: require("./svg/low-p.svg")
    },
    {
        name: "Clear",
        image: require("./svg/clear-p.svg")
    }
];

class PriorityMenu extends Component {
    render() {
        return (
            <Menu className="priority-dropdown">
                {prioritySvgArray.map((d, index) => {
                    return (
                        <Menu.Item key={index}>
                            <a href="" className="priority-urgent">
                                <img src={d.image} alt={d.name} width={15} />
                            {d.name}
                            </a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    }
}

export default PriorityMenu;
