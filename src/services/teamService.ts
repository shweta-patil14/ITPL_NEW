import { LEADERSHIP, DEV_TEAM, WEB_INTERNS_TEAM, ANDROID_INTERNS_TEAM } from '../data';
import { TeamMember, TeamMemberCategory } from '../types';
import {
  saveOurTeamMemberFirestore,
  deleteOurTeamMemberFirestore,
  getOurTeamMembersFirestore,
} from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';
import { getInitialsFromName } from '../utils/imageUtils';

const STORAGE_KEY = 'itpl_our_team_members';
const UPDATE_EVENT_NAME = 'itpl_team_updated';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Build the full default list of 38 employees displayed on the "Our Team" page.
 */
export function getDefaultTeamMembers(): TeamMember[] {
  let orderCounter = 1;

  const leaders: TeamMember[] = LEADERSHIP.map((m, idx) => ({
    ...m,
    id: `lead-${slugify(m.name) || idx + 1}`,
    category: 'leadership' as TeamMemberCategory,
    isLeader: true,
    circularPhoto: false,
    objectPosition: m.objectPosition || 'center center',
    initials: m.initials || getInitialsFromName(m.name),
    displayOrder: orderCounter++,
  }));

  const devs: TeamMember[] = DEV_TEAM.map((m, idx) => ({
    ...m,
    id: `dev-${slugify(m.name) || idx + 1}`,
    category: 'development' as TeamMemberCategory,
    isLeader: false,
    circularPhoto: m.circularPhoto ?? false,
    objectPosition: m.objectPosition || 'center center',
    initials: m.initials || getInitialsFromName(m.name),
    displayOrder: orderCounter++,
  }));

  const webInterns: TeamMember[] = WEB_INTERNS_TEAM.map((m, idx) => ({
    ...m,
    id: `web-${slugify(m.name) || idx + 1}`,
    category: 'web_intern' as TeamMemberCategory,
    isLeader: false,
    circularPhoto: m.circularPhoto ?? true,
    objectPosition: m.objectPosition || 'center 20%',
    initials: m.initials || getInitialsFromName(m.name),
    displayOrder: orderCounter++,
  }));

  const androidInterns: TeamMember[] = ANDROID_INTERNS_TEAM.map((m, idx) => ({
    ...m,
    id: `android-${slugify(m.name) || idx + 1}`,
    category: 'android_intern' as TeamMemberCategory,
    isLeader: false,
    circularPhoto: m.circularPhoto ?? true,
    objectPosition: m.objectPosition || 'center 20%',
    initials: m.initials || getInitialsFromName(m.name),
    displayOrder: orderCounter++,
  }));

  return [...leaders, ...devs, ...webInterns, ...androidInterns];
}

function normalizeTeamMember(m: any): TeamMember {
  const defaults = getDefaultTeamMembers();
  const matched = defaults.find(
    (d) => d.name.toLowerCase() === (m.name || '').toLowerCase() || d.id === m.id
  );

  let category = m.category;
  if (!category && matched) {
    category = matched.category;
  }
  if (!category) {
    const nameLower = (m.name || '').toLowerCase();
    if (m.isLeader || LEADERSHIP.some((l) => l.name.toLowerCase() === nameLower)) {
      category = 'leadership';
    } else if (DEV_TEAM.some((d) => d.name.toLowerCase() === nameLower)) {
      category = 'development';
    } else if (WEB_INTERNS_TEAM.some((w) => w.name.toLowerCase() === nameLower)) {
      category = 'web_intern';
    } else if (ANDROID_INTERNS_TEAM.some((a) => a.name.toLowerCase() === nameLower)) {
      category = 'android_intern';
    } else {
      category = 'development';
    }
  }

  const displayOrder = matched?.displayOrder || m.displayOrder || 999;

  return {
    ...(matched || {}),
    ...m,
    category,
    displayOrder,
    image: m.image || matched?.image || '',
    initials: m.initials || matched?.initials || getInitialsFromName(m.name || 'Member'),
  };
}

class TeamService {
  private memoryCache: TeamMember[] | null = null;
  private hasInitializedCloud = false;

  constructor() {
    this.initCloudSync();
  }

