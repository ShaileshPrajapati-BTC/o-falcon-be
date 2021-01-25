import React, { Component } from "react";
import { ReactComponent as Priority } from "./svg/priority.svg";

class PriorityAddForm extends Component {
    render() {
        return (
            <span className="d-flex flex-align-center priority_popup_in">
                <div key="0">
                    <div href="" className="urgent priority_label">
                        <Priority />
                        Urgent
                    </div>
                </div>
                <div key="1">
                    <div href="" className="high priority_label">
                        <Priority />
                        High
                    </div>
                </div>
                <div key="3">
                    <div className="normal priority_label">
                        <Priority />
                        Normal
                    </div>
                </div>
                <div key="4">
                    <div className="low priority_label">
                        <Priority />
                        Low
                    </div>
                </div>
            </span>
        );
    }
}

export default PriorityAddForm;
