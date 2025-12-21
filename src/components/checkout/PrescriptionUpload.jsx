import { useState } from "react";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

export default function PrescriptionUpload({ onUpload, required = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList) => {
    const validFiles = Array.from(fileList).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length === 0) {
      alert("Please upload valid image files (max 5MB each)");
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary or your storage service
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "prescriptions"); // Cloudinary preset

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        return {
          url: data.secure_url,
          public_id: data.public_id,
          original_name: file.name,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles((prev) => [...prev, ...uploadedFiles]);
      onUpload && onUpload(uploadedFiles);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload && onUpload(newFiles);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Prescription{" "}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {uploading
            ? "Uploading..."
            : "Drop prescription images here, or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-2">
                <DocumentIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {file.original_name}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>• Ensure prescription is clearly visible and readable</p>
        <p>• Include doctor's name and signature</p>
        <p>• Prescription should be recent (within 30 days)</p>
      </div>
    </div>
  );
}
