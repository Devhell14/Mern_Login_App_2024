import axios from "axios";
import { jwtDecode } from "jwt-decode";

/** To get username from Token */
export async function getUsername() {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject("Cannot find Token");
  }

  try {
    let decode = jwtDecode(token);
    return decode;
  } catch (error) {
    return Promise.reject("Error decoding token");
  }
}

/** authenticate function */
export async function authenticate(username) {
  try {
    return await axios.post(
      import.meta.env.VITE_VERCEL_URL + "/api/authenticate",
      { username },
    );
  } catch (error) {
    return { error: "Username doesn't exist...!" };
  }
}
 
/** get User details */
export async function getUser({ username }) {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_VERCEL_URL + `/api/user/${username}`,
    );
    return { data };
  } catch (error) {
    return { error: "Password doesn't Match...!" };
  }
}

/** register user function */
export async function registerUser(credentials) {
  try {
    const {
      data: { msg },
      status,
    } = await axios.post(
      import.meta.env.VITE_BACKEND_URL + `/api/register`,
      credentials
    );

    let { username, email } = credentials;

    /** send email */
    if (status === 201) {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/registerMail", {
        username,
        userEmail: email,
        text: msg,
      });
    }

    return Promise.resolve(msg);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** login function */
export async function verifyPassword({ username, password }) {
  try {
    if (username) {
      const { data } = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/login",
        { username, password }
      );
      return Promise.resolve({ data });
    }
  } catch (error) {
    return Promise.reject({ error: "Password doesn't Match...!" });
  }
}


/** update user profile function */
export async function updateUser(response) {
  try {
    const token = await localStorage.getItem("token");
    const data = await axios.put(
      import.meta.env.VITE_BACKEND_URL + "/api/updateuser",
      response,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return Promise.resolve({ data });
  } catch (error) {
    return Promise.reject({ error: "Couldn't Update Profile...!" });
  }
}

/** generate OTP */
export async function generateOTP(username) {
  try {
    // Fetch OTP code from the backend
    const {
      data: { code },
      status,
    } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/generateOTP`, {
      params: { username },
    });

    // Send mail with the OTP if the OTP is generated successfully
    if (status === 201) {
      // Get user email
      const {
        data: { email },
      } = await getUser({ username });

      // Compose email text
      const text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;

      // Send email
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/registerMail`, {
        username,
        userEmail: email,
        text,
        subject: "Password Recovery OTP",
      });

      // Return the generated OTP
      return code;
    } else {
      // Handle the case when status is not 201
      return Promise.reject({
        error: `Failed to generate OTP. Status: ${status}`,
      });
    }
  } catch (error) {
    // Handle other errors
    console.error("Error in generateOTP:", error);
    return Promise.reject({ error: "Failed to generate OTP" });
  }
}

/** verify OTP */
export async function verifyOTP({ username, code }) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/verifyOTP`,
      {
        params: { username, code },
      }
    );

    return response;
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return Promise.reject(error);
  }
}

/** reset password */
export async function resetPassword({ username, password }) {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/resetPassword`,
      {
        username,
        password,
      }
    );

    // Check if the password reset was successful
    if (response.status === 200) {
      return response.data; // You might want to return something specific from the backend
    } else {
      return Promise.reject({
        error: `Failed to reset password. Status: ${response.status}`,
      });
    }
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return Promise.reject({ error: "Failed to reset password" });
  }
}
