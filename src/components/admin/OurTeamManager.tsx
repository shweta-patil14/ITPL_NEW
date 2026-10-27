import React, { useState, useEffect, useRef } from 'react';
import { teamService } from '../../services/teamService';
import { TeamMember, TeamMemberCategory } from '../../types';
import { compressImageFile, getInitialsFromName } from '../../utils/imageUtils';

interface OurTeamManagerProps {
  isAdmin: boolean;
  showToast: (msg: string) => void;
}

const COMMON_ROLES = [
  'Founder & Chief Executive Officer',
  'Director',
  'Business Development Manager',
  'HR',
  'Senior Technical Lead & Architect',
  'Lead Android Developer',
  'Android Developer',
  'Full-Stack Web Developer',
  'Frontend Web Developer',
  'Web Developer',
  'UI/UX Designer',
  'Software Engineer',
  'DevOps Engineer',
  'Custom Role...',
];

const BG_COLOR_OPTIONS = [
  { label: 'Navy Blue', value: 'bg-[#232884]', bgHex: '#232884' },
  { label: 'Royal Indigo', value: 'bg-[#3D48C8]', bgHex: '#3D48C8' },
  { label: 'Emerald Green', value: 'bg-emerald-800', bgHex: '#065f46' },
  { label: 'Slate Dark', value: 'bg-slate-800', bgHex: '#1e293b' },
  { label: 'Ruby Rose', value: 'bg-rose-800', bgHex: '#9f1239' },
  { label: 'Purple Violet', value: 'bg-purple-800', bgHex: '#6b21a8' },
];

const ALIGNMENT_OPTIONS = [
  { label: 'Center (Default)', value: 'center center' },
  { label: 'Upper Face (15%)', value: 'center 15%' },
  { label: 'Upper Center (20%)', value: 'center 20%' },
  { label: 'Top (0%)', value: 'top center' },
];

