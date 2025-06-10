# -*- coding: utf-8 -*-
from datetime import date, timedelta

# ... 脚本的其余部分 ...
import random
from datetime import date, timedelta

def generate_random_isbn():
    """生成一个简单的随机 ISBN 格式字符串"""
    return f"{random.randint(978, 979)}-{random.randint(1, 9)}-{random.randint(1000, 9999)}-{random.randint(100, 999)}-{random.randint(0, 9)}"

def generate_random_date(start_year=2000, end_year=2023):
    """生成一个随机日期字符串"""
    start_date = date(start_year, 1, 1)
    end_date = date(end_year, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    return random_date.strftime("%Y-%m-%d")

titles_by_category = {
    "编程": [
        "Python编程从入门到实践", "JavaScript高级程序设计", "Go语言圣经",
        "Rust编程之道", "C++ Primer Plus", "算法导论", "数据结构与算法分析",
        "深入理解计算机系统", "代码大全", "重构：改善既有代码的设计",
        "Head First Java", "Effective C++", "Clean Code", "设计模式",
        "Web开发实战", "机器学习实战", "深度学习入门", "人工智能原理",
        "网络安全基础", "操作系统精髓与设计原理"
    ],
    "框架": [
        "Spring实战", "Spring Boot揭秘", "MyBatis从入门到精通",
        "Vue.js权威指南", "React实战", "Angular开发实战",
        "Django Web开发", "Flask Web开发", "Laravel入门与实践",
        "ASP.NET Core开发"
    ],
    "数据库": [
        "MySQL必知必会", "SQL必知必会", "PostgreSQL权威指南",
        "MongoDB权威指南", "Redis设计与实现", "数据库系统概论",
        "Oracle数据库管理", "SQL Server从入门到精通"
    ],
    "前端": [
        "HTML5与CSS3权威指南", "JavaScript DOM编程艺术", "CSS揭秘",
        "现代JavaScript教程", "前端工程化", "响应式Web设计",
        "Web性能优化"
    ],
    "文学": [
        "活着", "三体", "平凡的世界", "围城", "白夜行",
        "百年孤独", "傲慢与偏见", "追风筝的人", "小王子", "红楼梦"
    ],
    "历史": [
        "史记", "资治通鉴", "万历十五年", "全球通史", "人类简史",
        "中国通史", "罗马帝国衰亡史", "世界文明史"
    ],
    "经济管理": [
        "国富论", "资本论", "影响力", "思考，快与慢", "原则",
        "乌合之众", "穷爸爸富爸爸", "非暴力沟通"
    ],
    "科学": [
        "时间简史", "宇宙简史", "基因传", "自私的基因", "物种起源",
        "费曼物理学讲义", "哥德尔、埃舍尔、巴赫：集异璧之大成"
    ]
}

authors = [
    "张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十",
    "刘一", "陈二", "黄三", "林四", "郭五", "何六", "高七", "郑八",
    "Bruce Eckel", "Craig Walls", "周志明", "Joshua Bloch", "Ben Forta",
    "Erich Gamma", "Thomas H. Cormen", "David Gourley", "梁灏", "桑世龙",
    "Yuval Noah Harari", "Stephen Hawking", "Richard Dawkins", "Charles Darwin"
]

publishers = [
    "机械工业出版社", "电子工业出版社", "人民邮电出版社", "清华大学出版社",
    "北京大学出版社", "中信出版社", "译林出版社", "商务印书馆", "上海译文出版社"
]

descriptions = [
    "这是一本关于{}的经典书籍。",
    "深入探讨了{}的核心概念和实践。",
    "为读者提供了{}的全面指南。",
    "一本引人入胜的{}入门读物。",
    "详细讲解了{}的原理和应用。",
    "{}领域的权威著作，不容错过。",
    "通过实例和案例，帮助读者掌握{}。",
    "揭示了{}背后的奥秘。",
    "一本关于{}的必读之作。",
    "对{}进行了系统而深入的分析。"
]

sql_statements = []

for i in range(1, 101): # 生成100条数据
    category = random.choice(list(titles_by_category.keys()))
    title = random.choice(titles_by_category[category])
    author = random.choice(authors)
    isbn = generate_random_isbn()
    publisher = random.choice(publishers)
    publication_date = generate_random_date()
    description = random.choice(descriptions).format(category)
    total_copies = random.randint(10, 100)
    available_copies = random.randint(1, total_copies) # 确保可用数量小于等于总数量

    sql = (
        f"INSERT INTO book (title, author, isbn, publisher, publication_date, category, description, total_copies, available_copies) VALUES "
        f"('{title}', '{author}', '{isbn}', '{publisher}', '{publication_date}', '{category}', '{description}', {total_copies}, {available_copies});"
    )
    sql_statements.append(sql)

# 打印所有SQL语句
for s in sql_statements:
    print(s)