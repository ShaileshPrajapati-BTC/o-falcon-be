import React, {Component} from 'react';
import {Modal, Progress, Avatar, DatePicker, Menu, Dropdown, Button, Input, Tooltip} from 'antd';
import "../Task/task.less";
import {ReactComponent as Edit} from './svg/edit.svg';
import {ReactComponent as Attachment} from './svg/attachment.svg';
import {ReactComponent as Check} from './svg/check.svg';
import {ReactComponent as Deleted} from './svg/deleted.svg';
import {ReactComponent as UserAssign} from './svg/user-assign.svg';
import {ReactComponent as Priority} from './svg/priority.svg';
import {ReactComponent as AddTask} from './svg/add.svg';
import {ReactComponent as Clear} from './svg/clear.svg';

function onOk(value) {
    console.log('onOk: ', value);
}

const {Search} = Input;

const menu = (
    <Menu className="priority-dropdown">
        <Menu.Item key="0">
            <a href="" className="urgent">
                <svg viewBox="0 0 24 24" id="svg-sprite-priorities" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6.5c.4 0 .6.3.6.6v21.7c0 .4-.3.6-.6.6-.4 0-.6-.3-.6-.6V1c0-.2.3-.5.6-.5z"></path>
                    <path d="M4.6 2.4H21l-4 5 4 5.2H4.7"></path>
                </svg>
                Urgent</a>
        </Menu.Item>
        <Menu.Item key="1">
            <a href="" className="high">
                <svg viewBox="0 0 24 24" id="svg-sprite-priorities" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6.5c.4 0 .6.3.6.6v21.7c0 .4-.3.6-.6.6-.4 0-.6-.3-.6-.6V1c0-.2.3-.5.6-.5z"></path>
                    <path d="M4.6 2.4H21l-4 5 4 5.2H4.7"></path>
                </svg>
                High</a>
        </Menu.Item>
        <Menu.Item key="3">
            <a className="normal">
                <svg viewBox="0 0 24 24" id="svg-sprite-priorities" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6.5c.4 0 .6.3.6.6v21.7c0 .4-.3.6-.6.6-.4 0-.6-.3-.6-.6V1c0-.2.3-.5.6-.5z"></path>
                    <path d="M4.6 2.4H21l-4 5 4 5.2H4.7"></path>
                </svg>
                Normal
            </a>
        </Menu.Item>
        <Menu.Item key="4">
            <a className="low">
                <svg viewBox="0 0 24 24" id="svg-sprite-priorities" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6.5c.4 0 .6.3.6.6v21.7c0 .4-.3.6-.6.6-.4 0-.6-.3-.6-.6V1c0-.2.3-.5.6-.5z"></path>
                    <path d="M4.6 2.4H21l-4 5 4 5.2H4.7"></path>
                </svg>
                Low
            </a>
        </Menu.Item>
        <Menu.Item key="5">
            <a className="clear">
                <svg enable-background="new 0 0 47.971 47.971" version="1.1" viewBox="0 0 47.971 47.971"
                     xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88   c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242   C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879   s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"/>
                </svg>
                Clear
            </a>
        </Menu.Item>
    </Menu>
);
const menu1 = (
    <Menu className="priority-dropdown assign-user-dropdown">
        <div>
            <div className="assign-block search-assign-block SearchBarwithBtn">
                <Search
                    placeholder="Search"
                />
            </div>
        </div>
        <Menu.Item key="0">
            <a href="" className="assign-block">
                <Avatar style={{color: '#FFF', backgroundColor: '#28acc2'}}>M</Avatar>
                <span className="avatar-user-name">Me</span>
            </a>
        </Menu.Item>
        <Menu.Item key="1">
            <a href="" className="assign-block">
                <Avatar style={{color: '#FFF', backgroundColor: '#28acc2'}}>M</Avatar>
                <span className="avatar-user-name">Parul Bhayani</span>
            </a>
        </Menu.Item>
        <Menu.Item key="2">
            <a href="" className="assign-block">
                <Avatar style={{color: '#FFF', backgroundColor: '#28acc2'}}>M</Avatar>
                <span className="avatar-user-name">Me</span>
            </a>
        </Menu.Item>
        <Menu.Item key="3">
            <a href="" className="assign-block">
                <Avatar style={{color: '#FFF', backgroundColor: '#28acc2'}}>M</Avatar>
                <span className="avatar-user-name">Me</span>
            </a>
        </Menu.Item>
    </Menu>
);

