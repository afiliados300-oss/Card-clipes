
import React, { useState } from 'react';
import { Video } from '../types';
import { useApp } from '../context/AppContext';

interface CommentsDrawerProps {
  video: Video | null;
  onClose: () => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ video, onClose }) => {
  const { addComment, currentUser } = useApp();
  const [commentText, setCommentText] = useState('');

  if (!video) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (commentText.trim()) {
          addComment(video.id, commentText);
          setCommentText('');
      }
  };

  const comments = video.commentsList || [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] w-full rounded-t-3xl h-[60vh] flex flex-col animate-slide-up border-t border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="font-bold text-white text-sm">{comments.length} Comentários</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <p className="text-sm">Seja o primeiro a comentar!</p>
                </div>
            ) : (
                comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <img src={comment.userAvatar} className="w-8 h-8 rounded-full bg-gray-700 object-cover shrink-0" alt="avatar" />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-300">{comment.username}</span>
                                <span className="text-[10px] text-gray-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-white mt-0.5">{comment.text}</p>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#0f0f0f] pb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <img 
                    src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest${Date.now()}`} 
                    className="w-8 h-8 rounded-full bg-gray-700 object-cover" 
                    alt="me" 
                />
                <div className="flex-1 relative">
                    <input 
                        autoFocus
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={currentUser ? "Adicione um comentário..." : "Comente como visitante..."}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-neon-pink"
                    />
                    {commentText.trim() && (
                        <button 
                            type="submit" 
                            className="absolute right-2 top-1.5 text-neon-pink font-bold text-xs"
                        >
                            Publicar
                        </button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
