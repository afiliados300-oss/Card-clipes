
import React, { useRef, useState, useEffect } from 'react';
import { Video } from '../types';
import { HeartIcon, CommentIcon } from './Icons';
import { useApp } from '../context/AppContext';
import { CommentsDrawer } from './CommentsDrawer';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onOpenProduct: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onOpenProduct }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toggleLike } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      // Tentativa de tocar COM SOM (muted=false)
      // Nota: Navegadores podem bloquear isso se não houver interação prévia do usuário.
      videoRef.current.muted = false; 
      
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Se falhar (bloqueio do navegador), tenta tocar mutado
          console.log("Autoplay com som bloqueado. Tentando mudo.");
          if (videoRef.current) {
             videoRef.current.muted = true;
             videoRef.current.play();
          }
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toggleLike(video.id);
  };

  return (
    <div className="relative w-full h-full bg-black snap-start shrink-0 overflow-hidden">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        playsInline
        loop
        // Removido 'muted' padrão para tentar tocar com som
        poster={video.thumbnail}
        onClick={() => {
            if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
            }
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

      {/* Right Sidebar Interaction */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-6 z-20">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-neon-pink p-0.5 mb-2 overflow-hidden">
                <img src={video.userAvatar} alt={video.username} className="w-full h-full rounded-full object-cover" />
            </div>
        </div>

        <button onClick={handleLike} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
          <HeartIcon filled={isLiked} />
          <span className="text-xs font-bold">{video.likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button 
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <CommentIcon />
          <span className="text-xs font-bold">{video.comments}</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-0 bottom-0 p-4 pb-20 w-3/4 z-10 text-shadow-sm">
        <h3 className="font-bold text-lg mb-1">@{video.username}</h3>
        <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
        
        {/* Product Card Overlay - Small */}
        {video.product && (
            <div 
                onClick={() => onOpenProduct(video)}
                className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/20 flex items-center gap-3 cursor-pointer hover:bg-black/80 transition-all"
            >
                <img src={video.product.image} className="w-10 h-10 rounded bg-gray-700 object-cover" alt="product" />
                <div className="flex-1">
                    <p className="text-xs font-bold text-neon-blue truncate w-32">{video.product.name}</p>
                    <p className="text-xs text-white">R$ {video.product.price.toFixed(2)}</p>
                </div>
                <button className="bg-neon-pink text-white text-xs px-3 py-1.5 rounded font-bold">
                    Comprar
                </button>
            </div>
        )}
      </div>

      {/* Comments Drawer */}
      {showComments && (
          <CommentsDrawer video={video} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
};
