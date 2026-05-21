let ioInstance = null;

function setRealtimeServer(io) {
	ioInstance = io;
}

function publishActivity(activity) {
	if (!ioInstance) {
		return;
	}

	ioInstance.emit('activity', {
		timestamp: new Date().toISOString(),
		...activity,
	});
}

module.exports = {
	setRealtimeServer,
	publishActivity,
};