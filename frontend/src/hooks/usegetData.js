import { useGetUser } from "../utils/queries";
import { useDispatch } from "react-redux";
import { setUser,setVerificationStatus } from "../state/authSlice";
import { useEffect } from "react";


export const useStoreuser = () => {
  const dispatch = useDispatch();
  const { data, isLoading, isError,error } = useGetUser();
  if(isError){
    console.error("Error fetching user data:", error?.response);
    if(error?.response?.status === 401) {
      console.error("Unauthorized access - user not logged in or session expired.");

      //move to login page
    }
  }
  console.log(data?.user)

  useEffect(() => {
    if (data) {
      dispatch(setUser(data?.user));
    }
  }, [data, dispatch]);

  return {
    user: data,
    isLoading,
    isError,
  };
};