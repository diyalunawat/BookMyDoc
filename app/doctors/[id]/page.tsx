'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MapPin, Briefcase, GraduationCap, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { DoctorWithProfile, Review } from '@/lib/types';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30',
  ];

  useEffect(() => {
    if (params.id) {
      fetchDoctorDetails();
      fetchReviews();
    }
  }, [params.id]);

  const fetchDoctorDetails = async () => {
    try {
      const { getDoctorByIdAction } = await import('@/lib/actions');
      const result = await getDoctorByIdAction(params.id as string);

      if (result.error) {
        console.error('Error fetching doctor:', result.error);
      } else if (result.doctor) {
        setDoctor(result.doctor);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { getReviewsAction } = await import('@/lib/actions');
      const result = await getReviewsAction(params.id as string);

      if (result.error) {
        console.error('Error fetching reviews:', result.error);
      } else if (result.reviews) {
        setReviews(result.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to book an appointment');
      router.push('/login');
      return;
    }

    if (profile.role === 'doctor') {
      toast.error('Doctors cannot book appointments');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setBooking(true);

    try {
      const { createAppointmentAction } = await import('@/lib/actions');
      const result = await createAppointmentAction(
        params.id as string,
        selectedDate.toISOString().split('T')[0],
        selectedTime,
        notes
      );

      if (result.error) {
        toast.error('Failed to book appointment', {
          description: result.error,
        });
      } else {
        toast.success('Appointment booked successfully!');
        setBookingDialogOpen(false);
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error('Failed to book appointment', {
        description: error.message,
      });
    } finally {
      setBooking(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to submit a review');
      router.push('/login');
      return;
    }

    if (profile.role === 'doctor') {
      toast.error('Doctors cannot review other doctors');
      return;
    }

    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);

    try {
      const { createReviewAction } = await import('@/lib/actions');
      const result = await createReviewAction(
        params.id as string,
        reviewRating,
        reviewText || undefined
      );

      if (result.error) {
        toast.error('Failed to submit review', {
          description: result.error,
        });
      } else {
        toast.success('Review submitted successfully!');
        setReviewRating(0);
        setReviewText('');
        // Refresh reviews and doctor details
        await fetchReviews();
        await fetchDoctorDetails();
      }
    } catch (error: any) {
      toast.error('Failed to submit review', {
        description: error.message,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Check if current user has already reviewed this doctor
  const hasReviewed = user && profile && reviews.some(review => review.patient_id === user.id);
  const canReview = user && profile && profile.role === 'patient' && !hasReviewed;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = doctor.profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={doctor.profile.profile_photo_url || ''} alt={doctor.profile.full_name} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-3xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {doctor.profile.full_name}
                  </h1>
                  <p className="text-xl text-teal-600 font-medium mb-4">{doctor.specialization}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="h-5 w-5" />
                      <span>{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-5 w-5" />
                      <span>{doctor.experience_years} years of experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{doctor.clinic_location}, {doctor.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-semibold text-gray-900">₹{doctor.consultation_fee} consultation fee</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">
                        {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                    {doctor.total_ratings > 0 && (
                      <span className="text-gray-600">({doctor.total_ratings} reviews)</span>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => setBookingDialogOpen(true)}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {canReview && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none transition-transform hover:scale-110"
                            disabled={submittingReview}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                rating <= reviewRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-300 text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm text-gray-600">
                            {reviewRating} {reviewRating === 1 ? 'star' : 'stars'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Your Review (Optional)
                      </label>
                      <Textarea
                        placeholder="Share your experience with this doctor..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        disabled={submittingReview}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || submittingReview}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              )}

              {hasReviewed && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-sm text-teal-800">
                    ✓ You have already reviewed this doctor
                  </p>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.patient?.profile_photo_url || ''} />
                          <AvatarFallback className="bg-gray-200">
                            {review.patient?.full_name?.[0] || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {review.patient?.full_name || 'Anonymous'}
                            </span>
                            {review.patient_id === user?.id && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-600">{review.review_text}</p>
                          )}
                          <p className="text-sm text-gray-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. {doctor.profile.full_name}</DialogTitle>
            <DialogDescription>
              Select your preferred date and time slot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Select Date</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">Select Time Slot</h4>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Additional Notes (Optional)</h4>
              <Textarea
                placeholder="Describe your symptoms or reason for visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || booking}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setBookingDialogOpen(false)}
                disabled={booking}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
