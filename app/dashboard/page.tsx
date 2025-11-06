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
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type AppointmentWithDoctor = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  doctor: {
    id: string;
    specialization: string;
    consultation_fee: number;
    clinic_location: string;
    profile: {
      full_name: string;
      profile_photo_url: string | null;
    };
  };
};

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else {
        fetchAppointments();
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { getAppointmentsAction } = await import('@/lib/actions');
      const result = await getAppointmentsAction();

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

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { updateAppointmentStatusAction } = await import('@/lib/actions');
      const result = await updateAppointmentStatusAction(appointmentId, 'cancelled');

      if (result.error) {
        toast.error('Failed to cancel appointment');
      } else {
        toast.success('Appointment cancelled');
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Failed to cancel appointment');
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

  const upcomingAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.appointment_date) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'completed' || new Date(a.appointment_date) < new Date()
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
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
            <p className="text-teal-100 text-lg">Manage your appointments and health records</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {appointments.filter((a) => a.status === 'completed').length}
                    </p>
                  </div>
                  <Clock className="h-12 w-12 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Link href="/doctors">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                  <Link href="/doctors">
                    <Button className="bg-teal-600 hover:bg-teal-700">Find Doctors</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => {
                    const doctorInitials = appointment.doctor.profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={appointment.doctor.profile.profile_photo_url || ''} />
                              <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                                {doctorInitials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Dr. {appointment.doctor.profile.full_name}
                                  </h3>
                                  <p className="text-sm text-teal-600">{appointment.doctor.specialization}</p>
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
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{appointment.doctor.clinic_location}</span>
                                </div>
                              </div>

                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mb-4 italic">Note: {appointment.notes}</p>
                              )}

                              <div className="flex gap-2">
                                <Link href={`/doctors/${appointment.doctor.id}`}>
                                  <Button variant="outline" size="sm">
                                    View Doctor
                                  </Button>
                                </Link>
                                {appointment.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
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

          {pastAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastAppointments.slice(0, 5).map((appointment) => {
                    const doctorInitials = appointment.doctor.profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={appointment.doctor.profile.profile_photo_url || ''} />
                            <AvatarFallback className="bg-gray-200">{doctorInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Dr. {appointment.doctor.profile.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                              {appointment.appointment_time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
