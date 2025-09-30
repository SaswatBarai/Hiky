import { useGetUser } from "../utils/queries";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setVerificationStatus, clearUser } from "../state/authSlice";
import { useEffect, useState, useCallback } from "react";


export const useStoreuser = () => {
  const dispatch = useDispatch();
  const [shouldFetch, setShouldFetch] = useState(false);
  const [initialCheck, setInitialCheck] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Get current auth state from Redux
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Check for stored tokens and initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      console.log('Auth: Initializing with token:', !!accessToken);
      
      if (accessToken) {
        // We have a token, fetch user data
        setShouldFetch(true);
      } else {
        // No token found, clear any stale auth state and mark as complete quickly
        dispatch(clearUser());
        setInitialCheck(true);
        setIsInitializing(false);
      }
    };
    
    // Initialize immediately, no delay
    initializeAuth();
  }, [dispatch]);

  const { data, isLoading, isError, error } = useGetUser(shouldFetch);

  // Handle API errors
  useEffect(() => {
    if (isError) {
      console.error("Error fetching user data:", error?.response);
      if (error?.response?.status === 401) {
        console.error("Unauthorized access - user not logged in or session expired.");
        // Clear invalid tokens and state
        localStorage.removeItem("accessToken");
        dispatch(clearUser());
      }
      setInitialCheck(true);
      setIsInitializing(false);
      setShouldFetch(false);
    }
  }, [isError, error, dispatch]);

  // Handle successful user data fetch
  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
      dispatch(setVerificationStatus(data.user?.isEmailVerified || false));
      setInitialCheck(true);
      setIsInitializing(false);
    } else if (data && !data.user) {
      // API returned but no user data
      dispatch(clearUser());
      localStorage.removeItem("accessToken");
      setInitialCheck(true);
      setIsInitializing(false);
    }
  }, [data, dispatch]);

  // Handle loading completion
  useEffect(() => {
    if (!isLoading && shouldFetch && initialCheck) {
      setIsInitializing(false);
    }
  }, [isLoading, shouldFetch, initialCheck]);

  const finalLoading = isInitializing || (shouldFetch && isLoading) || !initialCheck;

  return {
    user: currentUser || data?.user,
    isLoading: finalLoading,
    isError,
    isAuthenticated,
  };
};
