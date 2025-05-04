import { Card } from '@/components/ui/card';
import type * as React from 'react';
import { HeaderSection } from '../layout/header-section';

const projects = [
  {
    title: 'MkSaaS',
    description: 'Make your AI SaaS Product in a Weekend',
    link: 'https://mksaas.com/',
    image: '/images/logos/mksaas.png',
  },
  {
    title: 'Mkdirs',
    description: 'The Best Directory Boilerplate with AI',
    link: 'https://mkdirs.com/',
    image: '/images/logos/mkdirs.png',
  },
  {
    title: 'IndieHub',
    description: 'The Best Directory for Indie Hackers',
    link: 'https://indiehub.best/',
    image: '/images/logos/indiehub.png',
  },
  {
    title: 'Haitang',
    description: 'Learn Chinese Ancient Poetries Online',
    link: 'https://haitang.app/',
    image: '/images/logos/haitang.png',
  },
  {
    title: 'Boilerplate Hunt',
    description: 'Find the Best Boilerplates to Ship Faster',
    link: 'https://boilerplatehunt.com/',
    image: '/images/logos/boilerplatehunt.png',
  },
  {
    title: 'OG Generator',
    description: 'Generate Open Graph images for free',
    link: 'https://og.indiehub.best/',
    image: '/images/logos/og.png',
  },
];

export default function HomeProjectsSection() {
  return (
    <section id="projects" className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <HeaderSection
          title="Projects"
          subtitle="What I've done and what I'm doing"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
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

const ProjectCard = ({
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
              <img src={image} alt={title} className="rounded-lg" />
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
