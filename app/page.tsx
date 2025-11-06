'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Calendar,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Stethoscope,
  Clock,
  Shield,
} from 'lucide-react';

const specialties = [
  { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-600' },
  { name: 'Neurology', icon: Brain, color: 'bg-purple-100 text-purple-600' },
  { name: 'Orthopedics', icon: Bone, color: 'bg-blue-100 text-blue-600' },
  { name: 'Pediatrics', icon: Baby, color: 'bg-pink-100 text-pink-600' },
  { name: 'Ophthalmology', icon: Eye, color: 'bg-teal-100 text-teal-600' },
  { name: 'General', icon: Stethoscope, color: 'bg-green-100 text-green-600' },
];

const features = [
  {
    icon: Search,
    title: 'Find Best Doctors',
    description: 'Search from our extensive database of qualified healthcare professionals',
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book appointments instantly with real-time availability',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data is protected with enterprise-grade security',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our support team is always here to help you',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-teal-50 via-blue-50 to-white px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Health,
              <span className="text-teal-600"> Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Book appointments with trusted doctors in just a few clicks. Quality healthcare made accessible.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white rounded-lg shadow-lg p-2">
                <Input
                  type="text"
                  placeholder="Search by doctor name, specialization, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16">
            {specialties.map((specialty) => (
              <Link key={specialty.name} href={`/doctors?specialization=${specialty.name}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`${specialty.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <specialty.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{specialty.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Book My Doc?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make healthcare accessible, reliable, and convenient for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-teal-600 transition-colors">
                <CardContent className="p-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to book your appointment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Doctor</h3>
              <p className="text-gray-600">
                Search by name, specialization, or location to find the right doctor
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Time Slot</h3>
              <p className="text-gray-600">
                Select from available time slots that fit your schedule
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Booking</h3>
              <p className="text-gray-600">
                Get instant confirmation and reminders for your appointment
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of patients who trust Book My Doc for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 text-lg">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/doctors">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-teal-700 px-8 text-lg">
                Browse Doctors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
