/**
 * CC Constants
 */

const mphConversionFactor = 2.23694;

/**
 * CC Utilities
 */

const getVehicleDrivenByPlayer = () => {
    const player = GetPlayerPed(-1);
    const vehicle = GetVehiclePedIsIn(player, false);
    if (vehicle && (GetPedInVehicleSeat(vehicle, -1) === player)) {
        return vehicle;
    }

    return null;
}

const getRoundedCruiseControlSpeedInMPH = () => {
    if (cruiseControlSpeed) {
        return Math.round((cruiseControlSpeed * mphConversionFactor) / 5) * 5;
    }

    return null;
}

const setCruiseControlSpeedInMPH = (speed) => {
    const newSpeed = speed / mphConversionFactor;

    if (newSpeed === 0) {
        cruiseControlSpeed = null;
    } else {
        cruiseControlSpeed = newSpeed;
    }
}

var cruiseControlSpeed = null;

/** 
 * CC Drawing Logic
 */

const getMinimapAnchor = () => {
    SetScriptGfxAlign(76, 66);
    const [topX, topY] = GetScriptGfxPosition(-0.0045, 0.002 - 0.188888);
    ResetScriptGfxAlign();

    return [
        topX, topY
    ];
}

const updateSpeedIndicator = () => {
    SetTextFont(4);
    SetTextScale(0.6, 0.6)
    SetTextColour(200, 0, 0, 255);
    SetTextEntry("STRING");
    AddTextComponentString(getRoundedCruiseControlSpeedInMPH());

    const [x, y] = getMinimapAnchor();
    DrawText(x + 0.005, y + 0.005);
}

/**
 * CC Command / Bindings
 */

RegisterCommand('cs_cruisecontrol_activate', () => {
    const vehicle = getVehicleDrivenByPlayer();
    if (vehicle) {
        if (cruiseControlSpeed === null) {
            const currentSpeed = GetEntitySpeed(vehicle);
            cruiseControlSpeed = currentSpeed;
            setCruiseControlSpeedInMPH(getRoundedCruiseControlSpeedInMPH());
        } else {
            cruiseControlSpeed = null;
        }
    }
});

RegisterCommand('cruise', (source, args, rawCommand) => {
    const vehicle = getVehicleDrivenByPlayer();
    const input = args[0];
    const speed = parseInt(input);

    if (speed) {
        setCruiseControlSpeedInMPH(speed);
    }
});

RegisterCommand('cs_cruisecontrol_increase', () => {
    const vehicle = getVehicleDrivenByPlayer();
    if (vehicle && cruiseControlSpeed) {
        const currentSpeed = getRoundedCruiseControlSpeedInMPH();
        setCruiseControlSpeedInMPH(currentSpeed + 5);
    }
});

RegisterCommand('cs_cruisecontrol_decrease', () => {
    const vehicle = getVehicleDrivenByPlayer();
    if (vehicle && cruiseControlSpeed) {
        const currentSpeed = getRoundedCruiseControlSpeedInMPH();
        if (currentSpeed - 5 < 5) {
            cruiseControlSpeed = null;
        } else {
            setCruiseControlSpeedInMPH(currentSpeed - 5);
        }
    }
});

setTick(() => {
    const vehicle = getVehicleDrivenByPlayer();
    
    if (vehicle) {
        if (cruiseControlSpeed) {
            SetVehicleMaxSpeed(vehicle, cruiseControlSpeed);
        } else {
            SetVehicleMaxSpeed(vehicle, -1);
        }
    }

    updateSpeedIndicator();
});


RegisterKeyMapping('cs_cruisecontrol_activate', 'CS-CruiseControl Activate/Deactivate', 'keyboard', 'm');
RegisterKeyMapping('cs_cruisecontrol_increase', 'CS-CruiseControl Increase', 'keyboard', 'PERIOD');
RegisterKeyMapping('cs_cruisecontrol_decrease', 'CS-CruiseControl Decrease', 'keyboard', 'COMMA');