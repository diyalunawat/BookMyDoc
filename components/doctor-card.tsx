import { Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorWithProfile } from '@/lib/types';

type DoctorCardProps = {
  doctor: DoctorWithProfile;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const initials = doctor.profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={doctor.profile.profile_photo_url || ''} alt={doctor.profile.full_name} />
            <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              Dr. {doctor.profile.full_name}
            </h3>
            <p className="text-sm text-teal-600 font-medium">{doctor.specialization}</p>
            <p className="text-xs text-gray-500 mt-1">{doctor.qualification}</p>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{doctor.experience_years} years</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{doctor.city}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                  </span>
                </div>
                {doctor.total_ratings > 0 && (
                  <span className="text-xs text-gray-500">({doctor.total_ratings} reviews)</span>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="text-lg font-bold text-gray-900">₹{doctor.consultation_fee}</p>
              </div>
            </div>

            <Link href={`/doctors/${doctor.id}`} className="block mt-4">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                View Profile & Book
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
