import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from 'cloudinary';


export const getUserProfile = async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(400).json({message: "User not found"})
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("🚀 ~ getUserProfile ~ error:", error)
        res.status(500).json({error: error.message});
    }
}


export const followUnfollowUser = async (req,res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const presentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({error: "You can't follow or unfollow yourself"});
        }

        if(!userToModify || !presentUser){
            return res.status(400).json({error: "User not found"});
        }

        const isFollowing = presentUser.following.includes(id);

        if(isFollowing){
            // We will unfollow 
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}}); // not the current user
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}}); // update in current user
            return res.status(200).json({message: "User unfollowed successfully"});
        }else{
            // We will follow 
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}}); // not the current user
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}}); // update in current user

            //Notification Part
            const newNotifiaction  = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotifiaction.save();

            return res.status(200).json({message: "User followed successfully"});
        }
    } catch (error) {
        console.log("🚀 ~ followUnfollowUser ~ error:", error)
        res.status(500).json({error: error.message});
        
    }
}


export const getSuggestedUsers = async (req,res) => {
    try {
        const userId = req.user._id; //current user
        const usersFollowedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne:userId}
                }
            },
            {$sample: {size:10}}
        ])

        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("🚀 ~ getSuggestedUsers ~ error:", error.message);
        res.status(500).json({error: error.message});
        
    }
}


export const updateUserProfile = async (req, res) => {
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body;
    // console.log("🚀 ~ updateUserProfile ~ req.body:", req.body)
    let {profileImg, coverImg} = req.body;
    
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({message: "Please provide both current password and new password"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error: "Current password is incorrect"});
            if(newPassword < 6 ) return res.status(400).json({error: "Password must be 6 characters long"});

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }
            if(profileImg){
                if(user.profileImg){
                    await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                }
                const uploadedResponse = await cloudinary.uploader.upload(profileImg)
                profileImg = uploadedResponse.secure_url;
            }
            if(coverImg){
                if(user.coverImg){
                    await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
                }
                const uploadedResponse = await cloudinary.uploader.upload(coverImg)
                coverImg = uploadedResponse.secure_url;
            }
            
            user.fullname = fullname || user.fullname;
            user.email = email || user.email;
            user.username = username || user.username;
            user.bio = bio || user.bio;
            user.link = link || user.link;
            user.profileImg = profileImg || user.profileImg;
            user.coverImg = coverImg || user.coverImg;


            user = await user.save()

            // Password should be null in the response.
            user.password = null;

            return res.status(200).json(user);

        
    } catch (error) {
        console.log("🚀 ~ updateUserProfile ~ error:", error.message);
        res.status(500).json({error: "Internal Server error"});
        
    }
}