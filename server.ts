import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import {
  User,
  Listing,
  Order,
  ChatMessage,
  ChatConversation,
  VerificationRequest,
  Report,
  AdminStats,
} from "./src/types";

const app = express();
const PORT = 3000;

// Lazy initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "RAY SHOP Marketplace" });
});

// Persistent Data Storage Path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "marketplace-data.json");

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  orders: Order[];
  chats: ChatConversation[];
  messages: ChatMessage[];
  verificationRequests: VerificationRequest[];
  reports: Report[];
}

// Initial realistic Free Fire gaming seed data
const initialSeedData: DatabaseSchema = {
  users: [
    {
      id: "user_admin",
      username: "RAY_Admin",
      email: "admin@rayshop.gg",
      phone: "+1 800 729 7467",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-10T10:00:00.000Z",
      isVerifiedSeller: true,
      verificationStatus: "approved",
      role: "admin",
      totalSales: 312,
      rating: 5.0,
      bio: "Official RAY SHOP Marketplace Safety & Escrow Administrator",
      freeFireUid: "1000000001",
    },
    {
      id: "user_seller_rayfire",
      username: "RayFire_Official",
      email: "seller@rayshop.gg",
      phone: "+1 555 342 9871",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-02-14T12:00:00.000Z",
      isVerifiedSeller: true,
      verificationStatus: "approved",
      role: "seller",
      totalSales: 184,
      rating: 4.96,
      bio: "Trusted Free Fire Seller since Season 2. 100% clean Google & Facebook binds. Instant handover via RAY Escrow.",
      freeFireUid: "2847193821",
    },
    {
      id: "user_seller_nexus",
      username: "NexusFF_Accounts",
      email: "nexus@gamestore.io",
      phone: "+1 555 873 2190",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-03-01T09:30:00.000Z",
      isVerifiedSeller: true,
      verificationStatus: "approved",
      role: "seller",
      totalSales: 96,
      rating: 4.92,
      bio: "Max Evo Guns specialist. Indonesian & NA region accounts with rare criminal bundles.",
      freeFireUid: "1928374650",
    },
    {
      id: "user_buyer_shadow",
      username: "ShadowSniper_99",
      email: "buyer@gmail.com",
      phone: "+1 555 901 4422",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-04-12T15:20:00.000Z",
      isVerifiedSeller: false,
      verificationStatus: "none",
      role: "buyer",
      totalSales: 0,
      rating: 5.0,
      bio: "Competitive Free Fire player searching for maxed Evo gun accounts in NA/BR regions.",
      freeFireUid: "8839201948",
    },
    {
      id: "user_applicant_kai",
      username: "KaiZenith_FF",
      email: "kaizenith@outlook.com",
      phone: "+1 555 671 0029",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-05-18T11:15:00.000Z",
      isVerifiedSeller: false,
      verificationStatus: "pending",
      role: "buyer",
      totalSales: 0,
      rating: 5.0,
      bio: "Long-time esports player applying for verified merchant badge.",
      freeFireUid: "3748291047",
    },
  ],
  listings: [
    {
      id: "list_ff_101",
      sellerId: "user_seller_rayfire",
      sellerUsername: "RayFire_Official",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      sellerRating: 4.96,
      sellerSales: 184,
      title: "Grandmaster Lv.78 | 7 Evo Guns Max (Draco + Cobra) | Sakura & Hip Hop Bundles",
      price: 185,
      description: "Elite tier competitive Free Fire account. Level 78 with over 4,500 likes. Features 7 MAXED Level 7 Evo Guns including AK-47 Blue Flame Draco, MP40 Predatory Cobra, M1014 Green Flame Draco, and SCAR Megalodon Alpha. Includes ultra-rare Season 1 Sakura Bundle and Season 2 Hip Hop Bundle. Clean Google login with no 3rd-party strikes. Immediate delivery upon escrow confirmation.",
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80"
      ],
      level: 78,
      rank: "Grandmaster",
      region: "North America",
      evoGuns: [
        "AK47 Blue Flame Draco (Max Lv.7)",
        "MP40 Predatory Cobra (Max Lv.7)",
        "M1014 Green Flame Draco (Max Lv.7)",
        "SCAR Megalodon Alpha (Max Lv.7)",
        "XM8 Destiny Guardian (Lv.6)"
      ],
      exclusiveItems: [
        "Season 1 Sakura Bundle",
        "Season 2 Hip Hop Bundle",
        "Red Criminal Bundle",
        "Arctic Blue Outfit",
        "Alok & Chrono Max Skills"
      ],
      bindType: "Google",
      badgesCount: 520,
      likesCount: 4890,
      status: "active",
      featured: true,
      createdAt: "2024-05-20T14:30:00.000Z",
      viewsCount: 342,
    },
    {
      id: "list_ff_102",
      sellerId: "user_seller_nexus",
      sellerUsername: "NexusFF_Accounts",
      sellerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      sellerRating: 4.92,
      sellerSales: 96,
      title: "Heroic Tier Lv.71 | Red Criminal Bundle + Arctic Blue | 5 Evo Guns | All S1-S8 Passes",
      price: 135,
      description: "Collector edition account. Level 71, Heroic Rank in both Battle Royale and Clash Squad. Complete Red Criminal package with Arctic Blue bundle and Breakdancer set. 5 Evo weapons with custom kill effects and emotes. Facebook bind ready to change to your own email/phone number safely.",
      images: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80"
      ],
      level: 71,
      rank: "Heroic",
      region: "Brazil",
      evoGuns: [
        "MP40 Predatory Cobra (Lv.7 Max)",
        "M1014 Green Flame (Lv.6)",
        "UMP Booyah Day (Lv.5)",
        "M4A1 Infernal Draco (Lv.5)"
      ],
      exclusiveItems: [
        "Original Red Criminal",
        "Arctic Blue Set",
        "Breakdancer Bundle",
        "Shadow Earthshaker",
        "Old Elite Passes S1-S8"
      ],
      bindType: "Facebook",
      badgesCount: 380,
      likesCount: 3200,
      status: "active",
      featured: true,
      createdAt: "2024-05-22T08:15:00.000Z",
      viewsCount: 280,
    },
    {
      id: "list_ff_103",
      sellerId: "user_seller_rayfire",
      sellerUsername: "RayFire_Official",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      sellerRating: 4.96,
      sellerSales: 184,
      title: "Master Tier Lv.69 | M1014 Green Flame Draco Max | Golden Shade + Poker MP40",
      price: 95,
      description: "Super clean smurf and tournament account. Level 69 with Master rank star badges. Fully upgraded M1014 shotgun that obliterates lobbies in CS mode. Includes Yellow & Flashing Spade Poker MP40, Golden Shade, and Angelic Pants. Bound cleanly to Google.",
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80"
      ],
      level: 69,
      rank: "Master",
      region: "Indonesia",
      evoGuns: [
        "M1014 Green Flame Draco (Max Lv.7)",
        "Poker MP40 Flashing Spade",
        "AK47 Blue Flame (Lv.4)"
      ],
      exclusiveItems: [
        "Golden Shade Bundle",
        "Angelic Blue Pants (Rare)",
        "Grave Digger Emote",
        "Zombie Samurai Mask"
      ],
      bindType: "Google",
      badgesCount: 240,
      likesCount: 2150,
      status: "active",
      featured: false,
      createdAt: "2024-05-23T19:40:00.000Z",
      viewsCount: 195,
    },
    {
      id: "list_ff_104",
      sellerId: "user_seller_nexus",
      sellerUsername: "NexusFF_Accounts",
      sellerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      sellerRating: 4.92,
      sellerSales: 96,
      title: "Diamond IV Smurf Lv.58 | Yellow Criminal + Bunny Warrior | NA Server | Instant Delivery",
      price: 65,
      description: "Budget powerhouse! Level 58 account with legendary Yellow Criminal bundle, Bunny Warrior outfit, and Level 4 Draco AK. High KD ratio (4.2 in Ranked). Fast clean delivery with 24/7 support.",
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
      ],
      level: 58,
      rank: "Diamond",
      region: "North America",
      evoGuns: [
        "AK47 Blue Flame Draco (Lv.4)",
        "MP40 Royal Flush"
      ],
      exclusiveItems: [
        "Yellow Criminal Bundle",
        "Bunny Warrior Outfit",
        "Throne Emote"
      ],
      bindType: "Clean (Unbound)",
      badgesCount: 190,
      likesCount: 1420,
      status: "active",
      featured: false,
      createdAt: "2024-05-24T10:00:00.000Z",
      viewsCount: 140,
    },
    {
      id: "list_ff_105",
      sellerId: "user_seller_rayfire",
      sellerUsername: "RayFire_Official",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      sellerRating: 4.96,
      sellerSales: 184,
      title: "Grandmaster God Account Lv.84 | 12 Evo Guns MAX | S1 Sakura + Hip Hop + All Criminals",
      price: 340,
      description: "The ultimate collector account in the entire community. 12 Evo guns fully maxed at Level 7 with exclusive lobby emotes and kill banners. All 5 Criminal sets (Red, Blue, Yellow, Purple, Green). 15,000+ likes. Guaranteed secure transaction via RAY SHOP Escrow.",
      images: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
      ],
      level: 84,
      rank: "Grandmaster",
      region: "Singapore",
      evoGuns: [
        "AK47 Draco (Max Lv.7)",
        "MP40 Cobra (Max Lv.7)",
        "M1014 Green Flame (Max Lv.7)",
        "SCAR Megalodon (Max Lv.7)",
        "XM8 Guardian (Max Lv.7)",
        "M4A1 Infernal (Max Lv.7)",
        "Famas Demonic (Max Lv.7)",
        "Thompson Cindered (Max Lv.7)"
      ],
      exclusiveItems: [
        "All 5 Criminal Bundles (Red, Blue, Yellow, Purple, Green)",
        "Season 1 Sakura + Season 2 Hip Hop",
        "Titan SCAR",
        "Angelic Blue & Red Pants",
        "Push Up & Flag Emotes"
      ],
      bindType: "Google",
      badgesCount: 890,
      likesCount: 15400,
      status: "active",
      featured: true,
      createdAt: "2024-05-25T07:20:00.000Z",
      viewsCount: 512,
    },
  ],
  orders: [
    {
      id: "RAY-88421",
      listingId: "list_ff_103",
      listingTitle: "Master Tier Lv.69 | M1014 Green Flame Draco Max | Golden Shade",
      listingImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      price: 95,
      buyerFee: 4.75,
      totalAmount: 99.75,
      buyerId: "user_buyer_shadow",
      buyerUsername: "ShadowSniper_99",
      buyerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      sellerId: "user_seller_rayfire",
      sellerUsername: "RayFire_Official",
      sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      sellerIsVerified: true,
      status: "Processing",
      paymentMethod: "RAY Escrow Protection",
      createdAt: "2024-05-25T14:10:00.000Z",
      chatId: "chat_order_88421",
      credentialsDelivered: true,
    },
  ],
  chats: [
    {
      id: "chat_order_88421",
      participantIds: ["user_buyer_shadow", "user_seller_rayfire"],
      participants: {
        user_buyer_shadow: {
          username: "ShadowSniper_99",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          isVerified: false,
        },
        user_seller_rayfire: {
          username: "RayFire_Official",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          isVerified: true,
        },
      },
      orderId: "RAY-88421",
      orderStatus: "Processing",
      listingId: "list_ff_103",
      listingTitle: "Master Tier Lv.69 | M1014 Green Flame Draco Max",
      listingPrice: 95,
      listingImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      lastMessage: "I've sent the Google transfer verification code to your phone!",
      lastMessageAt: "2024-05-25T14:22:00.000Z",
      unreadCounts: {
        user_buyer_shadow: 1,
        user_seller_rayfire: 0,
      },
    },
  ],
  messages: [
    {
      id: "msg_1",
      chatId: "chat_order_88421",
      senderId: "system",
      senderUsername: "RAY Escrow Bot",
      senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
      text: "🛡️ Order RAY-88421 started! Buyer payment of $99.75 is secured in RAY Escrow. Seller RayFire_Official has been notified to deliver account credentials.",
      createdAt: "2024-05-25T14:10:05.000Z",
      isSystem: true,
    },
    {
      id: "msg_2",
      chatId: "chat_order_88421",
      senderId: "user_buyer_shadow",
      senderUsername: "ShadowSniper_99",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text: "Hi RayFire, I just paid! Ready to link the Google login to my recovery email.",
      createdAt: "2024-05-25T14:12:30.000Z",
    },
    {
      id: "msg_3",
      chatId: "chat_order_88421",
      senderId: "user_seller_rayfire",
      senderUsername: "RayFire_Official",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      text: "Hello Shadow! Thanks for purchasing. I have initiated the Google Account transfer. Check your Google prompt.",
      createdAt: "2024-05-25T14:16:10.000Z",
    },
    {
      id: "msg_4",
      chatId: "chat_order_88421",
      senderId: "user_seller_rayfire",
      senderUsername: "RayFire_Official",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      text: "I've sent the Google transfer verification code to your phone!",
      createdAt: "2024-05-25T14:22:00.000Z",
    },
  ],
  verificationRequests: [
    {
      id: "vr_kai_01",
      userId: "user_applicant_kai",
      username: "KaiZenith_FF",
      email: "kaizenith@outlook.com",
      phone: "+1 555 671 0029",
      reasonLetter: "I am a reputable competitive Free Fire player seeking to sell verified Lv.60+ smurf accounts under safe escrow.",
      freeFireUid: "3748291047",
      idDocumentType: "Government National ID & In-Game Profile Proof",
      proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
      sellerExperience: "Competitive player with 4 years experience. Verified merchant on Discord & Facebook Free Fire trade groups.",
      status: "pending",
      submittedAt: "2024-05-24T16:45:00.000Z",
    },
  ],
  reports: [
    {
      id: "rep_01",
      reporterId: "user_buyer_shadow",
      reporterUsername: "ShadowSniper_99",
      targetType: "listing",
      targetId: "list_ff_104",
      targetTitle: "Diamond IV Smurf Lv.58",
      reason: "Suspicion of incorrect bind description",
      details: "Checking if the email is completely detached from the previous owner's recovery phone.",
      status: "pending",
      createdAt: "2024-05-25T09:12:00.000Z",
    },
  ],
};

