import { createContext, useEffect, useState } from "react";
//import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  // const addToCart = (itemId)=> {
  //     if(!cartItems[itemId]){
  //         setCartItems((prev)=>({...prev,[itemId]:1}));
  //     }
  //     else{
  //         setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
  //     }
  // }

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  // const removeFromCart = async (itemId) => {
  //   setCartItems((prev) => {
  //     const newCount = (prev[itemId] || 0) - 1;
  //     if (newCount <= 0) {
  //       // Remove the item from the cart if the count is 0 or less
  //       const { [itemId]: _, ...rest } = prev; // Destructure to remove the item
  //       return rest;
  //     }
  //     return { ...prev, [itemId]: newCount };
  //   });
  //   if (token) {
  //     await axios.post(
  //       url + "/api/cart/remove",
  //       { itemId },
  //       { headers: { token } }
  //     );
  //   }
  // };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };

  const loadCartData = async (token) => {
    const response = await axios.get(url + "/api/cart/get", {
      headers: { token },
    });
    console.log(response.data);
    setCartItems(response.data.cartData);
  };
  /*
    useEffect(()=>{
        console.log(cartItems);
    },[cartItems]);
    */

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
