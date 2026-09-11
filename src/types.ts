export type UserRole = 'buyer' | 'seller' | 'admin';
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'revoked';

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar: string;
  createdAt: string;
  isVerifiedSeller: boolean;
  verificationStatus: VerificationStatus;
  role: UserRole;
  isSuspended?: boolean;
  totalSales: number;
  rating: number;
  freeFireUid?: string;
  bio?: string;
  passwordHash?: string;
}

export type AccountRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Heroic' | 'Master' | 'Grandmaster';
export type AccountRegion = 'North America' | 'Brazil' | 'Indonesia' | 'Europe' | 'Singapore' | 'India' | 'Middle East' | 'Latin America';
export type BindType = 'Google' | 'Facebook' | 'VK' | 'Twitter' | 'Clean (Unbound)';

export interface Listing {
  id: string;
  sellerId: string;
  sellerUsername: string;
  sellerAvatar: string;
  sellerIsVerified: boolean;
  sellerRating?: number;
  sellerSales?: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  level: number;
  rank: AccountRank;
  region: AccountRegion;
  evoGuns: string[];
  exclusiveItems: string[];
  bindType: BindType;
  badgesCount?: number;
  likesCount?: number;
  status: 'active' | 'sold' | 'under_review' | 'removed';
  featured: boolean;
  createdAt: string;
  viewsCount: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled' | 'Disputed';

export interface Order {
  id: string; // e.g. RAY-10492
  listingId: string;
  listingTitle: string;
  listingImage: string;
  price: number;
  buyerFee: number;
  totalAmount: number;
  buyerId: string;
  buyerUsername: string;
  buyerAvatar: string;
  sellerId: string;
  sellerUsername: string;
  sellerAvatar: string;
  sellerIsVerified: boolean;
  status: OrderStatus;
  paymentMethod: 'OPay' | 'PalmPay' | string;
  accountNumberPaid?: string;
  receiptUrl?: string;
  receiptNotes?: string;
  receiptUploadedAt?: string;
  sellerApproved?: boolean;
  approvedAt?: string;
  createdAt: string;
  completedAt?: string;
  chatId: string;
  disputeReason?: string;
  credentialsDelivered?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  text: string;
  attachment?: string;
  createdAt: string;
  isSystem?: boolean;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participants: {
    [userId: string]: {
      username: string;
      avatar: string;
      isVerified: boolean;
    };
  };
  orderId?: string;
  orderStatus?: OrderStatus;
  listingId?: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCounts: { [userId: string]: number };
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  phone: string;
  reasonLetter: string; // Reasonable statement / letter of why the applicant wants to be verified
  noNinNotice?: string;
  freeFireUid?: string;
  idDocumentType?: string;
  proofUrl?: string;
  sellerExperience?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'user' | 'listing' | 'message' | 'transaction';
  targetId: string;
  targetTitle?: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedSellers: number;
  activeListings: number;
  pendingVerifications: number;
  activeOrders: number;
  completedOrders: number;
  disputes: number;
  totalVolume: number;
}
