import axios from 'axios';


const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL ,
    withCredentials: true, // Enable sending cookies with requests
})


axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);





export const register = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/users/register`,
      formData,
      {
        headers:{
          'Content-Type': 'application/json',
        },
        withCredentials: true 
      }
    )
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw error
  }
}


export const getUser = async () => {
  try {
    const res = await axiosInstance.get(
      `/users/get-user-data`,
      {
        headers:{
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    )

    return res.data
  } catch (error) {
    throw error;
  }
}


export const verifyEmail = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/users/verify-email`,
      formData,
      {
        headers:{
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    )

    return res.data;
  } catch (error) {
    throw error;
  }
}


export const resendOTP = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/users/resent-otp`,
      formData,
      {
        headers:{
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }

    )

    return res.data;
  } catch (error) {
    throw error;
  }
}



export const profileUploader = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/users/profile-uploader`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      }
    )

    return res.data;
  } catch (error) {
    throw error;
  }
}


export const login  = async(formData) => {
  try {
    const res = await axiosInstance.post(
      `/users/login`,
      formData,
      {
        headers:{
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    )
    return res.data;
    
  } catch (error) {
    throw error;
  }
}


export const getRooms = async() => {
  try {
    const res = await axiosInstance.get(
      `/messages/rooms`,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    )

    return res.data;
  } catch (error) {
   throw error; 
  }
}


export const getMessages = async(roomId, page = 1, limit = 20) => {
  try {
    const res = await axiosInstance.get(
      `/messages/messages/${roomId}?page=${page}&limit=${limit}`,
      {
        headers:{
          "Content-Type":"application/json",
        },
        withCredentials:true
      }
    )

    return res.data;
  } catch (error) {
    throw error;
  }
}


export const sendMessage = async(messageData) => {
  try {
    const res = await axiosInstance.post(
      `/messages/send-message`,
      messageData,
      {
        headers:{
          "Content-Type":"application/json",
        },
        withCredentials:true
      }
    )

    return res.data;
  } catch (error) {
    throw error;
  }
}


export const createRoom = async(roomData) => {
  try {
    const res = await axiosInstance.post(
      `/messages/create-room`,
      roomData,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    )
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const searchUsers = async(query) => {
  try {
    const res = await axiosInstance.get(
      `/messages/search-users?query=${encodeURIComponent(query)}`,// why encodeURIComponent? besause query can contain special characters that need to be encoded for URL safety
      {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    )
    return res.data;
  } catch (error) {
    throw error;
  }
}


export const deleteRoom = async(roomId) => {
  try {
    const res = await axiosInstance.delete(
      `/messages/room/${roomId}`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    )
    return res.data;
  } catch (error) {
    throw error
  }
}

export const markMessagesAsRead = async(roomId) => {
  try {
    const res = await axiosInstance.post(
      `/messages/mark-read/${roomId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    )
    
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const createPrivateRoom = async(formData) => {
  try {
    const res = await axiosInstance.post(
      "/messages/create-private-room",
      formData,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    );
    return res.data;  
    
  } catch (error) {
    throw error;
  }
}

export const forgotPassword = async(formData) => {
  try {
    const res = await axiosInstance.post(
      "/users/forgot-password",
      formData,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    )

    return res.data;
    
  } catch (error) {
    throw error;
  }
}

export const verifyResetToken = async(token) => {
  try {
    const res = await axiosInstance.get(
      `/users/verify-reset-token/${token}`,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    )
    return res.data;
  } catch (error) {
    throw error;
  }
}



export const resetPassword = async(formData) => {
  try {
    const { token, ...data } = formData;
    const res = await axiosInstance.post(
      `/users/reset-password/${token}`,
      data,
      {
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      }
    )

    return res.data;
  } catch (error) {
    throw error;
  }
}