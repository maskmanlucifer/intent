import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories } from "../db";
import { Category } from "../types";
import dbHelper from "../db/helper";

const initialState = {
  items: [] as Category[]
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const categories = await getCategories();
    return categories;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategories: (state, action) => {
      state.items = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.items.push(action.payload);
      dbHelper.addCategory(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const { id, name } = action.payload;

      state.items = state.items.map(category =>
        category.id === id ? { ...category, name } : category
      );

      dbHelper.updateCategory(action.payload);
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(category => category.id !== action.payload);
      dbHelper.deleteCategory(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.items = action.payload as Category[];
    });
  }
});

export const selectCategories = createSelector(
  (state: { categories: { items: Category[] } }) => state.categories.items,
  items => items
);

export const selectCategoryById = createSelector(
  [state => state.categories.items, (_, id) => id],
  (items, id) => items.find((item: Category) => item.id === id)
);

export const { addCategory, updateCategory, deleteCategory, addCategories } = categorySlice.actions;

export default categorySlice.reducer;
