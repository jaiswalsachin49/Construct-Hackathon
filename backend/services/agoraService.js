const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const axios = require('axios');

// Agora credentials (will be loaded from .env)
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;

// Token expiration time (24 hours)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60; // seconds

/**
 * Generate Agora RTC Token for video streaming
 * @param {string} channelName - Unique channel identifier
 * @param {number} uid - User ID (0 for dynamic assignment)
 * @param {string} role - 'publisher' or 'subscriber'
 * @returns {string} RTC token
 */
const generateRtcToken = (channelName, uid = 0, role = 'publisher') => {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    throw new Error('Agora credentials not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + TOKEN_EXPIRATION_TIME;

  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    agoraRole,
    expirationTimestamp
  );

  return token;
};

/**
 * Generate unique channel name for stream
 * @param {string} userId - Host user ID
 * @returns {string} Channel name
 */
const generateChannelName = (userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `stream_${userId}_${timestamp}_${random}`;
};

/**
 * Start cloud recording for a stream
 * @param {string} channelName - Channel to record
 * @param {number} uid - Recording bot UID
 * @returns {Object} { resourceId, sid }
 */
const startCloudRecording = async (channelName, uid = 1000) => {
  if (!AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
    console.warn('Agora cloud recording credentials not configured. Recording will be skipped.');
    return null;
  }

  try {
    const token = generateRtcToken(channelName, uid, 'publisher');
    
    // Step 1: Acquire resource
    const acquireResponse = await axios.post(
      `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/acquire`,
      {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          resourceExpiredHour: 24,
          scene: 0 // Real-time recording
        }
      },
      {
        auth: {
          username: AGORA_CUSTOMER_ID,
          password: AGORA_CUSTOMER_SECRET
        }
      }
    );

    const resourceId = acquireResponse.data.resourceId;

    // Step 2: Start recording
    const startResponse = await axios.post(
      `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
      {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          token: token,
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2, // Audio + Video
            channelType: 0, // Communication mode
            videoStreamType: 0, // High-stream video
            subscribeVideoUids: ['#allstream#'],
            subscribeAudioUids: ['#allstream#']
          },
          recordingFileConfig: {
            avFileType: ['hls', 'mp4']
          },
          storageConfig: {
            vendor: 1, // Agora Cloud Storage
            region: 0 // Auto-select region
          }
        }
      },
      {
        auth: {
          username: AGORA_CUSTOMER_ID,
          password: AGORA_CUSTOMER_SECRET
        }
      }
    );

    return {
      resourceId: resourceId,
      sid: startResponse.data.sid
    };
  } catch (error) {
    console.error('Cloud recording start error:', error.response?.data || error.message);
    throw new Error('Failed to start cloud recording');
  }
};

/**
 * Stop cloud recording and get recording URL
 * @param {string} resourceId - Resource ID from start
 * @param {string} sid - Session ID from start
 * @param {string} channelName - Channel name
 * @param {number} uid - Recording bot UID
 * @returns {Object} { recordingUrl, duration }
 */
const stopCloudRecording = async (resourceId, sid, channelName, uid = 1000) => {
  if (!resourceId || !sid) {
    console.warn('No recording session to stop');
    return null;
  }

  try {
    const stopResponse = await axios.post(
      `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
      {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {}
      },
      {
        auth: {
          username: AGORA_CUSTOMER_ID,
          password: AGORA_CUSTOMER_SECRET
        }
      }
    );

    const serverResponse = stopResponse.data.serverResponse;
    
    // The recording will be available at Agora's CDN
    // File list contains the recording files
    const fileList = serverResponse.fileList || [];
    const mp4File = fileList.find(f => f.fileName.endsWith('.mp4'));

    return {
      recordingUrl: mp4File ? `https://recording-cdn.agora.io/${mp4File.fileName}` : null,
      duration: serverResponse.uploadingStatus === 'uploaded' ? 
        Math.floor((new Date(serverResponse.sliceEndTime) - new Date(serverResponse.sliceStartTime)) / 60000) : 0,
      fileList: fileList
    };
  } catch (error) {
    console.error('Cloud recording stop error:', error.response?.data || error.message);
    throw new Error('Failed to stop cloud recording');
  }
};

/**
 * Query recording status
 * @param {string} resourceId - Resource ID
 * @param {string} sid - Session ID
 * @returns {Object} Recording status
 */
const queryRecordingStatus = async (resourceId, sid) => {
  try {
    const response = await axios.get(
      `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`,
      {
        auth: {
          username: AGORA_CUSTOMER_ID,
          password: AGORA_CUSTOMER_SECRET
        }
      }
    );

    return response.data.serverResponse;
  } catch (error) {
    console.error('Recording query error:', error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  generateRtcToken,
  generateChannelName,
  startCloudRecording,
  stopCloudRecording,
  queryRecordingStatus
};
