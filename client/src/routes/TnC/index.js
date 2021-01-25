import React, { Component } from 'react';
import { Card } from 'antd';
import CustomScrollbars from '../../util/CustomScrollbars';
import { PROJECT_NAME, RIDER_LABEL } from '../../constants/Setup';

class TermsNConditions extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <>
                <CustomScrollbars>
                    <Card className="gx-m-5">
                        <h3>Rental Agreement</h3>
                        <div className="gx-align-right mb-4">
                            Effective Date: April 30, 2019
                    </div>
                        <p>
                            PLEASE READ THIS AGREEMENT CAREFULLY. IT SETS FORTH THE LEGALLY BINDING TERMS AND CONDITIONS FOR YOUR USE OF THE SERVICE.
                        <br /><br />
        In consideration of Your use of any of the E-scooter Services (defined below) provided by E-scooter Rides, Inc. d/b/a E-scooter (“{PROJECT_NAME}”), E-scooter requires that You ({RIDER_LABEL},” “You,” or “Your”) (acting for all of {RIDER_LABEL}’s family, heirs, agents, affiliates, representatives, successors, and assigns) agree to all terms and conditions in this E-scooter Rental Agreement, Waiver of Liability and Release (“Agreement”).
                        <br /><br />
                            The services provided by E-scooter include, among other things, (1) E-scooter mobile application (“E-scooter App”) and related website, (2) E-scooter Electric Vehicles (“Vehicle” or “Vehicles”), and (3) all other related equipment, personnel, services, applications, websites, and information provided or made available by E-scooter (collectively, the “{PROJECT_NAME} Services”).
                        <br />
                            In addition to the Terms of Service, located at https://www.E-scooter.co/terms, You expressly agreed to when you signed up for E-scooter, You should CAREFULLY READ all terms and conditions before entering into this Agreement. Here is a partial list of some of the terms that E-scooter wants to bring to Your initial attention in the event You are on a smartphone or other device with a small screen. Capitalized terms have the meanings given to them where defined in this Agreement.
                        <br /><br />
                            THIS AGREEMENT CONTAINS RELEASES, DISCLAIMERS, ASSUMPTION-OF-RISK PROVISIONS, AND A BINDING ARBITRATION AGREEMENT THAT MAY LIMIT YOUR LEGAL RIGHTS AND REMEDIES. FOR MORE DETAILS, PLEASE REFER TO SECTIONS 9 AND 15 BELOW
                        <br /><br />
                            You must end your ride on the E-scooter App at the conclusion of the ride. If you fail to do so, You will continue to be charged. The maximum charge for a single trip under such circumstances is $100 for 24 hours. For more details, please refer to Section 2.3 below.
                            Upon conclusion of Your ride, the Vehicle must not be parked at a prohibited parking spot, i.e. unauthorized private property, in a locked area, blocking the right of way, or in any other unapproved non-public space.
                            All applicable laws and regulations (including, without limitation, those applicable to traffic, pedestrians, parking, charging and electric Vehicles) must be obeyed, including any helmet laws in Your area.
                            You must promptly report any damaged or malfunctioning Vehicles to E-scooter via the E-scooter App or e-mail.
                            E-scooter expressly agrees to let, and the {RIDER_LABEL} expressly agrees to take on, rental of the Vehicle subject to the terms and conditions set out herein. Unless otherwise indicated, all monetary values set forth in this Agreement shall be deemed to be denominated in United States dollars.
                        <br /><br />
                            {RIDER_LABEL} ACCEPTANCE OF AGREEMENT
                        <br />
                            I certify that I have read and expressly agree to the terms and conditions of Section 15 Releases; Disclaimers; Assumption of Risk, and I acknowledge that this section limits my legal rights and remedies. I intend my assent to this Agreement to be a complete and unconditional release of all liability to the greatest extent permitted by law. I represent and certify that I am familiar with the operation of the Vehicle, and am reasonably competent and physically fit to ride the Vehicle.
                        <br />
                            I certify that I am the {RIDER_LABEL}, I am 18 years old or over, I will wear a helmet where required by law, I will not ride a Bird with another occupant, I will obey all traffic laws, I will ride at my own risk, and I have read and expressly agree to the terms and conditions set forth in this Agreement.
                    </p>
                    </Card>
                </CustomScrollbars>
            </>
        );
    }
}
export default TermsNConditions;
