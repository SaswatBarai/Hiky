import {createSlice} from "@reduxjs/toolkit"


const authSlice = createSlice({
    name:"auth",
    initialState:{
        user: null,
        isAuthenticated: false,
        isVerified: false,
    },
    reducers:{
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setVerificationStatus: (state) => {
            state.isVerified = true;
        }
    }
});
export const {setUser, clearUser, setVerificationStatus} = authSlice.actions;
export default authSlice.reducer;