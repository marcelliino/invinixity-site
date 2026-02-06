class GamePad {
  constructor() {
    this.isConnected = false;
    this.gamepads = {};
    this.debugMode = false;
    this.broadcastChannel = new BroadcastChannel('gamepad_channel');
    window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
    window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
  }

  update() {
    const connectedGamepads = navigator.getGamepads();
    for (let i = 0; i < connectedGamepads.length; i++) {
      if (connectedGamepads[i]) {
        this.gamepads[connectedGamepads[i].index] = connectedGamepads[i];
        this.broadcastChannel.postMessage({
          type: 'update',
          index: connectedGamepads[i].index,
          buttons: connectedGamepads[i].buttons.map(button => ({
            value: button.value,
            pressed: button.pressed
          })),
          axes: connectedGamepads[i].axes
        });
        console.log(`Broadcasting update for gamepad ${connectedGamepads[i].index}`);
      }
    }
  }

  getButtonState(gamepadIndex, buttonIndex) {
    const gamepad = this.gamepads[gamepadIndex];
    if (!gamepad || buttonIndex < 0 || buttonIndex >= gamepad.buttons.length) return { value: 0, pressed: false };
    return {
      value: gamepad.buttons[buttonIndex].value,
      pressed: gamepad.buttons[buttonIndex].pressed
    };
  }

  getAxisValue(gamepadIndex, axisIndex) {
    const gamepad = this.gamepads[gamepadIndex];
    if (!gamepad || axisIndex < 0 || axisIndex >= gamepad.axes.length) return 0;
    return gamepad.axes[axisIndex];
  }

  startVibration(gamepadIndex, duration, weakMagnitude, strongMagnitude) {
    const gamepad = this.gamepads[gamepadIndex];
    if (gamepad && gamepad.vibrationActuator) {
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude
      }).then(() => {
        if (this.debugMode) console.log('Vibration started with duration:', duration, 'weakMagnitude:', weakMagnitude, 'strongMagnitude:', strongMagnitude);
      }).catch(err => {
        console.log('Failed to start vibration:', err);
      });
    }
  }

  debug() {
    this.debugMode = true;
    for (const index of Object.keys(this.gamepads)) {
      const gamepad = this.gamepads[index];
      if (gamepad) {
        console.log(`Gamepad ${index}: ${gamepad.id}`);
        console.log(`Mapping: ${gamepad.mapping}`);

        for (let buttonIndex = 0; buttonIndex < gamepad.buttons.length; buttonIndex++) {
          const button = gamepad.buttons[buttonIndex];
          if (button.pressed || button.value > 0) {
            console.log(`Button ${buttonIndex}: pressed=${button.pressed}, value=${button.value}`);
          }
        }

        for (let axisIndex = 0; axisIndex < gamepad.axes.length; axisIndex++) {
          const axis = gamepad.axes[axisIndex];
          if (Math.abs(axis) > 0.1) { // Log only significant movements
            console.log(`Axis ${axisIndex}: value=${axis}`);
          }
        }
      }
    }
  }

  onGamepadConnected(event) {
    console.log("Gamepad connected:", event.gamepad);
    this.isConnected = true;
    this.gamepads[event.gamepad.index] = event.gamepad;
    this.broadcastChannel.postMessage({
      type: 'connected',
      gamepad: {
        index: event.gamepad.index,
        id: event.gamepad.id,
        buttons: event.gamepad.buttons.map(button => ({
          value: button.value,
          pressed: button.pressed
        })),
        axes: event.gamepad.axes
      }
    });
    console.log(`Broadcasting connected for gamepad ${event.gamepad.index}`);
  }

  onGamepadDisconnected(event) {
    console.log("Gamepad disconnected:", event.gamepad);
    this.isConnected = false;
    delete this.gamepads[event.gamepad.index];
    this.broadcastChannel.postMessage({
      type: 'disconnected',
      index: event.gamepad.index
    });
    console.log(`Broadcasting disconnected for gamepad ${event.gamepad.index}`);
  }
}