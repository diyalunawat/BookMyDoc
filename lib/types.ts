export type DoctorWithProfile = {
  id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  clinic_location: string;
  city: string;
  bio: string | null;
  rating: number;
  total_ratings: number;
  created_at: Date;
  updated_at: Date;
  profile: {
    id: string;
    email: string;
    role: string;
    full_name: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    profile_photo_url: string | null;
    created_at: Date;
    updated_at: Date;
  };
};

export type Review = {
  id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  review_text: string | null;
  created_at: Date;
  patient: {
    full_name: string;
    profile_photo_url: string | null;
  };
};