// Database persistence helpers
function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedData, null, 2), "utf-8");
      return initialSeedData;
    }
  } catch (err) {
    console.error("Error reading database, falling back to seed data:", err);
    return initialSeedData;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

let db: DatabaseSchema = loadDatabase();

// SSE Real-time clients manager
interface SSEClient {
  id: string;
  userId?: string;
  res: Response;
}

const sseClients: Map<string, SSEClient> = new Map();

function broadcastEvent(eventType: string, payload: any, targetUserIds?: string[]) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    if (
      !targetUserIds ||
      (client.userId && targetUserIds.includes(client.userId))
    ) {
      try {
        client.res.write(message);
      } catch (e) {
        // Client may have disconnected
      }
    }
  });
}

// Password encryption & validation helpers (scrypt + random salt)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

function sanitizeUser(user: any): User {
  if (!user) return user;
  const { passwordHash, ...safeUser } = user;
  return safeUser as User;
}

// Authentication middleware
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  const user = db.users.find((u) => u.id === token || u.email === token || u.username === token);
  return user ? sanitizeUser(user) : null;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// SSE Real-time stream endpoint
app.get("/api/realtime/stream", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || undefined;
  const clientId = crypto.randomUUID();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  sseClients.set(clientId, { id: clientId, userId, res });

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);

  // Heartbeat to keep connection alive
  const interval = setInterval(() => {
    try {
      res.write(`event: ping\ndata: ${Date.now()}\n\n`);
    } catch {
      clearInterval(interval);
      sseClients.delete(clientId);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(interval);
    sseClients.delete(clientId);
  });
});

