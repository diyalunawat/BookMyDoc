'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DoctorCard } from '@/components/doctor-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import type { DoctorWithProfile } from '@/lib/types';

function DoctorsContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'all');
  const [city, setCity] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchQuery, specialization, city, sortBy]);

  const fetchDoctors = async () => {
    try {
      const { getDoctorsAction } = await import('@/lib/actions');
      const result = await getDoctorsAction();

      if (result.error) {
        console.error('Error fetching doctors:', result.error);
      } else if (result.doctors) {
        setDoctors(result.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.profile.full_name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.city.toLowerCase().includes(query)
      );
    }

    if (specialization !== 'all') {
      filtered = filtered.filter((doctor) => doctor.specialization === specialization);
    }

    if (city !== 'all') {
      filtered = filtered.filter((doctor) => doctor.city === city);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee-low') return a.consultation_fee - b.consultation_fee;
      if (sortBy === 'fee-high') return b.consultation_fee - a.consultation_fee;
      if (sortBy === 'experience') return b.experience_years - a.experience_years;
      return 0;
    });

    setFilteredDoctors(filtered);
  };

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));
  const cities = Array.from(new Set(doctors.map((d) => d.city)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <div className="bg-teal-600 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Find Your Doctor</h1>
            <p className="text-teal-100 text-lg">Browse our network of qualified healthcare professionals</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                  <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
              </p>
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
