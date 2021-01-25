export const IOT_BUTTON_INFO = {
    buzon: {
        eg: '0,10',
        desription: `Buzzer will play back a pre-recorded sound based on mode and duration. When duration is 0, it will conninue untill receive a stop command.
        \n0 = alram  eg: 0,10
        \n1 = beep mode1 eg: 1,10
        \n2 = beep mode2 eg: 2,10
        \n3 = beep mode3 eg: 3,10
        \n As per example Buzzer will play For 10s according beep type.`
    },
    lighton: {
        eg: '0,10',
        desription: `When duration is 0, it will conninue untill receive a stop command.
        \n0 = keep light on eg: 0,10
        \n1 = flash mode1 eg: 1,10
        \n2 = flash mode2 eg: 2,10
        \n3 = flash mode3 eg: 3,10
        \n As per example Light will be on For 10s according flash type.`
    },
    alarmon: {
        eg: '0,10',
        desription: `Buzzer and Light on same time, same with buzon command and lighton command.same with buzon command and lighton command.`
    },
    playaudio: {
        eg: '0,10',
        desription: `Play audio  and control volume:
        \nvoice_index,repeat_times (eg: 1, 1)
        \nvoice_index,repeat_times,volume (eg: 1, 1, 100)\n
        \n1:Getting started and enjoy your ride
        \n2:End your ride,thank you for your riding
        \n3:Lock successfully
        \n4:Unlock successfully
        \n5:Illegal move
        \n6:Illegal operation
        \n7:Turn on the light
        \n8:Turn off the light
        \n9:Lock failed	
        \n10:Voice on	
        \n11:Voice off	
        \n12:Sliding satart
        \n13:Sliding satart off
        \n14:Low battery
        \n15:Unfolded kickstand
        \n16:Self-inspection normal
        \n17:Vehicle unavailable
        \n18:Vehicle issues
        \n19:Eergency                                                           
        \n20：Pause your ride`
    },
    listpaly: {
        eg: '0,10',
        desription: `Play audio from start index to end index.
        \nstart index, end index,repeat_times`
    },
    GPSON: {
        eg: '10',
        desription: `GPS turned on and works for 5 minutes;
        \nT=5-300,unit: minute, GPS turned on and works for T minutes, default: 5 minutes`
    },
    BATALM: {
        eg: 'ON, 0',
        desription: `A,M
        \nA=ON/OFF,  default：ON;
        \nM=0, way of alarming, 0: GPRS, default:0；
        \nFor Turn off low battery alarm Write "OFF"`
    },
    SDFIND: {
        eg: 'ON,3,15,5',
        desription: `M,A,B,C
        \nM=ON/OFF: turn on/off the function
        \nA: ring time during search, Default: 3s, range: 1-300s
        \nB: ring time interval, Default: 15s,range: 1-300s
        \nC: ring times, default: 5 times, range: 1-20
        
        As per example the Alarm will ring for 3s for 5 times.`
    }
};