class Task extends Component {
    state = {
        loading: false,
        visible: false,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.setState({loading: true});
        setTimeout(() => {
            this.setState({loading: false, visible: false});
        }, 3000);
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        const {visible, loading} = this.state;
        return (
            <div>
                <div className="todo-modal-title" onClick={this.showModal}>
                    Task
                </div>
                <Modal
                    className="task-list-popup"
                    visible={visible}
                    title={false}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={false}
                >
                    <div className="notes-list-top-block">
                        <span className="task-title">ToDo</span>
                    </div>
                    <div className="task-list">
                        <div className="task_list_wrapper">
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
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                     <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail New_task_add">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="task-close">
                                                <Clear/>
                                            </div>
                                            <input placeholder="Task name or type '/' for commands" type="text" />
                                        </h2>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                       <Button type="primary">Save</Button>
                                    </div>
                                </div>
                            </div>
                            <span className="new-task-add">
                            <AddTask/>
                            <span>New task</span>
                        </span>
                        </div>
                        <div className="task_list_wrapper done_stauts">
                            <div className="task_list_top">
                                <div className="task_list-col">
                                    <span className="status-block done_block">Close</span>5 Task
                                </div>
                                <div className="task_list-col_1">
                                    <div className="task_list_col_sub">Assignee</div>
                                    <div className="task_list_col_sub">Due Date</div>
                                    <div className="task_list_col_sub">Priority</div>
                                    <div className="task_list_col_sub">Progress</div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="task_list_detail">
                                <div className="task_detail_col">
                                    <div className="task_detail_hover">
                                        <h2 className="task_title">
                                            <div className="status-done">
                                                <Check/>
                                            </div>
                                            Schema-Admin user can create
                                        </h2>
                                        <div className="status_icon_wrapper">
                                            <div className="status_icon">
                                                <Tooltip title="Edit" placement="top">
                                                    <Edit/>
                                                </Tooltip>
                                            </div>
                                            <div className="status_icon">
                                                <Tooltip title="Attachment" placement="top">
                                                    <Attachment/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="task_detail_col_1">
                                    <div className="task_detail_sub_col">
                                        <Dropdown overlay={menu1} trigger={['click']}
                                                  className="task-priority-dropdown">
                                            <Tooltip title="AssignedTo" placement="top" className="ant-dropdown-link"
                                                     href="#">
                                                <UserAssign/>
                                            </Tooltip>
                                        </Dropdown>
                                    </div>
                                    <div className="task_detail_sub_col">
                                        <Tooltip title="Due Date" placement="top">
                                            <DatePicker className="due-date" showTime placeholder="Select Time"
                                                        onOk={onOk}>
                                                {/*<img src={require("../Task/svg/date.svg")} alt="" />*/}
                                            </DatePicker>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_priority">
                                        <Tooltip title="Set Priority" placement="top">
                                            <Dropdown overlay={menu} trigger={['click']}
                                                      className="task-priority-dropdown">
                                                <a className="ant-dropdown-link" href="#">
                                                    <Priority/>
                                                </a>
                                            </Dropdown>
                                        </Tooltip>
                                    </div>
                                    <div className="task_detail_sub_col task_progress_block">
                                        <Tooltip title="Progress" placement="top">
                                            <Progress className="task_progress" type="circle" percent={30} width={80}/>
                                        </Tooltip>
                                        <Tooltip title="Deleted" placement="top">
                                            <div className="task_more_icon">
                                                <Deleted/>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default Task;