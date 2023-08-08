import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{type:String, unique:true},
    password:String,
},{timestamps: true});
// UserSchema.index({ username: 1 }, { unique: true });
const UserModel = mongoose.model('User', UserSchema);


export default UserModel;

