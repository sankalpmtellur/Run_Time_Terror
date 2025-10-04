export interface Project {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  lastCommit: string;
  openIssues: number;
  goodFirstIssues: number;
  communityScore: number;
  url: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'react-beautiful-dnd',
    description: 'Beautiful and accessible drag and drop for lists with React',
    stars: 29500,
    forks: 2400,
    language: 'JavaScript',
    topics: ['react', 'drag-and-drop', 'accessibility', 'ui'],
    lastCommit: '2 days ago',
    openIssues: 45,
    goodFirstIssues: 8,
    communityScore: 92,
    url: 'https://github.com/atlassian/react-beautiful-dnd'
  },
  {
    id: '2',
    name: 'zustand',
    description: 'A small, fast and scalable bearbones state-management solution',
    stars: 38000,
    forks: 1200,
    language: 'TypeScript',
    topics: ['react', 'state-management', 'hooks', 'typescript'],
    lastCommit: '5 hours ago',
    openIssues: 12,
    goodFirstIssues: 3,
    communityScore: 95,
    url: 'https://github.com/pmndrs/zustand'
  },
  {
    id: '3',
    name: 'fastapi',
    description: 'FastAPI framework, high performance, easy to learn, fast to code',
    stars: 67000,
    forks: 5600,
    language: 'Python',
    topics: ['python', 'api', 'async', 'web-framework'],
    lastCommit: '1 day ago',
    openIssues: 234,
    goodFirstIssues: 15,
    communityScore: 88,
    url: 'https://github.com/tiangolo/fastapi'
  },
  {
    id: '4',
    name: 'gitui',
    description: 'Blazing fast terminal-ui for git written in rust',
    stars: 15200,
    forks: 480,
    language: 'Rust',
    topics: ['rust', 'git', 'terminal', 'tui'],
    lastCommit: '3 days ago',
    openIssues: 67,
    goodFirstIssues: 12,
    communityScore: 90,
    url: 'https://github.com/extrawurst/gitui'
  },
  {
    id: '5',
    name: 'tauri',
    description: 'Build smaller, faster, and more secure desktop applications',
    stars: 72000,
    forks: 2100,
    language: 'Rust',
    topics: ['rust', 'desktop', 'electron-alternative', 'webview'],
    lastCommit: '6 hours ago',
    openIssues: 156,
    goodFirstIssues: 22,
    communityScore: 94,
    url: 'https://github.com/tauri-apps/tauri'
  },
  {
    id: '6',
    name: 'charts',
    description: 'Beautiful charts for iOS/tvOS/OSX',
    stars: 27000,
    forks: 5900,
    language: 'Swift',
    topics: ['ios', 'swift', 'charts', 'visualization'],
    lastCommit: '1 week ago',
    openIssues: 89,
    goodFirstIssues: 5,
    communityScore: 85,
    url: 'https://github.com/danielgindi/Charts'
  },
  {
    id: '7',
    name: 'deno',
    description: 'A modern runtime for JavaScript and TypeScript',
    stars: 91000,
    forks: 5000,
    language: 'Rust',
    topics: ['rust', 'javascript', 'typescript', 'runtime'],
    lastCommit: '4 hours ago',
    openIssues: 312,
    goodFirstIssues: 18,
    communityScore: 91,
    url: 'https://github.com/denoland/deno'
  },
  {
    id: '8',
    name: 'vite',
    description: 'Next generation frontend tooling. It\'s fast!',
    stars: 62000,
    forks: 5500,
    language: 'TypeScript',
    topics: ['typescript', 'build-tool', 'frontend', 'vite'],
    lastCommit: '8 hours ago',
    openIssues: 245,
    goodFirstIssues: 14,
    communityScore: 93,
    url: 'https://github.com/vitejs/vite'
  },
  {
    id: '9',
    name: 'shadcn-ui',
    description: 'Beautifully designed components built with Radix UI and Tailwind',
    stars: 45000,
    forks: 2800,
    language: 'TypeScript',
    topics: ['react', 'tailwind', 'components', 'ui'],
    lastCommit: '1 day ago',
    openIssues: 78,
    goodFirstIssues: 9,
    communityScore: 96,
    url: 'https://github.com/shadcn-ui/ui'
  },
  {
    id: '10',
    name: 'astro',
    description: 'The web framework for content-driven websites',
    stars: 39000,
    forks: 2000,
    language: 'TypeScript',
    topics: ['typescript', 'static-site', 'framework', 'web'],
    lastCommit: '12 hours ago',
    openIssues: 134,
    goodFirstIssues: 11,
    communityScore: 89,
    url: 'https://github.com/withastro/astro'
  },
  {
    id: '11',
    name: 'tokio',
    description: 'A runtime for writing reliable asynchronous applications with Rust',
    stars: 23000,
    forks: 2100,
    language: 'Rust',
    topics: ['rust', 'async', 'runtime', 'networking'],
    lastCommit: '2 days ago',
    openIssues: 167,
    goodFirstIssues: 20,
    communityScore: 87,
    url: 'https://github.com/tokio-rs/tokio'
  },
  {
    id: '12',
    name: 'htmx',
    description: 'High power tools for HTML',
    stars: 28000,
    forks: 950,
    language: 'JavaScript',
    topics: ['javascript', 'html', 'hypermedia', 'ajax'],
    lastCommit: '3 days ago',
    openIssues: 34,
    goodFirstIssues: 6,
    communityScore: 90,
    url: 'https://github.com/bigskysoftware/htmx'
  }
];
