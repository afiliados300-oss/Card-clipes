
export interface Product {
  id: string;
  name: string;
  brand?: string; 
  price: number;
  description: string;
  image: string;
  affiliateCommission: number; // Percentage
  productUrl?: string; 
  rating: number;
  reviews: number;
  sellerId: string; // New: Identifies who receives the money
}

export type VideoStatus = 'active' | 'pending_payment' | 'rejected' | 'blocked';
export type AdType = 'product' | 'instagram' | 'youtube' | 'store';
export type OrderStatus = 'pending_verification' | 'paid' | 'shipped' | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  email: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  transactionProof?: string; // Optional text/id sent by buyer
  shippingAddress: ShippingAddress; // New: Required for delivery
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  likes: number;
  comments: number;
  commentsList?: Comment[]; // New: List of actual comments
  shares: number;
  username: string;
  userId: string;
  userAvatar: string;
  product?: Product;
  category: string;
  adType?: AdType;
  tags?: string[];
  status: VideoStatus;
  salesCount?: number;
  conversionRate?: number;
  createdAt: string;
  rejectionReason?: string;
}

export interface PaymentInfo {
  pixKey: string;
  fullName: string;
  companyName: string;
  logoUrl?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  pixKey: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number; // Reais
  credits: number; // Credits added
  status: 'approved' | 'pending' | 'cancelled';
  date: string;
  pixId: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'ad_payment' | 'credit_purchase';
  amount: number;
  date: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  followers: number;
  following: number;
  role: 'user' | 'creator' | 'admin';
  status: 'active' | 'banned';
  
  // Financials
  balance: number;
  paymentInfo?: PaymentInfo;
  transactions?: Transaction[];
  
  // Ad System Limits
  freeAdsUsed: number;
  paidCredits: number;
  totalAdsCreated: number;
  lastLogin?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum ViewState {
  FEED = 'FEED',
  DISCOVER = 'DISCOVER',
  UPLOAD = 'UPLOAD',
  INBOX = 'INBOX',
  PROFILE = 'PROFILE',
  CHECKOUT = 'CHECKOUT',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN'
}