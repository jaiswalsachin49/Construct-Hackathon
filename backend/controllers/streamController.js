const LiveStream = require('../models/LiveStream');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { generateRtcToken, generateChannelName, startCloudRecording, stopCloudRecording } = require('../services/agoraService');

/**
 * Start a new live stream
 * POST /api/streams/start
 */
exports.startStream = async (req, res) => {
  try {
    const { title, category, description, location, coordinates, coverImage } = req.body;
    const hostId = req.user.userId;

    // Validate coordinates
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ msg: 'Valid coordinates [lat, lng] required' });
    }

    // Check if user already has an active stream
    const existingStream = await LiveStream.findOne({
      host: hostId,
      status: 'live'
    });

    if (existingStream) {
      return res.status(400).json({ msg: 'You already have an active stream. End it before starting a new one.' });
    }

    // Generate Agora channel and token
    const channelName = generateChannelName(hostId);
    const broadcasterToken = generateRtcToken(channelName, 0, 'publisher');

    // Create Activity for the stream
    const activity = new Activity({
      title,
      host: hostId,
      category: category || 'Other',
      time: new Date().toISOString(),
      startTime: new Date().toTimeString().slice(0, 5),
      endTime: '23:59', // Default end time
      location: location || 'Live Stream',
      coordinates: coordinates,
      description: description || '',
      isOnline: true,
      attendees: [],
      isLiveStream: true,
      streamStatus: 'live'
    });

    await activity.save();

    // Create LiveStream document
    const liveStream = new LiveStream({
      activityId: activity._id,
      host: hostId,
      title,
      category: category || 'Other',
      description: description || '',
      coverImage: coverImage || null,
      coordinates: coordinates,
      location: location || 'Live Stream',
      status: 'live',
      startedAt: new Date(),
      agoraChannelId: channelName
    });

    await liveStream.save();

    // Update activity with stream reference
    activity.liveStreamId = liveStream._id;
    await activity.save();

    // Start cloud recording (async, don't wait)
    startCloudRecording(channelName, 1000)
      .then(recordingData => {
        if (recordingData) {
          liveStream.agoraRecordingId = recordingData.sid;
          liveStream.save();
          console.log('Cloud recording started:', recordingData.sid);
        }
      })
      .catch(err => {
        console.error('Failed to start recording:', err.message);
      });

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('stream:started', {
      streamId: liveStream._id,
      activityId: activity._id,
      host: hostId,
      coordinates: coordinates,
      title: title
    });

    // Populate host details
    await liveStream.populate('host', 'name profilePhoto bio');

    res.json({
      stream: liveStream,
      activity: activity,
      token: broadcasterToken,
      channelName: channelName,
      appId: process.env.AGORA_APP_ID
    });
  } catch (err) {
    console.error('Start stream error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * End a live stream
 * POST /api/streams/:id/end
 */
exports.endStream = async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.user.userId;

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return res.status(404).json({ msg: 'Stream not found' });
    }

    // Only host can end stream
    if (stream.host.toString() !== userId) {
      return res.status(403).json({ msg: 'Not authorized to end this stream' });
    }

    if (stream.status === 'ended') {
      return res.status(400).json({ msg: 'Stream already ended' });
    }

    // Calculate duration
    const endTime = new Date();
    const duration = Math.floor((endTime - stream.startedAt) / 60000); // Minutes

    // Stop cloud recording
    let recordingUrl = null;
    if (stream.agoraRecordingId) {
      try {
        const recordingData = await stopCloudRecording(
          stream.agoraRecordingId,
          stream.agoraRecordingId,
          stream.agoraChannelId,
          1000
        );
        recordingUrl = recordingData?.recordingUrl;
      } catch (err) {
        console.error('Failed to stop recording:', err.message);
      }
    }

    // Update stream
    stream.status = 'ended';
    stream.endedAt = endTime;
    stream.duration = duration;
    stream.recordingUrl = recordingUrl;
    stream.viewerCount = 0; // Reset live viewer count
    await stream.save();

    // Update linked activity
    const activity = await Activity.findById(stream.activityId);
    if (activity) {
      activity.streamStatus = 'ended';
      activity.recordingLink = recordingUrl;
      await activity.save();
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('stream:ended', {
      streamId: stream._id,
      recordingUrl: recordingUrl,
      duration: duration
    });

    res.json({
      msg: 'Stream ended successfully',
      stream: stream,
      recordingUrl: recordingUrl
    });
  } catch (err) {
    console.error('End stream error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Get all live streams
 * GET /api/streams/live
 */
exports.getLiveStreams = async (req, res) => {
  try {
    const liveStreams = await LiveStream.find({ status: 'live' })
      .populate('host', 'name profilePhoto bio')
      .sort({ viewerCount: -1, startedAt: -1 });

    res.json(liveStreams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get stream details
 * GET /api/streams/:id
 */
exports.getStreamDetails = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id)
      .populate('host', 'name profilePhoto bio')
      .populate('viewers', 'name profilePhoto');

    if (!stream) {
      return res.status(404).json({ msg: 'Stream not found' });
    }

    res.json(stream);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Join stream as viewer
 * POST /api/streams/:id/join
 */
exports.joinStream = async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.user.userId;

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return res.status(404).json({ msg: 'Stream not found' });
    }

    if (stream.status !== 'live') {
      return res.status(400).json({ msg: 'Stream is not live' });
    }

    // Add to viewers if not already present
    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      stream.totalViews += 1;
    }

    // Increment viewer count
    stream.viewerCount += 1;

    // Update peak viewers
    if (stream.viewerCount > stream.peakViewers) {
      stream.peakViewers = stream.viewerCount;
    }

    await stream.save();

    // Generate viewer token
    const viewerToken = generateRtcToken(stream.agoraChannelId, 0, 'subscriber');

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('stream:viewer-joined', {
      streamId: stream._id,
      viewerCount: stream.viewerCount,
      userId: userId
    });

    // Also emit updated viewer count
    io.emit('stream:viewer-count', {
      streamId: stream._id,
      viewerCount: stream.viewerCount
    });

    res.json({
      stream: stream,
      token: viewerToken,
      channelName: stream.agoraChannelId,
      appId: process.env.AGORA_APP_ID
    });
  } catch (err) {
    console.error('Join stream error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Leave stream
 * POST /api/streams/:id/leave
 */
exports.leaveStream = async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.user.userId;

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return res.status(404).json({ msg: 'Stream not found' });
    }

    // Decrement viewer count
    if (stream.viewerCount > 0) {
      stream.viewerCount -= 1;
    }

    await stream.save();

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('stream:viewer-left', {
      streamId: stream._id,
      viewerCount: stream.viewerCount,
      userId: userId
    });

    // Also emit updated viewer count
    io.emit('stream:viewer-count', {
      streamId: stream._id,
      viewerCount: stream.viewerCount
    });

    res.json({ msg: 'Left stream', viewerCount: stream.viewerCount });
  } catch (err) {
    console.error('Leave stream error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Get user's recordings
 * GET /api/streams/user/:userId/recordings
 */
exports.getUserRecordings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const recordings = await LiveStream.find({
      host: userId,
      status: 'ended',
      recordingUrl: { $exists: true, $ne: null }
    })
      .populate('host', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(recordings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
