import React, { useState } from "react";
import Header from "../Header/Header";
import Product from "./Product.jsx";
import "./Shop.css";

function Shop() {
  return (
    <>
      <Product name="product1" price={1221} solded={false} />
      <Product name="product1" price={11758} solded={true} />
      <Product />
      <Product />
      <br></br>
      <Product />
      <Product />
      <Product />
    </>
  );
}
export default Shop;
