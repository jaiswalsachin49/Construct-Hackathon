import React from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";

const WavePreview = ({ wave, onClick, isViewed }) => {
    // --- FIX: Normalize User Data ---
    // Backend sends 'userId' (populated), Frontend might expect 'user'
    const waveUser = wave.userId || wave.user || {};
    // --------------------------------

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getTimeRemaining = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diff = now - created;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            return "Just now";
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return "Expired";
        }
    };

    const getThumbnail = () => {
        if (wave.type === "photo" && wave.mediaUrl) {
            return wave.mediaUrl;
        } else if (wave.type === "video" && wave.thumbnailUrl) {
            return wave.thumbnailUrl;
        } else if (wave.type === "text") {
            return null; // Will show text content
        }
        return waveUser.profilePhoto;
    };

    const thumbnail = getThumbnail();

    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center cursor-pointer group"
        >
            <div className="relative">
                {/* Ring */}
                <div
                    className={`absolute -inset-1 rounded-full ${isViewed
                        ? "bg-gray-300"
                        : "bg-gradient-to-tr from-pink-500 to-purple-500"
                        } p-[2px]`}
                >
                    <div className="bg-white rounded-full w-full h-full" />
                </div>

                {/* Avatar / Thumbnail */}
                <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt="Wave"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: wave.backgroundColor || "#3B82F6" }}
                        >
                            {wave.type === "text" ? "T" : getInitials(waveUser.name)}
                        </div>
                    )}
                </div>

                {/* User Badge (Small Icon) */}
                <div className="absolute bottom-0 right-0 translate-y-1">
                    {waveUser.profilePhoto ? (
                        <img
                            src={waveUser.profilePhoto}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            alt={waveUser.name}
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                            {getInitials(waveUser.name)}
                        </div>
                    )}

                    {/* Plus icon for unviewed */}
                    {!isViewed && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                </div>
            </div>

            {/* Name */}
            <p className="text-xs font-medium text-white mt-2 text-center truncate w-20">
                {waveUser.name || "Unknown"}
            </p>

            {/* Time */}
            <p className="text-[10px] text-[#8A90A2] text-center">
                {getTimeRemaining(wave.createdAt)}
            </p>
        </div>
    );
};

WavePreview.propTypes = {
    wave: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    isViewed: PropTypes.bool,
};

export default WavePreview;
