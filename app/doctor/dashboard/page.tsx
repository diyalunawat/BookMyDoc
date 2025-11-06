'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Star, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type AppointmentWithPatient = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  patient: {
    full_name: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    profile_photo_url: string | null;
  };
};

export default function DoctorDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.role === 'patient') {
        router.push('/dashboard');
      } else {
        fetchDoctorData();
        fetchAppointments();
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchDoctorData = async () => {
    if (!user) return;

    try {
      const { getDoctorProfileAction } = await import('@/lib/actions');
      const result = await getDoctorProfileAction();

      if (result.error) {
        if (result.error === 'Doctor profile not found') {
          router.push('/doctor/complete-profile');
        }
      } else if (result.doctor) {
        setDoctorData(result.doctor);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { getDoctorAppointmentsAction } = await import('@/lib/actions');
      const result = await getDoctorAppointmentsAction();

      if (result.error) {
        console.error('Error fetching appointments:', result.error);
      } else if (result.appointments) {
        setAppointments(result.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      const { updateAppointmentStatusAction } = await import('@/lib/actions');
      const result = await updateAppointmentStatusAction(appointmentId, newStatus);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayAppointments = appointments.filter(
    (a) =>
      a.appointment_date === new Date().toISOString().split('T')[0] &&
      a.status !== 'cancelled'
  );

  const upcomingAppointments = appointments.filter(
    (a) =>
      a.status !== 'cancelled' &&
      a.status !== 'completed' &&
      new Date(a.appointment_date) >= new Date()
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <div className="bg-teal-600 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Welcome, Dr. {profile?.full_name}!</h1>
            <p className="text-teal-100 text-lg">Manage your appointments and availability</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today&apos;s</p>
                    <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  </div>
                  <Clock className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {doctorData?.rating > 0 ? doctorData.rating.toFixed(1) : 'New'}
                    </p>
                  </div>
                  <Star className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fee</p>
                    <p className="text-3xl font-bold text-gray-900">₹{doctorData?.consultation_fee}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/doctor/profile">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/doctor/availability">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Availability
              </Button>
            </Link>
            <Link href={`/doctors/${user?.id}`}>
              <Button variant="outline" className="w-full">
                View Public Profile
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => {
                    const patientInitials = appointment.patient.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={appointment.patient.profile_photo_url || ''} />
                              <AvatarFallback className="bg-gray-200">{patientInitials}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.patient.full_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {appointment.patient.age && `${appointment.patient.age} years`}
                                    {appointment.patient.age && appointment.patient.gender && ' • '}
                                    {appointment.patient.gender}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>

                              <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{appointment.appointment_time}</span>
                                </div>
                                {appointment.patient.phone && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{appointment.patient.phone}</span>
                                  </div>
                                )}
                              </div>

                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mb-4 italic bg-gray-50 p-3 rounded">
                                  <span className="font-semibold">Patient notes:</span> {appointment.notes}
                                </p>
                              )}

                              {appointment.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={updatingAppointmentId === appointment.id}
                                  >
                                    {updatingAppointmentId === appointment.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Confirming...
                                      </>
                                    ) : (
                                      'Confirm'
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={updatingAppointmentId === appointment.id}
                                  >
                                    {updatingAppointmentId === appointment.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Declining...
                                      </>
                                    ) : (
                                      'Decline'
                                    )}
                                  </Button>
                                </div>
                              )}

                              {appointment.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  disabled={updatingAppointmentId === appointment.id}
                                >
                                  {updatingAppointmentId === appointment.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Mark as Completed'
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
