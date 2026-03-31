import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Re-create db connection after env is loaded
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { ...schema, ...relations } });
import {
  users,
  userProfessions,
  professions,
  actorProfiles,
  companies,
  companyServices,
  posts,
  postLikes,
  postComments,
  follows,
  projects,
  projectRoles,
  applications,
  conversations,
  conversationParticipants,
  messages,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// ======= MOCK DATA =======
// Все данные вымышлены. Любые совпадения с реальными людьми случайны.

const PASSWORD = "test123"; // пароль для всех тестовых аккаунтов

const MOCK_USERS = [
  {
    email: "demo.director@test.fake",
    phone: "+7000111TEST",
    name: "[ТЕСТ] Айдар Тестов",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Снимаю демо-ролики и тестовые сцены уже 0 лет.",
    city: "Тестоград",
    experienceYears: 8,
    availability: "full-time" as const,
    role: "superadmin" as const,
    telegram: "@test_aidar_fake",
    isActor: false,
    isCastingDirector: true,
    primaryProfs: ["director", "producer"],
    secondaryProfs: ["screenwriter"],
  },
  {
    email: "demo.actress@test.fake",
    phone: "+7000222TEST",
    name: "[ТЕСТ] Алия Фейкова",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Актриса тестового театра. Снималась в 0 настоящих фильмах.",
    city: "Тестоград",
    experienceYears: 5,
    availability: "project-based" as const,
    role: "user" as const,
    telegram: "@test_aliya_fake",
    isActor: true,
    isCastingDirector: false,
    primaryProfs: ["actress"],
    secondaryProfs: ["makeup-artist"],
  },
  {
    email: "demo.operator@test.fake",
    phone: "+7000333TEST",
    name: "[ТЕСТ] Бекзат Моков",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Оператор-постановщик. Снимаю на воображаемую камеру RED.",
    city: "Демо-Алматы",
    experienceYears: 10,
    availability: "part-time" as const,
    role: "user" as const,
    telegram: "@test_bekzat_fake",
    isActor: false,
    isCastingDirector: false,
    primaryProfs: ["cinematographer"],
    secondaryProfs: ["drone-operator", "colorist"],
  },
  {
    email: "demo.actor@test.fake",
    phone: "+7000444TEST",
    name: "[ТЕСТ] Данияр Примеров",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Актёр. Играл дерево в школьной постановке.",
    city: "Тестоград",
    experienceYears: 3,
    availability: "full-time" as const,
    role: "user" as const,
    telegram: "@test_daniyar_fake",
    isActor: true,
    isCastingDirector: false,
    primaryProfs: ["actor"],
    secondaryProfs: [],
  },
  {
    email: "demo.sound@test.fake",
    phone: "+7000555TEST",
    name: "[ТЕСТ] Камила Демова",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Звукорежиссёр. Записываю тишину в формате Dolby Atmos.",
    city: "Демо-Астана",
    experienceYears: 6,
    availability: "project-based" as const,
    role: "content-manager" as const,
    telegram: "@test_kamila_fake",
    isActor: false,
    isCastingDirector: false,
    primaryProfs: ["sound-designer"],
    secondaryProfs: ["composer", "foley-artist"],
  },
  {
    email: "demo.editor@test.fake",
    phone: "+7000666TEST",
    name: "[ТЕСТ] Руслан Шаблонов",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Монтажёр. Монтирую сны.",
    city: "Демо-Алматы",
    experienceYears: 4,
    availability: "full-time" as const,
    role: "user" as const,
    telegram: "@test_ruslan_fake",
    isActor: false,
    isCastingDirector: false,
    primaryProfs: ["editor"],
    secondaryProfs: ["colorist"],
  },
  {
    email: "demo.gaffer@test.fake",
    phone: "+7000777TEST",
    name: "[ТЕСТ] Мадина Тестерова",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Осветитель. Работаю со светом, которого нет.",
    city: "Тестоград",
    experienceYears: 7,
    availability: "part-time" as const,
    role: "admin" as const,
    telegram: "@test_madina_fake",
    isActor: false,
    isCastingDirector: false,
    primaryProfs: ["gaffer"],
    secondaryProfs: ["steadicam-operator"],
  },
  {
    email: "demo.costume@test.fake",
    phone: "+7000888TEST",
    name: "[ТЕСТ] Жанна Фальшивова",
    bio: "⚠️ ТЕСТОВЫЙ АККАУНТ. Костюмер. Одеваю манекенов для тестовых съёмок.",
    city: "Демо-Астана",
    experienceYears: 9,
    availability: "project-based" as const,
    role: "user" as const,
    telegram: "@test_zhanna_fake",
    isActor: true,
    isCastingDirector: false,
    primaryProfs: ["costume-designer"],
    secondaryProfs: ["props-master"],
  },
];

const MOCK_COMPANIES = [
  {
    name: "[ТЕСТ] DemoFilm Production",
    description: "⚠️ ТЕСТОВАЯ КОМПАНИЯ. Продакшн-студия полного цикла. Снимаем всё, кроме настоящих фильмов.",
    city: "Тестоград",
    status: "approved" as const,
    services: [
      { name: "Аренда камеры (воображаемой)", price: "0 ₸/день", category: "rental" },
      { name: "Полный продакшн тестового ролика", price: "от 0 ₸", category: "production" },
      { name: "Цветокоррекция демо-материала", price: "от 0 ₸/мин", category: "post-production" },
    ],
  },
  {
    name: "[ТЕСТ] MockCast Agency",
    description: "⚠️ ТЕСТОВАЯ КОМПАНИЯ. Кастинг-агентство. Подбираем тестовых актёров для тестовых проектов.",
    city: "Демо-Алматы",
    status: "approved" as const,
    services: [
      { name: "Подбор актёров (фейковых)", price: "договорная", category: "casting" },
      { name: "Организация тестового кастинга", price: "от 0 ₸", category: "casting" },
    ],
  },
  {
    name: "[ТЕСТ] ДемоЛокации KZ",
    description: "⚠️ ТЕСТОВАЯ КОМПАНИЯ. Аренда несуществующих локаций для съёмок.",
    city: "Демо-Астана",
    status: "pending" as const,
    services: [
      { name: "Лофт (нарисованный)", price: "0 ₸/час", category: "location" },
      { name: "Студия хромакей (воображаемая)", price: "0 ₸/час", category: "location" },
    ],
  },
];

const MOCK_POSTS = [
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Привет, Film Crew! Только что зарегистрировался. Ищу команду для тестового проекта! 🎬", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Кто свободен на следующей неделе? Нужен оператор для демо-ролика в Тестограде.", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Только что закончили тестовый монтаж. Результат: 0 минут чистого ничего. 😂", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Ищу звукорежиссёра для короткометражки «Тишина». Бюджет — 0 ₸, зато опыт бесценный! 🎤", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Делюсь лайфхаком: лучший свет для съёмок — это тот, который ещё не изобрели. 💡", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Открыт кастинг на роль «Человек, который тестирует приложения». Все подробности в проектах! 🎭", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Закончила работу над тестовыми костюмами. Теперь манекены выглядят лучше, чем я. 👗", isWelcome: false },
  { content: "⚠️ ТЕСТОВЫЙ ПОСТ. Алматинские киношники, собираемся в субботу в несуществующем кафе для тестового нетворкинга! ☕", isWelcome: false },
];

const MOCK_PROJECTS = [
  {
    title: "[ТЕСТ] Короткометражка «Тестовый день»",
    description: "⚠️ ТЕСТОВЫЙ ПРОЕКТ. История о человеке, который живёт внутри тестовой среды и не знает об этом. Драма. 15 минут.",
    genre: "Короткометражный фильм",
    type: "technical" as const,
    status: "recruiting" as const,
    city: "Тестоград",
    roles: [
      { profSlug: "cinematographer", description: "Нужен оператор с камерой (или воображением)", conditionsType: "specified" as const, payment: "0 ₸" },
      { profSlug: "sound-designer", description: "Звукорежиссёр для записи тишины", conditionsType: "discuss" as const },
      { profSlug: "editor", description: "Монтажёр. Premiere или DaVinci", conditionsType: "specified" as const, payment: "0 ₸" },
    ],
  },
  {
    title: "[ТЕСТ] Кастинг: «Мок-сериал: Первый сезон»",
    description: "⚠️ ТЕСТОВЫЙ КАСТИНГ. Ищем актёров для несуществующего сериала о жизни тестировщиков ПО. Комедия.",
    genre: "Веб-сериал",
    type: "casting" as const,
    status: "recruiting" as const,
    city: "Демо-Алматы",
    roles: [
      { customTitle: "Главный QA-инженер", roleType: "main" as const, gender: "any" as const, ageFrom: 25, ageTo: 40, description: "Главная роль. Харизматичный тестировщик." },
      { customTitle: "Джуниор-разработчик", roleType: "episodic" as const, gender: "any" as const, ageFrom: 20, ageTo: 30, description: "Эпизодическая роль. Постоянно ломает код." },
      { customTitle: "Массовка в офисе", roleType: "mass" as const, description: "Фоновые сотрудники открытого офиса." },
    ],
  },
  {
    title: "[ТЕСТ] Реклама «Тестовый продукт»",
    description: "⚠️ ТЕСТОВЫЙ ПРОЕКТ. 30-секундный ролик для продукта, которого не существует. Нужна полная команда.",
    genre: "Реклама",
    type: "technical" as const,
    status: "recruiting" as const,
    city: "Демо-Астана",
    roles: [
      { profSlug: "gaffer", description: "Осветитель. Работа на студии", conditionsType: "specified" as const, payment: "0 ₸" },
      { profSlug: "makeup-artist", description: "Гримёр для модели", conditionsType: "discuss" as const },
    ],
  },
];

const MOCK_COMMENTS = [
  "⚠️ Тестовый комментарий. Отличный пост! 👏",
  "⚠️ Тестовый комментарий. Полностью согласен!",
  "⚠️ Тестовый комментарий. Интересно, расскажи подробнее!",
  "⚠️ Тестовый комментарий. Мы тоже ищем людей на похожий проект 🎬",
  "⚠️ Тестовый комментарий. Напишу в личку!",
];

const MOCK_MESSAGES = [
  "⚠️ Тест. Привет! Видел твой профиль, интересно было бы поработать вместе",
  "⚠️ Тест. Привет! Да, давай обсудим. Что за проект?",
  "⚠️ Тест. Короткометражка, драма. Нужен оператор на 3 дня в Тестограде",
  "⚠️ Тест. Звучит интересно! Когда планируете съёмки?",
  "⚠️ Тест. Ориентировочно через 2 недели. Скину подробности позже",
  "⚠️ Тест. Отлично, буду ждать! 👍",
];

async function seedMock() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  // Fetch professions
  const allProfs = await db.select().from(professions);
  const profMap = new Map(allProfs.map((p) => [p.slug, p.id]));

  console.log("🧹 Создаю тестовых пользователей...");

  const userIds: string[] = [];

  for (const u of MOCK_USERS) {
    // Check if already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, u.email),
    });
    if (existing) {
      userIds.push(existing.id);
      console.log(`  ↳ ${u.name} уже существует, пропускаю`);
      continue;
    }

    const [created] = await db
      .insert(users)
      .values({
        email: u.email,
        phone: u.phone,
        passwordHash: hash,
        name: u.name,
        bio: u.bio,
        city: u.city,
        experienceYears: u.experienceYears,
        availability: u.availability,
        role: u.role,
        telegram: u.telegram,
        isActor: u.isActor,
        isCastingDirector: u.isCastingDirector,
        ageConfirmed: true,
        termsAccepted: true,
        referralCode: `TEST${Math.random().toString(36).slice(2, 8)}`,
      })
      .returning({ id: users.id });

    userIds.push(created.id);

    // Professions
    const profInserts = [
      ...u.primaryProfs.map((slug) => ({
        userId: created.id,
        professionId: profMap.get(slug)!,
        isPrimary: true,
      })),
      ...u.secondaryProfs.map((slug) => ({
        userId: created.id,
        professionId: profMap.get(slug)!,
        isPrimary: false,
      })),
    ].filter((p) => p.professionId);

    if (profInserts.length > 0) {
      await db.insert(userProfessions).values(profInserts).onConflictDoNothing();
    }

    console.log(`  ✓ ${u.name} (${u.role})`);
  }

  // Actor profiles for actors
  console.log("\n🎭 Создаю актёрские анкеты...");
  const actorUsers = MOCK_USERS.filter((u) => u.isActor);
  for (let i = 0; i < actorUsers.length; i++) {
    const idx = MOCK_USERS.indexOf(actorUsers[i]);
    const userId = userIds[idx];

    const existing = await db.query.actorProfiles.findFirst({
      where: eq(actorProfiles.userId, userId),
    });
    if (existing) continue;

    await db.insert(actorProfiles).values({
      userId,
      gender: actorUsers[i].name.includes("Алия") || actorUsers[i].name.includes("Жанна") ? "female" : "male",
      birthYear: 1990 + i,
      height: 165 + i * 5,
      weight: 55 + i * 8,
      hairColor: ["Тёмно-русый", "Чёрный", "Каштановый"][i % 3],
      eyeColor: ["Карий", "Зелёный", "Голубой"][i % 3],
      languages: "Казахский, Русский, Английский (тестовый)",
      specialSkills: "Тестовые навыки: стояние на месте, моргание, тестирование приложений",
    });
    console.log(`  ✓ Анкета: ${actorUsers[i].name}`);
  }

  // Companies
  console.log("\n🏢 Создаю тестовые компании...");
  const companyIds: string[] = [];

  for (let i = 0; i < MOCK_COMPANIES.length; i++) {
    const c = MOCK_COMPANIES[i];
    const ownerId = userIds[i % userIds.length];

    const existing = await db.query.companies.findFirst({
      where: eq(companies.name, c.name),
    });
    if (existing) {
      companyIds.push(existing.id);
      console.log(`  ↳ ${c.name} уже существует`);
      continue;
    }

    const [created] = await db
      .insert(companies)
      .values({
        ownerId,
        name: c.name,
        description: c.description,
        city: c.city,
        status: c.status,
      })
      .returning({ id: companies.id });

    companyIds.push(created.id);

    // Services
    for (const s of c.services) {
      await db.insert(companyServices).values({
        companyId: created.id,
        name: s.name,
        price: s.price,
        category: s.category,
      });
    }

    console.log(`  ✓ ${c.name} (${c.status}) — ${c.services.length} услуг`);
  }

  // Posts
  console.log("\n📝 Создаю тестовые посты...");

  // Welcome posts
  for (let i = 0; i < userIds.length; i++) {
    await db.insert(posts).values({
      userId: userIds[i],
      content: `🆕 Новый пользователь: ${MOCK_USERS[i].name} присоединился к Film Crew! [ТЕСТОВЫЕ ДАННЫЕ]`,
      isWelcomePost: true,
    }).onConflictDoNothing();
  }
  console.log(`  ✓ ${userIds.length} приветственных постов`);

  // Regular posts
  const postIds: string[] = [];
  for (let i = 0; i < MOCK_POSTS.length; i++) {
    const [post] = await db
      .insert(posts)
      .values({
        userId: userIds[i % userIds.length],
        content: MOCK_POSTS[i].content,
      })
      .returning({ id: posts.id });
    postIds.push(post.id);
  }
  console.log(`  ✓ ${MOCK_POSTS.length} обычных постов`);

  // Likes
  console.log("\n❤️ Создаю тестовые лайки...");
  let likeCount = 0;
  for (const postId of postIds) {
    // Random 2-5 users like each post
    const likers = userIds.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 4));
    for (const userId of likers) {
      await db.insert(postLikes).values({ postId, userId }).onConflictDoNothing();
      likeCount++;
    }
  }
  console.log(`  ✓ ${likeCount} лайков`);

  // Comments
  console.log("\n💬 Создаю тестовые комментарии...");
  let commentCount = 0;
  for (let i = 0; i < postIds.length; i++) {
    const numComments = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numComments; j++) {
      const userId = userIds[(i + j + 1) % userIds.length];
      await db.insert(postComments).values({
        postId: postIds[i],
        userId,
        content: MOCK_COMMENTS[(i + j) % MOCK_COMMENTS.length],
      });
      commentCount++;
    }
  }
  console.log(`  ✓ ${commentCount} комментариев`);

  // Follows
  console.log("\n👥 Создаю тестовые подписки...");
  let followCount = 0;
  for (let i = 0; i < userIds.length; i++) {
    // Each user follows 2-4 others
    const toFollow = userIds.filter((_, j) => j !== i).sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    for (const targetId of toFollow) {
      await db.insert(follows).values({ followerId: userIds[i], followingId: targetId }).onConflictDoNothing();
      followCount++;
    }
  }
  console.log(`  ✓ ${followCount} подписок`);

  // Projects
  console.log("\n🎬 Создаю тестовые проекты...");
  for (let i = 0; i < MOCK_PROJECTS.length; i++) {
    const p = MOCK_PROJECTS[i];
    const ownerId = userIds[i % userIds.length];

    const [project] = await db
      .insert(projects)
      .values({
        ownerId,
        title: p.title,
        description: p.description,
        genre: p.genre,
        type: p.type,
        status: p.status,
        city: p.city,
      })
      .returning({ id: projects.id });

    for (const r of p.roles) {
      const profId = "profSlug" in r ? profMap.get(r.profSlug as string) : null;

      await db.insert(projectRoles).values({
        projectId: project.id,
        professionId: profId || null,
        customTitle: "customTitle" in r ? r.customTitle : null,
        description: r.description || null,
        conditionsType: "conditionsType" in r ? r.conditionsType : "discuss",
        payment: "payment" in r ? r.payment : null,
        roleType: "roleType" in r ? r.roleType : null,
        gender: "gender" in r ? r.gender : null,
        ageFrom: "ageFrom" in r ? r.ageFrom : null,
        ageTo: "ageTo" in r ? r.ageTo : null,
      });
    }

    console.log(`  ✓ ${p.title} — ${p.roles.length} ролей`);

    // Add some applications to casting project
    if (p.type === "casting") {
      const actorIds = userIds.filter((_, idx) => MOCK_USERS[idx].isActor);
      for (const actorId of actorIds) {
        const rolesList = await db.select().from(projectRoles).where(eq(projectRoles.projectId, project.id));
        if (rolesList.length > 0) {
          await db.insert(applications).values({
            projectId: project.id,
            roleId: rolesList[0].id,
            userId: actorId,
            coverMessage: "⚠️ ТЕСТОВЫЙ ОТКЛИК. Здравствуйте! Очень хочу попробовать себя в этой роли.",
          });
        }
      }
      console.log(`    ↳ + ${actorIds.length} тестовых откликов`);
    }
  }

  // Conversations & Messages
  console.log("\n✉️ Создаю тестовые чаты...");

  // Chat between first two users
  const [conv1] = await db
    .insert(conversations)
    .values({ type: "direct" })
    .returning({ id: conversations.id });

  await db.insert(conversationParticipants).values([
    { conversationId: conv1.id, userId: userIds[0] },
    { conversationId: conv1.id, userId: userIds[2] },
  ]);

  for (let i = 0; i < MOCK_MESSAGES.length; i++) {
    await db.insert(messages).values({
      conversationId: conv1.id,
      senderId: i % 2 === 0 ? userIds[0] : userIds[2],
      content: MOCK_MESSAGES[i],
    });
  }
  console.log(`  ✓ Чат: ${MOCK_USERS[0].name} ↔ ${MOCK_USERS[2].name} (${MOCK_MESSAGES.length} сообщений)`);

  // Chat between users 1 and 3
  const [conv2] = await db
    .insert(conversations)
    .values({ type: "direct" })
    .returning({ id: conversations.id });

  await db.insert(conversationParticipants).values([
    { conversationId: conv2.id, userId: userIds[1] },
    { conversationId: conv2.id, userId: userIds[3] },
  ]);

  await db.insert(messages).values([
    { conversationId: conv2.id, senderId: userIds[1], content: "⚠️ Тест. Привет! Ты тоже актёр?" },
    { conversationId: conv2.id, senderId: userIds[3], content: "⚠️ Тест. Да! Видел кастинг на «Мок-сериал»? Хочу попробовать" },
    { conversationId: conv2.id, senderId: userIds[1], content: "⚠️ Тест. Да, я уже откликнулась! Удачи нам обоим 🍀" },
  ]);
  console.log(`  ✓ Чат: ${MOCK_USERS[1].name} ↔ ${MOCK_USERS[3].name} (3 сообщения)`);

  console.log("\n✅ Мок-данные успешно загружены!");
  console.log(`\n📋 Для входа в любой тестовый аккаунт:`);
  console.log(`   Email: demo.director@test.fake (или любой другой demo.*.fake)`);
  console.log(`   Пароль: ${PASSWORD}`);
  console.log(`\n   Суперадмин: demo.director@test.fake`);
  console.log(`   Админ: demo.gaffer@test.fake`);
  console.log(`   Контент-менеджер: demo.sound@test.fake`);

  process.exit(0);
}

seedMock().catch((e) => {
  console.error("❌ Ошибка:", e);
  process.exit(1);
});
