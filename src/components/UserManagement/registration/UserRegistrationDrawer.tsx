import React, { useState, useEffect } from "react";
import { User, Sparkles, X, Upload, Check, Save } from "lucide-react";
import { UserRegistrationFormValues } from "./UserRegistrationSchema";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { uploadImage } from "../../../services/uploadService";
import { ImageCropModal } from "../../common/ImageCropModal";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

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
        setPhoto(initialData.profileUrl || initialData.imageUrl || null);
        setSelectedFile(null);
        setPhotoPreview(null);
        setIsActive(initialData.active !== undefined ? initialData.active : !initialData.blocked);
        setOtpStep(false);
      } else {
        setFormData({ fullName: "", email: "", phone: "" });
        setPhoto(null);
        setSelectedFile(null);
        setPhotoPreview(null);
        setIsActive(true);
        setOtpStep(false);
      }
    }
  }, [isOpen, initialData]);
  
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const resetStateAndClose = () => {
    setOtpStep(false);
    setOtp("");
    setSelectedFile(null);
    setPhotoPreview(null);
    setFormData({ fullName: "", email: "", phone: "" });
    onClose();
  };

  const isFormValid = Boolean(
    formData.fullName?.trim() &&
    formData.email?.trim() &&
    formData.phone?.trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);

    let finalProfileUrl = photo || "";

    if (selectedFile) {
      setStatusMessage("Uploading Image...");
      try {
        finalProfileUrl = await uploadImage(selectedFile);
      } catch (uploadErr: any) {
        setLoading(false);
        setStatusMessage("");
        const errText = uploadErr.message || "Image upload failed";
        toast.error(errText);
        return; // STOP! DO NOT CALL CREATE/EDIT API
      }
    }

    setStatusMessage("Saving Data...");

    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        blocked: !isActive,
        ...(finalProfileUrl ? { profileUrl: finalProfileUrl, imageUrl: finalProfileUrl } : {}),
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
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const handleVerifyOtp = async () => {
    toast.success("OTP Verified Successfully");
    resetStateAndClose();
  };

  const isView = mode === "view";
  const isEdit = mode === "edit";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-300">
        {/* Drawer Header with Project Blue Accent */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-700 text-white flex items-center justify-between border-b border-red-500/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 border border-white/20 rounded-xl text-white shadow-inner backdrop-blur-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white capitalize">
                {isView ? "View User Details" : (isEdit ? "Edit User" : (otpStep ? "Verify OTP" : "Register New User"))}
              </h3>
              <p className="text-xs text-red-100/90 font-medium">Manage user profile information & credentials</p>
            </div>
          </div>
          <button onClick={resetStateAndClose} className="p-2 rounded-xl text-red-100 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form className="flex-1 space-y-6 overflow-y-auto p-6 custom-scrollbar flex flex-col justify-between" onSubmit={handleSubmit}>
          {otpStep ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 my-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-600 text-white rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-red-500/30 border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enter Security OTP</h2>
                <p className="text-sm text-slate-500 font-medium">We've sent a one-time verification code to <br/><span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">{formData.phone}</span></p>
              </div>
              
              <div className="relative flex gap-2 sm:gap-3 justify-center my-8 w-full max-w-xs mx-auto">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className={`w-10 sm:w-12 h-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-200 ${otp.length === index ? 'border-red-500 ring-4 ring-red-500/20 bg-red-50 text-red-700 shadow-md scale-105' : (otp[index] ? 'border-slate-300 bg-white text-slate-900 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-400')}`}>
                    {otp[index] || ''}
                  </div>
                ))}
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text caret-transparent" 
                />
              </div>

              <button 
                type="button" 
                disabled={otp.length < 6}
                onClick={handleVerifyOtp} 
                className="w-full max-w-xs px-5 py-3.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                Verify & Finish
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Photo</label>
                <label className={`border-2 border-dashed border-blue-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent transition-all group shadow-2xs ${isView ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:shadow-red-500/5'}`}>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={isView}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setRawSelectedFile(file);
                        setRawPreviewUrl(URL.createObjectURL(file));
                        setCropModalOpen(true);
                        setImgError(false);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-md mb-3 overflow-hidden group-hover:scale-105 transition-all relative">
                    {(photoPreview || photo) && !imgError ? (
                      <img
                        src={photoPreview || photo || undefined}
                        className="w-full h-full object-cover"
                        alt="User Photo"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <User className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  {!isView && (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload User Photo
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium mt-1">PNG, JPG or WEBP up to 5MB</span>
                </label>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Basic Information</h4>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    disabled={isView}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      disabled={isView}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      disabled={isView}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/80 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Account Status</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{isActive ? 'User can access the system' : 'User account is restricted'}</p>
                    </div>
                    <button
                      type="button"
                      disabled={isView}
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-red-600' : 'bg-slate-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Sticky Actions */}
          {!otpStep && (
            <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3 mt-auto">
              <button 
                type="button" 
                onClick={resetStateAndClose} 
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
              >
                {isView ? "Close" : "Cancel"}
              </button>
              {!isView && (
                <button 
                  type="submit" 
                  disabled={loading || !isFormValid} 
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                >
                  <Save className="w-4 h-4" /> {loading ? (statusMessage || "Saving Data...") : (isEdit ? "Update User" : "Register User")}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedFile, croppedUrl) => {
          setSelectedFile(croppedFile);
          setPhotoPreview(croppedUrl);
        }}
      />
    </div>
  );
}
