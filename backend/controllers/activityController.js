const Activity = require('../models/Activity');
const User = require('../models/User');

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
        const { title, category, time, location, coordinates, description, isOnline } = req.body;

        const newActivity = new Activity({
            title,
            host: req.user.userId, // Fixed: accessing userId from token payload
            category,
            time,
            location,
            coordinates,
            description,
            isOnline,
            attendees: [] // Host is not automatically an attendee, or maybe they should be? Let's keep them separate as 'host'
        });

        const activity = await newActivity.save();

        // Populate host details for immediate frontend display
        await activity.populate('host', 'name profilePhoto bio');

        res.json(activity);
    } catch (err) {
        console.error(err.message);
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
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Activity not found' });
        }
        res.status(500).send('Server Error');
    }
};
