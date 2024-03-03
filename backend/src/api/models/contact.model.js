const mongoose = require('mongoose');

/**
 * Contact Schema
 * @private
 */
const ContactSchema = new mongoose.Schema({
  contactId:{type:Number, default:0, required:true,unique: true},//Auto incremented
  name: { type: String},
  email: {type: String, required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Games' },
  framework:{type:Number},
  sdkId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Sdk' },
  environment:{type:Number},
  deviceModel:{type:String},
  deviceOs:{type:String},
  crashLog:{type:String},
  manifestFile:{type:String},
  screenShot:{type:String},
  type:{type:String},                                 //  developer=0,  player=1
  subject: {type: String},
  message: {type: String },
  status:  {type: Number, required: true, default: 1 } // 0 == In Progress, 1 == Pending, 2 == Closed
}, { timestamps: true }
);

/**
 * @typedef Contact
 */

 ContactSchema.pre('save', async function save(next) {
  try {
    let contact = await mongoose.model('contact', ContactSchema).findOne().limit(1).sort({$natural:-1})
    const contactId= contact ? contact.contactId : 0;
    this.contactId = contactId+1;
    return next();
  }
  catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model('contact', ContactSchema);