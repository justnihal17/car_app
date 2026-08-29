import React, { useState, useEffect, useRef } from "react";
import { User, Sparkles, X, Upload, Check, Save, Edit2 } from "lucide-react";
import { UserRegistrationFormValues } from "./UserRegistrationSchema";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { uploadImage } from "../../../services/uploadService";
import { getCompactDrawerClass, SectionActiveToggle } from "../../SubAdminManagement/utils/subAdminFormUtils";
import { getLoggedInAdminName } from "../../SubAdminManagement/subAdminDrawerUtils";
import { ImageCropModal } from "../../common/ImageCropModal";
import { SafeImage } from '../../common/SafeImage';

const getFullImageUrl = (url: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${import.meta.env.VITE_API_URL || 'https://stylein-backend.onrender.com'}${url}`;
};

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
  const loggedInAdminName = getLoggedInAdminName();
  const [currentMode, setCurrentMode] = useState<"register" | "view" | "edit">(mode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formData, setFormData] = useState<Partial<UserRegistrationFormValues>>({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          fullName: initialData.name || initialData.fullName || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
        });
        setPhoto(initialData.image || initialData.profileUrl || initialData.imageUrl || null);
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
        return;
      }
    }

    setStatusMessage("Saving Data...");

    try {
      if ((currentMode === "edit" || Boolean(initialData?.id)) && initialData?.id) {
        const response = await api.put(`/customer/customer/admin/${initialData.id}`, {
          name: formData.fullName,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          image: finalProfileUrl,
          active: isActive,
        });

        if (response.data?.success) {
          toast.success("User updated successfully!");
          resetStateAndClose();
        } else {
          toast.error(response.data?.message || "Failed to update user");
        }
      } else {
        const response = await api.post("/customer/customer/register", {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          image: finalProfileUrl,
          active: isActive,
        });

        if (response.data?.success) {
          toast.success("User registered successfully!");
          resetStateAndClose();
        } else {
          toast.error(response.data?.message || "Registration failed");
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Operation failed";
      toast.error(errMsg);
      setLoading(false);
      setStatusMessage("");
    }
  };

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setPhotoPreview(croppedPreviewUrl);
    setImgError(false);
    
    toast.loading('Uploading Image...', { id: 'imgUpload' });
    try {
      const uploadedUrl = await uploadImage(croppedFile);
      toast.dismiss('imgUpload');
      toast.success('Image uploaded successfully');
      setPhoto(uploadedUrl);
      setSelectedFile(null);
    } catch (err: any) {
      toast.dismiss('imgUpload');
      toast.error(err.message || 'Image upload failed');
      setSelectedFile(croppedFile);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      toast.success("User verified successfully!");
      resetStateAndClose();
    }
  };

  const isView = currentMode === "view";
  const isEdit = currentMode === "edit" || (Boolean(initialData) && currentMode !== "view");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200 ease-out">
      <div className="bg-[#F8FAFC] w-full max-w-lg md:max-w-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
        {/* Header - White, minimal, top accent */}
        <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 capitalize leading-tight">
                {currentMode === "view"
                  ? (formData.fullName || initialData?.name || initialData?.fullName || "View User")
                  : isEdit
                  ? (formData.fullName || initialData?.name || initialData?.fullName || "Edit User")
                  : "Create User"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isView ? 'View user details.' : (isEdit ? 'Manage user profile details.' : 'Add a new user to the system.')}
              </p>
            </div>
          </div>
          <button onClick={resetStateAndClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form className="flex-1 flex flex-col justify-between overflow-hidden" onSubmit={handleSubmit}>
          {otpStep ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative flex flex-col items-center justify-center my-auto pb-6">
              <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center mb-1 shadow-2xs border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Enter Security OTP</h2>
                <p className="text-xs text-slate-500">We've sent a verification code to <span className="font-semibold text-slate-900">{formData.phone}</span></p>
              </div>
              
              <div className="relative flex gap-2 justify-center my-3 w-full max-w-xs mx-auto">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className={`w-9 h-10 rounded-lg border flex items-center justify-center text-base font-semibold transition-all duration-150 ${otp.length === index ? 'border-red-500 ring-1 ring-red-500 bg-white text-slate-900 shadow-2xs' : (otp[index] ? 'border-slate-300 bg-white text-slate-900 shadow-2xs' : 'border-slate-200 bg-slate-50 text-slate-400')}`}>
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
                className="w-full max-w-xs h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Verify & Finish
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar relative pb-6">
              
              {/* Personal Information Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Personal Information</h4>
                      <p className="text-[10px] text-slate-500">Basic contact and profile details.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {/* Profile Photo Horizontal Row */}
                  <div className="flex items-center gap-3.5 pb-1">
                    <div 
                      className="relative group shrink-0"
                      onClick={() => {
                        if (photoPreview || (photo && !imgError)) {
                          setShowImageModal(true);
                        } else if (!isView) {
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full border border-slate-200 shadow-2xs overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${photoPreview || (photo && !imgError) ? 'cursor-pointer hover:scale-105' : (!isView ? 'cursor-pointer hover:bg-slate-100' : '')} ${isView ? '' : 'group-hover:border-red-100'}`}>
                        {(photoPreview || (photo && !imgError)) ? (
                          <SafeImage 
                            src={getFullImageUrl(photoPreview || photo)} 
                            allowBlob={true}
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1 justify-center">
                      {!isView && (
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-md hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-slate-500" />
                            Change Photo
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">PNG, JPG or WEBP · Max 5MB</p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const localUrl = URL.createObjectURL(file);
                            setRawSelectedFile(file);
                            setRawPreviewUrl(localUrl);
                            setCropModalOpen(true);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Full Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        disabled={isView}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${isView ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        placeholder="e.g. john@example.com"
                        value={formData.email}
                        disabled={isView}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${isView ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +1 234 567 8900"
                        value={formData.phone}
                        disabled={isView}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full h-8 px-2.5 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all shadow-2xs ${isView ? 'opacity-80 cursor-default bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Account Status</h4>
                    <p className="text-[10px] text-slate-500">Enable or disable this user account.</p>
                  </div>
                  <SectionActiveToggle 
                    checked={isActive} 
                    onChange={v => setIsActive(v)} 
                    disabled={isView} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Sticky Actions */}
          {!otpStep && (
            <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={resetStateAndClose} 
                className="h-8 px-3.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-xs shadow-2xs cursor-pointer"
              >
                {isView ? "Close" : "Cancel"}
              </button>
              {isView && (
                <button
                  type="button"
                  onClick={() => setCurrentMode("edit")}
                  className="flex items-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit User
                </button>
              )}
              {!isView && (
                <button 
                  type="submit" 
                  disabled={loading || !isFormValid} 
                  className="flex items-center justify-center gap-1.5 h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> 
                      {isEdit ? "Update User" : "Register User"}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Full Screen Image Modal */}
      {showImageModal && (photoPreview || photo) && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <SafeImage 
              src={getFullImageUrl(photoPreview || photo)} 
              alt="User Photo Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
      
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
