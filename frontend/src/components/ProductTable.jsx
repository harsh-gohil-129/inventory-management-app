import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductContext } from "@/context/ProductContext";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  Pencil,
  Save,
  Trash,
  User,
  X,
} from "lucide-react";
import { useContext, useState } from "react";
import api from "/configs/api";
import toast from "react-hot-toast";

const ProductTable = ({ productsList }) => {
  const { onRemoveProduct, editProductId, setEditProductId, setProducts } =
    useContext(ProductContext);

  const [editProductDetail, setEditProductDetail] = useState({
    name: "",
    category: "",
    brand: "",
    stock: 0,
    price: 0,
  });
  const [historyLogs, setHistoryLogs] = useState([]);

  const onChangeProductDetails = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setEditProductDetail((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const onSaveProductChanges = async (pid) => {
    try {
      const { data } = await api.put(`/api/product/${pid}`, editProductDetail);

      if (data && data.updated) {
        setProducts((prev) =>
          prev.map((p) => (p.id === pid ? data.updated : p))
        );

        toast.success("Product Successfully Edited!");
      }

      setEditProductId("");
    } catch (e) {
      console.error("Failed to save product changes:", e);
    }
  };

  const handleViewHistory = async (pid) => {
    try {
      const { data } = await api.get(`/api/product/${pid}/history`);

      const logs = (data && data.history ? data.history : []).map((h) => ({
        id: h.id,
        productId: h.product_id,
        oldStock: h.old_quantity,
        newStock: h.new_quantity,
        changedBy: h.user_info,
        timestamp: h.change_date,
      }));

      setHistoryLogs(logs);
    } catch (e) {
      console.error("Failed to fetch history:", e);
      setHistoryLogs([]);
    }
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-6">
      <Table>
        <TableCaption>--- A list of your products ---</TableCaption>
        <TableHeader className={"bg-gray-100"}>
          <TableRow>
            <TableHead className="w-[120px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productsList.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={
                    typeof product.image === "string"
                      ? product.image
                      : URL.createObjectURL(product.image)
                  }
                  className="w-14 h-14"
                />
              </TableCell>
              <TableCell>
                {editProductId === product.id ? (
                  <input
                    value={editProductDetail.name}
                    onChange={onChangeProductDetails}
                    className="px-2 pl-3 rounded max-w-[130px] py-2 text-sm text-gray-500 bg-transparent border-2"
                    type="name"
                    placeholder="Name"
                    name="name"
                  />
                ) : (
                  product.name
                )}
              </TableCell>
              <TableCell>
                {editProductId === product.id ? (
                  <input
                    value={editProductDetail.category}
                    onChange={onChangeProductDetails}
                    className="px-2 pl-3 rounded max-w-[130px] py-2 text-sm text-gray-500 bg-transparent border-2"
                    type="name"
                    placeholder="Category"
                    name="category"
                  />
                ) : (
                  product.category
                )}
              </TableCell>
              <TableCell>
                {editProductId === product.id ? (
                  <input
                    value={editProductDetail.brand}
                    onChange={onChangeProductDetails}
                    className="px-2 pl-3 rounded max-w-[130px] py-2 text-sm text-gray-500 bg-transparent border-2"
                    type="name"
                    placeholder="Brand"
                    name="brand"
                  />
                ) : (
                  product.brand
                )}
              </TableCell>
              <TableCell>
                {editProductId === product.id ? (
                  <input
                    value={editProductDetail.price}
                    onChange={onChangeProductDetails}
                    className="px-2 pl-3 rounded max-w-[130px] py-2 text-sm text-gray-500 bg-transparent border-2"
                    type="number"
                    placeholder="Price"
                    name="price"
                  />
                ) : (
                  product.price + " ₹"
                )}
              </TableCell>
              <TableCell>
                {editProductId === product.id ? (
                  <input
                    value={editProductDetail.stock}
                    onChange={onChangeProductDetails}
                    className="px-2 pl-3 rounded max-w-[130px] py-2 text-sm text-gray-500 bg-transparent border-2"
                    type="number"
                    placeholder="Stock"
                    name="stock"
                  />
                ) : (
                  product.stock
                )}
              </TableCell>
              <TableCell>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle size={12} /> Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle size={12} /> In Stock
                  </span>
                )}
              </TableCell>

              <TableCell className="space-x-4">
                {editProductId === product.id ? (
                  <>
                    <button
                      onClick={() => onSaveProductChanges(product.id)}
                      className="cursor-pointer hover:scale-105 transition-all duration-75"
                    >
                      <Save className="h-4.5 w-4.5 text-gray-800" />
                    </button>

                    <button
                      onClick={() => setEditProductId("")}
                      className="cursor-pointer hover:scale-105 transition-all duration-75"
                    >
                      <X className="h-4.5 w-4.5 text-gray-800" />
                    </button>
                  </>
                ) : (
                  <>
                    <Sheet>
                      <SheetTrigger>
                        <button
                          onClick={() => handleViewHistory(product.id)}
                          className="cursor-pointer hover:scale-105 transition-all duration-75"
                        >
                          <History className="h-4.5 w-4.5 text-gray-800" />
                        </button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader className="pt-6">
                          <SheetTitle className="text-2xl">
                            Inventory History
                          </SheetTitle>
                          <SheetDescription className="text-base ">
                            {product.name}
                          </SheetDescription>
                        </SheetHeader>
                        <hr />

                        <div className="flex-1 overflow-y-auto p-0">
                          {historyLogs.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {historyLogs.map((log, idx) => (
                                <div
                                  key={idx}
                                  className="p-5 hover:bg-gray-50 transition-colors flex gap-4"
                                >
                                  <div className="flex flex-col items-center pt-1">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
                                        log.newStock > log.oldStock
                                          ? "bg-green-50 border-green-100 text-green-600"
                                          : "bg-amber-50 border-amber-100 text-amber-600"
                                      }`}
                                    >
                                      {log.newStock > log.oldStock ? (
                                        <ChevronUp size={18} />
                                      ) : (
                                        <ChevronDown size={18} />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <Clock size={12} />
                                        {new Date(
                                          log.timestamp
                                        ).toLocaleString()}
                                      </div>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                          log.newStock > log.oldStock
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                      >
                                        {log.newStock > log.oldStock
                                          ? "Restock"
                                          : "Adjustment"}
                                      </span>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                                      <div className="flex justify-between items-center">
                                        <div className="text-center">
                                          <div className="text-xs text-gray-400 uppercase font-semibold">
                                            Old
                                          </div>
                                          <div className="font-mono font-bold text-gray-500">
                                            {log.oldStock}
                                          </div>
                                        </div>
                                        <div className="text-gray-600">→</div>
                                        <div className="text-center">
                                          <div className="text-xs text-gray-400 uppercase font-semibold">
                                            New
                                          </div>
                                          <div
                                            className={`font-mono font-bold text-lg ${
                                              log.newStock > log.oldStock
                                                ? "text-green-600"
                                                : "text-amber-600"
                                            }`}
                                          >
                                            {log.newStock}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <User size={12} />
                                      <span>
                                        Changed by{" "}
                                        <span className="text-gray-600 font-medium">
                                          {log.changedBy}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText size={24} />
                              </div>
                              <p className="font-medium">
                                No history logs available
                              </p>
                              <p className="text-sm">
                                Stock updates will appear here
                              </p>
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <button
                      onClick={() => {
                        setEditProductId(product.id);
                        setEditProductDetail({
                          name: product.name || "",
                          category: product.category || "",
                          brand: product.brand || "",
                          stock: product.stock ?? 0,
                          price: product.price ?? 0,
                        });
                      }}
                      className="cursor-pointer hover:scale-105 transition-all duration-75"
                    >
                      <Pencil className="h-4.5 w-4.5 text-gray-800" />
                    </button>

                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="cursor-pointer hover:scale-105 transition-all duration-75"
                    >
                      <Trash className="h-4.5 w-4.5 text-gray-800" />
                    </button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
