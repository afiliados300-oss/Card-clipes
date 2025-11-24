
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ViewState, VideoStatus } from '../types';
import { generateProductDescription, categorizeContent } from '../services/geminiService';

export const Upload: React.FC = () => {
  const { setView, addVideo, currentUser, adPrice, adminPixKey } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  
  // Form State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  
  // Product Details
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUrl, setProductUrl] = useState(''); 
  
  // Meta Details
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAIEnhance = async () => {
    if (!productName || !productPrice) return;
    setLoading(true);
    
    // Simulate parallel AI calls
    const [desc, cat] = await Promise.all([
        generateProductDescription(productName, Number(productPrice)),
        categorizeContent(productName)
    ]);
    
    setDescription(desc);
    setCategory(cat);
    setLoading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handlePublish = async () => {
    if (!videoFile || !currentUser) return;
    setIsProcessingVideo(true);

    try {
        let videoUrl = videoPreviewUrl;
        
        if (videoFile.size < 4000000) { 
            videoUrl = await fileToBase64(videoFile);
        } else {
            console.warn("File too big for LocalStorage persistence, using session URL");
        }

        const newVideo = {
            id: Date.now().toString(),
            url: videoUrl,
            thumbnail: 'https://picsum.photos/seed/new/400/800', 
            description: description,
            likes: 0,
            comments: 0,
            shares: 0,
            username: currentUser.name.replace(' ', '_').toLowerCase(),
            userId: currentUser.id, 
            userAvatar: currentUser.avatar,
            category: category || 'Geral',
            tags: tags.split(',').map(t => t.trim()),
            status: 'pending_payment' as VideoStatus,
            salesCount: 0,
            conversionRate: 0,
            createdAt: new Date().toISOString(),
            product: {
                id: `p${Date.now()}`,
                name: productName,
                brand: brand,
                price: Number(productPrice),
                description: 'Novo produto incrível',
                image: 'https://picsum.photos/seed/productnew/200',
                affiliateCommission: 10,
                rating: 5,
                reviews: 0,
                productUrl: productUrl,
                sellerId: currentUser.id // CRITICAL: Identify seller
            }
        };
        
        addVideo(newVideo);
        alert("Vídeo enviado! Aguarde a aprovação do seu anúncio pelo Admin.");
        setView(ViewState.DASHBOARD);
    } catch (e) {
        alert("Erro ao processar vídeo. Tente novamente.");
        console.error(e);
    } finally {
        setIsProcessingVideo(false);
    }
  };

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-24">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
        Novo Anúncio
      </h1>

      {step === 1 && (
        <div className="flex flex-col gap-5">
          {/* VIDEO UPLOAD */}
          <div className="border-2 border-dashed border-gray-700 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-900 overflow-hidden relative">
            {videoFile ? (
                <div className="w-full h-full relative">
                    <video src={videoPreviewUrl} className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-green-400 font-bold mb-2 shadow-black drop-shadow-md">Vídeo OK!</p>
                        <button onClick={() => {setVideoFile(null); setVideoPreviewUrl('');}} className="text-red-400 text-xs hover:underline z-10 bg-black/50 px-2 py-1 rounded">Trocar</button>
                    </div>
                </div>
            ) : (
                <>
                    <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" id="v-upload" />
                    <label htmlFor="v-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                        <span className="text-3xl mb-2">📹</span>
                        <span className="font-bold text-sm">Upload Vídeo (Max 1 min)</span>
                    </label>
                </>
            )}
          </div>

          {/* PRODUCT FORM */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Detalhes do Produto</h3>
            
            <input 
                type="text" 
                placeholder="Nome do Produto"
                className="w-full bg-[#1a1a1a] border border-gray-800 p-3 rounded-lg outline-none focus:border-neon-blue"
                value={productName}
                onChange={e => setProductName(e.target.value)}
            />
            
            <div className="flex gap-3">
                <input 
                    type="text" 
                    placeholder="Marca"
                    className="flex-1 bg-[#1a1a1a] border border-gray-800 p-3 rounded-lg outline-none focus:border-neon-blue"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="Preço (R$)"
                    className="w-32 bg-[#1a1a1a] border border-gray-800 p-3 rounded-lg outline-none focus:border-neon-blue"
                    value={productPrice}
                    onChange={e => setProductPrice(e.target.value)}
                />
            </div>

            <input 
                type="url" 
                placeholder="Link de Compra (URL Externa - Opcional)"
                className="w-full bg-[#1a1a1a] border border-gray-800 p-3 rounded-lg outline-none focus:border-neon-blue text-blue-400"
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
            />
          </div>

          <button 
            disabled={!videoFile || !productName || !productPrice}
            onClick={() => setStep(2)}
            className="w-full bg-neon-blue text-black font-bold py-4 rounded-xl disabled:opacity-50 transition-all mt-4"
          >
            Continuar para Descrição
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 animate-fade-in">
           <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-300 text-sm">Descrição & SEO</h3>
                    <button 
                        onClick={handleAIEnhance}
                        disabled={loading}
                        className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full font-bold flex items-center gap-1"
                    >
                        {loading ? 'Gerando...' : '✨ Gerar com IA'}
                    </button>
                </div>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva seu vídeo de forma vendedora..."
                    className="w-full bg-black/30 p-3 rounded-lg outline-none h-24 text-sm resize-none mb-3 border border-gray-800 focus:border-purple-500"
                />
                
                <input 
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="Tags (separe por vírgula): #promo, #moda..."
                    className="w-full bg-black/30 p-3 rounded-lg outline-none text-sm border border-gray-800 focus:border-purple-500"
                />
           </div>

           <div className="bg-[#1a1a1a] p-4 rounded-xl flex justify-between items-center border border-gray-800">
                <span className="text-gray-400 text-sm">Categoria Sugerida</span>
                <span className="text-neon-pink font-bold text-sm bg-neon-pink/10 px-3 py-1 rounded">{category || 'Geral'}</span>
           </div>

           {/* PAYMENT GATE FOR THE AD ITSELF */}
           <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-neon-blue/30 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-neon-blue text-black text-[10px] font-bold px-2 py-1">TAXA DE UPLOAD</div>
               <h3 className="text-lg font-bold text-white mb-2">Ativar Anúncio</h3>
               <div className="flex justify-between items-end mb-4">
                   <span className="text-gray-400 text-sm">Custo de Publicação:</span>
                   <span className="text-2xl font-bold text-neon-pink">R$ {adPrice.toFixed(2)}</span>
               </div>
               
               <div className="bg-black p-3 rounded border border-gray-700 mb-2">
                   <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Pague para o ClipCart (Pix Admin)</p>
                   <p className="text-sm font-mono text-white break-all select-all">{adminPixKey}</p>
               </div>
               <p className="text-[10px] text-yellow-400 text-center">
                   O vídeo só será publicado após confirmação do pagamento da taxa de upload pelo Admin.
               </p>
           </div>

           <div className="flex gap-4 mt-auto">
             <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 py-4 rounded-xl font-bold text-sm">Voltar</button>
             <button 
                onClick={handlePublish}
                disabled={isProcessingVideo}
                className="flex-[2] bg-neon-pink py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(255,0,255,0.3)] disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
             >
                {isProcessingVideo ? 'Enviando...' : 'Publicar'}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
