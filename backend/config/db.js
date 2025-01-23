import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://anusingh1104:tomato11@food-del.abv4x.mongodb.net/food-del"
    )
    .then(() => console.log("DB Connected"));
};
