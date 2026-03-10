import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, BookOpen, Loader2, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
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
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            KHÁM PHÁ <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">KHOÁ HỌC</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nâng tầm kỹ năng với lộ trình học bài bản và thực chiến.
          </p>
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          <div className="relative max-w-2xl mx-auto" ref={autocompleteRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Bạn muốn học gì hôm nay?..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full pl-12 pr-4 py-4 bg-card/50 backdrop-blur-md border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-xl shadow-black/5"
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

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 justify-center items-center bg-card/30 p-4 rounded-2xl border border-border backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấp độ:</span>
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l === 'all' ? 'Tất cả' : formatLevel(l)}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Giá:</span>
              <select 
                value={selectedPrice} 
                onChange={(e) => setSelectedPrice(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="all">Tất cả</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Trả phí</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sắp xếp:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="price">Giá</option>
              </select>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary'}`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat._id ? 'bg-primary text-white' : 'bg-card border border-border hover:border-primary'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-8 flex justify-between items-center">
            <p className="text-muted-foreground">
              Tìm thấy <span className="text-foreground font-bold">{total}</span> khoá học
            </p>
            {totalPages > 1 && (
               <div className="flex items-center gap-4">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-border rounded-lg disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
                  <span className="text-sm font-bold">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border border-border rounded-lg disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button>
               </div>
            )}
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Đang tải danh sách khoá học...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col h-full relative"
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Link 
                        to={`/courses/${course._id}`} 
                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                     >
                        <PlayCircle className="w-5 h-5" /> Chi tiết
                     </Link>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-black text-[10px] font-black uppercase rounded-full">
                      {formatLevel(course.level)}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase">{course.categoryId?.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-bold">{course.averageRating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </div>

                  <Link to={`/courses/${course._id}`}>
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors h-14">
                      {course.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(course.totalDuration)}</div>
                    <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.totalLessons || 0} bài</div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground line-clamp-1">{course.instructorId?.fullName}</span>
                    <span className="text-lg font-black text-primary">
                      {course.price === 0 ? 'Miễn phí' : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold">Không tìm thấy khoá học nào</h3>
            <p className="text-muted-foreground mt-2">Hãy thử thay đổi từ khoá hoặc bộ lọc của bạn.</p>
            <button 
               onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
               className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold"
            >
               Xoá tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}