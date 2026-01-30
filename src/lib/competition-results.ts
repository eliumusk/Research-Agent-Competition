export type Finalist = {
  name: string;
  score: number;
};

export type TrackAwards = {
  gold: string[];
  silver: string[];
  bronze: string[];
};

export type TrackResults = {
  key: 'general' | 'vertical';
  name: string;
  finalists: Finalist[];
  awards: TrackAwards;
};

export type CompetitionResults = {
  publishedAt: string;
  tracks: TrackResults[];
  excellenceAwards: string[];
};

export const competitionResults: CompetitionResults = {
  publishedAt: '2026.01.30',
  tracks: [
    {
      key: 'general',
      name: '通用赛道',
      finalists: [
        { name: 'AITHENA-全流程论文助手', score: 90.9 },
        { name: '投刊管家papergo', score: 90.6 },
        { name: 'Xyzen-AI4S智能体工作空间', score: 90.1 },
        { name: '文献星图', score: 89.6 },
        { name: 'Figsci', score: 89.4 },
        { name: '颢穹', score: 87.4 },
        { name: '实验室视觉日志', score: 86.5 },
        { name: 'paper2any', score: 86.5 },
        { name: '投稿期刊推荐智能体', score: 86.5 },
        { name: '科研润色助手', score: 84.1 },
        { name: 'paper2code', score: 83.4 },
        { name: 'AI公式助手', score: 82.6 },
        { name: '智能科研价值定位Agent', score: 81.1 },
        { name: 'ArxivScout', score: 80.5 },
      ],
      awards: {
        gold: ['AITHENA-全流程论文助手'],
        silver: ['Xyzen-AI4S 智能体工作空间', '投刊管家papergo'],
        bronze: ['文献星图', 'Figsci', '颢穹'],
      },
    },
    {
      key: 'vertical',
      name: '垂类赛道',
      finalists: [
        { name: 'NexusNMR', score: 89.3 },
        { name: 'JAX-FEM Express', score: 86.1 },
        { name: 'LaMol', score: 86.1 },
        { name: 'Gaussian软件智能助理', score: 85.3 },
        { name: 'S1-MatAgent', score: 85.2 },
        { name: 'Agora Minds', score: 85.2 },
        { name: 'ResearchMind', score: 84.9 },
        { name: '“乐”生物医学科研智能体', score: 84.3 },
        { name: 'EasyStat', score: 83.6 },
        { name: 'MolPilot', score: 81.8 },
        { name: 'FlowMaster', score: 81.0 },
        { name: 'pdemaster', score: 80.9 },
        { name: 'x-astra', score: 80.8 },
        { name: 'NeuroFlow AI', score: 77.4 },
        { name: 'deepmd-jupyter-ai智能笔记本', score: 75.4 },
      ],
      awards: {
        gold: ['NexusNMR'],
        silver: ['JAX-FEM Express', 'LaMol'],
        bronze: ['Gaussian软件智能助理', 'S1-MatAgent', 'Agora Minds'],
      },
    },
  ],
  excellenceAwards: [
    '实验室视觉日志',
    'paper2any',
    'ResearchMind',
    '“乐”生物医学科研智能体',
    'EasySTAT',
    'MolPilot',
    'FlowMaster',
    'PDEMaster',
  ],
};
