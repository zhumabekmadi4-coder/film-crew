import { db } from "./index";
import { professions } from "./schema";

const PROFESSIONS = [
  { name: "Режиссёр", slug: "director" },
  { name: "Оператор", slug: "cinematographer" },
  { name: "Сценарист", slug: "screenwriter" },
  { name: "Актёр", slug: "actor" },
  { name: "Актриса", slug: "actress" },
  { name: "Продюсер", slug: "producer" },
  { name: "Монтажёр", slug: "editor" },
  { name: "Звукорежиссёр", slug: "sound-designer" },
  { name: "Гримёр", slug: "makeup-artist" },
  { name: "Художник-постановщик", slug: "production-designer" },
  { name: "Осветитель", slug: "gaffer" },
  { name: "Колорист", slug: "colorist" },
  { name: "Второй режиссёр", slug: "assistant-director" },
  { name: "Кастинг-директор", slug: "casting-director" },
  { name: "Фокус-пуллер", slug: "focus-puller" },
  { name: "Стедикамщик", slug: "steadicam-operator" },
  { name: "Дронщик", slug: "drone-operator" },
  { name: "Художник по костюмам", slug: "costume-designer" },
  { name: "Реквизитор", slug: "props-master" },
  { name: "Композитор", slug: "composer" },
  { name: "Саунд-дизайнер", slug: "foley-artist" },
];

async function seed() {
  console.log("Seeding professions...");

  for (const p of PROFESSIONS) {
    await db
      .insert(professions)
      .values(p)
      .onConflictDoNothing();
  }

  console.log(`Seeded ${PROFESSIONS.length} professions.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
