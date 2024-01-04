const bcrypt = require('bcryptjs');
const UserModel = require("../model/User.model");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

exports.verifyUser = async (req, res, next) => {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance 
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
};

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
exports.register = async (req, res) => {
  try {
    const { username, password, profile, email } = req.body;

    // Check existing username
    const usernameExists = await UserModel.findOne({ username });
    if (usernameExists) {
      return res.status(400).send({ error: "Please use a unique username." });
    }
    // Check existing email
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).send({ error: "Please use a unique email." });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || "",
        email,
      });

      const result = await user.save();
      return res.status(201).send({ msg: "User registered successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

 
/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "Username not found" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(400).send({ error: "Password does not match" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).send({
      msg: "Login successful",
      username: user.username,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

/** GET: http://localhost:8080/api/user/example123 */
exports.getUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).send({ error: "Invalid username" });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Remove sensitive data like password before sending the response
    const { password, ...rest } = user.toJSON();

    return res.status(200).send(rest);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
exports.updateUser = async (req, res) => {
  try {
    // Extract user ID from query parameters
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      // Extract data to be updated from request body
      const body = req.body;

      // Update the user data
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: userId },
        body,
        { new: true }
      );

      // Check if the user was found and updated successfully
      if (updatedUser) {
        return res.status(201).send({ msg: "Record Updated...!" });
      } else {
        // User not found
        return res.status(404).send({ error: "User Not Found...!" });
      }
    } else {
      // No user ID provided
      return res.status(401).send({ error: "User ID not provided...!" });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating user:", error);
    // Return internal server error
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

/** GET: http://localhost:8080/api/generateOTP */
exports.generateOTP = async (req, res) => {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
};

/** GET: http://localhost:8080/api/verifyOTP */
exports.verifyOTP = async (req, res) => {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
};

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
exports.createResetSession = async (req, res) => {
  try {
    // Assume you have logic to generate a reset session here
    
    req.app.locals.resetSession = true; // Set resetSession to true
    
    return res.status(201).send({ flag: req.app.locals.resetSession });
  } catch (error) {
    console.error("Error in createResetSession function:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ error: "Session expired!" });
    }

    const { username, password } = req.body;

    try {
      const user = await UserModel.findOne({ username });

      if (!user) {
        return res.status(404).send({ error: "Username not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await UserModel.updateOne(
        { username: user.username },
        { password: hashedPassword }
      );

      req.app.locals.resetSession = false; // Reset session

      return res.status(200).send({ msg: "Password reset successful!" });
    } catch (error) {
      console.error("Error during password reset:", error);
      return res.status(500).send({ error: "Failed to reset password" });
    }
  } catch (error) {
    console.error("Error in resetPassword function:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};