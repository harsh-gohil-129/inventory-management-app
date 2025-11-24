import React, { useContext, useRef, useState } from "react";
import { Download, Loader2, Package, Upload } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { ProductContext } from "@/context/ProductContext";

const Header = () => {
  const importRef = useRef();
  const [loading, setLoading] = useState(false);
  const { getAllProducts } = useContext(ProductContext);

  const handleExportCsv = () => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/export`, "_blank");
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/import`,
        formData
      );

      const { added, skipped, duplicates, errors } = response.data;

      toast.success(
        `Import Complete!\n\n✅ Added: ${added}\n⚠️ Skipped (Duplicates): ${skipped}\n❌ Errors: ${errors.length}`,
        {
          duration: 6000,
        }
      );

      getAllProducts();

      if (duplicates.length > 0) {
        console.log("Duplicate items:", duplicates);
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import CSV. Check console for details.");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  return (
    <nav className="relative h-[70px] flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 bg-white text-gray-900 transition-all shadow">
      <div className="flex items-center gap-2 hover:cursor-pointer">
        <Package className="h-8 w-8" />
        <h1 className="text-sm leading-none lg:text-lg font-semibold">
          Inventory Management
        </h1>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <input
          ref={importRef}
          onChange={handleImportFileChange}
          type="file"
          accept=".csv"
          className="hidden"
        />

        <button
          onClick={() => importRef.current.click()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            // Show spinner when loading
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          <span className="hidden md:inline">
            {loading ? "Importing..." : "Import"}
          </span>
        </button>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Download size={16} />
          <span className="hidden md:inline">Export</span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
