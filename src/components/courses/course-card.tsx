'use client';

import { Calendar, MapPin, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  coverImage: string;
  date: string;
  location: 'online' | 'offline';
  status: 'upcoming' | 'live' | 'ended';
  recordingUrl?: string;
  registrationUrl?: string;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations('Courses');

  const getStatusBadge = () => {
    switch (course.status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-red-500 px-3 py-1 text-xs font-bold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {t('card.status.live')}
          </span>
        );
      case 'upcoming':
        return (
          <span className="rounded-full border-2 border-black bg-blue-500 px-3 py-1 text-xs font-bold text-white">
            {t('card.status.upcoming')}
          </span>
        );
      case 'ended':
        return (
          <span className="rounded-full border-2 border-black bg-gray-500 px-3 py-1 text-xs font-bold text-white">
            {t('card.status.ended')}
          </span>
        );
    }
  };

  const getActionButton = () => {
    if (course.status === 'ended' && course.recordingUrl) {
      return (
        <Link
          href={course.recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg border-4 border-black bg-purple-500 px-6 py-3 text-center font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          {t('card.actions.watchRecording')}
        </Link>
      );
    }

    if (course.status === 'live' || course.status === 'upcoming') {
      return (
        <Link
          href={course.registrationUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg border-4 border-black bg-blue-500 px-6 py-3 text-center font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          {t('card.actions.register')}
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="group overflow-hidden rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none dark:bg-gray-800">
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden border-b-4 border-black">
        <Image
          src={course.coverImage}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-4 top-4">{getStatusBadge()}</div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-black">
            <Image
              src={course.instructor.avatar}
              alt={course.instructor.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {course.instructor.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {course.instructor.title}
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mb-4 space-y-2 border-t-2 border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{course.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>
              {course.location === 'online'
                ? t('card.location.online')
                : t('card.location.offline')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {getActionButton()}
      </div>
    </div>
  );
}
