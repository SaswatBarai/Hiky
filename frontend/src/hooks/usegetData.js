import { useGetUser } from "../utils/queries";
import { useDispatch } from "react-redux";
import { setUser, setVerificationStatus, clearUser } from "../state/authSlice";
import { useEffect, useState } from "react";


export const useStoreuser = () => {
  const dispatch = useDispatch();
  const [shouldFetch, setShouldFetch] = useState(false);
  const [initialCheck, setInitialCheck] = useState(false);

  // Check for stored tokens on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setShouldFetch(true);
    } else {
      // No token found, mark initial check as complete
      setInitialCheck(true);
    }
  }, []);

  const { data, isLoading, isError, error } = useGetUser(shouldFetch);

  if(isError){
    console.error("Error fetching user data:", error?.response);
    if(error?.response?.status === 401) {
      console.error("Unauthorized access - user not logged in or session expired.");
      // Clear invalid tokens
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
    }
    setInitialCheck(true);
  }

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data?.user));
      dispatch(setVerificationStatus(data?.user?.isEmailVerified || false));
      setInitialCheck(true);
    }
  }, [data, dispatch]);

  return {
    user: data?.user,
    isLoading: isLoading || !initialCheck,
    isError,
  };
};