'use client';

import { useTranslations } from 'next-intl';
import CourseCard, { type Course } from './course-card';

// Mock data - replace with real data later
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Agent 开发入门：从零到一',
    description:
      '面向无编程经验的参赛者，学习 AI Agent 的基本概念和开发流程，掌握使用低代码工具快速构建 Agent 的方法。',
    instructor: {
      name: '张教授',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
      title: 'AI 研究员',
    },
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    date: '2025-11-15 14:00',
    location: 'online',
    status: 'upcoming',
    registrationUrl: '#',
  },
  {
    id: '2',
    title: '产品思维与用户需求挖掘',
    description:
      '学习如何从用户角度思考问题，掌握需求调研方法，了解如何将科研成果转化为实用产品。',
    instructor: {
      name: '李经理',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
      title: '产品总监',
    },
    coverImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
    date: '2025-11-20 19:00',
    location: 'online',
    status: 'live',
    registrationUrl: '#',
  },
  {
    id: '3',
    title: 'AI4Science 前沿技术解析',
    description:
      '深入了解 AI 在科学研究中的应用，包括分子动力学模拟、药物发现、材料设计等领域的最新进展。',
    instructor: {
      name: '王博士',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
      title: '深势科技研究员',
    },
    coverImage:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    date: '2025-10-28 15:00',
    location: 'offline',
    status: 'ended',
    recordingUrl: '#',
  },
  {
    id: '4',
    title: 'LangChain 实战：构建智能对话系统',
    description:
      '学习使用 LangChain 框架构建复杂的 AI Agent，掌握 RAG、Function Calling 等核心技术。',
    instructor: {
      name: '陈工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
      title: '全栈开发工程师',
    },
    coverImage:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
    date: '2025-11-25 14:00',
    location: 'online',
    status: 'upcoming',
    registrationUrl: '#',
  },
  {
    id: '5',
    title: '科研 Agent 设计模式与最佳实践',
    description:
      '分享科研领域 Agent 的设计模式，包括实验设计、数据分析、文献检索等场景的实战案例。',
    instructor: {
      name: '刘研究员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
      title: '计算化学专家',
    },
    coverImage:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=450&fit=crop',
    date: '2025-11-30 16:00',
    location: 'online',
    status: 'upcoming',
    registrationUrl: '#',
  },
  {
    id: '6',
    title: '比赛项目答疑与经验分享',
    description:
      '往届获奖选手分享参赛经验，解答常见问题，提供项目开发建议和技巧。',
    instructor: {
      name: '赵同学',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
      title: '2024 年一等奖获得者',
    },
    coverImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop',
    date: '2025-10-20 20:00',
    location: 'online',
    status: 'ended',
    recordingUrl: '#',
  },
];

export default function CoursesSection() {
  const t = useTranslations('Courses');

  return (
    <section className="border-b-4 border-black bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">
            {t('courses.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('courses.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
