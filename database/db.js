import mongoose from "mongoose";

const connectDB = async (req, res) => {

    try {

        await mongoose.connect("mongodb://hashtagweb69:_Hashtag123@ac-xpbxyyu-shard-00-00.xkirvvc.mongodb.net:27017,ac-xpbxyyu-shard-00-01.xkirvvc.mongodb.net:27017,ac-xpbxyyu-shard-00-02.xkirvvc.mongodb.net:27017/hashtagweb?replicaSet=atlas-6vg1ez-shard-0&ssl=true&authSource=admin")
        console.log('Connected With Database');
    } catch (error) {
        console.log(`Error Occured While Connecting With Database : ${error.message}`);
    }

}



export default connectDB