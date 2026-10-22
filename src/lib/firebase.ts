import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Registration, 
  Student, 
  Guardian, 
  ConsentRecord, 
  ObservationAppointment, 
  SchoolSettings 
} from '../types/database';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with databaseId as instructed in Firebase Skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore as required by Skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'default'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or starting up.");
    }
    return false;
  }
}

// Firebase Auth Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOutFromFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-Out Error:', error);
  }
}

// Firestore Database Service for Little Star School
export const firebaseService = {
  // Save new student
  async createStudent(student: Student): Promise<void> {
    const path = `students/${student.id}`;
    try {
      await setDoc(doc(db, 'students', student.id), {
        id: student.id,
        fullName: student.full_name,
        preferredName: student.preferred_name,
        birthPlace: student.birth_place,
        birthDate: student.birth_date,
        calculatedAge: student.calculated_age || '',
        gender: student.gender,
        address: student.address,
        previousEducation: student.previous_education || '',
        createdAt: student.created_at,
        updatedAt: student.updated_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Save new guardian
  async createGuardian(guardian: Guardian): Promise<void> {
    const path = `guardians/${guardian.id}`;
    try {
      await setDoc(doc(db, 'guardians', guardian.id), {
        id: guardian.id,
        fullName: guardian.full_name,
        relationship: guardian.relationship,
        phoneNumber: guardian.phone_number,
        whatsappNumber: guardian.whatsapp_number,
        email: guardian.email || '',
        emergencyContactName: guardian.emergency_contact_name,
        emergencyContactPhone: guardian.emergency_contact_phone,
        createdAt: guardian.created_at,
        updatedAt: guardian.updated_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Save new registration
  async createRegistration(reg: Registration): Promise<void> {
    const path = `registrations/${reg.id}`;
    try {
      await setDoc(doc(db, 'registrations', reg.id), {
        id: reg.id,
        registrationNumber: reg.registration_number,
        studentId: reg.student_id,
        guardianId: reg.guardian_id,
        status: reg.status,
        submissionDate: reg.submission_date,
        developmentalBackground: reg.developmental_background,
        adminNotes: reg.admin_notes || '',
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Save consent record
  async createConsent(consent: ConsentRecord): Promise<void> {
    const path = `consents/${consent.id}`;
    try {
      await setDoc(doc(db, 'consents', consent.id), {
        id: consent.id,
        registrationId: consent.registration_id,
        guardianName: consent.guardian_name,
        consentObservation: consent.consent_observation,
        consentPrivacyPolicy: consent.consent_privacy_policy,
        dataAccuracyConfirmed: consent.data_accuracy_confirmed,
        consentedAt: consent.consented_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Save or update appointment
  async saveAppointment(apt: ObservationAppointment): Promise<void> {
    const path = `appointments/${apt.id}`;
    try {
      await setDoc(doc(db, 'appointments', apt.id), {
        id: apt.id,
        registrationId: apt.registration_id,
        appointmentDate: apt.appointment_date,
        timeSlot: apt.time_slot,
        locationRoom: apt.location_room,
        observerId: apt.observer_id || '',
        observerName: apt.observer_name || '',
        status: apt.status,
        notes: apt.notes || '',
        rescheduleReason: apt.reschedule_reason || '',
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Update registration status
  async updateRegistrationStatus(id: string, status: string, adminNotes?: string): Promise<void> {
    const path = `registrations/${id}`;
    try {
      const payload: any = { status, updatedAt: new Date().toISOString() };
      if (adminNotes !== undefined) payload.adminNotes = adminNotes;
      await updateDoc(doc(db, 'registrations', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Save school settings
  async saveSchoolSettings(settings: SchoolSettings): Promise<void> {
    const path = `settings/default`;
    try {
      await setDoc(doc(db, 'settings', 'default'), {
        id: 'default',
        schoolName: settings.school_name,
        tagline: settings.tagline,
        address: settings.address,
        phone: settings.phone,
        whatsappNumber: settings.whatsapp_number,
        email: settings.email,
        accreditation: settings.accreditation,
        vision: settings.vision,
        mission: settings.mission,
        observationGuidelines: settings.observation_guidelines,
        faqList: settings.faq_list,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save observation session (Module 2)
  async saveObservationSession(session: any): Promise<void> {
    const path = `observation_sessions/${session.id}`;
    try {
      await setDoc(doc(db, 'observation_sessions', session.id), {
        ...session,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save observation report (Module 3)
  async saveObservationReport(report: any): Promise<void> {
    const path = `reports/${report.id}`;
    try {
      await setDoc(doc(db, 'reports', report.id), {
        ...report,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save learning recommendation (Module 3)
  async saveLearningRecommendation(rec: any): Promise<void> {
    const path = `learning_recommendations/${rec.id}`;
    try {
      await setDoc(doc(db, 'learning_recommendations', rec.id), {
        ...rec,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save admission decision (Module 4)
  async saveAdmissionDecision(decision: any): Promise<void> {
    const path = `admission_decisions/${decision.id}`;
    try {
      await setDoc(doc(db, 'admission_decisions', decision.id), {
        ...decision,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete admission decision (Module 4)
  async deleteAdmissionDecision(decisionId: string): Promise<void> {
    const path = `admission_decisions/${decisionId}`;
    try {
      await deleteDoc(doc(db, 'admission_decisions', decisionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save staff user (Module 4)
  async saveStaffUser(user: any): Promise<void> {
    const path = `staff_users/${user.id}`;
    try {
      await setDoc(doc(db, 'staff_users', user.id), {
        ...user,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Record immutable audit log (Module 4)
  async logAuditEvent(auditLog: any): Promise<void> {
    const path = `audit_logs/${auditLog.id}`;
    try {
      await setDoc(doc(db, 'audit_logs', auditLog.id), {
        ...auditLog,
        timestamp: auditLog.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },
};

