export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  LAB_TECH = 'LAB_TECH',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DoctorDetails {
  registrationNumber: string;
  specialization: string[];
  clinicName: string;
  clinicAddress?: Address;
  verificationStatus: VerificationStatus;
  verificationDocumentUrl?: string;
  yearsOfExperience?: number;
}

export interface User {
  _id?: string;
  id: string;
  role: UserRole;
  phone?: string;
  uhid?: string;
  email: string;
  fullName: string;
  gender?: Gender;
  dateOfBirth?: Date;
  address?: Address;
  profileImageUrl?: string;
  photoURL?: string;

  // Doctor-specific fields
  doctorDetails?: DoctorDetails;

  // Patient-specific fields
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;

  // Security
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface CreateUserDto {
  role: UserRole;
  phone?: string;
  email: string;
  fullName: string;
  password: string;
  gender?: Gender;
  dateOfBirth?: Date;
  doctorDetails?: Partial<DoctorDetails>;
}

export interface UpdateUserDto {
  fullName?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  address?: Address;
  profileImageUrl?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: User['emergencyContact'];
}
