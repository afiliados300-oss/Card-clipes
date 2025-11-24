
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Video, Product, CartItem, ViewState, User, WithdrawalRequest, PaymentInfo, Transaction, CreditTransaction, AdType, Order, OrderStatus, ShippingAddress, Comment } from '../types';

interface AppContextType {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: (sellerId?: string) => void;
  
  // Auth & User Management
  users: User[]; 
  currentUser: User | null;
  register: (email: string, password: string, name: string, role: 'user' | 'creator') => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUserPaymentInfo: (info: PaymentInfo) => void;
  getUserById: (id: string) => User | undefined;
  
  videos: Video[];
  addVideo: (video: Video) => void;
  approveVideo: (videoId: string) => void;
  rejectVideo: (videoId: string, reason?: string) => void;
  blockVideo: (videoId: string) => void;
  toggleLike: (videoId: string) => void;
  addComment: (videoId: string, text: string) => void; // New
  
  // Orders (P2P)
  orders: Order[];
  createOrder: (sellerId: string, items: CartItem[], total: number, proof: string, shippingAddress: ShippingAddress) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Admin & Financial
  withdrawalRequests: WithdrawalRequest[];
  creditTransactions: CreditTransaction[]; 
  requestWithdrawal: (amount: number) => void;
  processWithdrawal: (id: string, status: 'approved' | 'rejected') => void;
  
  // Admin User Management
  adminResetFreeLimit: (userId: string) => void;
  adminAddCredits: (userId: string, amount: number) => void;
  adminBanUser: (userId: string, status: 'active' | 'banned') => void;
  adminDeleteUser: (userId: string) => void; // New

  platformFee: number;
  setPlatformFee: (fee: number) => void;
  adPrice: number;
  setAdPrice: (price: number) => void;
  adminPixKey: string;
  setAdminPixKey: (key: string) => void;
  totalRevenue: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- SEED DATA ---
const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://picsum.photos/seed/1/400/800',
    description: "Esses tênis novos são fogo absoluto! 🔥 #corrida #fitness",
    likes: 1240,
    comments: 2,
    commentsList: [
        { id: 'c1', userId: 'u_guest', username: 'Visitante', userAvatar: 'https://picsum.photos/seed/g/50', text: 'Muito top!', createdAt: new Date().toISOString() },
        { id: 'c2', userId: 'u_guest2', username: 'Ana', userAvatar: 'https://picsum.photos/seed/a/50', text: 'Onde compra?', createdAt: new Date().toISOString() }
    ],
    shares: 12,
    username: 'runner_pro',
    userId: 'u_runner',
    userAvatar: 'https://picsum.photos/seed/user1/100',
    category: 'Esportes',
    adType: 'product',
    status: 'active',
    salesCount: 45,
    conversionRate: 3.2,
    createdAt: new Date().toISOString(),
    product: {
      id: 'p1',
      name: 'Speedster X 5000',
      brand: 'Speedster',
      price: 129.99,
      description: 'Tênis ultra-leves para profissionais.',
      image: 'https://picsum.photos/seed/shoe/200',
      affiliateCommission: 15,
      rating: 4.8,
      reviews: 342,
      productUrl: 'https://example.com/shoe',
      sellerId: 'u_runner'
    }
  }
];

