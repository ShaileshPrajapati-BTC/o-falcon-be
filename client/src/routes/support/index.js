import React from 'react';
import CustomScrollbars from '../../util/CustomScrollbars';
import { Card, Icon } from 'antd';
import { SUPPORT } from '../../constants/Setup';
const Support = () => {
  return (
    <React.Fragment>
      <CustomScrollbars>
        <Card className="gx-m-5">
          <h2>Support</h2>
          <p>
            <Icon type="mobile" /> : {SUPPORT.CONTACT}
            <br /><br />
            <Icon type="mail" /> : {SUPPORT.EMAIL}
          </p>
        </Card>
      </CustomScrollbars>
    </React.Fragment>
  )
}
export default Support