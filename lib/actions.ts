'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { generateToken, verifyToken } from './jwt';
import { revalidatePath } from 'next/cache';

// Auth Actions
export async function signUpAction(
  email: string,
  password: string,
  full_name: string,
  phone: string,
  role: 'patient' | 'doctor'
) {
  try {
    if (!email || !password || !full_name || !role) {
      return { error: 'Missing required fields' };
    }

    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName: full_name,
        phone,
        role,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.fullName,
        phone: user.phone,
      },
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return { error: error.message || 'Internal server error' };
  }
}

export async function signInAction(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { error: 'Invalid email or password' };
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.fullName,
        phone: user.phone,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function signOutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Internal server error' };
  }
}

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { user: null };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { user: null };
    }

    // Get user from database
    const user = await prisma.profile.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        age: true,
        gender: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { user: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.fullName,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        profile_photo_url: user.profilePhotoUrl,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { user: null };
  }
}

// Doctor Actions
export async function getDoctorsAction() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    const doctorsWithProfile = doctors.map((doctor) => ({
      id: doctor.id,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience_years: doctor.experienceYears,
      consultation_fee: Number(doctor.consultationFee),
      clinic_location: doctor.clinicLocation,
      city: doctor.city,
      bio: doctor.bio,
      rating: Number(doctor.rating),
      total_ratings: doctor.totalRatings,
      created_at: doctor.createdAt,
      updated_at: doctor.updatedAt,
      profile: {
        id: doctor.profile.id,
        email: doctor.profile.email,
        role: doctor.profile.role,
        full_name: doctor.profile.fullName,
        phone: doctor.profile.phone,
        age: doctor.profile.age,
        gender: doctor.profile.gender,
        profile_photo_url: doctor.profile.profilePhotoUrl,
        created_at: doctor.profile.createdAt,
        updated_at: doctor.profile.updatedAt,
      },
    }));

    return { success: true, doctors: doctorsWithProfile };
  } catch (error: any) {
    console.error('Get doctors error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function getDoctorByIdAction(doctorId: string) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        profile: true,
      },
    });

    if (!doctor) {
      return { error: 'Doctor not found' };
    }

    const doctorWithProfile = {
      id: doctor.id,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience_years: doctor.experienceYears,
      consultation_fee: Number(doctor.consultationFee),
      clinic_location: doctor.clinicLocation,
      city: doctor.city,
      bio: doctor.bio,
      rating: Number(doctor.rating),
      total_ratings: doctor.totalRatings,
      created_at: doctor.createdAt,
      updated_at: doctor.updatedAt,
      profile: {
        id: doctor.profile.id,
        email: doctor.profile.email,
        role: doctor.profile.role,
        full_name: doctor.profile.fullName,
        phone: doctor.profile.phone,
        age: doctor.profile.age,
        gender: doctor.profile.gender,
        profile_photo_url: doctor.profile.profilePhotoUrl,
        created_at: doctor.profile.createdAt,
        updated_at: doctor.profile.updatedAt,
      },
    };

    return { success: true, doctor: doctorWithProfile };
  } catch (error: any) {
    console.error('Get doctor error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

// Appointment Actions
export async function getAppointmentsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: payload.userId,
      },
      include: {
        doctor: {
          include: {
            profile: {
              select: {
                fullName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      appointment_date: appointment.appointmentDate.toISOString().split('T')[0],
      appointment_time: appointment.appointmentTime.toTimeString().slice(0, 5),
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
      doctor: {
        id: appointment.doctor.id,
        specialization: appointment.doctor.specialization,
        consultation_fee: Number(appointment.doctor.consultationFee),
        clinic_location: appointment.doctor.clinicLocation,
        profile: {
          full_name: appointment.doctor.profile.fullName,
          profile_photo_url: appointment.doctor.profile.profilePhotoUrl,
        },
      },
    }));

    return { success: true, appointments: formattedAppointments };
  } catch (error: any) {
    console.error('Get appointments error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function createAppointmentAction(
  doctorId: string,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return { error: 'Missing required fields' };
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: payload.userId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: new Date(`1970-01-01T${appointmentTime}:00`),
        notes: notes || null,
        status: 'pending',
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/doctors/[id]');

    return {
      success: true,
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointmentDate.toISOString().split('T')[0],
        appointment_time: appointment.appointmentTime.toTimeString().slice(0, 5),
        status: appointment.status,
        notes: appointment.notes,
      },
    };
  } catch (error: any) {
    console.error('Create appointment error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: string
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { error: 'Appointment not found' };
    }

    // Allow both patient and doctor to update appointment status
    if (appointment.patientId !== payload.userId && appointment.doctorId !== payload.userId) {
      return { error: 'Unauthorized' };
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    revalidatePath('/dashboard');
    revalidatePath('/doctor/dashboard');

    return {
      success: true,
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
      },
    };
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

// Review Actions
export async function getReviewsAction(doctorId: string) {
  try {
    const reviews = await prisma.doctorReview.findMany({
      where: {
        doctorId,
      },
      include: {
        patient: {
          select: {
            fullName: true,
            profilePhotoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      doctor_id: review.doctorId,
      patient_id: review.patientId,
      rating: review.rating,
      review_text: review.reviewText,
      created_at: review.createdAt,
      patient: {
        full_name: review.patient.fullName,
        profile_photo_url: review.patient.profilePhotoUrl,
      },
    }));

    return { success: true, reviews: formattedReviews };
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function createReviewAction(
  doctorId: string,
  rating: number,
  reviewText?: string
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    if (!doctorId || !rating || rating < 1 || rating > 5) {
      return { error: 'Invalid rating' };
    }

    // Check if review already exists
    const existingReview = await prisma.doctorReview.findUnique({
      where: {
        doctorId_patientId: {
          doctorId,
          patientId: payload.userId,
        },
      },
    });

    if (existingReview) {
      return { error: 'You have already reviewed this doctor' };
    }

    // Create review
    const review = await prisma.doctorReview.create({
      data: {
        doctorId,
        patientId: payload.userId,
        rating,
        reviewText: reviewText || null,
      },
    });

    // Update doctor rating
    const doctorReviews = await prisma.doctorReview.findMany({
      where: { doctorId },
    });

    const totalRatings = doctorReviews.length;
    const averageRating =
      doctorReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        rating: averageRating,
        totalRatings: totalRatings,
      },
    });

    revalidatePath('/doctors/[id]');

    return {
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        review_text: review.reviewText,
      },
    };
  } catch (error: any) {
    console.error('Create review error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

// Profile Actions
export async function updateProfileAction(data: {
  full_name?: string;
  phone?: string;
  age?: number;
  gender?: string;
  profile_photo_url?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const updateData: any = {};
    if (data.full_name !== undefined) updateData.fullName = data.full_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.profile_photo_url !== undefined)
      updateData.profilePhotoUrl = data.profile_photo_url;

    const updatedProfile = await prisma.profile.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        age: true,
        gender: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        full_name: updatedProfile.fullName,
        phone: updatedProfile.phone,
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        profile_photo_url: updatedProfile.profilePhotoUrl,
        created_at: updatedProfile.createdAt.toISOString(),
        updated_at: updatedProfile.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

// Doctor-specific Actions
export async function createDoctorProfileAction(data: {
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  clinic_location: string;
  city: string;
  bio?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    if (payload.role !== 'doctor') {
      return { error: 'Only doctors can create doctor profiles' };
    }

    const doctor = await prisma.doctor.create({
      data: {
        id: payload.userId,
        specialization: data.specialization,
        qualification: data.qualification,
        experienceYears: data.experience_years,
        consultationFee: data.consultation_fee,
        clinicLocation: data.clinic_location,
        city: data.city,
        bio: data.bio || null,
      },
    });

    revalidatePath('/doctor/dashboard');
    revalidatePath('/doctor/complete-profile');

    return {
      success: true,
      doctor: {
        id: doctor.id,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience_years: doctor.experienceYears,
        consultation_fee: Number(doctor.consultationFee),
        clinic_location: doctor.clinicLocation,
        city: doctor.city,
        bio: doctor.bio,
      },
    };
  } catch (error: any) {
    console.error('Create doctor profile error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function getDoctorProfileAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: payload.userId },
    });

    if (!doctor) {
      return { error: 'Doctor profile not found' };
    }

    return {
      success: true,
      doctor: {
        id: doctor.id,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience_years: doctor.experienceYears,
        consultation_fee: Number(doctor.consultationFee),
        clinic_location: doctor.clinicLocation,
        city: doctor.city,
        bio: doctor.bio,
        rating: Number(doctor.rating),
        total_ratings: doctor.totalRatings,
      },
    };
  } catch (error: any) {
    console.error('Get doctor profile error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function updateDoctorProfileAction(data: {
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  clinic_location?: string;
  city?: string;
  bio?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const updateData: any = {};
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.experience_years !== undefined) updateData.experienceYears = data.experience_years;
    if (data.consultation_fee !== undefined) updateData.consultationFee = data.consultation_fee;
    if (data.clinic_location !== undefined) updateData.clinicLocation = data.clinic_location;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.bio !== undefined) updateData.bio = data.bio;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: payload.userId },
      data: updateData,
    });

    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');

    return {
      success: true,
      doctor: {
        id: updatedDoctor.id,
        specialization: updatedDoctor.specialization,
        qualification: updatedDoctor.qualification,
        experience_years: updatedDoctor.experienceYears,
        consultation_fee: Number(updatedDoctor.consultationFee),
        clinic_location: updatedDoctor.clinicLocation,
        city: updatedDoctor.city,
        bio: updatedDoctor.bio,
      },
    };
  } catch (error: any) {
    console.error('Update doctor profile error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function getDoctorAppointmentsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: 'Invalid token' };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: payload.userId,
      },
      include: {
        patient: {
          select: {
            fullName: true,
            phone: true,
            age: true,
            gender: true,
            profilePhotoUrl: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      appointment_date: appointment.appointmentDate.toISOString().split('T')[0],
      appointment_time: appointment.appointmentTime.toTimeString().slice(0, 5),
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
      patient: {
        full_name: appointment.patient.fullName,
        phone: appointment.patient.phone,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
        profile_photo_url: appointment.patient.profilePhotoUrl,
      },
    }));

    return { success: true, appointments: formattedAppointments };
  } catch (error: any) {
    console.error('Get doctor appointments error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

