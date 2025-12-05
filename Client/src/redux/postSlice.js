import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: 'post',
    initialState: {
        postData: [],
    },
    reducers: {
        setPostData: (state, action) => {
            state.postData = action.payload;
        },
        removePost: (state, action) => {
            state.postData = state.postData.filter(post => post._id !== action.payload);
        },
    }
});

export const { setPostData, removePost } = postSlice.actions;
export default postSlice.reducer;