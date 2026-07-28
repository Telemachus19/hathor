import { catalogDb, catalogPool } from './client.js';
import { games, tags, gameTags } from './schema.js';
import { eq, sql } from 'drizzle-orm';

const DEMO_CREATOR_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
  try {
    const defaultTags = [
      { name: 'Indie', slug: 'indie' },
      { name: 'Action', slug: 'action' },
      { name: 'RPG', slug: 'rpg' },
      { name: 'Strategy', slug: 'strategy' },
      { name: 'Cyberpunk', slug: 'cyberpunk' },
      { name: 'Adventure', slug: 'adventure' },
      { name: 'Simulation', slug: 'simulation' },
      { name: 'Puzzle', slug: 'puzzle' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Racing', slug: 'racing' },
    ];

    const seededTags: Record<string, number> = {};

    for (const tag of defaultTags) {
      const [inserted] = await catalogDb
        .insert(tags)
        .values(tag)
        .onConflictDoNothing({ target: tags.slug })
        .returning();

      if (inserted) {
        seededTags[tag.slug] = inserted.id;
      } else {
        const existing = await catalogDb.query.tags.findFirst({
          where: eq(tags.slug, tag.slug),
        });
        if (existing) {
          seededTags[tag.slug] = existing.id;
        }
      }
    }

    const demoGames = [
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Neon Overdrive',
        slug: 'neon-overdrive',
        shortDescription: 'A high-octane cyberpunk action RPG set in a futuristic metropolis.',
        fullDescription: 'Explore the illuminated streets of Neo-Cairo in this action-packed RPG featuring deep skill trees, cybernetic augmentations, and intense combat.',
        priceEgp: '299.99',
        discountPercent: 10,
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'CYBERNETIC AUGMENTATION SYSTEM',
                  description: 'Upgrade your hero with over 50 combat augmentations, optical targeting rigs, and overclocked neural boosters in Neo-Cairo.',
                },
                {
                  title: 'NEON NIGHTS & HIGH STAKES',
                  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
                  description: 'Navigate subterranean syndicate hideouts, execute high-speed vehicle hacks, and challenge megacorp bosses in fast-paced encounters.',
                },
              ],
            },
          },
        },
        tagSlugs: ['action', 'rpg', 'cyberpunk'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Pharaoh Tactics',
        slug: 'pharaoh-tactics',
        shortDescription: 'Turn-based tactical strategy game set in ancient Egypt.',
        fullDescription: 'Command your armies across the Nile valley, construct grand monuments, and outmaneuver rival kingdoms in rich tactical warfare.',
        priceEgp: '449.50',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'TACTICAL WARFARE ALONG THE NILE',
                  description: 'Lead ancient pharaonic legions across hex-grid desert battlefields. Position spear throwers, war chariots, and royal guards to conquer rival dynasties.',
                },
                {
                  title: 'DIVINE BLESSINGS OF THE ANCIENT GODS',
                  imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
                  description: 'Invoke the solar fury of Ra or the sandstorms of Seth to turn the tide of battle in critical siege encounters.',
                },
              ],
            },
          },
        },
        tagSlugs: ['indie', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Nile Odyssey',
        slug: 'nile-odyssey',
        shortDescription: 'An epic narrative adventure following mythical journeys along the Nile.',
        fullDescription: 'Uncover forgotten temples, solve ancient riddles, and master mythical abilities in an immersive story-driven campaign.',
        priceEgp: '199.99',
        discountPercent: 15,
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'MYTHICAL JOURNEY ACROSS ANCIENT TEMPLE RUINS',
                  description: 'Explore sunken tombs along the sacred river banks, deciphero hieroglyphic vaults, and unlock legendary artifacts.',
                },
              ],
            },
          },
        },
        tagSlugs: ['adventure', 'rpg'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Shadow Realm',
        slug: 'shadow-realm',
        shortDescription: 'Dark fantasy action RPG with challenging boss encounters.',
        fullDescription: 'Battle through corrupted domains, unleash dark spells, and overcome towering bosses in a punishing dark fantasy world.',
        priceEgp: '349.00',
        discountPercent: 20,
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'PUNISHING DARK FANTASY COMBAT',
                  description: 'Face terrifying shadow leviathans and master precise parry mechanics in a grim, decaying realm.',
                },
              ],
            },
          },
        },
        tagSlugs: ['action', 'rpg'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Starlight Horizon',
        slug: 'starlight-horizon',
        shortDescription: 'Deep space exploration and colony building simulator.',
        fullDescription: 'Build galactic trade routes, manage resource supply chains, and establish thriving orbital colonies in vast star systems.',
        priceEgp: '599.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'GALACTIC TRADE & COLONY EXPANSION',
                  description: 'Construct orbital space stations, mine asteroid belts for rare minerals, and expand interstellar civilization.',
                },
              ],
            },
          },
        },
        tagSlugs: ['simulation', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Desert Racer X',
        slug: 'desert-racer-x',
        shortDescription: 'High-speed off-road racing across treacherous sand dunes.',
        fullDescription: 'Customize buggy vehicles, master extreme drift physics, and compete in multiplayer sand dune rallies.',
        priceEgp: '149.99',
        discountPercent: 5,
        bannerUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'TREACHEROUS SAND DUNE RALLIES',
                  description: 'Custom-tune dune buggies and conquer shifting desert sands in high-octane multiplayer rally tournaments.',
                },
              ],
            },
          },
        },
        tagSlugs: ['racing', 'sports'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Pixel Dungeon Quest',
        slug: 'pixel-dungeon-quest',
        shortDescription: 'Charming retro pixel-art roguelike dungeon crawler.',
        fullDescription: 'Explore procedurally generated dungeons, collect hundreds of unique artifacts, and slay whimsical monsters.',
        priceEgp: '79.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'PROCEDURAL DUNGEON EXPLORATION',
                  description: 'Delve into infinite retro dungeons filled with deadly traps, magical relics, and epic boss loot.',
                },
              ],
            },
          },
        },
        tagSlugs: ['indie', 'rpg', 'puzzle'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Cyber City 2099',
        slug: 'cyber-city-2099',
        shortDescription: 'Gritty open-world detective adventure in a neon-lit metropolis.',
        fullDescription: 'Investigate corporate espionage, hack security networks, and decide the fate of a sprawling cyberpunk city.',
        priceEgp: '399.99',
        discountPercent: 25,
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'CORPORATE DETECTIVE INVESTIGATIONS',
                  description: 'Uncover dark secrets in a dystopian megacity where cybernetic augmentation holds the key to power.',
                },
              ],
            },
          },
        },
        tagSlugs: ['action', 'cyberpunk'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Mythic Kingdoms',
        slug: 'mythic-kingdoms',
        shortDescription: 'Grand strategy empire builder with legendary hero units.',
        fullDescription: 'Expand your realm, engage in deep diplomacy, and lead mythical hero armies into massive real-time battlefields.',
        priceEgp: '499.00',
        discountPercent: 10,
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'GRAND EMPIRE DIPLOMACY & CONQUEST',
                  description: 'Form royal alliances, forge trade pacts, and deploy mythical heroes across sprawling strategic maps.',
                },
              ],
            },
          },
        },
        tagSlugs: ['strategy', 'rpg'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Cosmic Voyage',
        slug: 'cosmic-voyage',
        shortDescription: 'Relaxing space travel and planet discovery simulator.',
        fullDescription: 'Pilot atmospheric starships, catalog alien flora and fauna, and enjoy a meditative journey across uncharted worlds.',
        priceEgp: '249.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'MEDITATIVE UNCHARTED PLANET EXPLORATION',
                  description: 'Soar through peaceful celestial biomes, record alien species, and craft atmospheric starship upgrades.',
                },
              ],
            },
          },
        },
        tagSlugs: ['adventure', 'simulation'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Ancient Legends',
        slug: 'ancient-legends',
        shortDescription: 'Mythological action adventure inspired by ancient folklore.',
        fullDescription: 'Wield divine weapons, solve mystical environmental puzzles, and battle legendary beasts from ancient lore.',
        priceEgp: '299.00',
        discountPercent: 15,
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'DIVINE WEAPONS & MYSTICAL PUZZLES',
                  description: 'Unlock celestial combat techniques, solve temple trials, and conquer mythological titans.',
                },
              ],
            },
          },
        },
        tagSlugs: ['rpg', 'action'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Velocity Drift',
        slug: 'velocity-drift',
        shortDescription: 'Arcade street racing with precision drifting mechanics.',
        fullDescription: 'Tune custom sports cars, dominate night-time street circuits, and climb online global leaderboard ranks.',
        priceEgp: '129.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'PRECISION DRIFTING & NIGHT CIRCUITS',
                  description: 'Fine-tune engine torque, master hair-pin turns, and dominate underground night street racing tournaments.',
                },
              ],
            },
          },
        },
        tagSlugs: ['racing', 'sports'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Brain Teaser Extreme',
        slug: 'brain-teaser-extreme',
        shortDescription: 'Mind-bending physics puzzle game with creative level editor.',
        fullDescription: 'Solve over 200 handcrafted physics puzzles and share custom levels with an active global community.',
        priceEgp: '49.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'PHYSICS PUZZLES & LEVEL CREATION',
                  description: 'Engineered for puzzle enthusiasts—create complex mechanical contraptions and share custom challenges worldwide.',
                },
              ],
            },
          },
        },
        tagSlugs: ['puzzle', 'indie'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Stealth Assassin',
        slug: 'stealth-assassin',
        shortDescription: 'Tactical stealth action game with complete player freedom.',
        fullDescription: 'Plan complex infiltrations, utilize shadow disguises, and eliminate targets without raising alarms.',
        priceEgp: '319.99',
        discountPercent: 10,
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'TACTICAL INFILTRATION & SHADOW STEALTH',
                  description: 'Execute ghost-level stealth missions with custom silent gadgetry and complete strategic player choice.',
                },
              ],
            },
          },
        },
        tagSlugs: ['action', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Space Colony Sim',
        slug: 'space-colony-sim',
        shortDescription: 'Manage life support and economic production on alien moons.',
        fullDescription: 'Design modular habitats, balance oxygen supply, and protect colonists from harsh planetary environments.',
        priceEgp: '379.50',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'MODULAR HABITATS & LIFE SUPPORT MANAGEMENT',
                  description: 'Engineer atmospheric domes, regulate power grids, and safeguard colonists against alien solar flares.',
                },
              ],
            },
          },
        },
        tagSlugs: ['simulation', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Dragon Slayer Chronicles',
        slug: 'dragon-slayer-chronicles',
        shortDescription: 'Third-person action RPG with giant monster hunting.',
        fullDescription: 'Craft elemental armors, forge colossal blades, and track down elder dragons across vast open biomes.',
        priceEgp: '549.99',
        discountPercent: 30,
        bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'ELDER DRAGON HUNTING',
                  description: 'Track winged leviathans through fiery volcanic peaks and frozen tundra, target vulnerable elemental scales, and craft legendary weapons.',
                },
              ],
            },
          },
        },
        tagSlugs: ['rpg', 'action'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Free Runner City',
        slug: 'free-runner-city',
        shortDescription: 'Fast-paced parkour platformer across skyscraper rooftops.',
        fullDescription: 'Flow through dynamic urban environments, string together acrobatic tricks, and outrun security drones.',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
        status: 'published',
        pageTheme: {
          theme: 'default',
          layout: {
            gameAbout: {
              sections: [
                {
                  title: 'HIGH-ALTITUDE URBAN PARKOUR',
                  description: 'Leap across vertigo-inducing rooftops, wall-run past laser barriers, and master momentum fluid movement.',
                },
              ],
            },
          },
        },
        tagSlugs: ['indie', 'action'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Quantum Breakthrough',
        slug: 'quantum-breakthrough',
        shortDescription: 'Unreleased quantum physics puzzle game currently in active testing.',
        fullDescription: 'Manipulate subatomic particles to solve temporal paradoxes.',
        priceEgp: '199.00',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        pageTheme: { theme: 'default', layout: { gameAbout: { sections: [{ title: 'QUANTUM MECHANICS', description: 'Manipulate temporal particles in subatomic puzzle environments.' }] } } },
        tagSlugs: ['indie', 'puzzle'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Prototype Arena',
        slug: 'prototype-arena',
        shortDescription: 'Internal combat sandbox prototype.',
        fullDescription: 'Experimental weapons testbed for upcoming combat mechanics.',
        priceEgp: '99.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        pageTheme: { theme: 'default', layout: { gameAbout: { sections: [{ title: 'EXPERIMENTAL COMBAT', description: 'Sandbox arena for testing next-generation weapon physics.' }] } } },
        tagSlugs: ['action', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Banned Shooter Z',
        slug: 'banned-shooter-z',
        shortDescription: 'Suspended title undergoing content review.',
        fullDescription: 'This title is temporarily suspended from public catalog listing.',
        priceEgp: '299.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        status: 'suspended',
        pageTheme: { theme: 'default', layout: { gameAbout: { sections: [{ title: 'RESTRICTED CONTENT', description: 'Under active moderation review.' }] } } },
        tagSlugs: ['action', 'cyberpunk'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Unannounced Project X',
        slug: 'unannounced-project-x',
        shortDescription: 'Top-secret unannounced RPG project.',
        fullDescription: 'Classified development build.',
        priceEgp: '699.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        status: 'draft',
        pageTheme: { theme: 'default', layout: { gameAbout: { sections: [{ title: 'CLASSIFIED PROJECT', description: 'Secret RPG development build.' }] } } },
        tagSlugs: ['rpg', 'strategy'],
      },
      {
        creatorId: DEMO_CREATOR_ID,
        title: 'Archived Demo V1',
        slug: 'archived-demo-v1',
        shortDescription: 'Legacy prototype build removed from active listing.',
        fullDescription: 'Archived initial tech demo.',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        status: 'suspended',
        pageTheme: { theme: 'default', layout: { gameAbout: { sections: [{ title: 'LEGACY ARCHIVE', description: 'Archived early tech demo build.' }] } } },
        tagSlugs: ['indie'],
      },
    ];

    for (const gameData of demoGames) {
      const { tagSlugs, ...gameValues } = gameData;

      const [insertedGame] = await catalogDb
        .insert(games)
        .values(gameValues)
        .onConflictDoUpdate({
          target: games.slug,
          set: {
            title: sql`EXCLUDED.title`,
            shortDescription: sql`EXCLUDED.short_description`,
            fullDescription: sql`EXCLUDED.full_description`,
            priceEgp: sql`EXCLUDED.price_egp`,
            discountPercent: sql`EXCLUDED.discount_percent`,
            bannerUrl: sql`EXCLUDED.banner_url`,
            pageTheme: sql`EXCLUDED.page_theme`,
            status: sql`EXCLUDED.status`,
          },
        })
        .returning();

      const targetGameId = insertedGame?.id || (
        await catalogDb.query.games.findFirst({
          where: eq(games.slug, gameValues.slug),
        })
      )?.id;

      if (targetGameId) {
        for (const tagSlug of tagSlugs) {
          const tagId = seededTags[tagSlug];
          if (tagId) {
            await catalogDb
              .insert(gameTags)
              .values({ gameId: targetGameId, tagId })
              .onConflictDoNothing();
          }
        }
      }
    }

    console.log('Catalog database seeding completed successfully with 22 demo games and custom pageThemes!');
  } catch (error) {
    console.error('Error during catalog database seeding:', error);
    process.exitCode = 1;
  } finally {
    await catalogPool.end();
  }
}

void seed();
