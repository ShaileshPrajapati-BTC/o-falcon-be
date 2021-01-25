import React, { Component } from "react";
import { message } from "antd";
import axios from "util/Api";
import moment from 'moment';
import { DEFAULT_API_ERROR } from "../../constants/Common";

class NotificationItem extends Component {
  state = {
    data: [],
    loading: false,
    total: 0,
    filter: {
      page: 1,
      limit: 5
    }
  };

  componentDidMount() {
    this.fetch();
  }

  /* listing start */
  fetch() {
    this.setState({ loading: true });

    const self = this;

    axios
      .post("admin/notification/paginate")
      .then((data) => {
        console.log('data----->',data)
        if (data.code === "OK") {
          self.setState(prevState => {
            prevState.total = data.data.count;
            prevState.data = data.data.list;
          });
        } else {
          self.setState(prevState => {
            prevState.total = 0;
            prevState.data = [];
          });
        }

        self.setState({ loading: false });
      })
      .catch(function({ response }) {
        let resp = (response && response.data) || {
          message: DEFAULT_API_ERROR
        };
        message.error(`${resp.message}`);
        self.setState({ loading: false });
      });
  }

  render() {

    return (
      <li className="gx-media">
        {this.state.data.map(nData => {
          return (
            <div key={nData.id}>
              <p>{nData.title}</p>
              <p>{moment(nData.createdAt).format("DD-MM-YYYY hh:ss a")}</p>
            </div>
          );
        })}
      </li>
    );
  }
}
export default NotificationItem;
