import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
import  "../AddNotes/add-notes.css";

class AddNotes extends Component {
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

    constructor(props) {
        super(props);
        this.state = {
            noteclick: false
        }
    }

    handleNoteAdd() {
        this.setState({
            noteclick: !this.state.noteclick
        })
    }

    render() {
        const {visible} = this.state;
        return (
            <div>
                <div className="note-label" onClick={this.showModal}>
                  {/*  <Notes/>*/}
                    Notes
                </div>
                <Modal
                    className="note-list-popup"
                    visible={visible}
                    title={false}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={false}
                >
                    <div className="notes-list-top-block">
                        <div className="">
                            <span className="note-title">Riders Name :</span>
                            <span className="note-name">John Rambo</span>
                        </div>
                        <div className="topbarCommonBtn">
                           <Button type="primary" onClick={() => {
                               this.handleNoteAdd()}}>
                                   <span>
                                       <AddButton/>
                                   </span>
                                    <span>Add Notes</span>
                           </Button>
                        </div>
                    </div>
                    {this.state.noteclick ?
                        <div className="note-add_block">
                            <div className="notes-comment mb-20">
                                <textarea placeholder="Add Notes.." ></textarea>
                                <span>Add Maximum 250 character</span>
                            </div>
                            <div className="notes-add-footer-btn">
                                <Button className="mb-0"  onClick={() => {
                                    this.handleNoteAdd()}}>Cancel</Button>
                                <Button type="primary"  onClick={() => {
                                    this.handleNoteAdd()}}>Submit</Button>
                            </div>
                        </div>
                        :"" }
                        <div className="note_list_block">
                    <div className="notes-list">
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. </p>
                        <div className="note-list_wrap">
                            <div className="note-list-add">
                                <span>Add by : </span>
                                <span>John Doe</span>
                            </div>
                            <div className="note-list-date">
                                <span>Date :</span>
                                <span>12, Jun 2019</span>
                            </div>

                        </div>
                    </div>
                    <div className="notes-list">
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. </p>
                        <div className="note-list_wrap">
                            <div className="note-list-add">
                                <span>Add by : </span>
                                <span>John Doe</span>
                            </div>
                            <div className="note-list-date">
                                <span>Date : </span>
                                <span>12, Jun 2019 & 9:30 AM</span>
                            </div>

                        </div>
                    </div>
                        </div>
                </Modal>
            </div>
        );
    }
}

export default AddNotes;