export const OurTeamManager: React.FC<OurTeamManagerProps> = ({ isAdmin, showToast }) => {
  const [members, setMembers] = useState<TeamMember[]>(() => teamService.getTeamMembers());
  const [activeCategory, setActiveCategory] = useState<'all' | TeamMemberCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [formCategory, setFormCategory] = useState<TeamMemberCategory>('development');
  const [formInitials, setFormInitials] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formCircular, setFormCircular] = useState(false);
  const [formAlignment, setFormAlignment] = useState('center center');
  const [formBg, setFormBg] = useState('bg-[#232884]');

  // Add Member Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // File input refs
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to live updates
  useEffect(() => {
    const unsubscribe = teamService.subscribe((updated) => {
      setMembers(updated);
    });
    return unsubscribe;
  }, []);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.bio && m.bio.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Category counts
  const countAll = members.length;
  const countLeadership = members.filter((m) => m.category === 'leadership').length;
  const countDev = members.filter((m) => m.category === 'development').length;
  const countWebInterns = members.filter((m) => m.category === 'web_intern').length;
  const countAndroidInterns = members.filter((m) => m.category === 'android_intern').length;

  // Open Edit Modal
  const handleStartEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormCategory(member.category || 'development');

    // Role
    if (COMMON_ROLES.includes(member.role)) {
      setFormRole(member.role);
      setCustomRoleInput('');
    } else {
      setFormRole('Custom Role...');
      setCustomRoleInput(member.role);
    }

    setFormInitials(member.initials || getInitialsFromName(member.name));
    setFormImage(member.image || '');
    setFormBio(member.bio || '');
    setFormCircular(member.circularPhoto ?? (member.category?.includes('intern') ? true : false));
    setFormAlignment(member.objectPosition || 'center center');
    setFormBg(member.bg || 'bg-[#232884]');
  };

  // Open Add Modal
  const handleStartAdd = () => {
    const defaultCat: TeamMemberCategory =
      activeCategory === 'all' ? 'development' : activeCategory;
    const isIntern = defaultCat.includes('intern');

    setFormName('');
    setFormCategory(defaultCat);
    setFormRole(isIntern ? 'Web Developer' : 'Software Engineer');
    setCustomRoleInput('');
    setFormInitials('');
    setFormImage('');
    setFormBio('');
    setFormCircular(isIntern);
    setFormAlignment(isIntern ? 'center 20%' : 'center center');
    setFormBg('bg-[#232884]');
    setShowAddModal(true);
  };

  // Handle image file selection
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingImage(true);
      const base64Data = await compressImageFile(file, 600, 600, 0.85);
      setFormImage(base64Data);
      showToast('New photo uploaded and formatted successfully!');
    } catch (err) {
      console.error('Image compression error:', err);
      showToast('Could not process image file. Please try another file.');
    } finally {
      setIsCompressingImage(false);
      if (isEdit && editFileInputRef.current) editFileInputRef.current.value = '';
      if (!isEdit && addFileInputRef.current) addFileInputRef.current.value = '';
    }
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.id) return;

    const finalRole = formRole === 'Custom Role...' ? customRoleInput.trim() : formRole;
    if (!formName.trim()) {
      showToast('Employee name is required.');
      return;
    }
    if (!finalRole) {
      showToast('Employee role is required.');
      return;
    }

    const updates: Partial<TeamMember> = {
      name: formName.trim(),
      role: finalRole,
      category: formCategory,
      initials: formInitials.trim() || getInitialsFromName(formName),
      image: formImage.trim(),
      bio: formBio.trim(),
      circularPhoto: formCircular,
      objectPosition: formAlignment,
      bg: formBg,
      isLeader: formCategory === 'leadership',
    };

    teamService.updateTeamMember(editingMember.id, updates);
    setEditingMember(null);
    showToast(`Saved changes for ${formName}! Public "Our Team" page updated live.`);
  };

  // Save New Member
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = formRole === 'Custom Role...' ? customRoleInput.trim() : formRole;
    if (!formName.trim()) {
      showToast('Employee name is required.');
      return;
    }
    if (!finalRole) {
      showToast('Employee role is required.');
      return;
    }

    teamService.createTeamMember({
      name: formName.trim(),
      role: finalRole,
      category: formCategory,
      initials: formInitials.trim() || getInitialsFromName(formName),
      image: formImage.trim(),
      bio: formBio.trim(),
      circularPhoto: formCircular,
      objectPosition: formAlignment,
      bg: formBg,
      isLeader: formCategory === 'leadership',
    });

    setShowAddModal(false);
    showToast(`Added ${formName} to ${getCategoryBadgeLabel(formCategory)}! Live on /team.`);
  };

  // Delete Member
  const handleDeleteMember = (member: TeamMember) => {
    if (!member.id) return;
    if (window.confirm(`Are you sure you want to remove ${member.name} (${member.role}) from the "Our Team" page?`)) {
      teamService.deleteTeamMember(member.id);
      showToast(`Removed ${member.name} from team roster.`);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the default 38 team members roster? Any custom edits or added members will be reset.'
      )
    ) {
      teamService.resetToDefaultTeam();
      showToast('Team roster successfully restored to defaults (38 members).');
    }
  };

  function getCategoryBadgeLabel(cat?: TeamMemberCategory): string {
    switch (cat) {
      case 'leadership':
        return 'Leadership';
      case 'development':
        return 'Engineering Team';
      case 'web_intern':
        return 'Web Intern';
      case 'android_intern':
        return 'Android Intern';
      default:
        return 'Team';
    }
  }

  function getCategoryBadgeColor(cat?: TeamMemberCategory): string {
    switch (cat) {
      case 'leadership':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'development':
        return 'bg-blue-50 text-[#232884] border-blue-200';
      case 'web_intern':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'android_intern':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  return (
    <div className="glass-card p-5 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Our Team &amp; Employee Directory
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live on /team ({members.length} members)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Edit photos, roles, categories, and options for every team member displayed on the public "Our Team" page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/team"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            title="Open public team page in a new tab"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>View Live Page</span>
          </a>

          {isAdmin && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Revert back to original team members roster"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reset Defaults</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#232884] hover:bg-[#1a1e64] text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-md active:scale-95"
            title="Add a new team member to the employee directory and public website"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>+ Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-[#232884] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Members</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('leadership')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'leadership'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Leadership</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'leadership' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countLeadership}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('development')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'development'
                ? 'bg-[#3D48C8] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Engineering Team</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'development' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countDev}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('web_intern')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'web_intern'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Web Interns</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'web_intern' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countWebInterns}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('android_intern')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'android_intern'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Android Interns</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'android_intern' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countAndroidInterns}
            </span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, role, or bio..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#232884]/30 focus:border-[#232884] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Showing counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredMembers.length}</strong> of{' '}
          <strong className="text-slate-800">{members.length}</strong> employees
        </span>
        {searchQuery && (
          <span className="text-blue-600">
            Filtered by: "{searchQuery}"
          </span>
        )}
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 space-y-3">
          <span className="material-symbols-outlined text-5xl text-slate-300">group_off</span>
          <p className="text-sm font-bold text-slate-700">No employees match your search or filter</p>
          <p className="text-xs text-slate-400">Try adjusting your search terms or select "All Members".</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#232884] text-white"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMembers.map((member) => {
            const isCircular = member.circularPhoto;
            return (
              <div
                key={member.id || member.name}
                className="group relative p-4 rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-blue-300 shadow-[0_4px_16px_-2px_rgba(0,17,58,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(35,40,132,0.15)] flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Category badge & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                        member.category
                      )}`}
                    >
                      {getCategoryBadgeLabel(member.category)}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete employee"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Portrait / Avatar Display */}
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`relative w-24 h-24 ${
                        isCircular ? 'rounded-full' : 'rounded-2xl'
                      } p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200 border-2 border-slate-200 shadow-sm overflow-hidden mb-3 group-hover:scale-105 transition-transform`}
                    >
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`w-full h-full object-cover ${
                            isCircular ? 'rounded-full' : 'rounded-xl'
                          }`}
                          style={{
                            objectFit: 'cover',
                            objectPosition: member.objectPosition || 'center center',
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={`w-full h-full ${
                            member.bg || 'bg-[#232884]'
                          } text-white flex items-center justify-center font-black text-xl ${
                            isCircular ? 'rounded-full' : 'rounded-xl'
                          }`}
                        >
                          {member.initials || getInitialsFromName(member.name)}
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#232884] transition-colors uppercase tracking-tight line-clamp-1">
                      {member.name}
                    </h4>

                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-bold text-[#3D48C8] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                        {member.role}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed px-1">
                        {member.bio}
                      </p>
                    )}

                    {/* Display options info */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="material-symbols-outlined text-xs">tune</span>
                      <span>{isCircular ? 'Circular Photo' : 'Card Portrait'}</span>
                      <span>•</span>
                      <span>{member.objectPosition || 'center'}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(member)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-[#232884] text-[#232884] hover:text-white border border-slate-200 hover:border-[#232884] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Details &amp; Change Image</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ===================================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#232884] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Edit Employee: {editingMember.name}
                </h3>
                <p className="text-xs text-blue-200">
                  Live updates are immediately reflected on the "Our Team" page (/team).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* LIVE PREVIEW BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200/60 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`relative w-20 h-20 ${
                      formCircular ? 'rounded-full' : 'rounded-2xl'
                    } p-1 bg-white border-2 border-[#232884]/30 shadow-md overflow-hidden`}
                  >
                    {formImage ? (
                      <img
                        src={formImage}
                        alt={formName || 'Preview'}
                        className={`w-full h-full object-cover ${
                          formCircular ? 'rounded-full' : 'rounded-xl'
                        }`}
                        style={{ objectFit: 'cover', objectPosition: formAlignment }}
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${formBg} text-white flex items-center justify-center font-black text-xl ${
                          formCircular ? 'rounded-full' : 'rounded-xl'
                        }`}
                      >
                        {formInitials || getInitialsFromName(formName)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#232884] border border-blue-200 mb-1">
                    Live Preview Card
                  </span>
                  <h4 className="text-base font-black text-slate-900 uppercase truncate">
                    {formName || 'Employee Name'}
                  </h4>
                  <p className="text-xs font-bold text-[#3D48C8] uppercase">
                    {formRole === 'Custom Role...' ? customRoleInput || 'Custom Role' : formRole || 'Role'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {formBio || 'No bio description entered yet.'}
                  </p>
                </div>
              </div>

              {/* PHOTO UPLOAD & IMAGE OPTIONS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#232884]">photo_camera</span>
                    <span>Employee Photo / Image</span>
                  </label>
                  {formImage && (
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      <span>Remove Photo (Use Initials)</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isCompressingImage}
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl font-bold bg-[#232884] hover:bg-[#181c62] text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>{isCompressingImage ? 'Processing...' : 'Upload Photo from Device'}</span>
                  </button>

                  <span className="text-slate-400 text-center font-bold text-[11px]">OR</span>

                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Paste image URL (e.g. /live_assets/... or https://...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Upload any JPG, PNG, or WEBP photo. It is automatically compressed to optimize web performance.
                </p>
              </div>

              {/* BASIC DETAILS */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        if (!formInitials || formInitials === getInitialsFromName(formName)) {
                          setFormInitials(getInitialsFromName(e.target.value));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                      placeholder="e.g. Shriram Khabale"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Initials (For Avatar)</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={formInitials}
                      onChange={(e) => setFormInitials(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold uppercase"
                      placeholder="e.g. SK"
                    />
                  </div>
                </div>

                {/* CATEGORY & ROLE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Team Section / Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as TeamMemberCategory;
                        setFormCategory(newCat);
                        if (newCat.includes('intern')) {
                          setFormCircular(true);
                          setFormAlignment('center 20%');
                        } else {
                          setFormCircular(false);
                          setFormAlignment('center center');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      <option value="leadership">Leadership (Top 3 Cards)</option>
                      <option value="development">Engineering &amp; Development Team (Main Grid)</option>
                      <option value="web_intern">Web Developer Interns (Scrolling Marquee)</option>
                      <option value="android_intern">Android Developer Interns (Scrolling Marquee)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Designation / Role *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      {COMMON_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formRole === 'Custom Role...' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom Role Title *</label>
                    <input
                      required
                      type="text"
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      placeholder="Type custom designation, e.g. Chief Technology Officer"
                      className="w-full px-3.5 py-2 rounded-xl border border-blue-400 bg-white text-slate-900"
                    />
                  </div>
                )}

                {/* BIO */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bio / Description
                    <span className="text-slate-400 font-normal ml-1">
                      (Shown on Leadership &amp; Engineering cards)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Brief description of experience, specialization, and responsibilities..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* DISPLAY OPTIONS (SHAPE, ALIGNMENT, BG COLOR) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#232884]">tune</span>
                  <span>Photo &amp; Display Options</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Shape */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Photo Frame Shape</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormCircular(false)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          !formCircular
                            ? 'bg-[#232884] text-white border-[#232884] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block font-extrabold text-xs">Rounded Card</span>
                        <span className="text-[10px] opacity-80">Default for Devs</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormCircular(true)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          formCircular
                            ? 'bg-[#232884] text-white border-[#232884] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block font-extrabold text-xs">Circular Avatar</span>
                        <span className="text-[10px] opacity-80">Default for Interns</span>
                      </button>
                    </div>
                  </div>

                  {/* Face Focus / Alignment */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Photo Alignment / Focus</label>
                    <select
                      value={formAlignment}
                      onChange={(e) => setFormAlignment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      {ALIGNMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Adjusts object-position so faces stay centered and not cropped.
                    </p>
                  </div>
                </div>

                {/* Avatar BG Color (if no image) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Initials Avatar Color (used when photo is not provided)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {BG_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormBg(opt.value)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          formBg === opt.value
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: opt.bgHex }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#232884] hover:bg-[#171a5c] text-white shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Save &amp; Apply Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ADD NEW MEMBER MODAL */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-scaleIn">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  + Add New Team Member
                </h3>
                <p className="text-xs text-emerald-200">
                  New member will immediately appear on the "Our Team" page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* LIVE PREVIEW BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/60 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`relative w-20 h-20 ${
                      formCircular ? 'rounded-full' : 'rounded-2xl'
                    } p-1 bg-white border-2 border-emerald-500/30 shadow-md overflow-hidden`}
                  >
                    {formImage ? (
                      <img
                        src={formImage}
                        alt={formName || 'Preview'}
                        className={`w-full h-full object-cover ${
                          formCircular ? 'rounded-full' : 'rounded-xl'
                        }`}
                        style={{ objectFit: 'cover', objectPosition: formAlignment }}
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${formBg} text-white flex items-center justify-center font-black text-xl ${
                          formCircular ? 'rounded-full' : 'rounded-xl'
                        }`}
                      >
                        {formInitials || getInitialsFromName(formName)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                    Live Preview Card
                  </span>
                  <h4 className="text-base font-black text-slate-900 uppercase truncate">
                    {formName || 'New Employee Name'}
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 uppercase">
                    {formRole === 'Custom Role...' ? customRoleInput || 'Custom Role' : formRole || 'Role'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {formBio || 'No bio entered yet.'}
                  </p>
                </div>
              </div>

              {/* PHOTO UPLOAD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-700">photo_camera</span>
                  <span>Employee Photo</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="file"
                    ref={addFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isCompressingImage}
                    onClick={() => addFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>{isCompressingImage ? 'Processing...' : 'Upload Photo from Device'}</span>
                  </button>

                  <span className="text-slate-400 text-center font-bold text-[11px]">OR</span>

                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Paste image URL (e.g. /live_assets/... or https://...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* BASIC DETAILS */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        if (!formInitials || formInitials === getInitialsFromName(formName)) {
                          setFormInitials(getInitialsFromName(e.target.value));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                      placeholder="e.g. Anand Shinde"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Initials (For Avatar)</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={formInitials}
                      onChange={(e) => setFormInitials(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold uppercase"
                      placeholder="e.g. AS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Team Section / Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as TeamMemberCategory;
                        setFormCategory(newCat);
                        if (newCat.includes('intern')) {
                          setFormCircular(true);
                          setFormAlignment('center 20%');
                        } else {
                          setFormCircular(false);
                          setFormAlignment('center center');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      <option value="leadership">Leadership (Top 3 Cards)</option>
                      <option value="development">Engineering &amp; Development Team (Main Grid)</option>
                      <option value="web_intern">Web Developer Interns (Scrolling Marquee)</option>
                      <option value="android_intern">Android Developer Interns (Scrolling Marquee)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Designation / Role *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      {COMMON_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formRole === 'Custom Role...' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom Role Title *</label>
                    <input
                      required
                      type="text"
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      placeholder="Type custom designation"
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-white text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bio / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Brief description of experience, specialization, and role..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* DISPLAY OPTIONS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-700">tune</span>
                  <span>Photo &amp; Display Options</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Photo Frame Shape</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormCircular(false)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          !formCircular
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block font-extrabold text-xs">Rounded Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormCircular(true)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          formCircular
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block font-extrabold text-xs">Circular Avatar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Photo Alignment</label>
                    <select
                      value={formAlignment}
                      onChange={(e) => setFormAlignment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                    >
                      {ALIGNMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>+ Add Employee to Roster</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
