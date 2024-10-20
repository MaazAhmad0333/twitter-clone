import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
// console.log("🚀 ~ jwt:", jwt)

export const protectRoute = async (req, res, next) => {
    
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Unauthorize Access"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({error: "Unauthorize Access"})
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({error: "User not found"})   
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("🚀 ~ protectRoute ~ error:", error)
        return res.status(500).json({error: "Internal server error"});
    }
}