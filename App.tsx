
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { VideoCard } from './components/VideoCard';
import { ProductDrawer } from './components/ProductDrawer';
import { ViewState, Video } from './types';
import { Upload } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { Checkout } from './pages/Checkout';
import { AdminPanel } from './pages/AdminPanel';
import { Auth } from './pages/Auth';

const MainFeed = () => {
  const { videos } = useApp();
  // Filter only active videos for the feed
  const activeVideos = videos.filter(v => v.status === 'active');
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [selectedProductVideo, setSelectedProductVideo] = useState<Video | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeVideoIndex) {
      setActiveVideoIndex(index);
    }
  };

  if (activeVideos.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-black p-6 text-center">
            <p className="mb-4">Nenhum vídeo ativo no momento.</p>
            <p className="text-sm">Seja o primeiro a postar!</p>
        </div>
      );
  }

  return (
    <>
      <div 
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black"
        onScroll={handleScroll}
      >
        {activeVideos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === activeVideoIndex} 
            onOpenProduct={(v) => setSelectedProductVideo(v)}
          />
        ))}
      </div>
      
      <ProductDrawer 
        product={selectedProductVideo?.product || null} 
        onClose={() => setSelectedProductVideo(null)} 
      />
    </>
  );
};

const DiscoverView = () => {
  const { videos } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductVideo, setSelectedProductVideo] = useState<Video | null>(null);

  // Filter active videos that have products
  const activeVideos = videos.filter(v => v.status === 'active' && v.product);

  const filteredVideos = activeVideos.filter(v => {
      const term = searchTerm.toLowerCase();
      return (
          v.product?.name.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term) ||
          (v.tags && v.tags.some(t => t.toLowerCase().includes(term)))
      );
  });

  return (
    <div className="h-full bg-black text-white p-4 overflow-y-auto pb-24">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-neon-blue to-purple-500 bg-clip-text text-transparent">Descobrir Ofertas</h1>
        
        {/* Search Bar */}
        <div className="sticky top-0 bg-black/90 backdrop-blur z-10 pb-4 pt-2">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar produtos, marcas, tags..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-10 py-3 text-sm focus:border-neon-pink outline-none text-white placeholder:text-gray-600 transition-all focus:bg-black"
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
            {filteredVideos.map(video => (
                <div 
                    key={video.id} 
                    onClick={() => setSelectedProductVideo(video)}
                    className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden relative border border-gray-800 cursor-pointer group"
                >
                    {/* Thumbnail */}
                    <img src={video.thumbnail || video.product?.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="thumb" />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-1 mb-1">
                            <img src={video.userAvatar} className="w-4 h-4 rounded-full border border-white" alt="avatar"/>
                            <p className="text-[10px] text-gray-300 truncate">@{video.username}</p>
                        </div>
                        <p className="text-xs font-bold text-white truncate leading-tight mb-0.5">{video.product?.name}</p>
                        <p className="text-sm text-neon-blue font-bold">R$ {video.product?.price.toFixed(2)}</p>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 right-2 bg-neon-pink text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                        COMPRAR
                    </div>
                </div>
            ))}
        </div>
        
        {filteredVideos.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-4xl mb-2">🔍</span>
                <p>Nenhum produto encontrado.</p>
             </div>
        )}

        <ProductDrawer 
            product={selectedProductVideo?.product || null} 
            onClose={() => setSelectedProductVideo(null)} 
        />
    </div>
  );
};

const ViewManager = () => {
  const { currentView, currentUser } = useApp();

  switch (currentView) {
    case ViewState.FEED:
      return <MainFeed />;
    case ViewState.DISCOVER:
      return <DiscoverView />;
    case ViewState.CHECKOUT:
      return <Checkout />;
    case ViewState.ADMIN:
      return <AdminPanel />;
      
    // Protected Routes
    case ViewState.UPLOAD:
      return currentUser ? <Upload /> : <Auth />;
    case ViewState.DASHBOARD:
      return currentUser ? <Dashboard /> : <Auth />;
      
    default:
      return <MainFeed />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <ViewManager />
      </Layout>
    </AppProvider>
  );
};

export default App;
