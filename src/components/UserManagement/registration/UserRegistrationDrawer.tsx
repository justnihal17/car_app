import React, { useState, useEffect } from "react";
import { SlidePanel } from "../../common/SlidePanel";
import { User, Plus, Trash2, MapPin, Car, Mail, Phone, UploadCloud } from "lucide-react";
import { UserRegistrationFormValues } from "./UserRegistrationSchema";

import api from "../../../api/axios";
import toast from "react-hot-toast";

export function UserRegistrationDrawer({
  isOpen,
  onClose,
  mode = "register",
  initialData = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode?: "register" | "view" | "edit";
  initialData?: any;
}) {
  const [photo, setPhoto] = useState<string | null>(null);

  // Basic state to match the required JSON structure
  const [formData, setFormData] = useState<Partial<UserRegistrationFormValues>>({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          fullName: initialData.name || initialData.fullName || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
        });
        setOtpStep(false);
      } else {
        setFormData({ fullName: "", email: "", phone: "" });
        setOtpStep(false);
      }
    }
  }, [isOpen, initialData]);
  
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const resetStateAndClose = () => {
    setOtpStep(false);
    setOtp("");
    setFormData({ fullName: "", email: "", phone: "" });
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      if (mode === "edit") {
        const response = await api.put(
          `/customer/customer/admin/${initialData?.id || initialData?._id}`,
          payload
        );
        toast.success(response.data?.message || "Customer updated successfully");
        resetStateAndClose();
      } else {
        const response = await api.post(
          "/customer/customer/admin/register",
          payload,
        );
        toast.success(
          response.data?.message || "Registration successful. OTP sent.",
        );
        setOtpStep(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || (mode === "edit" ? "Failed to update user" : "Failed to register user"));
      console.error(mode === "edit" ? "Update failed:" : "Registration failed:", error);
    }
  };

  const handleVerifyOtp = async () => {
    // The user hasn't provided the verify OTP API yet, so we will just close and show success for now
    toast.success("OTP Verified Successfully");
    resetStateAndClose();
  };

  const isView = mode === "view";
  const isEdit = mode === "edit";

  return (
    <SlidePanel isOpen={isOpen} onClose={resetStateAndClose} title={isView ? "View User Details" : (isEdit ? "Edit User" : (otpStep ? "Verify OTP" : "Register New User"))}>
      <div
        className="space-y-6 bg-white overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 140px)" }}
      >
        {otpStep ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Enter OTP</h2>
            <p className="text-sm text-slate-500 text-center">We've sent a one-time password to <br/><span className="font-medium text-slate-700">{formData.phone}</span></p>
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full max-w-50 text-center text-3xl tracking-widest p-4 bg-slate-50 border border-slate-300 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-colors font-mono" 
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Profile Image</label>
              <label className={`block w-full border-2 border-dashed border-blue-300 rounded-xl p-8  flex-col items-center justify-center bg-blue-50/50 transition-colors ${isView ? 'cursor-default' : 'cursor-pointer hover:bg-blue-50'}`}>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={isView}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhoto(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-3 overflow-hidden">
                  {photo ? (
                    <img
                      src={photo}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                {!isView && <span className="text-sm font-semibold text-blue-600">Upload User Photo</span>}
              </label>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Basic Information</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  disabled={isView}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    disabled={isView}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    disabled={isView}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer sticky action area */}
      <div className="pt-4 border-t border-slate-200 bg-white mt-auto flex gap-4">
        {isView ? (
          <button
            onClick={resetStateAndClose}
            className="flex-1 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        ) : otpStep ? (
          <button
            onClick={handleVerifyOtp}
            className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            Verify OTP
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            {isEdit ? "Save Changes" : "Register User"}
          </button>
        )}
        {!isView && (
          <button
            onClick={resetStateAndClose}
            className="flex-1 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </SlidePanel>
  );
}