// Auth Routes
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { username, email, phone, freeFireUid, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() ||
      u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: "A user with this username or email already exists" });
  }

  const passwordHash = hashPassword(password);

  const newUser: User = {
    id: `user_${crypto.randomUUID().slice(0, 8)}`,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || "",
    freeFireUid: freeFireUid?.trim() || "",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
    createdAt: new Date().toISOString(),
    isVerifiedSeller: false,
    verificationStatus: "none",
    role: "buyer",
    totalSales: 0,
    rating: 5.0,
    passwordHash,
  };

  db.users.push(newUser);
  saveDatabase(db);

  broadcastEvent("user:new", { user: sanitizeUser(newUser) });
  return res.json({ user: sanitizeUser(newUser), token: newUser.id });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/email and password are required" });
  }

  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === identifier.toLowerCase().trim() ||
      u.username.toLowerCase() === identifier.toLowerCase().trim() ||
      u.phone === identifier.trim()
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username/email or password" });
  }

  if (user.passwordHash) {
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: "This account has been suspended for violating marketplace rules." });
  }

  return res.json({ user: sanitizeUser(user), token: user.id });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ user });
});

// Update User Profile (Avatar photo, phone, Free Fire UID, bio)
app.patch("/api/user/profile", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const { avatar, phone, freeFireUid, bio } = req.body;
  if (avatar && typeof avatar === "string") {
    dbUser.avatar = avatar;

    // Synchronize avatar across all of this user's active listings
    db.listings.forEach((l) => {
      if (l.sellerId === dbUser.id) {
        l.sellerAvatar = dbUser.avatar;
      }
    });

    // Synchronize avatar in active chats
    db.chats.forEach((c) => {
      if (c.participants && c.participants[dbUser.id]) {
        c.participants[dbUser.id].avatar = dbUser.avatar;
      }
    });

    // Synchronize avatar in chat messages
    db.messages.forEach((m) => {
      if (m.senderId === dbUser.id) {
        m.senderAvatar = dbUser.avatar;
      }
    });
  }

  if (phone !== undefined) dbUser.phone = phone;
  if (freeFireUid !== undefined) dbUser.freeFireUid = freeFireUid;
  if (bio !== undefined) dbUser.bio = bio;

  saveDatabase(db);
  const updatedUser = sanitizeUser(dbUser);
  broadcastEvent("user:updated", { user: updatedUser }, [dbUser.id]);
  return res.json({ user: updatedUser, message: "Profile picture updated successfully!" });
});

