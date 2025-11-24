const Activity = require('../models/Activity');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all activities
exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate('host', 'name profilePhoto bio')
            .populate('attendees', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new activity
exports.createActivity = async (req, res) => {
    try {
        const { title, category, time, startTime, endTime, location, coordinates, description, isOnline } = req.body;

        // Calculate expireAt based on date from time field and endTime
        // time is in format "YYYY-MM-DDTHH:MM", endTime is "HH:MM"
        let expireDateTime = null;
        try {
            if (time && endTime) {
                // Extract date part from time (YYYY-MM-DD)
                const datePart = time.split('T')[0];
                // Combine with endTime to create expiration datetime
                const expireDateTimeStr = `${datePart}T${endTime}:00`;
                expireDateTime = new Date(expireDateTimeStr);

                // Validate the date
                if (isNaN(expireDateTime.getTime())) {
                    console.error('Invalid expireAt date calculated:', { datePart, endTime, expireDateTimeStr });
                    expireDateTime = null;
                } else {
                    console.log('Activity will expire at:', expireDateTime.toISOString());
                }
            }
        } catch (dateError) {
            console.error('Error calculating expireAt:', dateError);
            expireDateTime = null;
        }

        const newActivity = new Activity({
            title,
            host: req.user.userId,
            category,
            time,
            startTime,
            endTime,
            location,
            coordinates,
            description,
            isOnline,
            attendees: [],
            ...(expireDateTime && { expireAt: expireDateTime }) // Only add if valid
        });

        const activity = await newActivity.save();

        // Populate host details for immediate frontend display
        await activity.populate('host', 'name profilePhoto bio');

        res.json(activity);
    } catch (err) {
        console.error('Activity creation error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Join an activity
exports.joinActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ msg: 'Activity not found' });
        }

        // Check if already joined
        if (activity.attendees.includes(req.user.userId)) {
            return res.status(400).json({ msg: 'Already joined this activity' });
        }

        activity.attendees.push(req.user.userId);
        await activity.save();

        // Return updated activity with populated fields
        const updatedActivity = await Activity.findById(req.params.id)
            .populate('host', 'name profilePhoto bio')
            .populate('attendees', 'name profilePhoto');

        res.json(updatedActivity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Leave an activity
exports.leaveActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ msg: 'Activity not found' });
        }

        // Check if user is in attendees
        if (!activity.attendees.includes(req.user.userId)) {
            return res.status(400).json({ msg: 'Not in this activity' });
        }

        // Remove user from attendees
        activity.attendees = activity.attendees.filter(
            attendee => attendee.toString() !== req.user.userId
        );
        await activity.save();

        // Return updated activity with populated fields
        const updatedActivity = await Activity.findById(req.params.id)
            .populate('host', 'name profilePhoto bio')
            .populate('attendees', 'name profilePhoto');

        res.json(updatedActivity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ msg: 'Activity not found' });
        }

        // Check user
        if (activity.host.toString() !== req.user.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await activity.deleteOne();

        res.json({ msg: 'Activity removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get activity messages
exports.getActivityMessages = async (req, res) => {
    try {
        const messages = await Message.find({ activityId: req.params.id })
            .populate('senderId', 'name profilePhoto')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Send activity message
exports.sendActivityMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ msg: 'Activity not found' });
        }

        // Check if user is participant (host or attendee)
        const isParticipant = activity.host.toString() === req.user.userId ||
            activity.attendees.includes(req.user.userId);

        if (!isParticipant) {
            return res.status(403).json({ msg: 'Not a participant' });
        }

        const newMessage = new Message({
            activityId: req.params.id,
            senderId: req.user.userId,
            content
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate('senderId', 'name profilePhoto');

        res.json(populatedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
