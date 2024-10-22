import Notification from "../models/notification.model.js";


export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to:userId}).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({to:userId}, {read:true});

        return res.status(200).json(notifications);
    } catch (error) {
        console.log("🚀 ~ getNotifications ~ error:", error)
        return res.status(500).json({error: "Internal server error"});
        
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to:userId});

        res.status(200).json({message: "Notification deleted successfully"});
    } catch (error) {
        console.log("🚀 ~ deleteNotifications ~ error:", error)
        return res.status(500).json({error: "Internal server error"});
    }
}