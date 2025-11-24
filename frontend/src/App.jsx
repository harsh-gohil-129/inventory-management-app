import React, { useContext, useState } from "react";
import Banner from "./components/Banner";
import Header from "./components/Header";
import { FileText, Filter, PlusIcon, Search, X } from "lucide-react";
import ProductTable from "./components/ProductTable";
import { ProductContext } from "./context/ProductContext";
import toast, { Toaster } from "react-hot-toast";
import api from "/configs/api";
import { Spinner } from "./components/ui/spinner";

const App = () => {
  const [searchProductInput, setSearchProductInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Electronics",
    brand: "",
    price: "",
    stock: "",
    image: "",
  });

  const { products, setProducts } = useContext(ProductContext);

  const CATEGORIES = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Groceries",
    "Accessories",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchProductInput.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("brand", newProduct.brand);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      if (newProduct.image) formData.append("image", newProduct.image);

      const { data } = await api.post("/api/product", formData);

      console.log(data);

      if (data && data.product) {
        setProducts((prev) => [...prev, data.product]);
        toast.success("Product Successfully Added!");
      } else {
        if (data.statua === 500) toast.error("Failed to add product");
      }

      setNewProduct({
        name: "",
        category: "Electronics",
        brand: "",
        price: "",
        stock: "",
        image: "",
      });
    } catch (e) {
      console.error("Failed to add product:", e);
    } finally {
      setIsAddModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* <Banner /> */}
      <Toaster />
      <Header />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Add New Product
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewProduct({
                    name: "",
                    category: "Electronics",
                    brand: "",
                    price: "",
                    stock: "",
                    image: "",
                  });
                }}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              className="p-6 overflow-y-auto flex-1"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Product Image
                  </label>

                  <label
                    htmlFor="fileInput"
                    className="border bg-white rounded-md text-sm w-full border-gray-600/60 p-8 flex flex-col items-center gap-4  cursor-pointer hover:border-gray-500 transition"
                  >
                    {newProduct.image ? (
                      <img
                        src={
                          typeof newProduct.image === "string"
                            ? newProduct.image
                            : URL.createObjectURL(newProduct.image)
                        }
                        alt="user-image"
                        className="max-h-[120px] object-cover mt-5 ring ring-slate-300 hover:opacity-80"
                      />
                    ) : (
                      <>
                        <FileText className="h-10 w-10 text-zinc-800" />
                        <p className="text-gray-500">
                          Drag & drop your files here
                        </p>
                        <p className="text-gray-400">
                          Or{" "}
                          <span className="text-zinc-800 underline">click</span>{" "}
                          to upload
                        </p>
                      </>
                    )}
                    <input
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          image: e.target.files[0],
                        })
                      }
                      id="fileInput"
                      type="file"
                      className="hidden"
                      name="image"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                    placeholder="e.g., Wireless Mouse"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 outline-none bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      required
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, brand: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 outline-none"
                      placeholder="e.g., Logitech"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 gap-3 flex items-center justify-center cursor-pointer px-4 py-2 bg-zinc-600 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  {isLoading && <Spinner className="size-5" />}
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-4 flex flex-col sm:flex-row gap-3 lg:gap-5 lg:mt-3">
        <div className="flex items-center border pl-3 gap-3 bg-white border-gray-500/30 py-3 rounded-md overflow-hidden max-w-sm md:max-w-xs lg:max-w-md w-full">
          <Search className="text-gray-500 h-5 w-5" />
          <input
            value={searchProductInput}
            onChange={(e) => setSearchProductInput(e.target.value)}
            type="search"
            placeholder="Search for products"
            className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm lg:text-base"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative max-w-sm ">
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
              className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-gray-50 outline-none cursor-pointer hover:bg-gray-50"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <Filter
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-800 pointer-events-none"
              size={16}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-gray-800 active:scale-95 transition text-sm flex items-center px-4 py-2 gap-2 rounded-lg border border-gray-500/30 cursor-pointer hover:bg-gray-50"
          >
            <PlusIcon className="w-5 h-5" />
            Add <span className="hidden sm:inline">Product</span>
          </button>
        </div>
      </div>

      <ProductTable productsList={filteredProducts} />
    </>
  );
};

export default App;