// Secret Master Admin Terminal Access
app.post("/api/admin/secret-access", (req: Request, res: Response) => {
  const { secretPin } = req.body;
  const pin = (secretPin || "").trim().toUpperCase();
  if (pin !== "RAYADMIN999" && pin !== "4040" && pin !== "RAY40K") {
    return res.status(403).json({ error: "Access Denied: Invalid Security Override PIN" });
  }

  let adminUser = db.users.find((u) => u.role === "admin");
  if (!adminUser) {
    adminUser = {
      id: "user_admin",
      username: "RAY_MasterAdmin",
      email: "admin@rayshop.gg",
      phone: "+234 800 729 7467",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      isVerifiedSeller: true,
      verificationStatus: "approved",
      role: "admin",
      totalSales: 312,
      rating: 5.0,
      bio: "Official RAY SHOP Marketplace Safety & Escrow Master Administrator",
    };
    db.users.push(adminUser);
    saveDatabase(db);
  }

  return res.json({
    success: true,
    user: sanitizeUser(adminUser),
    token: adminUser.id,
  });
});

// Public Demo Users endpoint (Admin excluded to keep invisible)
app.get("/api/auth/demo-users", (req: Request, res: Response) => {
  return res.json({ users: [] });
});

// Listings Routes
app.get("/api/listings", (req: Request, res: Response) => {
  const { search, region, rank, minPrice, maxPrice, minLevel, sort, sellerId } = req.query;

  let filtered = db.listings.filter((l) => l.status === "active" || l.status === "sold");

  if (sellerId) {
    filtered = db.listings.filter((l) => l.sellerId === sellerId);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.evoGuns.some((g) => g.toLowerCase().includes(q)) ||
        l.exclusiveItems.some((i) => i.toLowerCase().includes(q)) ||
        l.sellerUsername.toLowerCase().includes(q)
    );
  }

  if (region && region !== "all") {
    filtered = filtered.filter((l) => l.region.toLowerCase() === (region as string).toLowerCase());
  }

  if (rank && rank !== "all") {
    filtered = filtered.filter((l) => l.rank.toLowerCase() === (rank as string).toLowerCase());
  }

  if (minPrice) {
    filtered = filtered.filter((l) => l.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((l) => l.price <= Number(maxPrice));
  }

  if (minLevel) {
    filtered = filtered.filter((l) => l.level >= Number(minLevel));
  }

  // Sorting
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "level-desc") {
    filtered.sort((a, b) => b.level - a.level);
  } else {
    // latest
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ listings: filtered, total: filtered.length });
});

app.get("/api/listings/:id", (req: Request, res: Response) => {
  const listing = db.listings.find((l) => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  listing.viewsCount = (listing.viewsCount || 0) + 1;
  saveDatabase(db);
  return res.json({ listing });
});

app.post("/api/listings", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // CORE RULE: Only verified sellers can publish listings!
  if (!user.isVerifiedSeller && user.role !== "admin") {
    return res.status(403).json({
      error: "Seller Verification Required",
      message: "Only verified sellers can create account listings. Please submit a verification request in your profile.",
      requiresVerification: true,
    });
  }

  const {
    title,
    price,
    description,
    images,
    level,
    rank,
    region,
    evoGuns,
    exclusiveItems,
    bindType,
  } = req.body;

  if (!title || !price || !level || !rank || !region) {
    return res.status(400).json({ error: "Missing required listing fields" });
  }

  const newListing: Listing = {
    id: `list_ff_${Date.now()}`,
    sellerId: user.id,
    sellerUsername: user.username,
    sellerAvatar: user.avatar,
    sellerIsVerified: user.isVerifiedSeller,
    sellerRating: user.rating,
    sellerSales: user.totalSales,
    title,
    price: Number(price),
    description: description || "No description provided",
    images: images && images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
    ],
    level: Number(level),
    rank,
    region,
    evoGuns: Array.isArray(evoGuns) ? evoGuns : [],
    exclusiveItems: Array.isArray(exclusiveItems) ? exclusiveItems : [],
    bindType: bindType || "Google",
    status: "active",
    featured: false,
    createdAt: new Date().toISOString(),
    viewsCount: 1,
  };

  db.listings.unshift(newListing);
  saveDatabase(db);

  broadcastEvent("listing:new", { listing: newListing });
  return res.status(201).json({ listing: newListing });
});

app.put("/api/listings/:id", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const listing = db.listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  if (listing.sellerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized to edit this listing" });
  }

  Object.assign(listing, req.body);
  saveDatabase(db);

  broadcastEvent("listing:updated", { listing });
  return res.json({ listing });
});

app.delete("/api/listings/:id", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const index = db.listings.findIndex((l) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Listing not found" });

  const listing = db.listings[index];
  if (listing.sellerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized to delete this listing" });
  }

  db.listings.splice(index, 1);
  saveDatabase(db);

  broadcastEvent("listing:deleted", { id: req.params.id });
  return res.json({ success: true, message: "Listing deleted" });
});

