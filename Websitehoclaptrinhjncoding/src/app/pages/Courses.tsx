import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, BookOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { courseApi, categoryApi, Course, type Pagination } from '@/app/lib/api';

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const PAGE_SIZE = 12;
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

function formatDuration(minutes?: number) {
  if (!minutes) return '0 giờ';
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.round(minutes / 60)} giờ`;
}

function formatLevel(level?: string) {
  if (!level) return '-';
  const map: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    'all-levels': 'Mọi cấp độ',
  };
  return map[level] || level;
}

export function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [suggestions, setSuggestions] = useState<{ _id: string; title: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      courseApi
        .autocomplete({ q: searchTerm.trim(), limit: 10 })
        .then((res) => setSuggestions(res.data || []))
        .catch(() => setSuggestions([]));
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSearchOrFilter = searchTerm.trim() || selectedCategory !== 'all' || selectedLevel !== 'all' || selectedPrice !== 'all';

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      limit: PAGE_SIZE,
      sortBy,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      level: selectedLevel !== 'all' ? selectedLevel : undefined,
      priceType: selectedPrice !== 'all' ? selectedPrice : undefined,
    };
    if (hasSearchOrFilter) {
      courseApi
        .search({ ...params, q: searchTerm.trim() || undefined })
        .then((res) => {
          setCourses(res.data.courses || []);
          setPagination(res.data.pagination || null);
        })
        .catch(() => {
          setCourses([]);
          setPagination(null);
        })
        .finally(() => setLoading(false));
    } else {
      courseApi
        .list({ page: params.page, limit: params.limit, sortBy })
        .then((res) => {
          setCourses(res.data.courses || []);
          setPagination(res.data.pagination || null);
        })
        .catch(() => {
          setCourses([]);
          setPagination(null);
        })
        .finally(() => setLoading(false));
    }
  }, [page, searchTerm, selectedCategory, selectedLevel, selectedPrice, sortBy, hasSearchOrFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedLevel, selectedPrice, sortBy]);

  const totalPages = pagination?.totalPages ?? (pagination?.total ? Math.ceil(pagination.total / (pagination.limit || PAGE_SIZE)) : 1);
  const total = pagination?.total ?? 0;

  return (
    <div className="min-h-screen py-12 bg-background relative overflow-hidden">
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
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto" ref={autocompleteRef}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {suggestions.map((s) => (
                    <li key={s._id}>
                      <button
                        onClick={() => {
                          setSearchTerm(s.title);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-primary" />
                        <span className="font-medium">{s.title}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 items-center justify-center">
            {/* Category Filter */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Danh mục:</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:border-primary/50'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === cat._id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Level + Price + Sort */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Level Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Cấp độ:</span>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedLevel === level
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:border-primary/50'
                      }`}
                    >
                      {level === 'all' ? 'Tất cả' : formatLevel(level)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Sort (giữ logic cũ, nhưng UI gọn hơn) */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Giá:</span>
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value as any)}
                    className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="all">Tất cả</option>
                    <option value="free">Miễn phí</option>
                    <option value="paid">Trả phí</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến</option>
                    <option value="price">Giá</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Info */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6 flex flex-wrap gap-4 justify-between items-center"
          >
            <p className="text-muted-foreground">
              Tìm thấy <span className="text-primary font-semibold">{total}</span> khóa học
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 border border-border rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border border-border rounded-lg disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">
              Đang tải danh sách khoá học...
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ y: -8 }}
                className="flex flex-col h-full"
              >
                <Link
                  to={`/courses/${course._id}`}
                  className="group block bg-card border border-border hover:border-primary/50 rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:shadow-primary/10 h-full"
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {formatLevel(course.level)}
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm text-white rounded-lg text-sm flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(course.totalDuration)}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-primary font-medium">
                        {course.categoryId?.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {course.averageRating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                      {course.title}
                    </h3>

                    <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description ||
                        'Khoá học thực chiến giúp bạn nâng cao kỹ năng lập trình qua các dự án.'}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.totalLessons || 0} bài</span>
                      </div>
                      <span>•</span>
                      <span>{course.enrollmentCount ?? 0} học viên</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-muted-foreground text-sm line-clamp-1">
                        {course.instructorId?.fullName}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {course.price === 0
                            ? 'Miễn phí'
                            : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  to={`/courses/${course._id}`}
                  className="mt-3 w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all font-semibold text-center block btn-shine border-2 border-blue-500/20 hover:scale-[1.02] active:scale-95"
                >
                  Xem chi tiết
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
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
                setSelectedPrice('all');
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