import toast from "react-hot-toast";
import api from "/configs/api";
import { createContext, useEffect, useState } from "react";

export const ProductContext = createContext(null);

const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [editProductId, setEditProductId] = useState(false);

  const onRemoveProduct = async (productId) => {
    try {
      const { data } = await api.delete(`/api/product/${productId}`);

      const deletedId = Number(data && data.id ? data.id : productId);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== deletedId)
      );

      toast.success("Product Successfully Deleted!");
    } catch (e) {
      console.error("Failed to delete product:", e);
      toast.error("Failed to delete product");
    }
  };

  const getAllProducts = async () => {
    const { data } = await api.get("/api/products");
    setProducts(data.productData);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const contextValue = {
    products,
    onRemoveProduct,
    editProductId,
    setEditProductId,
    getAllProducts,
    setProducts,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;