// Verification Requests Routes - Requirements: Phone number, Email address, NO NIN, and a reasonable letter of intent
app.post("/api/verification/request", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { phone, email, reasonLetter } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required for verification." });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email address is required for verification." });
  }

  if (!reasonLetter || reasonLetter.trim().length < 15) {
    return res.status(400).json({
      error: "Please provide a reasonable letter explaining why you want to be verified as a trusted seller.",
    });
  }

  // Update existing or create new
  const existingIndex = db.verificationRequests.findIndex(
    (vr) => vr.userId === user.id && vr.status === "pending"
  );
  if (existingIndex !== -1) {
    return res.status(400).json({ error: "You already have a verification request under review." });
  }

  const newRequest: VerificationRequest = {
    id: `vr_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    username: user.username,
    email: email.trim(),
    phone: phone.trim(),
    reasonLetter: reasonLetter.trim(),
    noNinNotice: "No NIN required - verified via phone, email, and letter of intent",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  db.verificationRequests.unshift(newRequest);
  user.phone = phone.trim();
  user.email = email.trim();
  user.verificationStatus = "pending";
  saveDatabase(db);

  broadcastEvent("verification:new", { request: newRequest });
  return res.status(201).json({ request: newRequest, user });
});

app.get("/api/verification/my-status", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const request = db.verificationRequests.find((vr) => vr.userId === user.id);
  return res.json({
    status: user.verificationStatus,
    isVerifiedSeller: user.isVerifiedSeller,
    request: request || null,
  });
});

// Orders & Purchases Flow (Naira ₦, PalmPay & OPay with Mandatory Transfer Receipt)
app.post("/api/orders", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { listingId, paymentMethod, accountNumberPaid, receiptUrl, receiptNotes } = req.body;
  const listing = db.listings.find((l) => l.id === listingId);

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.status === "sold") {
    return res.status(400).json({ error: "This listing has already been sold" });
  }

  if (listing.sellerId === user.id) {
    return res.status(400).json({ error: "You cannot purchase your own listing" });
  }

  // Payment method validation: OPay or PalmPay
  const validMethod: 'OPay' | 'PalmPay' =
    paymentMethod === "PalmPay" ? "PalmPay" : "OPay";

  // Designated Account numbers provided by user:
  // PalmPay: 7067252385
  // OPay: 8081885757
  const officialAccount = validMethod === "PalmPay" ? "7067252385" : "8081885757";

  if (!receiptUrl || !receiptUrl.trim()) {
    return res.status(400).json({
      error: "Payment receipt is mandatory. Please upload your transfer receipt before placing the order.",
    });
  }

  const orderId = `RAY-${Math.floor(10000 + Math.random() * 90000)}`;
  const chatId = `chat_order_${orderId.replace("RAY-", "")}`;

  // Naira pricing without artificial markup
  const buyerFee = 0;
  const totalAmount = listing.price;

  const newOrder: Order = {
    id: orderId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0] || "",
    price: listing.price,
    buyerFee,
    totalAmount,
    buyerId: user.id,
    buyerUsername: user.username,
    buyerAvatar: user.avatar,
    sellerId: listing.sellerId,
    sellerUsername: listing.sellerUsername,
    sellerAvatar: listing.sellerAvatar,
    sellerIsVerified: listing.sellerIsVerified,
    status: "Pending",
    paymentMethod: validMethod,
    accountNumberPaid: accountNumberPaid || officialAccount,
    receiptUrl: receiptUrl.trim(),
    receiptNotes: receiptNotes || "",
    receiptUploadedAt: new Date().toISOString(),
    sellerApproved: false,
    createdAt: new Date().toISOString(),
    chatId,
    credentialsDelivered: false,
  };

  // Mark listing as reserved/sold
  listing.status = "sold";

  // Create dedicated Chat for this transaction
  const newChat: ChatConversation = {
    id: chatId,
    participantIds: [user.id, listing.sellerId],
    participants: {
      [user.id]: {
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerifiedSeller,
      },
      [listing.sellerId]: {
        username: listing.sellerUsername,
        avatar: listing.sellerAvatar,
        isVerified: listing.sellerIsVerified,
      },
    },
    orderId,
    orderStatus: "Pending",
    listingId: listing.id,
    listingTitle: listing.title,
    listingPrice: listing.price,
    listingImage: listing.images[0] || "",
    lastMessage: `🛡️ New Escrow Order #${orderId} opened for ₦${totalAmount.toLocaleString()} via ${validMethod}!`,
    lastMessageAt: new Date().toISOString(),
    unreadCounts: {
      [user.id]: 0,
      [listing.sellerId]: 1,
    },
  };

  // Automated first system notification message with explicit seller instructions
  const systemMsg: ChatMessage = {
    id: `msg_${Date.now()}_sys`,
    chatId,
    senderId: "system",
    senderUsername: "RAY Escrow Safeguard",
    senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    text: `🛡️ Order #${orderId} placed for ₦${totalAmount.toLocaleString()} via ${validMethod} (${officialAccount}). Buyer @${user.username} has attached their payment receipt. Seller @${listing.sellerUsername}, please inspect the receipt and press "Approve / Seen" before delivering login credentials.`,
    createdAt: new Date().toISOString(),
    isSystem: true,
  };

  db.orders.unshift(newOrder);
  db.chats.unshift(newChat);
  db.messages.push(systemMsg);
  saveDatabase(db);

  // Broadcast to buyer and seller
  broadcastEvent("order:new", { order: newOrder }, [user.id, listing.sellerId]);
  broadcastEvent("chat:new", { chat: newChat }, [user.id, listing.sellerId]);
  broadcastEvent("listing:updated", { listing });

  return res.status(201).json({ order: newOrder, chatId });
});

// Seller / Admin Approves & Acknowledges Receipt -> Moves order to Confirmed
app.patch("/api/orders/:id/approve-receipt", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Only seller of the order or master admin can approve receipt
  if (order.sellerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Only the seller or admin can approve this transaction receipt." });
  }

  order.status = "Confirmed";
  order.sellerApproved = true;
  order.approvedAt = new Date().toISOString();

  // Update chat orderStatus
  const chat = db.chats.find((c) => c.orderId === order.id || c.id === order.chatId);
  if (chat) {
    chat.orderStatus = "Confirmed";
  }

  // System announcement in chat
  const approveMsg: ChatMessage = {
    id: `msg_${Date.now()}_receipt_approved`,
    chatId: order.chatId,
    senderId: "system",
    senderUsername: "RAY Escrow System",
    senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    text: `✅ Payment Receipt APPROVED & SEEN by @${user.username}! Escrow transaction #${order.id} is now [CONFIRMED]. Seller @${order.sellerUsername}, you may now deliver the account credentials safely in this chat.`,
    createdAt: new Date().toISOString(),
    isSystem: true,
  };
  db.messages.push(approveMsg);
  saveDatabase(db);

  broadcastEvent("order:updated", { order }, [order.buyerId, order.sellerId]);
  broadcastEvent("chat:message", { message: approveMsg, chatId: order.chatId }, [order.buyerId, order.sellerId]);

  return res.json({ order, message: "Payment receipt seen and approved! Order is now Confirmed." });
});

