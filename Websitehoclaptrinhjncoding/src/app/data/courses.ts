export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseCategory = 'Frontend' | 'Backend' | 'Full Stack' | 'Mobile' | 'Data Science';

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export interface InstructorInfo {
  name: string;
  avatar: string;
  title: string;
  bio: string;
  specialties: string[];
  stats: { courses: number; students: number; rating: number; reviews: number };
  social?: { website?: string; github?: string; linkedin?: string };
}

export interface CourseCurriculumSection {
  section: string;
  lessons: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  instructor: string;
  instructorInfo?: InstructorInfo;
  duration: string;
  level: CourseLevel;
  category: CourseCategory;
  rating: number;
  students: number;
  lessons: number;
  features: string[];
  curriculum: CourseCurriculumSection[];
  reviews?: Review[];
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'React & TypeScript - Từ Cơ Bản Đến Chuyên Nghiệp',
    description:
      'Khóa học toàn diện về React và TypeScript, từ những kiến thức cơ bản đến các kỹ thuật nâng cao để xây dựng ứng dụng web hiện đại.',
    price: 1990000,
    originalPrice: 2990000,
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    instructor: 'Nguyễn Văn A',
    instructorInfo: {
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=12',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Nguyễn Văn A là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Ông đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['React', 'TypeScript', 'Redux', 'Testing'],
      stats: { courses: 5, students: 5000, rating: 4.8, reviews: 1000 },
      social: {
        website: 'https://nguyenvana.com',
        github: 'https://github.com/nguyenvana',
        linkedin: 'https://linkedin.com/in/nguyenvana',
      },
    },
    duration: '40 giờ',
    level: 'Intermediate',
    category: 'Frontend',
    rating: 4.8,
    students: 1234,
    lessons: 120,
    features: [
      'Học React Hooks và Context API',
      'TypeScript cho React',
      'State Management với Redux Toolkit',
      'Testing với Jest và React Testing Library',
      'Dự án thực tế hoàn chỉnh',
    ],
    curriculum: [
      {
        section: 'Giới thiệu và Cơ bản',
        lessons: ['Giới thiệu React', 'JSX và Components', 'Props và State', 'Event Handling'],
      },
      {
        section: 'React Hooks',
        lessons: ['useState Hook', 'useEffect Hook', 'useContext Hook', 'Custom Hooks'],
      },
      {
        section: 'TypeScript',
        lessons: ['TypeScript Basics', 'Types và Interfaces', 'Generics', 'Advanced Types'],
      },
    ],
    reviews: [
      {
        id: 'r1',
        userName: 'Trần Minh Tuấn',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        rating: 5,
        date: '2025-01-10',
        comment:
          'Khóa học rất chi tiết và dễ hiểu! Giảng viên giải thích rất kỹ, từng bước một. Sau khi hoàn thành khóa học tôi đã tự tin làm được dự án React cho công ty. Đáng tiền bỏ ra!',
        helpful: 124,
      },
      {
        id: 'r2',
        userName: 'Lê Thị Hương',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5,
        date: '2025-01-08',
        comment:
          'Mình là newbie hoàn toàn nhưng sau khóa học này đã hiểu rõ React và TypeScript. Phần bài tập thực hành rất hay, giúp mình nắm vững kiến thức. Recommend 100%!',
        helpful: 89,
      },
      {
        id: 'r3',
        userName: 'Nguyễn Đức Anh',
        userAvatar: 'https://i.pravatar.cc/150?img=33',
        rating: 4,
        date: '2025-01-05',
        comment:
          'Nội dung khóa học phong phú, cập nhật các kiến thức mới nhất. Tuy nhiên phần Redux Toolkit hơi nhanh, mình phải xem lại vài lần mới hiểu. Overall vẫn là khóa học tốt!',
        helpful: 56,
      },
      {
        id: 'r4',
        userName: 'Phạm Quốc Bảo',
        userAvatar: 'https://i.pravatar.cc/150?img=68',
        rating: 5,
        date: '2025-01-03',
        comment:
          'Best React course ever! Mình đã học qua nhiều khóa nhưng khóa này là chi tiết và thực tế nhất. Dự án cuối khóa rất hay, áp dụng được luôn vào công việc.',
        helpful: 102,
      },
      {
        id: 'r5',
        userName: 'Võ Thị Mai',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        rating: 5,
        date: '2024-12-28',
        comment:
          'Giảng viên nhiệt tình, support học viên rất tốt. Mỗi khi có thắc mắc đều được giải đáp nhanh chóng. Khóa học giúp mình chuyển từ Backend sang Frontend developer thành công!',
        helpful: 78,
      },
    ],
  },
  {
    id: '2',
    title: 'Node.js & Express - Xây Dựng REST API',
    description:
      'Học cách xây dựng backend mạnh mẽ với Node.js và Express, từ cơ bản đến triển khai production.',
    price: 1790000,
    originalPrice: 2590000,
    image:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    instructor: 'Trần Thị B',
    instructorInfo: {
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=5',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Trần Thị B là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Bà đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['Node.js', 'Express', 'MongoDB', 'RESTful API'],
      stats: { courses: 4, students: 4000, rating: 4.7, reviews: 800 },
      social: {
        website: 'https://tranthib.com',
        github: 'https://github.com/tranthib',
        linkedin: 'https://linkedin.com/in/tranthib',
      },
    },
    duration: '35 giờ',
    level: 'Intermediate',
    category: 'Backend',
    rating: 4.7,
    students: 987,
    lessons: 95,
    features: [
      'RESTful API Design',
      'Authentication & Authorization',
      'Database với MongoDB',
      'Error Handling và Validation',
      'Deployment và CI/CD',
    ],
    curriculum: [
      {
        section: 'Node.js Cơ Bản',
        lessons: ['Introduction to Node.js', 'NPM và Modules', 'Async Programming', 'File System'],
      },
      {
        section: 'Express Framework',
        lessons: ['Express Setup', 'Routing', 'Middleware', 'Error Handling'],
      },
    ],
  },
  {
    id: '3',
    title: 'Full Stack Developer - MERN Stack',
    description:
      'Trở thành Full Stack Developer với MERN Stack (MongoDB, Express, React, Node.js). Xây dựng ứng dụng web hoàn chỉnh từ A-Z.',
    price: 2990000,
    originalPrice: 4990000,
    image:
      'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop',
    instructor: 'Lê Văn C',
    instructorInfo: {
      name: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/150?img=33',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Lê Văn C là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Ông đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['MongoDB', 'Express', 'React', 'Node.js'],
      stats: { courses: 6, students: 6000, rating: 4.9, reviews: 1200 },
      social: {
        website: 'https://levanc.com',
        github: 'https://github.com/levanc',
        linkedin: 'https://linkedin.com/in/levanc',
      },
    },
    duration: '60 giờ',
    level: 'Advanced',
    category: 'Full Stack',
    rating: 4.9,
    students: 2156,
    lessons: 180,
    features: [
      'MERN Stack từ cơ bản đến nâng cao',
      'Authentication & Security',
      'Real-time với Socket.IO',
      'Cloud Deployment (AWS, Vercel)',
      '3 dự án thực tế hoàn chỉnh',
    ],
    curriculum: [
      {
        section: 'MongoDB & Mongoose',
        lessons: ['MongoDB Basics', 'Mongoose Models', 'Relationships', 'Aggregation'],
      },
      {
        section: 'Backend với Node & Express',
        lessons: ['REST API', 'JWT Authentication', 'File Upload', 'Real-time Features'],
      },
      {
        section: 'Frontend với React',
        lessons: ['React Setup', 'State Management', 'API Integration', 'Optimization'],
      },
    ],
  },
  {
    id: '4',
    title: 'Next.js 14 - Server Components & App Router',
    description:
      'Khám phá Next.js 14 với App Router và Server Components. Xây dựng ứng dụng web hiệu năng cao và SEO-friendly.',
    price: 2190000,
    originalPrice: 3190000,
    image:
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=450&fit=crop',
    instructor: 'Phạm Thị D',
    instructorInfo: {
      name: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/150?img=68',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Phạm Thị D là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Bà đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['Next.js', 'Server Components', 'App Router', 'SEO'],
      stats: { courses: 3, students: 3000, rating: 4.9, reviews: 600 },
      social: {
        website: 'https://phamthid.com',
        github: 'https://github.com/phamthid',
        linkedin: 'https://linkedin.com/in/phamthid',
      },
    },
    duration: '45 giờ',
    level: 'Advanced',
    category: 'Frontend',
    rating: 4.9,
    students: 1567,
    lessons: 135,
    features: [
      'Next.js 14 App Router',
      'Server Components và Server Actions',
      'Static và Dynamic Rendering',
      'SEO Optimization',
      'Deployment trên Vercel',
    ],
    curriculum: [
      {
        section: 'Next.js Fundamentals',
        lessons: ['App Router', 'Routing', 'Layouts', 'Data Fetching'],
      },
      {
        section: 'Server Components',
        lessons: ['Server vs Client Components', 'Server Actions', 'Streaming', 'Caching'],
      },
    ],
  },
  {
    id: '5',
    title: 'Python & Django - Web Development',
    description:
      'Học Python và Django framework để xây dựng các ứng dụng web mạnh mẽ và có khả năng mở rộng cao.',
    price: 1890000,
    originalPrice: 2790000,
    image:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    instructor: 'Hoàng Văn E',
    instructorInfo: {
      name: 'Hoàng Văn E',
      avatar: 'https://i.pravatar.cc/150?img=9',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Hoàng Văn E là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Ông đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['Python', 'Django', 'ORM', 'RESTful API'],
      stats: { courses: 5, students: 5000, rating: 4.6, reviews: 1000 },
      social: {
        website: 'https://hoangvane.com',
        github: 'https://github.com/hoangvane',
        linkedin: 'https://linkedin.com/in/hoangvane',
      },
    },
    duration: '38 giờ',
    level: 'Beginner',
    category: 'Backend',
    rating: 4.6,
    students: 892,
    lessons: 110,
    features: [
      'Python Programming từ cơ bản',
      'Django Framework',
      'ORM và Database',
      'Django REST Framework',
      'Authentication & Security',
    ],
    curriculum: [
      {
        section: 'Python Basics',
        lessons: ['Python Syntax', 'Data Types', 'Functions', 'OOP'],
      },
      {
        section: 'Django Framework',
        lessons: ['Django Setup', 'Models', 'Views', 'Templates', 'Forms'],
      },
    ],
  },
  {
    id: '6',
    title: 'React Native - Mobile App Development',
    description:
      'Xây dựng ứng dụng di động đa nền tảng với React Native. Một lần code, chạy trên cả iOS và Android.',
    price: 2290000,
    originalPrice: 3290000,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
    instructor: 'Vũ Thị F',
    instructorInfo: {
      name: 'Vũ Thị F',
      avatar: 'https://i.pravatar.cc/150?img=15',
      title: 'Giảng viên chuyên nghiệp',
      bio: 'Vũ Thị F là một chuyên gia phát triển phần mềm với hơn 10 năm kinh nghiệm. Bà đã giảng dạy và hướng dẫn hàng nghìn học viên trên toàn thế giới.',
      specialties: ['React Native', 'Navigation', 'State Management', 'Native Modules'],
      stats: { courses: 4, students: 4000, rating: 4.7, reviews: 800 },
      social: {
        website: 'https://vuthif.com',
        github: 'https://github.com/vuthif',
        linkedin: 'https://linkedin.com/in/vuthif',
      },
    },
    duration: '50 giờ',
    level: 'Intermediate',
    category: 'Mobile',
    rating: 4.7,
    students: 1345,
    lessons: 145,
    features: [
      'React Native Fundamentals',
      'Navigation với React Navigation',
      'State Management',
      'Native Modules',
      'Publish lên App Store & Play Store',
    ],
    curriculum: [
      {
        section: 'Getting Started',
        lessons: ['Setup Environment', 'Components', 'Styling', 'Layout'],
      },
      {
        section: 'Advanced Topics',
        lessons: ['Navigation', 'Async Storage', 'API Integration', 'Push Notifications'],
      },
    ],
  },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((course) => course.id === id);
}

export function getCoursesByCategory(category: string): Course[] {
  if (category === 'all') return courses;
  return courses.filter(
    (course) => course.category.toLowerCase() === category.toLowerCase()
  );
}
