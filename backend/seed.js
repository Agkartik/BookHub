import dotenv from "dotenv";
import connectDB from "./config/database.js";
import User from "./models/User.js";
import Book from "./models/Book.js";

dotenv.config();
await connectDB();

const upsertUser = async ({ name, email, password, role, bio = "" }) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ name, email, password, role, bio, isEmailVerified: true });
};

const admin = await upsertUser({
  name: "BookVerse Admin",
  email: "admin@bookverse.com",
  password: "Admin@12345",
  role: "admin",
  bio: "Platform administrator",
});

const writer = await upsertUser({
  name: "Aarav Writer",
  email: "writer@bookverse.com",
  password: "Writer@12345",
  role: "writer",
  bio: "Writes fiction and sci-fi stories",
});

await upsertUser({
  name: "Demo Reader",
  email: "reader@bookverse.com",
  password: "Reader@12345",
  role: "user",
  bio: "Loves discovering new books",
});

// Clear existing books to force seed updated chapter schema
await Book.deleteMany({});

const sampleBooks = [
  {
    title: "The Midnight Archive",
    author: "Aarav Writer",
    description: "A mystery novel where forgotten books reveal hidden timelines and mystical secrets of the city.",
    categories: ["Mystery", "Fiction"],
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 312,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2024,
    user: writer._id,
    averageRating: 4.6,
    reviewCount: 28,
    chapters: [
      {
        title: "Chapter 1: The Dust on the Shelves",
        content: "The library did not exist in any official records of the city. Silas found it on a cold November evening, following a stray calico cat through the winding alleys behind the old bell tower. The sign above the oak door read only 'The Archive' in faded brass lettering. Inside, the scent of vanilla, old paper, and ancient dust hung thick in the air. Shelves climbed endlessly into the shadows, packed with books bound in cracked leather and faded cloth. As Silas brushed his fingers against the spine of a small black volume, a sudden chill ran down his neck. The cat sat on the main desk, staring at him with emerald eyes that seemed entirely too intelligent."
      },
      {
        title: "Chapter 2: Whisper of Timelines",
        content: "Silas opened the black volume. The pages were thin, like dried leaves, and the ink looked fresh—almost shimmering under the dim gas lamp. The text was written in a beautiful cursive, describing the events of his own morning in vivid detail: the spilled coffee, the train delay, the cat in the alley. Heart pounding, he turned the page. The entries for the afternoon were blank, yet faint silvery lines began to resolve themselves on the paper as he watched, spelling out paths he might take next. 'To know the future is to write it,' a soft voice murmured from the shadows behind the counter. Silas spun around, but the room was empty except for the cat."
      },
      {
        title: "Chapter 3: The Keeper's Warning",
        content: "The voice belonged to no human occupant. Out of the darkness stepped a woman dressed in a velvet coat of deep indigo. Her hair was silver, and she held a brass pocket watch that ticked backward. 'You should not have opened that book, Silas,' she said, her voice like wind through dry grass. 'The Midnight Archive does not hold stories that have passed. It holds the fragments of lives that were never meant to cross. Once you read your name, you become part of the shelf.' She pointed to the black book, which had now grown warm to the touch. Silas tried to drop it, but his fingers felt locked to the leather binding."
      }
    ]
  },
  {
    title: "Quantum Rain",
    author: "Aarav Writer",
    description: "A sci-fi journey across parallel cities linked by quantum storms, electric anomalies, and cybernetic grids.",
    categories: ["Science Fiction", "Adventure"],
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 286,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2025,
    user: writer._id,
    averageRating: 4.3,
    reviewCount: 15,
    chapters: [
      {
        title: "Chapter 1: The Storm Gathers",
        content: "The clouds over Neo-Tokyo were not grey; they glowed with a toxic violet hue, charged by the massive quantum emitters at the city center. Vance pulled his collar up against the drizzle. Each droplet of water carried a microscopic charge, sparking weakly as it struck his cybernetic visor. Underneath his feet, the subterranean power grids hummed like a thousand metallic bees. He was hunting a ghost—a data courier who had supposedly vanished into a parallel version of Sector 9 during the last storm. If the courier didn't return before the emitters reached peak cycle, both worlds would shear apart."
      },
      {
        title: "Chapter 2: The Portal at Sector 9",
        content: "The tracking signal flickered, overlaying green telemetry onto Vance's field of vision. It pointed directly toward an abandoned warehouse where the air shimmered like heat rising from tarmac. As he stepped inside, the hum of his visor grew deafening. The walls of the warehouse were fluctuating, briefly showing rusty machinery in one moment and sleek chrome labs in the next. He saw her—the courier—crouched near a glowing rift in the floor. She looked up, her eyes wide with terror. 'It's not a transmission, Vance!' she screamed over the rising wind. 'The storm is leaking!'"
      },
      {
        title: "Chapter 3: Shear Velocity",
        content: "The floor groaned as gravity began to pull in two directions at once. Vance fired his magnetic anchor into the chrome wall, but the metal dissolved into rotten wood a second later. The courier reached out, throwing a glowing storage drive toward him just as the rift expanded, swallowing her in a flash of blinding white light. Vance lunged, grabbing the drive with his cybernetic hand. The shockwave threw him backward through the warehouse doors and back into the rainy street—but the city he landed in was silent, dark, and completely devoid of lights."
      }
    ]
  },
  {
    title: "Designing With Calm",
    author: "BookVerse Team",
    description: "A practical guide to building mindful digital products that respect user attention and mental space.",
    categories: ["Technology", "Design", "Productivity"],
    coverImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 198,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2023,
    user: admin._id,
    averageRating: 4.8,
    reviewCount: 54,
    chapters: [
      {
        title: "Chapter 1: The Architecture of Attention",
        content: "In an era of relentless push notifications, design is no longer just about aesthetics or usability; it is a battle for human attention. Calm design assumes that human attention is a precious, finite resource that must be treated with respect. When we flood interfaces with red badges, auto-playing media, and manipulative gamification, we build digital anxiety. To design with calm is to build software that is there when needed, invisible when not, and always protective of the user's focus."
      },
      {
        title: "Chapter 2: The Power of White Space",
        content: "White space is often misunderstood as 'wasted' space on a screen. In reality, white space is the active tissue of an interface. It gives elements room to breathe, allows the user's eye to navigate structure naturally, and reduces the cognitive load required to digest information. By increasing padding and margins, we communicate clarity and importance. A calm app doesn't try to fill every pixel; it values silence and lets the content speak for itself."
      },
      {
        title: "Chapter 3: Designing for Autonomy",
        content: "A premium digital product empowers the user rather than trapping them. This means avoiding dark patterns, making settings easy to customize, and honoring user choices like dark mode or reduced motion. When an application respects user autonomy, it builds long-term trust. The goal is to create products that make users feel powerful, relaxed, and in control of their digital lives."
      }
    ]
  },
  {
    title: "Voices of the Monsoon",
    author: "Aarav Writer",
    description: "A contemporary collection of short stories reflecting on rain, nostalgia, and relationships in coastal towns.",
    categories: ["Drama", "Literary Fiction"],
    coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 240,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2022,
    user: writer._id,
    averageRating: 4.1,
    reviewCount: 19,
    chapters: [
      {
        title: "Chapter 1: The Salt on the Wind",
        content: "The monsoon always announced itself with the smell of wet earth and salt carried from the sea. Devi sat on the wooden veranda, watching the dark clouds advance like an army across the horizon. In the village below, fishermen were dragging their wooden boats onto the safety of the beach. Her grandmother was in the kitchen, grinding spices for cardamom tea, the rhythmic sound of the stone pestle matching the distant roll of thunder. It had been five years since Devi left for the city, but the smell of the monsoon wind instantly erased the intervening years."
      },
      {
        title: "Chapter 2: Currents of the Past",
        content: "By nightfall, the rain was a deafening sheet of water hitting the tin roof. The power had gone out hours ago, leaving the house lit by the flickering glow of kerosene lamps. Devi opened the old steel trunk in the corner of her room. Inside, wrapped in a yellow cotton cloth, were dozens of letters her grandfather had written during his years at sea. She picked one at random, the paper yellowed and fragile, smelling of salt and old ink. 'The sea is wide, my love,' she read, 'but the rain here is the same rain that falls on our roof. We look at the same sky.'"
      }
    ]
  },
  {
    title: "The Founder’s Reading Playbook",
    author: "BookVerse Team",
    description: "Business and startup frameworks distilled from the world's most influential books and minds.",
    categories: ["Business", "Startup", "Self Help"],
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 175,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2026,
    user: admin._id,
    averageRating: 4.5,
    reviewCount: 9,
    chapters: [
      {
        title: "Chapter 1: The Synthesis Method",
        content: "Most founders read books wrong. They treat reading like a race, focusing on page count and completion. The Synthesis Method flips this: you should read for execution. For every book you read, your goal should be to extract exactly three actionable ideas that you can test in your business within forty-eight hours. Write them down on a index card. If you cannot find three actionable experiments, close the book and open a different one. Your time is too valuable to waste on passive consumption."
      },
      {
        title: "Chapter 2: Building Your Second Brain",
        content: "Your brain is a device for having ideas, not for storing them. In a fast-moving startup environment, you must build a external system to capture, organize, distill, and express information. This is your 'Second Brain.' Whenever you read a book, highlight the key concepts, write brief summaries in your own words, and store them in a searchable digital database. When faced with a business crisis, you don't need to panic; you simply search your second brain for frameworks on hiring, scaling, or product-market fit."
      }
    ]
  },
  {
    title: "Echoes of the Void",
    author: "Aarav Writer",
    description: "A dark sci-fi thriller about a lone exploration ship investigating a massive, silent relic at the edge of the galaxy.",
    categories: ["Science Fiction", "Thriller"],
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 350,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2026,
    user: writer._id,
    averageRating: 4.7,
    reviewCount: 31,
    chapters: [
      {
        title: "Chapter 1: The Outpost at Nowhere",
        content: "The signal had taken three months to reach the nearest comm relay. By the time Captain Elena Vance arrived at coordinates 44-X, the space outpost was already silent. The massive solar sails hung torn and limp in the solar wind, looking like the skeletal wings of some forgotten titan. She initiated the docking procedure, the metal-on-metal clank echoing through her ship's hull like a heartbeat. There was no atmosphere inside the main ring—only the freezing, airless dark of the deep void."
      },
      {
        title: "Chapter 2: The Whispering Monolith",
        content: "In the center of the station's observation deck floated a black slab. It didn't reflect any light; it seemed to consume it. As Elena stepped closer, her suit's radiation sensors began to click erratically. But it wasn't radiation—it was a sound, vibrating directly through the bones of her skull. It sounded like voices speaking in a language that hadn't been heard in a billion years. She reached out with her glove, touching the absolute cold of the stone."
      }
    ]
  },
  {
    title: "The Whispering Library",
    author: "Aarav Writer",
    description: "A magical realism adventure about an ancient library where the books speak to those who know how to listen.",
    categories: ["Fantasy", "Mystery"],
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 290,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2024,
    user: writer._id,
    averageRating: 4.5,
    reviewCount: 18,
    chapters: [
      {
        title: "Chapter 1: A Midnight Symphony",
        content: "If you walk into the archives after midnight, the silence is far from quiet. Maya held her breath, listening to the soft, papery rustling of thousands of pages settling into sleep. On the third shelf of the history section, a leather-bound journal was clearing its throat. 'He was not a king, you know,' a faint, dusty voice whispered from the darkness. Maya smiled and opened her notebook. The books were ready to tell their stories."
      },
      {
        title: "Chapter 2: The Lost Codex",
        content: "The voices grew louder as she moved deeper into the restricted vaults. She was looking for the Codex of Stars, a book that had supposedly burned in the Great Fire of Alexandria. But books don't truly die; their memories simply migrate. She found a small, charred volume that smelled faintly of smoke and ancient oil. As her fingers touched the cover, she was suddenly standing in the middle of a desert beneath an sky ablaze with unfamiliar constellations."
      }
    ]
  },
  {
    title: "Neon Dreams",
    author: "Aarav Writer",
    description: "A fast-paced cyberpunk detective novel set in a neon-drenched metropolis controlled by rival corporate factions.",
    categories: ["Mystery", "Thriller"],
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 320,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2025,
    user: writer._id,
    averageRating: 4.4,
    reviewCount: 22,
    chapters: [
      {
        title: "Chapter 1: Rain and Holograms",
        content: "The neon glow of the advertising banners painted the wet asphalt in shades of hot pink and electric blue. Detective Kaelen Cruz stood under the awning of a noodle bar, steam rising around his synthetic trench coat. The holographic geisha overhead smiled down at the crowd, her digital eyes flickering. Cruz checked his opti-link. The victim's neural core had been completely wiped—not a single byte of memory left behind."
      },
      {
        title: "Chapter 2: Neural Fractures",
        content: "Cruz entered the server room of the syndicate. The cold air smelled of ozone and coolant. Row after row of black towers hummed in the dark, their blue LED lights blinking in synchronization. He located the primary interface, plugging his cyber-deck directly into the network. Instantly, his mind was flooded with a blinding surge of raw data, a digital labyrinth of corporate secrets, stolen identities, and a hidden AI that was watching him."
      }
    ]
  },
  {
    title: "Chasing the Horizon",
    author: "BookVerse Team",
    description: "An inspiring collection of travel logs and philosophies on discovering the hidden corners of the world.",
    categories: ["Adventure", "Productivity"],
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 210,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2023,
    user: admin._id,
    averageRating: 4.8,
    reviewCount: 41,
    chapters: [
      {
        title: "Chapter 1: The Art of Getting Lost",
        content: "The best journeys are those that begin without a map. In a world obsessed with planning every detail, we have forgotten the profound joy of discovery. When you walk into an unknown city without a destination, your senses sharpen. You notice the aroma of fresh baking from a back alley, the laughter of children in a hidden courtyard, and the architecture of everyday life. To travel is to embrace uncertainty and let the world surprise you."
      },
      {
        title: "Chapter 2: Mountain Silences",
        content: "High up in the Andes, the air is thin and the sky feels close enough to touch. I sat on a rocky ridge, watching the valley below fill with thick, white clouds. There were no sounds of engines, no cellular signals, no notifications. Just the wind through the high grass and the beating of my own heart. In this deep silence, I realized that the greatest adventure is not crossing oceans, but finding quietness in your own mind."
      }
    ]
  },
  {
    title: "Poetry of the Everyday",
    author: "BookVerse Team",
    description: "A soothing collection of modern prose and poetry celebrating small, beautiful daily rituals.",
    categories: ["Poetry", "Self Help"],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 150,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2025,
    user: admin._id,
    averageRating: 4.9,
    reviewCount: 65,
    chapters: [
      {
        title: "Chapter 1: Morning Cardamom",
        content: "There is a quiet liturgy to the morning. The sound of water heating in the kettle, the steady grinding of coffee beans, and the scent of crushed cardamom. For ten minutes, the world is at peace. The emails haven't arrived, the news is silent, and the day is full of unwritten potential. We must build these small, sacred sanctuaries in our schedules, protecting them from the rush of the world."
      },
      {
        title: "Chapter 2: The Sound of Rain on Glass",
        content: "Rain is nature's way of telling us to slow down. As the droplets slide down the cold glass of the window, they create an ever-changing art gallery. The city outside becomes soft and blurry, its sharp edges smoothed by the gray mist. It is the perfect afternoon to wrap yourself in a blanket, hold a warm mug, and lose yourself in a book. The rain reminds us that growth requires patience and quiet days."
      }
    ]
  },
  {
    title: "Mindful Product Design",
    author: "BookVerse Team",
    description: "An advanced industry framework for designing software products that elevate human wellbeing and focus.",
    categories: ["Technology", "Design"],
    coverImage: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 230,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2026,
    user: admin._id,
    averageRating: 4.6,
    reviewCount: 14,
    chapters: [
      {
        title: "Chapter 1: The Design Ethos",
        content: "We must transition from designing for 'engagement' to designing for 'value.' When the primary metric of a software company is the number of minutes a user spends on their screen, the design team is forced to build addictive feedback loops. Mindful design measures success by the quality of interaction. We want to build products that help users achieve their goals quickly and then close the app to live their real lives."
      },
      {
        title: "Chapter 2: Micro-Interactions of Delight",
        content: "A premium product is defined by its details. A subtle haptic buzz, a smooth transition, a curated color palette—these micro-interactions create an emotional connection with the user. When design feels responsive and alive, it becomes joyful. We must invest time in refining these tiny moments, ensuring they serve to delight and guide the user rather than distracting or manipulating them."
      }
    ]
  },
  {
    title: "The Silk Road Courier",
    author: "Aarav Writer",
    description: "A historical epic about a young messenger navigating the dangerous desert routes of the ancient Silk Road.",
    categories: ["Adventure", "Fiction"],
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 340,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2021,
    user: writer._id,
    averageRating: 4.2,
    reviewCount: 17,
    chapters: [
      {
        title: "Chapter 1: Sand and Shadows",
        content: "The dunes stretched endlessly into the golden haze of the Gobi desert. Tariq adjusted the leather strap of his satchel, which held a royal decree sealed in green wax. His camel walked with a steady, rhythmic sway, its hooves crunching softly on the dry sand. The sun was a blinding brass disc in the sky, baking the air until it rippled. He knew the bandits were out there, hiding in the dry ravines, waiting for the cover of night."
      },
      {
        title: "Chapter 2: Oasis of Stars",
        content: "The water of the spring was cold and sweet, reflecting the bright stars like diamonds in black velvet. Tariq washed the dust from his face, his muscles aching from the long ride. Under the shade of the date palms, merchants from Constantinople and Chang'an sat around a common fire, sharing flatbread and stories of home. For one night, there were no borders—only the shared warmth of the fire and the road."
      }
    ]
  },
  {
    title: "Gothic Shadows",
    author: "Aarav Writer",
    description: "A haunting gothic horror story set in a crumbling family manor perched high on the cliffs of a stormy coast.",
    categories: ["Fiction", "Mystery"],
    coverImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 275,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2023,
    user: writer._id,
    averageRating: 4.3,
    reviewCount: 29,
    chapters: [
      {
        title: "Chapter 1: The Iron Gates",
        content: "Blackwood Manor stood like a jagged tooth against the stormy sky. The iron gates were choked with dead ivy, groaning in the wind like a dying animal. Clara pulled her shawl tight, her carriage wheels splashing through deep puddles of muddy water. She had been hired to catalog the estate's library, but as she looked up at the dark, shuttered windows, she felt a cold certainty that she was not welcome."
      },
      {
        title: "Chapter 2: The Red Room",
        content: "The dust lay thick on the mahogany tables, undisturbed for decades. Clara walked through the long corridors, her candle casting long, dancing shadows on the peeling wallpaper. She stopped before a heavy oak door at the end of the east wing. The key turned with a loud, rusty click. The room inside was decorated entirely in faded crimson velvet, and in the center stood an empty cradle that was rocking slowly."
      }
    ]
  },
  {
    title: "Beyond the Mirror",
    author: "Aarav Writer",
    description: "A deep psychological thriller exploring identity, memory, and the dark secrets hidden in our reflections.",
    categories: ["Mystery", "Thriller"],
    coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 310,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2025,
    user: writer._id,
    averageRating: 4.6,
    reviewCount: 38,
    chapters: [
      {
        title: "Chapter 1: The Unfamiliar Face",
        content: "The mirror in the hallway had always been slightly warped, but this morning, the distortion felt deliberate. Dr. Sarah Thorne stared at her reflection. The eyes staring back looked tired, but there was something else—a subtle delay in her movements, a micro-second where the image in the glass didn't match the hand she raised to her cheek. She blinked, and the reflection smiled before she did."
      },
      {
        title: "Chapter 2: Fragments of Amnesia",
        content: "The medical files on her desk were empty, yet they bore her signature. Sarah tried to reconstruct the timeline of her week, but the days felt like smoke slipping through her fingers. She found a tape recorder in her desk drawer. When she pressed play, a voice that sounded exactly like hers began to speak, whispering: 'Do not trust the mirror. They are rewriting your memory.'"
      }
    ]
  },
  {
    title: "Culinary Alchemy",
    author: "BookVerse Team",
    description: "A fascinating look at the chemistry of cooking, the histories of exotic spices, and the secrets of gastronomy.",
    categories: ["Design", "Productivity"],
    coverImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    pdf: "",
    pages: 185,
    language: "English",
    format: "Ebook",
    condition: "New",
    publishedYear: 2024,
    user: admin._id,
    averageRating: 4.7,
    reviewCount: 42,
    chapters: [
      {
        title: "Chapter 1: The Magic of Sizzle",
        content: "Cooking is the oldest form of alchemy. When meat hits a hot cast-iron skillet, a complex chemical reaction begins, converting proteins and sugars into hundreds of new flavor compounds. This is the Maillard reaction, the secret behind the rich crust of a steak or the golden color of a loaf of bread. By understanding the physics of heat and fat, we can transform simple ingredients into edible masterpieces."
      },
      {
        title: "Chapter 2: Spice Caravan",
        content: "A single pinch of black pepper or a strip of cinnamon bark contains a history of empires, sea battles, and ancient trade routes. Spices are the plants' defense systems—highly aromatic molecules designed to deter insects. But to humans, these chemicals are triggers of delight. When we balance fat, acid, salt, and heat with these aromatic compounds, we create a sensory experience that speaks directly to our primal brain."
      }
    ]
  }
];

for (const item of sampleBooks) {
  await Book.create(item);
}

console.log("Demo data seeded successfully with chapter lists.");
console.log("Admin login: admin@bookverse.com / Admin@12345");
console.log("Writer login: writer@bookverse.com / Writer@12345");
console.log("Reader login: reader@bookverse.com / Reader@12345");
process.exit(0);
