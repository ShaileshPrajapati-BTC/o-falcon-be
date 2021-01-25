import React from 'react';
import CircularProgress from "components/CircularProgress/index";
import {message} from 'antd';
import Auxiliary from "util/Auxiliary";
import {connect} from "react-redux";
import {hideMessage} from "appRedux/actions/Common";

class InfoView extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.error || nextProps.message || nextProps.displayMessage) {
      setTimeout(() => {
        this.props.hideMessage();
      }, 3000);
    }
  }

  render() {
    const {error, loading, displayMessage} = this.props;

    return (
      <Auxiliary>
        {loading && <div className="gx-loader-view">
          <CircularProgress/>
        </div>}
        {displayMessage && message.success(displayMessage)}
        {error && message.error(error)}
      </Auxiliary>
    );
  }
}

const mapStateToProps = ({commonData}) => {
  const {error, loading} = commonData;
  const displayMessage = commonData.message;
  return {error, loading, displayMessage};
};

export default connect(mapStateToProps, {hideMessage})(InfoView);
