import foodModel from "../models/foodModel.js";

import fs from "fs";

//add food item

const addFood = async (req, res) => {
  try {
    console.log(req);
    let image_filename = req.file.filename;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
    });
    await food.save();
    return res.status(201).json({ success: true, message: "Food Added" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error - " + error });
  }
};

//all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: Error });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const { id } = req.body;
    //find the food model by id
    const food = await foodModel.findById(id);

    fs.unlink(`uploads/${food.image}`, () => {});
    await foodModel.findByIdAndDelete(id);

    return res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    return res.json({ success: false, message: "Error - " + error });
  }
};

export { addFood, listFood, removeFood };
