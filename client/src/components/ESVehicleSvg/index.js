import React from 'react';
import { ReactComponent as VehicleType_1_1 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_1_2 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_1_3 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_1_4 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_1_5 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_1_6 } from '../../assets/svg/rides.svg';
import { ReactComponent as VehicleType_2_1 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_2_2 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_2_3 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_2_4 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_2_5 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_2_6 } from '../../assets/svg/bicycle.svg';
import { ReactComponent as VehicleType_3_1 } from '../../assets/svg/bike.svg';
import { ReactComponent as VehicleType_3_2 } from '../../assets/svg/bike.svg';
import { ReactComponent as VehicleType_3_3 } from '../../assets/svg/bike.svg';
import { ReactComponent as VehicleType_3_4 } from '../../assets/svg/bike.svg';
import { ReactComponent as VehicleType_3_5 } from '../../assets/svg/bike.svg';
import { ReactComponent as VehicleType_3_6 } from '../../assets/svg/bike.svg';


const components = {
    VehicleType_1_1: VehicleType_1_1,
    VehicleType_1_2: VehicleType_1_2,
    VehicleType_1_3: VehicleType_1_3,
    VehicleType_1_4: VehicleType_1_4,
    VehicleType_1_5: VehicleType_1_5,
    VehicleType_1_6: VehicleType_1_6,
    VehicleType_2_1: VehicleType_2_1,
    VehicleType_2_2: VehicleType_2_2,
    VehicleType_2_3: VehicleType_2_3,
    VehicleType_2_4: VehicleType_2_4,
    VehicleType_2_5: VehicleType_2_5,
    VehicleType_2_6: VehicleType_2_6,
    VehicleType_3_1: VehicleType_3_1,
    VehicleType_3_2: VehicleType_3_2,
    VehicleType_3_3: VehicleType_3_3,
    VehicleType_3_4: VehicleType_3_4,
    VehicleType_3_5: VehicleType_3_5,
    VehicleType_3_6: VehicleType_3_6
};
class VehicleSvg extends React.Component {
    render() {
        let SpecificStory;
        if (this.props.type.length > 1) {
            const first = this.props.type[0];
            SpecificStory = components[`${this.props.name}_${first}_${this.props.status}`];
        } else {
            SpecificStory = components[`${this.props.name}_${this.props.type}_${this.props.status}`];
        }

        return (
            <div className="iconBox" >
                <SpecificStory />
            </div>
        );
    }
}

export default VehicleSvg;