  private initCloudSync() {
    if (this.hasInitializedCloud || !isFirebaseConfigured || typeof window === 'undefined') return;
    this.hasInitializedCloud = true;

    // Asynchronously load from Firestore and merge if available
    getOurTeamMembersFirestore()
      .then((cloudMembers) => {
        if (cloudMembers && cloudMembers.length >= 20) {
          const normalized = cloudMembers
            .map(normalizeTeamMember)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          this.memoryCache = normalized;
          this.dispatchUpdate(normalized);
        } else {
          const defaults = getDefaultTeamMembers();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          this.memoryCache = defaults;
          this.dispatchUpdate(defaults);
        }
      })
      .catch((err) => {
        console.warn('Firestore team fetch note:', err);
      });
  }

  public getTeamMembers(): TeamMember[] {
    if (typeof window === 'undefined') {
      return getDefaultTeamMembers();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 25) {
          const normalized = parsed
            .map(normalizeTeamMember)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          this.memoryCache = normalized;
          return normalized;
        }
      }
    } catch (e) {
      console.error('Error reading team members from localStorage:', e);
    }

    // Seed defaults
    const defaults = getDefaultTeamMembers();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      // ignore
    }
    this.memoryCache = defaults;
    return defaults;
  }

  public getByCategory(category: TeamMemberCategory): TeamMember[] {
    return this.getTeamMembers().filter((m) => m.category === category);
  }

  public getMemberById(id: string): TeamMember | undefined {
    return this.getTeamMembers().find((m) => m.id === id);
  }

  public saveTeamMembers(members: TeamMember[]): void {
    this.memoryCache = members;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      } catch (err) {
        console.error('Error saving team members to localStorage:', err);
      }
      this.dispatchUpdate(members);
    }
  }

  public updateTeamMember(id: string, updates: Partial<TeamMember>): TeamMember[] {
    const members = this.getTeamMembers().map((m) => {
      if (m.id === id) {
        const updatedName = updates.name !== undefined ? updates.name : m.name;
        const updatedInitials =
          updates.initials ||
          (updates.name ? getInitialsFromName(updatedName) : m.initials);

        const merged: TeamMember = {
          ...m,
          ...updates,
          name: updatedName,
          initials: updatedInitials,
        };
        return merged;
      }
      return m;
    });

    this.saveTeamMembers(members);

    const updated = members.find((m) => m.id === id);
    if (updated && isFirebaseConfigured) {
      saveOurTeamMemberFirestore(updated);
    }

    return members;
  }

  public createTeamMember(member: Partial<TeamMember>): TeamMember {
    const current = this.getTeamMembers();
    const name = (member.name || 'New Team Member').trim();
    const initials = member.initials || getInitialsFromName(name);
    const category = member.category || 'development';
    const isIntern = category === 'web_intern' || category === 'android_intern';

    const newMember: TeamMember = {
      id: member.id || `custom-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      role: member.role || (isIntern ? 'Web Developer' : 'Software Engineer'),
      category,
      initials,
      image: member.image || '',
      bio: member.bio || '',
      circularPhoto: member.circularPhoto !== undefined ? member.circularPhoto : isIntern,
      objectPosition: member.objectPosition || (isIntern ? 'center 20%' : 'center center'),
      bg: member.bg || 'bg-[#232884]',
      isLeader: category === 'leadership',
      displayOrder: current.length + 1,
    };

    const updated = [newMember, ...current];
    this.saveTeamMembers(updated);

    if (isFirebaseConfigured) {
      saveOurTeamMemberFirestore(newMember);
    }

    return newMember;
  }

  public deleteTeamMember(id: string): TeamMember[] {
    const current = this.getTeamMembers();
    const updated = current.filter((m) => m.id !== id);
    this.saveTeamMembers(updated);

    if (isFirebaseConfigured) {
      deleteOurTeamMemberFirestore(id);
    }

    return updated;
  }

  public resetToDefaultTeam(): TeamMember[] {
    const defaults = getDefaultTeamMembers();
    this.saveTeamMembers(defaults);
    return defaults;
  }

  private dispatchUpdate(members: TeamMember[]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT_NAME, { detail: members })
      );
    }
  }

  public subscribe(callback: (members: TeamMember[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<TeamMember[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(this.getTeamMembers());
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback(this.getTeamMembers());
      }
    };

    window.addEventListener(UPDATE_EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }
}

export const teamService = new TeamService();
