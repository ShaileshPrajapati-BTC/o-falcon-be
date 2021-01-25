import React from 'react';

import { ReactComponent as BatteryIcon } from '../../assets/svg/battery.svg';
import IntlMessages from '../../util/IntlMessages';
const Battery = (props) => {
  const hasClassName = props.isRideCard ? 'lbl powerLbl' : null
  return (
    <React.Fragment>
      &nbsp;  &nbsp; <BatteryIcon />
      <div className={hasClassName} style={{ marginRight: '5px' }} ><IntlMessages id="app.power" /></div>
      <b>{` ${props.batteryLevel ? props.batteryLevel : 0}%`}</b>
    </React.Fragment>
  );
}

export default Battery;