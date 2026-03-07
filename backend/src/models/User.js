const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [ true, "Name is required" ],
      trim: true,
      minlenght: [ 3, "Name must be at least 3 characters" ],
      maxlenght: [ 50, "Name must be less than 50 characters" ]
    }, 
    email: {
      type: String,
      required: [ true, "Email is required" ],
      trim: true,
      unique: true,
      lowercase: true,
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address" ]
    },
    password: {
      type: String,
      required: [ true, "Password is required" ],
      minlenght: [ 6, "Password must be at least 6 characters" ],
      maxlenght: [ 100, "Password must be less than 100 characters" ],
      select: false // don't return password by default
    },
  },
  { timestamps: true, 
    versionKey: false
  }
);

// Hash the password before saving the user (only if the password is modified
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;