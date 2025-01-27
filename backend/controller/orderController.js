import OrderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order for fronted
const placeOrder = async (req, res) => {
  const fronted_url = process.env.FRONTEND_URL;
  try {
    const newOrder = new OrderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${fronted_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${fronted_url}/verify?success=false&orderId=${newOrder._id}`,
    });
    return res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await OrderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({ success: true, message: "Paid" });
    } else {
      await OrderModel.findByIdAndUpdate(orderId);
      return res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};
//user order for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ userId: req.body.userId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

//listing order for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({});
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    await OrderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    return res.json({ success: true, message: "Order Status Updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
