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

const DiscoverView = () => (
    <div className="p-6 h-full overflow-y-auto pb-24 bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Descobrir</h1>
        <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-800">
                    <img src={`https://picsum.photos/seed/${i * 55}/300/400`} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100" alt="discover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-sm font-bold shadow-black drop-shadow-md text-neon-blue">#Trend{i}</span>
                </div>
            ))}
        </div>
    </div>
);

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