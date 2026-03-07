import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Star, Clock, BookOpen } from 'lucide-react';
import { courses, Course } from '@/app/data/courses';

const categories = ['all', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Data Science'];
const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

export function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen py-12">
      {/* Gradient Background Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Khám Phá <span className="text-primary">Khóa Học</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tìm khóa học phù hợp với mục tiêu học tập của bạn
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Danh mục:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {category === 'all' ? 'Tất cả' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Cấp độ:</span>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedLevel === level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {level === 'all' ? 'Tất cả' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6"
        >
          <p className="text-muted-foreground">
            Tìm thấy <span className="text-primary font-semibold">{filteredCourses.length}</span> khóa học
          </p>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -8 }}
            >
              <Link
                to={`/courses/${course.id}`}
                className="group block bg-card border border-border hover:border-primary/50 rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:shadow-primary/10 h-full"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {course.level}
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm text-white rounded-lg text-sm flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-primary font-medium">{course.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons} bài</span>
                    </div>
                    <span>•</span>
                    <span>{course.students} học viên</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-muted-foreground text-sm">
                      {course.instructor}
                    </div>
                    <div className="text-right">
                      {course.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {course.originalPrice.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                      <div className="text-lg font-bold text-primary">
                        {course.price.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to={`/courses/${course.id}`}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold text-center block btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
              >
                Xem chi tiết
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Không tìm thấy khóa học</h3>
            <p className="text-muted-foreground mb-6">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}