// Buyer uploads or updates receipt
app.patch("/api/orders/:id/upload-receipt", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.buyerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Only the buyer can update this receipt." });
  }

  const { receiptUrl, receiptNotes } = req.body;
  if (!receiptUrl) {
    return res.status(400).json({ error: "Receipt image/URL is required." });
  }

  order.receiptUrl = receiptUrl;
  if (receiptNotes) order.receiptNotes = receiptNotes;
  order.receiptUploadedAt = new Date().toISOString();
  order.sellerApproved = false; // Reset to pending approval
  order.status = "Pending";

  const receiptMsg: ChatMessage = {
    id: `msg_${Date.now()}_receipt_update`,
    chatId: order.chatId,
    senderId: "system",
    senderUsername: "RAY Escrow System",
    senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    text: `📸 Buyer @${user.username} has updated the payment receipt. Seller @${order.sellerUsername}, please inspect it and press "Approve / Seen".`,
    createdAt: new Date().toISOString(),
    isSystem: true,
  };
  db.messages.push(receiptMsg);
  saveDatabase(db);

  broadcastEvent("order:updated", { order }, [order.buyerId, order.sellerId]);
  broadcastEvent("chat:message", { message: receiptMsg, chatId: order.chatId }, [order.buyerId, order.sellerId]);

  return res.json({ order, message: "Receipt updated successfully." });
});

// Gemini AI Support Assistant Endpoint
app.post("/api/support/gemini-chat", async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const userQuery = message.trim();

  // Knowledge base facts for accurate client assistance:
  // - Marketplace: RAY SHOP Free Fire Accounts Escrow Marketplace
  // - Currency: Nigerian Naira (₦)
  // - Featured Account: Free Fire MAX Lv.62 ❝Linx account (UID: 7031684177). Price: ₦40,000. Includes Evo MP40 Cobra Lv.6, Evo AWM Lv.3, Evo M1014 Lv.3, Bunny Captain Top, Demon Samurai, Byte Mounting cyber horse emote, 284 weapons. Clean Google Bind.
  // - Payment Methods:
  //    1. PalmPay (Account: 7067252385, Name: RAY SHOP ESCROW)
  //    2. OPay (Account: 8081885757, Name: RAY SHOP ESCROW)
  // - Payment & Receipt Flow:
  //    Buyers transfer ₦40,000 to either PalmPay (7067252385) or OPay (8081885757).
  //    Buyers MUST upload a receipt screenshot during checkout.
  //    The transaction is placed in "Pending" status until the seller inspects the receipt and presses "Approve / Seen".
  //    Once approved, status transitions to "Confirmed", and login credentials are safe to deliver.
  // - Transaction Tracking:
  //    Clients can track all transactions in real time under "Pending" and "Confirmed" tabs in their Profile / Transactions view.
  // - Seller Verification Requirements:
  //    Only Phone number, Email address, and a reasonable letter of intent explaining why they want to be verified. NO NIN (National Identity Number) required.

  const systemInstruction = `You are RAY Support AI, the friendly, prompt, and highly knowledgeable customer service assistant for RAY SHOP — the verified Free Fire account marketplace.

Key Marketplace Information & Rules:
1. Currency: All prices are strictly in Nigerian Naira (₦).
2. Featured Account: Free Fire MAX Lv.62 ❝Linx account (UID: 7031684177) priced at ₦40,000. Features: 3 Evo weapons (Evo MP40 Cobra Lv.6, Evo AWM Lv.3, Evo M1014 Green Flame Draco Lv.3), ultra-rare Bunny Captain Top, Byte Mounting Cyber Horse emote, 284 weapons, clean Google bind.
3. Payment Methods:
   - PalmPay: Account Number 7067252385 (RAY SHOP ESCROW)
   - OPay: Account Number 8081885757 (RAY SHOP ESCROW)
4. Payment & Receipt Workflow:
   - The buyer transfers the payment to either PalmPay (7067252385) or OPay (8081885757).
   - The buyer MUST submit their payment receipt (screenshot of the transfer) when ordering.
   - The transaction enters "Pending" status.
   - The seller must review the receipt and click "Approve / Seen" before the transaction moves to "Confirmed" and account credentials are provided.
5. Transaction Tracking:
   - Clients can easily track their purchases and sales under the "Pending" (awaiting seller receipt review) and "Confirmed" (receipt approved & verified) tabs.
6. Seller Verification:
   - Requirements to get verified: 1) Phone number, 2) Email address, 3) A reasonable letter of intent explaining why you want to be verified as a seller.
   - Explicitly: NO NIN (National Identity Number) is needed.
7. Account Handover & Security:
   - RAY Escrow holds funds safely until buyer confirms full account access, changes password, and sets up 2-step verification.

Keep your response friendly, clear, concise, and structured with bullet points where helpful. If a user asks how to buy, guide them step by step with the account numbers and receipt instructions.`;

  const ai = getGemini();

  if (ai) {
    try {
      // Build conversation contents
      const contents: any[] = [];

      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          if (h.role && h.parts) {
            contents.push({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: typeof h.parts === "string" ? h.parts : String(h.parts) }],
            });
          }
        });
      }

      contents.push({
        role: "user",
        parts: [{ text: userQuery }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Hello! I'm here to assist you with RAY SHOP orders, PalmPay/OPay payments, receipt verification, or seller verification.";
      return res.json({ reply, source: "gemini" });
    } catch (err: any) {
      console.warn("Gemini API call error, using intelligent knowledge fallback:", err?.message);
    }
  }

  // Intelligent, instant knowledge fallback if Gemini key is not configured
  const q = userQuery.toLowerCase();
  let reply = "";

  if (q.includes("pay") || q.includes("opay") || q.includes("palmpay") || q.includes("account number") || q.includes("buy")) {
    reply = `To purchase the Free Fire account (₦40,000), transfer to either of our official accounts:\n\n• **PalmPay**: Account Number \`7067252385\`\n• **OPay**: Account Number \`8081885757\`\n\n**Next Steps:**\n1. Take a clear screenshot of your payment receipt.\n2. In the checkout modal, upload the receipt screenshot and click "Submit Receipt & Place Order".\n3. Your order will show as **Pending**.\n4. The seller will review the receipt and press **"Approve / Seen"**, moving your order to **Confirmed** and handing over the Google bind credentials.`;
  } else if (q.includes("receipt") || q.includes("approve") || q.includes("seen")) {
    reply = `**Receipt & Approval Workflow:**\n\n1. Buyers must send a valid payment receipt after transferring funds.\n2. The order will be in **Pending** status while awaiting the seller's review.\n3. The seller then inspects the transfer receipt and clicks **"Approve / Seen"**.\n4. The transaction is immediately **Confirmed**, and login details are securely exchanged inside the Escrow Chat.`;
  } else if (q.includes("track") || q.includes("pending") || q.includes("confirmed")) {
    reply = `You can track all your transactions directly:\n\n• **Pending**: Orders where the payment receipt has been submitted and is awaiting the seller's "Approve / Seen" confirmation.\n• **Confirmed**: Orders where the seller has verified the receipt and released or delivered the account credentials.\n\nOpen your **Profile > Transactions** or click the **Track Transactions** button to view real-time status!`;
  } else if (q.includes("verify") || q.includes("verification") || q.includes("seller") || q.includes("nin")) {
    reply = `**Seller Verification Requirements:**\n\nTo become a verified seller on RAY SHOP, you only need to provide:\n1. **Phone Number**\n2. **Email Address**\n3. **Reasonable Letter of Intent** explaining why you want to be a verified merchant.\n\n✨ **Notice: NO NIN is required!** Submissions are reviewed quickly by RAY Admin.`;
  } else if (q.includes("linx") || q.includes("price") || q.includes("naira") || q.includes("account") || q.includes("evo")) {
    reply = `**Free Fire MAX ❝Linx Account Specs (₦40,000):**\n\n• **Level:** 62 | **Likes:** 3,177 | **Rank:** Heroic\n• **Evo Weapons:** Evo MP40 Cobra (Lv.6), Evo AWM (Lv.3), Evo M1014 Draco (Lv.3)\n• **Exclusive Outfits:** Bunny Captain Top, Demon Samurai\n• **Emotes:** Legendary Byte Mounting Cyber Horse emote (with glowing blue sword)\n• **Arsenal:** 284 weapons in gallery (2 Artifact, 45 Mythic, 96 Epic)\n• **Bind:** Clean Google Bind ready for instant handover upon receipt approval.`;
  } else {
    reply = `Hello! I am your RAY Support Assistant. How can I help you today?\n\n• **Payment:** OPay (\`8081885757\`) or PalmPay (\`7067252385\`) for ₦40,000\n• **Receipts:** Upload your receipt, wait for seller to click "Approve / Seen"\n• **Tracking:** Track your orders in "Pending" and "Confirmed"\n• **Verification:** Apply with Phone, Email, and Letter of Intent (NO NIN required)`;
  }

  return res.json({ reply, source: "fallback" });
});

