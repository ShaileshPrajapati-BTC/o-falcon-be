import React, { Fragment } from 'react';
import CustomScrollbars from '../../util/CustomScrollbars';
import { Card } from 'antd';
const PrivacyPolicyForDevice = () => {
  return (
    <Fragment>
      <CustomScrollbars>
        <Card className="gx-m-5">
          <h3>Privacy Policy</h3>
          <div className="gx-align-right mb-4"></div>
        </Card>
      </CustomScrollbars>
    </Fragment>
  );
}

export default PrivacyPolicyForDevice;