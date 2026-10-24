import React, { useState, useEffect, useRef } from 'react';

export interface AdminProfile {
  name: string;
  photo: string;
  designation: string;
  employeeId: string;
  department: string;
  email: string;
  phone: string;
  badge: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: AdminProfile;
  onSave: (updatedProfile: AdminProfile) => Promise<void> | void;
  userRole: 'admin' | 'hr';
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  userRole,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentProfile.name);
  const [photo, setPhoto] = useState(currentProfile.photo);
  const [designation, setDesignation] = useState(currentProfile.designation);
  const [employeeId, setEmployeeId] = useState(currentProfile.employeeId);
  const [department, setDepartment] = useState(currentProfile.department);
  const [email, setEmail] = useState(currentProfile.email);
  const [phone, setPhone] = useState(currentProfile.phone);
  const [badge, setBadge] = useState(currentProfile.badge);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.name || '');
      setPhoto(currentProfile.photo || '');
      setDesignation(currentProfile.designation || '');
      setEmployeeId(currentProfile.employeeId || '');
      setDepartment(currentProfile.department || '');
      setEmail(currentProfile.email || '');
      setPhone(currentProfile.phone || '');
      setBadge(currentProfile.badge || '');
      setIsSubmitting(false);
      setShowUrlInput(false);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = () => {
    if (userRole === 'admin') {
      setPhoto('https://www.infoyashonand.com/static/media/ceo1.79761e6e1db07dd71ee2.jpg');
    } else {
      setPhoto('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) return;

    setIsSubmitting(true);
    try {
      const updated: AdminProfile = {
        name: name.trim(),
        photo: photo.trim() || currentProfile.photo,
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        department: department.trim(),
        email: email.trim(),
        phone: phone.trim(),
        badge: badge.trim(),
      };
      await onSave(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-5 bg-white max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-lg">manage_accounts</span>
              <span>Edit Administrative Profile</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Update your corporate identity, profile photo, and authorization details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Profile Photo Editor Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group/photo shrink-0">
            <img
              src={photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80'}
              alt={name || 'Profile'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              <span>Change</span>
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Profile Photograph</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Upload a clear professional photo (JPG, PNG, or WebP). Displayed on your identity badge and portal header.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">upload</span>
                <span>Upload New Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">link</span>
                <span>{showUrlInput ? 'Hide URL' : 'Use Image URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetPhoto}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 text-[11px] font-medium transition-colors cursor-pointer"
                title="Reset to official company photo"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>

            {showUrlInput && (
              <div className="pt-2">
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://... or /live_assets/..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:outline-blue-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pooja Patil"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Designation / Title *</label>
              <input
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Lead HR & Talent Acquisition"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
              <input
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. ITPL-HR-002"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Human Resources"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@infoyashonand.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 80555 14368"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Role Badge / Clearance Tag</label>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. HR EXECUTIVE or SUPER ADMIN (CEO)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold uppercase tracking-wider focus:outline-blue-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This text is displayed on the pill badge in your identity card.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                {isSubmitting ? 'hourglass_top' : 'check'}
              </span>
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
