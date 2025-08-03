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