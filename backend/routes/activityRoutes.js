const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middlewares/auth'); // Assuming you have an auth middleware

// @route   GET api/activities
// @desc    Get all activities
// @access  Private (or Public depending on reqs, let's say Private for now)
router.get('/', auth, activityController.getActivities);

// @route   POST api/activities
// @desc    Create an activity
// @access  Private
router.post('/', auth, activityController.createActivity);

// @route   POST api/activities/:id/join
// @desc    Join an activity
// @access  Private
router.post('/:id/join', auth, activityController.joinActivity);

// @route   POST api/activities/:id/leave
// @desc    Leave an activity
// @access  Private
router.post('/:id/leave', auth, activityController.leaveActivity);

// @route   PUT api/activities/:id
// @desc    Update an activity
// @access  Private
router.put('/:id', auth, activityController.updateActivity);

// @route   DELETE api/activities/:id
// @desc    Delete an activity
// @access  Private
router.delete('/:id', auth, activityController.deleteActivity);

// @route   GET api/activities/:id/messages
// @desc    Get activity messages
// @access  Private
router.get('/:id/messages', auth, activityController.getActivityMessages);

// @route   POST api/activities/:id/messages
// @desc    Send activity message
// @access  Private
router.post('/:id/messages', auth, activityController.sendActivityMessage);

module.exports = router;