app.get("/api/orders", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const userOrders = db.orders.filter(
    (o) => o.buyerId === user.id || o.sellerId === user.id || user.role === "admin"
  );
  return res.json({ orders: userOrders });
});

app.get("/api/orders/:id", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  return res.json({ order });
});

app.patch("/api/orders/:id/status", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { status, disputeReason, credentialsDelivered } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (status) {
    order.status = status;
    if (status === "Completed") {
      order.completedAt = new Date().toISOString();
      // Increase seller's successful sales count
      const seller = db.users.find((u) => u.id === order.sellerId);
      if (seller) {
        seller.totalSales = (seller.totalSales || 0) + 1;
      }
    }
  }

  if (disputeReason) {
    order.disputeReason = disputeReason;
  }

  if (typeof credentialsDelivered === "boolean") {
    order.credentialsDelivered = credentialsDelivered;
  }

  // Update linked chat order status
  const chat = db.chats.find((c) => c.orderId === order.id || c.id === order.chatId);
  if (chat) {
    chat.orderStatus = order.status;
  }

  // System notification in chat
  const statusMsg: ChatMessage = {
    id: `msg_${Date.now()}_status`,
    chatId: order.chatId,
    senderId: "system",
    senderUsername: "RAY Escrow System",
    senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    text: `⚡ Order status changed to [${order.status}]. ${disputeReason ? `Reason: "${disputeReason}"` : ""}`,
    createdAt: new Date().toISOString(),
    isSystem: true,
  };
  db.messages.push(statusMsg);

  saveDatabase(db);

  broadcastEvent("order:updated", { order }, [order.buyerId, order.sellerId]);
  broadcastEvent("chat:message", { message: statusMsg, chatId: order.chatId }, [order.buyerId, order.sellerId]);

  return res.json({ order });
});

// Chats & Messaging System
app.get("/api/chats", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const userChats = db.chats.filter((c) => c.participantIds.includes(user.id));
  userChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return res.json({ chats: userChats });
});

app.post("/api/chats", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { targetUserId, listingId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required" });
  }

  const targetUser = db.users.find((u) => u.id === targetUserId);
  if (!targetUser) return res.status(404).json({ error: "Target user not found" });

  // Check if conversation already exists
  let chat = db.chats.find(
    (c) =>
      c.participantIds.includes(user.id) &&
      c.participantIds.includes(targetUserId) &&
      (!listingId || c.listingId === listingId)
  );

  if (!chat) {
    const listing = listingId ? db.listings.find((l) => l.id === listingId) : undefined;
    chat = {
      id: `chat_${Date.now()}`,
      participantIds: [user.id, targetUserId],
      participants: {
        [user.id]: {
          username: user.username,
          avatar: user.avatar,
          isVerified: user.isVerifiedSeller,
        },
        [targetUserId]: {
          username: targetUser.username,
          avatar: targetUser.avatar,
          isVerified: targetUser.isVerifiedSeller,
        },
      },
      listingId: listing?.id,
      listingTitle: listing?.title,
      listingPrice: listing?.price,
      listingImage: listing?.images[0],
      lastMessage: "Chat created",
      lastMessageAt: new Date().toISOString(),
      unreadCounts: {
        [user.id]: 0,
        [targetUserId]: 0,
      },
    };
    db.chats.unshift(chat);
    saveDatabase(db);
    broadcastEvent("chat:new", { chat }, [user.id, targetUserId]);
  }

  return res.json({ chat });
});