const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error("Storage load error", e);
        return fallback;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<ViewState>(ViewState.FEED);
  
  const [users, setUsers] = useState<User[]>(() => loadStorage('cc_users_db', [
      // Mock user seed to ensure u_runner exists
      {
          id: 'u_runner',
          name: 'Runner Pro Shop',
          email: 'runner@clipcart.com',
          password: '123',
          avatar: 'https://picsum.photos/seed/user1/100',
          followers: 1200,
          following: 50,
          role: 'creator',
          status: 'active',
          balance: 0,
          paymentInfo: {
            pixKey: 'runner@pix.com.br',
            fullName: 'Runner Sports LTDA',
            companyName: 'Runner Pro',
            logoUrl: ''
          },
          freeAdsUsed: 1,
          paidCredits: 0,
          totalAdsCreated: 1,
          lastLogin: new Date().toISOString()
      }
  ]));
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStorage('cc_current_session', null));
  const [cart, setCart] = useState<CartItem[]>(() => loadStorage('cc_cart', []));
  const [videos, setVideos] = useState<Video[]>(() => loadStorage('cc_videos', MOCK_VIDEOS));
  const [orders, setOrders] = useState<Order[]>(() => loadStorage('cc_orders', []));
  
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => loadStorage('cc_withdrawals', []));
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => loadStorage('cc_credit_tx', []));
  
  const [platformFee, setPlatformFee] = useState(() => loadStorage('cc_fee', 10));
  const [adPrice, setAdPrice] = useState(() => loadStorage('cc_ad_price', 0.50));
  const [adminPixKey, setAdminPixKey] = useState(() => loadStorage('cc_admin_pix', '725f4b23-a169-45b0-b8fb-57d7a6811560'));
  const [totalRevenue, setTotalRevenue] = useState(() => loadStorage('cc_revenue', 45820.00));

  useEffect(() => localStorage.setItem('cc_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('cc_videos', JSON.stringify(videos)), [videos]);
  useEffect(() => localStorage.setItem('cc_users_db', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('cc_current_session', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('cc_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('cc_withdrawals', JSON.stringify(withdrawalRequests)), [withdrawalRequests]);
  useEffect(() => localStorage.setItem('cc_fee', JSON.stringify(platformFee)), [platformFee]);
  useEffect(() => localStorage.setItem('cc_ad_price', JSON.stringify(adPrice)), [adPrice]);
  useEffect(() => localStorage.setItem('cc_admin_pix', JSON.stringify(adminPixKey)), [adminPixKey]);
  useEffect(() => localStorage.setItem('cc_revenue', JSON.stringify(totalRevenue)), [totalRevenue]);
  useEffect(() => localStorage.setItem('cc_credit_tx', JSON.stringify(creditTransactions)), [creditTransactions]);

  // --- AUTH ---
  const register = (email: string, password: string, name: string, role: 'user' | 'creator'): boolean => {
      if (users.find(u => u.email === email)) return false;
      const newUser: User = {
          id: `u_${Date.now()}`,
          name,
          email,
          password,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          followers: 0,
          following: 0,
          role: role,
          status: 'active',
          balance: 0,
          freeAdsUsed: 0,
          paidCredits: 0,
          totalAdsCreated: 0,
          lastLogin: new Date().toISOString(),
          paymentInfo: { pixKey: '', fullName: name, companyName: '', logoUrl: '' },
          transactions: []
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
  };

  const login = (email: string, password: string): boolean => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
          if (user.status === 'banned') return false;
          const updatedUser = { ...user, lastLogin: new Date().toISOString() };
          setCurrentUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
          return true;
      }
      return false;
  };

  const logout = () => {
      setCurrentUser(null);
      setView(ViewState.FEED);
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const updateUserPaymentInfo = (info: PaymentInfo) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, paymentInfo: info };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const adminResetFreeLimit = (userId: string) => {
    setUsers(prev => prev.map(u => {
        if (u.id === userId) {
            const updated = { ...u, freeAdsUsed: 0 };
            if (currentUser?.id === userId) setCurrentUser(updated);
            return updated;
        }
        return u;
    }));
  };

  const adminAddCredits = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
        if (u.id === userId) {
            const updated = { ...u, paidCredits: u.paidCredits + amount };
            if (currentUser?.id === userId) setCurrentUser(updated);
            return updated;
        }
        return u;
    }));
  };

  const adminBanUser = (userId: string, status: 'active' | 'banned') => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const adminDeleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      // Optionally remove their videos, orders, etc., but keeping it simple for now
  };

  // --- CART & ORDERS ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = (sellerId?: string) => {
      if (sellerId) {
          setCart(prev => prev.filter(item => item.sellerId !== sellerId));
      } else {
          setCart([]);
      }
  };

  const createOrder = (sellerId: string, items: CartItem[], total: number, proof: string, shippingAddress: ShippingAddress) => {
      const newOrder: Order = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          buyerId: currentUser?.id || 'guest',
          buyerName: currentUser?.name || shippingAddress.fullName,
          sellerId,
          items,
          total,
          status: 'pending_verification',
          createdAt: new Date().toISOString(),
          transactionProof: proof,
          shippingAddress
      };
      setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // --- VIDEO & COMMENTS ---
  const addVideo = (video: Video) => {
    if (currentUser) {
        const updatedUser = { 
            ...currentUser, 
            totalAdsCreated: currentUser.totalAdsCreated + 1,
            freeAdsUsed: currentUser.freeAdsUsed < 3 ? currentUser.freeAdsUsed + 1 : currentUser.freeAdsUsed
        };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }

    setTotalRevenue(prev => prev + adPrice); 
    setVideos(prev => [video, ...prev]);
  };

  const approveVideo = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'active' as const } : v));
  };

  const rejectVideo = (videoId: string, reason?: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'rejected' as const, rejectionReason: reason } : v));
  };

  const blockVideo = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'blocked' as const } : v));
  }

  const toggleLike = (videoId: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        return { ...v, likes: v.likes + 1 }; 
      }
      return v;
    }));
  };

  const addComment = (videoId: string, text: string) => {
      if (!text.trim()) return;
      
      const newComment: Comment = {
          id: `c_${Date.now()}`,
          userId: currentUser?.id || 'guest',
          username: currentUser?.name || 'Visitante',
          userAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
          text: text,
          createdAt: new Date().toISOString()
      };

      setVideos(prev => prev.map(v => {
          if (v.id === videoId) {
              return { 
                  ...v, 
                  comments: (v.comments || 0) + 1,
                  commentsList: [...(v.commentsList || []), newComment]
              };
          }
          return v;
      }));
  };

  // --- FINANCIAL ---
  const requestWithdrawal = (amount: number) => {
    if (!currentUser || currentUser.balance < amount) return;
    
    const newRequest: WithdrawalRequest = {
        id: `w${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        amount: amount,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        pixKey: currentUser.paymentInfo?.pixKey || 'Sem chave PIX'
    };
    
    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setWithdrawalRequests(prev => [newRequest, ...prev]);
  };

  const processWithdrawal = (id: string, status: 'approved' | 'rejected') => {
    const request = withdrawalRequests.find(w => w.id === id);
    setWithdrawalRequests(prev => prev.map(w => {
        if (w.id === id) {
             if (status === 'rejected' && w.status === 'pending' && request) {
                 setUsers(users => users.map(u => {
                    if (u.id === request.userId) return { ...u, balance: u.balance + request.amount };
                    return u;
                 }));
                 if (currentUser && currentUser.id === request.userId) {
                     setCurrentUser(prev => prev ? ({ ...prev, balance: prev.balance + request.amount }) : null);
                 }
             }
             return { ...w, status };
        }
        return w;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentView, setView,
      cart, addToCart, removeFromCart, clearCart,
      users, currentUser, register, login, logout, updateUserPaymentInfo, getUserById,
      videos, addVideo, approveVideo, rejectVideo, blockVideo, toggleLike, addComment,
      orders, createOrder, updateOrderStatus,
      withdrawalRequests, creditTransactions, requestWithdrawal, processWithdrawal,
      adminResetFreeLimit, adminAddCredits, adminBanUser, adminDeleteUser,
      platformFee, setPlatformFee, adPrice, setAdPrice, adminPixKey, setAdminPixKey, totalRevenue
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
