
const mongoose = require('mongoose')
const makeSchema = ()=>{
  return new mongoose.Schema({
      name: String,
      text: String,
      userID: String
    })
}
// const DateNow = Date.now(); // 1602710690936
// console.log(new Date(DateNow).toString())
let dbKeys={}
const makeModel = (roomID)=>{
    const modelName = mongoose.model(roomID,makeSchema())
    dbKeys[roomID] = modelName;
}
async function deleteCollection (roomID){
    let collectionName = dbKeys[roomID];
    await collectionName.collection.drop();
    delete dbKeys[roomID];
}
async function insertChat (roomID,userName,messege,ID){
    let collectionName = dbKeys[roomID];
    collectionName.create({ name: userName,text: messege,userID: ID }, function (err, small) {
        if (err) return handleError(err);
    })}
function getChat (roomID){
    return dbKeys[roomID].find().then((doc)=>{
        return doc;
    }) 
}
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
exports.makeSchema = makeSchema
exports.makeModel = makeModel
exports.deleteCollection = deleteCollection
exports.insertChat = insertChat
exports.makeid = makeid
exports.getChat = getChat
