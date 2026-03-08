import { motion } from 'motion/react';
import { Target, Users, Award, TrendingUp, Heart, Zap } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Target,
      title: 'Sứ mệnh',
      description: 'Làm cho lập trình trở nên dễ tiếp cận với mọi người, bất kể xuất phát điểm'
    },
    {
      icon: Heart,
      title: 'Tận tâm',
      description: 'Cam kết mang đến trải nghiệm học tập tốt nhất cho từng học viên'
    },
    {
      icon: Zap,
      title: 'Đổi mới',
      description: 'Không ngừng cập nhật công nghệ và phương pháp giảng dạy mới nhất'
    }
  ];

  const stats = [
    { label: 'Học viên', value: '10,000+' },
    { label: 'Khóa học', value: '50+' },
    { label: 'Giảng viên', value: '20+' },
    { label: 'Đánh giá', value: '4.9/5' }
  ];

  const team = [
    { name: 'Nguyễn Văn A', role: 'CEO & Founder', image: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff&size=200' },
    { name: 'Trần Thị B', role: 'CTO', image: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=8b5cf6&color=fff&size=200' },
    { name: 'Lê Văn C', role: 'Head of Education', image: 'https://ui-avatars.com/api/?name=Le+Van+C&background=06b6d4&color=fff&size=200' },
    { name: 'Phạm Thị D', role: 'Marketing Director', image: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=10b981&color=fff&size=200' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Về <span className="text-primary">Jncoding</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Chúng tôi tin rằng ai cũng có thể học lập trình. Sứ mệnh của chúng tôi là 
              làm cho giáo dục công nghệ trở nên dễ tiếp cận, chất lượng cao và thú vị.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Jncoding được thành lập vào năm 2020 với mục tiêu đơn giản: làm cho việc học 
                  lập trình trở nên dễ dàng và thú vị hơn cho mọi người.
                </p>
                <p>
                  Chúng tôi bắt đầu với chỉ 5 khóa học và một nhóm nhỏ các giảng viên nhiệt huyết. 
                  Ngày nay, chúng tôi tự hào phục vụ hơn 10,000 học viên với hơn 50 khóa học 
                  chất lượng cao.
                </p>
                <p>
                  Sự thành công của chúng tôi đến từ việc luôn đặt học viên lên hàng đầu. Mỗi khóa học 
                  được thiết kế cẩn thận, từ nội dung đến cách trình bày, để đảm bảo bạn có được 
                  trải nghiệm học tập tốt nhất.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những con người tài năng đứng sau Jncoding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="relative mb-4 group">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-primary/20 group-hover:border-primary/50 transition-all"
                  />
                </div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tham gia hành trình cùng chúng tôi
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Bắt đầu học lập trình ngay hôm nay và trở thành một phần của cộng đồng Jncoding
            </p>
            <a
              href="/courses"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Khám phá khóa học
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
