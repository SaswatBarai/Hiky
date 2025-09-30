import {createSlice} from "@reduxjs/toolkit"

// Helper function to check if we have a token on initial load
const getInitialAuthState = () => {
    try {
        const token = localStorage.getItem("accessToken");
        // If there's a token, assume we might be authenticated (will be verified by API call)
        return {
            user: null,
            isAuthenticated: !!token,
            isVerified: false,
        };
    } catch (error) {
        // localStorage might not be available (SSR, etc.)
        return {
            user: null,
            isAuthenticated: false,
            isVerified: false,
        };
    }
};

const authSlice = createSlice({
    name:"auth",
    initialState: getInitialAuthState(),
    reducers:{
        setUser: (state, action) => {
            console.log('Auth: Setting user', action.payload?.username || 'unknown');
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            console.log('Auth: Clearing user');
            state.user = null;
            state.isAuthenticated = false;
            state.isVerified = false;
        },
        setVerificationStatus: (state, action) => {
            console.log('Auth: Setting verification status', action.payload);
            state.isVerified = action.payload;
        }
    }
});
export const {setUser, clearUser, setVerificationStatus} = authSlice.actions;
export default authSlice.reducer;