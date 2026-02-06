inout.video['setup'] = function () {
	navigator.mediaDevices.enumerateDevices()
		.then(function (devices) {
			const videoDevices = devices.filter(device => device.kind === 'videoinput');
			if (videoDevices.length > 0) {
				let usbVideoDevice = videoDevices.find(device => device.label.includes('USB Video'));

				let vd = usbVideoDevice ?? videoDevices[0];
				inout.video.devices.id = vd.deviceId;
				inout.video.devices.label = vd.label;

				inout.video.currentDeviceIndex = videoDevices.indexOf(vd);

				console.log('\nSelected camera: ' + vd.label);

				inout.video.initialize();
			} else {
				console.error('No video devices found.');
			}
		})
		.catch(function (error) {
			console.error('Error enumerating devices:', error);
		});
}

/*
function getCameraByLabel(label) {
  const devices = navigator.mediaDevices.enumerateDevices();
  const camera = devices.find(device => device.label === label && device.kind === 'videoinput');
  return camera ? camera.deviceId : inout.video.devices.id;
}
*/

inout.video['initialize'] = function () {
	inout.video.options = {
		video: {
			deviceId: inout.video.devices.id,
			width: {
				ideal: 1920 / 2
			},
			height: {
				ideal: 1080 / 2
			}
		},
		audio: false
	};

	inout.video['capture'] = createCapture(inout.video.options, function () {
		inout.video.isLoaded = true;
		sensor.initialize();
		inout.video.capture.hide();
	});
}
