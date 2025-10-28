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
      name: '武老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
      title: 'AI 研究员',
    },
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    date: '待定',
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
      name: '李老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
      title: '产品总监',
    },
    coverImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
    date: '待定',
    location: 'online',
    status: 'upcoming',
    registrationUrl: '#',
  },
  {
    id: '3',
    title: 'AI4Science 前沿技术解析',
    description:
      '深入了解 AI 在科学研究中的应用，包括分子动力学模拟、药物发现、材料设计等领域的最新进展。',
    instructor: {
      name: '姚老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
      title: '深势科技研究员',
    },
    coverImage:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    date: '待定',
    location: 'offline',
    status: 'upcoming',
    recordingUrl: '#',
  },
  {
    id: '4',
    title: 'SciMaster 讲解：构建科研智能体',
    description:
      '如何工程化 Agent 上线，带你了解真实的部署过程',
    instructor: {
      name: '陈老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
      title: '全栈开发工程师',
    },
    coverImage:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
    date: '待定',
    location: 'online',
    status: 'upcoming',
    registrationUrl: '#',
  },
  {
    id: '5',
    title: 'X-Masters 设计模式与最佳实践',
    description:
      '分享科研领域 Agent 的设计模式，包括实验设计、数据分析、文献检索等场景的实战案例。',
    instructor: {
      name: '刘老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
      title: '上海交大同学',
    },
    coverImage:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=450&fit=crop',
    date: '待定',
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
      name: '乔同学',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
      title: '第一赛段优秀作品获得者',
    },
    coverImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop',
    date: '待定',
    location: 'online',
    status: 'upcoming',
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
