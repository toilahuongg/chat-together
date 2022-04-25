import multer from "multer"
import { User } from "../models/user.model"
import fs from "fs"
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(__dirname)
    cb(null, __dirname + '/../public/file/avatar/')
  },
  filename:async (req, file, cb) => {
    if(!req || !req.auth) throw new Error("Lỗi ko xác minh avatar")
    const userID = req.auth._id
    const user = await User.getUserByID(userID)
    const avatarURL = user?.avatar
    console.log(avatarURL)
    // xóa avartar cũ
    if(avatarURL){
      const path = __dirname + '/../public/file/avatar/' + avatarURL
      try {
        fs.unlinkSync(path)
        
      }catch(err) {
        console.error(err)
      }
    }
    // thêm avartar mới
    const fileName = `${userID}` +"-avatar-" + `${file.originalname}` 
    console.log(fileName)
    cb(null, fileName)
  }

})
const upload = multer({storage: storageConfig})
export default upload