app.get("/api/chats/:id/messages", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const chat = db.chats.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  if (!chat.participantIds.includes(user.id) && user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const messages = db.messages.filter((m) => m.chatId === req.params.id);
  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mark as read for this user
  if (chat.unreadCounts) {
    chat.unreadCounts[user.id] = 0;
    saveDatabase(db);
  }

  return res.json({ chat, messages });
});

app.post("/api/chats/:id/messages", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const chat = db.chats.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  if (!chat.participantIds.includes(user.id) && user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { text, attachment } = req.body;
  if (!text && !attachment) {
    return res.status(400).json({ error: "Message text or attachment required" });
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    chatId: chat.id,
    senderId: user.id,
    senderUsername: user.username,
    senderAvatar: user.avatar,
    text: text || "Sent an attachment",
    attachment,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  // Update chat summary
  chat.lastMessage = text || "Sent an attachment";
  chat.lastMessageAt = new Date().toISOString();

  // Increment unread for all other participants
  chat.participantIds.forEach((pid) => {
    if (pid !== user.id) {
      chat.unreadCounts[pid] = (chat.unreadCounts[pid] || 0) + 1;
    }
  });

  saveDatabase(db);

  // Push instantly via SSE to conversation participants
  broadcastEvent("chat:message", { message: newMsg, chatId: chat.id }, chat.participantIds);
  broadcastEvent("chat:updated", { chat }, chat.participantIds);

  return res.status(201).json({ message: newMsg });
});

// Reports & Safety
app.post("/api/reports", (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { targetType, targetId, targetTitle, reason, details } = req.body;
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Missing required report information" });
  }

  const report: Report = {
    id: `rep_${Date.now()}`,
    reporterId: user.id,
    reporterUsername: user.username,
    targetType,
    targetId,
    targetTitle: targetTitle || "",
    reason,
    details: details || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(report);
  saveDatabase(db);

  broadcastEvent("report:new", { report });
  return res.status(201).json({ report });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT (Protected)
// ----------------------------------------------------
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin authorization required" });
  }
  next();
}

app.get("/api/admin/stats", requireAdmin, (req: Request, res: Response) => {
  const activeListings = db.listings.filter((l) => l.status === "active").length;
  const verifiedSellers = db.users.filter((u) => u.isVerifiedSeller).length;
  const pendingVerifications = db.verificationRequests.filter((vr) => vr.status === "pending").length;
  const activeOrders = db.orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const completedOrders = db.orders.filter((o) => o.status === "Completed").length;
  const disputes = db.orders.filter((o) => o.status === "Disputed").length;
  const totalVolume = db.orders
    .filter((o) => o.status === "Completed" || o.status === "Processing")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const stats: AdminStats = {
    totalUsers: db.users.length,
    verifiedSellers,
    activeListings,
    pendingVerifications,
    activeOrders,
    completedOrders,
    disputes,
    totalVolume: Math.round(totalVolume),
  };

  return res.json({ stats });
});

app.get("/api/admin/users", requireAdmin, (req: Request, res: Response) => {
  return res.json({ users: db.users });
});

app.patch("/api/admin/users/:id/verify", requireAdmin, (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { action } = req.body; // 'approve' | 'revoke'
  if (action === "approve") {
    user.isVerifiedSeller = true;
    user.verificationStatus = "approved";
    user.role = "seller";
  } else if (action === "revoke") {
    user.isVerifiedSeller = false;
    user.verificationStatus = "revoked";
  }

  // Update any existing verification requests
  const vr = db.verificationRequests.find((r) => r.userId === user.id);
  if (vr) {
    vr.status = action === "approve" ? "approved" : "rejected";
    vr.reviewedAt = new Date().toISOString();
  }

  // Update seller listings verification badge
  db.listings.forEach((l) => {
    if (l.sellerId === user.id) {
      l.sellerIsVerified = user.isVerifiedSeller;
    }
  });

  saveDatabase(db);
  broadcastEvent("user:updated", { user }, [user.id]);
  broadcastEvent("verification:updated", { user });

  return res.json({ user, message: `User verification updated to ${user.verificationStatus}` });
});

app.patch("/api/admin/users/:id/suspend", requireAdmin, (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.isSuspended = !user.isSuspended;
  saveDatabase(db);

  broadcastEvent("user:updated", { user }, [user.id]);
  return res.json({ user, message: user.isSuspended ? "User suspended" : "User unsuspended" });
});

app.get("/api/admin/verifications", requireAdmin, (req: Request, res: Response) => {
  return res.json({ requests: db.verificationRequests });
});

app.post("/api/admin/verifications/:id/action", requireAdmin, (req: Request, res: Response) => {
  const vr = db.verificationRequests.find((r) => r.id === req.params.id);
  if (!vr) return res.status(404).json({ error: "Verification request not found" });

  const { action, adminNotes } = req.body; // 'approve' | 'reject'
  vr.status = action === "approve" ? "approved" : "rejected";
  vr.reviewedAt = new Date().toISOString();
  vr.adminNotes = adminNotes || "";

  const user = db.users.find((u) => u.id === vr.userId);
  if (user) {
    if (action === "approve") {
      user.isVerifiedSeller = true;
      user.verificationStatus = "approved";
      user.role = "seller";
    } else {
      user.isVerifiedSeller = false;
      user.verificationStatus = "rejected";
    }

    // Update their listings
    db.listings.forEach((l) => {
      if (l.sellerId === user.id) {
        l.sellerIsVerified = user.isVerifiedSeller;
      }
    });
  }

  saveDatabase(db);
  if (user) {
    broadcastEvent("user:updated", { user }, [user.id]);
  }
  broadcastEvent("verification:updated", { request: vr });

  return res.json({ request: vr, user });
});

app.get("/api/admin/reports", requireAdmin, (req: Request, res: Response) => {
  return res.json({ reports: db.reports });
});

app.patch("/api/admin/reports/:id", requireAdmin, (req: Request, res: Response) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });

  const { status } = req.body;
  if (status) {
    report.status = status;
  }
  saveDatabase(db);
  return res.json({ report });
});

app.get("/api/admin/orders", requireAdmin, (req: Request, res: Response) => {
  return res.json({ orders: db.orders });
});

// ----------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAY SHOP] Mobile Gaming Marketplace Server running on port ${PORT}`);
  });
}

startServer();
