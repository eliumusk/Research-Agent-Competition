import { Card } from '@/components/ui/card';
import { Favicon } from 'favicon-stealer';
import type * as React from 'react';
import { HeaderSection } from '../layout/header-section';

const friends = [
  {
    title: 'Miantiao',
    description: 'Open Source Enthusiast & Founder of sink.cool',
    link: 'https://miantiao.me/',
    image: '/images/friends/miantiao.jpg',
  },
  {
    title: 'Corey Chiu',
    description: 'Indie Hacker & Founder of aibest.tools',
    link: 'https://coreychiu.com/',
    image: '/images/friends/corey.jpg',
  },
  {
    title: 'liruifengv',
    description: 'Astro Maintainer & Founder of astro-cn.com',
    link: 'https://liruifengv.com/',
    image: '/images/friends/liruifengv.jpg',
  },
  {
    title: 'Weijun',
    description: 'Indie Hacker & Founder of nextjscn.org',
    link: 'https://weijun.com/',
    image: '/images/friends/weijun.jpg',
  },
  {
    title: 'Justin',
    description: 'Indie Hacker & Founder of template0.com',
    link: 'https://justin3go.com/',
    image: '/images/friends/justin.jpg',
  },
  {
    title: 'Tony Wu',
    description: 'Indie Hacker & Founder of mycareerhelp.ai',
    link: 'https://tonywu.ai/',
    image: '/images/friends/tony.jpg',
  },
];

export default function FriendsSection() {
  return (
    <section id="friends" className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <HeaderSection title="Friends" subtitle="The Best Friends I've Made" />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((project) => (
            <FriendCard
              key={project.title}
              link={project.link}
              title={project.title}
              description={project.description}
              image={project.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const FriendCard = ({
  title,
  description,
  image,
  link = '#',
}: {
  title: string;
  description: string;
  image: string;
  link?: string;
}) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Card className="p-6 group cursor-pointer transition-all duration-300 ease-in-out hover:scale-105">
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-start gap-4">
            <div className="*:size-10">
              <img src={image} alt={title} className="rounded-full" />
            </div>
            <h3 className="text-base font-medium">{title}</h3>
          </div>

          <div className="space-y-2 pt-3">
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </a>
  );
};
