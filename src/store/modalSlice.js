import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpen: false,
    selectedCourse: null,
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        openModal: (state, action) => {
            state.isOpen = true;
            state.selectedCourse = action.payload;
        },
        closeModal: (state) => {
            state.isOpen = false;
            state.selectedCourse = null;
        },
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
