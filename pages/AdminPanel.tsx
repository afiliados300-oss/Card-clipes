
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ViewState, AdType, VideoStatus } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    videos, 
    users,
    withdrawalRequests, 
    creditTransactions,
    approveVideo, 
    rejectVideo, 
    blockVideo,
    processWithdrawal, 
    adminResetFreeLimit,
    adminAddCredits,
    adminBanUser,
    adminDeleteUser, // New
    platformFee, 
    setPlatformFee,
    adPrice,
    setAdPrice,
    adminPixKey,
    setAdminPixKey,
    setView,
    totalRevenue
  } = useApp();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // CMD Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'users' | 'financial' | 'config'>('dashboard');
  
  // Ad Management Filters
  const [adFilterType, setAdFilterType] = useState<AdType | 'all'>('all');
  const [adFilterStatus, setAdFilterStatus] = useState<VideoStatus | 'all'>('all');

  // Local Config State
  const [localFee, setLocalFee] = useState(platformFee);
  const [localAdPrice, setLocalAdPrice] = useState(adPrice);
  const [localPixKey, setLocalPixKey] = useState(adminPixKey);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalFee(platformFee);
    setLocalAdPrice(adPrice);
    setLocalPixKey(adminPixKey);
  }, [platformFee, adPrice, adminPixKey]);

  const handleSaveConfigs = () => {
      setPlatformFee(localFee);
      setAdPrice(localAdPrice);
      setAdminPixKey(localPixKey);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
      if (window.confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
          adminDeleteUser(userId);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (email === 'admin@clipcart.com' && password === 'admin123') {
          setIsAuthenticated(true);
          setError('');
      } else {
          setError('Acesso negado.');
      }
  };

  // --- DATA AGGREGATION ---
  const filteredVideos = videos.filter(v => {
      if (adFilterType !== 'all' && v.adType !== adFilterType) return false;
      if (adFilterStatus !== 'all' && v.status !== adFilterStatus) return false;
      return true;
  });

  const totalUsers = users.length;
  const activeAds = videos.filter(v => v.status === 'active').length;
  const blockedAds = videos.filter(v => v.status === 'blocked').length;
  const freeAdsUsedTotal = users.reduce((acc, u) => acc + u.freeAdsUsed, 0);
  const totalCreditsPurchased = creditTransactions.reduce((acc, t) => acc + (t.status === 'approved' ? t.credits : 0), 0);
  const totalPixRevenue = creditTransactions.reduce((acc, t) => acc + (t.status === 'approved' ? t.amount : 0), 0);

  // Chart Data
  const DASH_DATA = [
      { name: 'Seg', revenue: totalRevenue * 0.1 },
      { name: 'Ter', revenue: totalRevenue * 0.15 },
      { name: 'Qua', revenue: totalRevenue * 0.12 },
      { name: 'Qui', revenue: totalRevenue * 0.18 },
      { name: 'Sex', revenue: totalRevenue * 0.25 },
      { name: 'Sab', revenue: totalRevenue * 0.15 },
      { name: 'Dom', revenue: totalRevenue * 0.05 },
  ];

  // --- COMPONENTS ---

  const StatusBadge = ({ status }: { status: string }) => {
      let color = 'bg-gray-700 text-gray-300';
      if (status === 'active') color = 'bg-green-500/20 text-green-400 border border-green-500/50';
      if (status === 'pending_payment') color = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
      if (status === 'rejected') color = 'bg-red-500/20 text-red-400 border border-red-500/50';
      if (status === 'blocked') color = 'bg-red-900 text-red-500 font-black border border-red-500';
      
      return <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${color}`}>{status}</span>;
  };

  const AdTypeBadge = ({ type }: { type?: AdType }) => {
      if (!type) return <span className="text-[10px] text-gray-500">Geral</span>;
      const colors: Record<string, string> = {
          product: 'bg-blue-500/20 text-blue-400',
          instagram: 'bg-pink-500/20 text-pink-400',
          youtube: 'bg-red-600/20 text-red-400',
          store: 'bg-green-500/20 text-green-400'
      };
      return <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${colors[type] || 'text-gray-500'}`}>{type}</span>;
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="h-full bg-black text-white p-6 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-neon-pink/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-neon-blue/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="z-10 w-full max-w-sm bg-[#1a1a1a]/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">ClipCart CMD</h1>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Acesso Administrativo</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-neon-pink"/>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-neon-blue"/>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl transition-colors">ENTRAR</button>
                    <button type="button" onClick={() => setView(ViewState.DASHBOARD)} className="w-full text-gray-500 text-xs py-2">Voltar para App</button>
                </form>
            </div>
        </div>
    );
  }

  // --- MAIN ADMIN PANEL ---
  return (
    <div className="h-full bg-dark-bg text-white p-6 overflow-y-auto pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">Centro de Comando</h1>
            <p className="text-[10px] text-gray-500">ClipCart Admin v2.0</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs bg-red-900/20 text-red-500 border border-red-900 px-3 py-1 rounded hover:bg-red-900/40">Sair</button>
      </div>

      {/* NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { id: 'dashboard', label: 'Visão Geral' },
          { id: 'ads', label: 'Gestão Anúncios' },
          { id: 'users', label: 'Usuários & Limites' },
          { id: 'financial', label: 'Financeiro (Pix)' },
          { id: 'config', label: 'Configurações' }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap uppercase tracking-wide transition-all ${
                    activeTab === tab.id ? 'bg-neon-blue text-black shadow-lg shadow-neon-blue/20' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-gray-600'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-500 text-[10px] uppercase">Usuários</p>
                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-500 text-[10px] uppercase">Anúncios Ativos</p>
                    <p className="text-2xl font-bold text-neon-blue">{activeAds}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-500 text-[10px] uppercase">Grátis Usados</p>
                    <p className="text-2xl font-bold text-orange-400">{freeAdsUsedTotal}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-500 text-[10px] uppercase">Créditos Pix</p>
                    <p className="text-2xl font-bold text-green-400">{totalCreditsPurchased}</p>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 h-64">
                <h3 className="font-bold text-xs text-gray-500 uppercase mb-4">Fluxo de Receita Semanal</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DASH_DATA}>
                        <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                        <Bar dataKey="revenue" fill="#bf00ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Audit Log (Simulated) */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                <h3 className="font-bold text-xs text-gray-500 uppercase mb-4">Log de Auditoria</h3>
                <div className="space-y-2 text-[10px] text-gray-400 font-mono">
                    <p>• {new Date().toLocaleTimeString()} - Admin logou no sistema.</p>
                    <p>• {new Date().toLocaleTimeString()} - Verificação automática de links concluída.</p>
                    <p>• Ontem - Usuário runner_pro comprou 10 créditos.</p>
                </div>
            </div>
        </div>
      )}

      {/* --- ADS MANAGEMENT TAB --- */}
      {activeTab === 'ads' && (
        <div className="space-y-4 animate-fade-in">
             <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800 flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setAdFilterType('all')} className={`px-3 py-1 rounded text-xs ${adFilterType === 'all' ? 'bg-white text-black' : 'bg-black text-gray-400'}`}>Todos</button>
                <button onClick={() => setAdFilterType('product')} className={`px-3 py-1 rounded text-xs ${adFilterType === 'product' ? 'bg-blue-500 text-white' : 'bg-black text-gray-400'}`}>Produtos</button>
                <button onClick={() => setAdFilterType('instagram')} className={`px-3 py-1 rounded text-xs ${adFilterType === 'instagram' ? 'bg-pink-500 text-white' : 'bg-black text-gray-400'}`}>Instagram</button>
                <button onClick={() => setAdFilterType('youtube')} className={`px-3 py-1 rounded text-xs ${adFilterType === 'youtube' ? 'bg-red-500 text-white' : 'bg-black text-gray-400'}`}>YouTube</button>
                <button onClick={() => setAdFilterType('store')} className={`px-3 py-1 rounded text-xs ${adFilterType === 'store' ? 'bg-green-500 text-white' : 'bg-black text-gray-400'}`}>Loja</button>
             </div>

             <div className="space-y-3">
                {filteredVideos.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum anúncio encontrado com este filtro.</p> :
                filteredVideos.map(video => (
                    <div key={video.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                             <div className="flex gap-3">
                                <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden">
                                    <video src={video.url} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">@{video.username}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <AdTypeBadge type={video.adType} />
                                        <StatusBadge status={video.status} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">{video.description.substring(0, 50)}...</p>
                                </div>
                             </div>
                        </div>
                        
                        <div className="flex gap-2 bg-black/50 p-2 rounded text-[10px] font-mono text-gray-400 break-all">
                            🔗 {video.product?.productUrl || 'Sem Link'}
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-gray-800 pt-3">
                            {video.status === 'pending_payment' && (
                                <button onClick={() => approveVideo(video.id)} className="bg-green-500 text-black font-bold py-2 rounded text-xs hover:bg-green-400">APROVAR</button>
                            )}
                            {video.status === 'active' && (
                                <button onClick={() => blockVideo(video.id)} className="bg-orange-500 text-black font-bold py-2 rounded text-xs hover:bg-orange-400">BLOQUEAR</button>
                            )}
                            {(video.status === 'active' || video.status === 'pending_payment') && (
                                <button onClick={() => rejectVideo(video.id)} className="bg-red-900/30 text-red-400 border border-red-900 font-bold py-2 rounded text-xs hover:bg-red-900/50">REJEITAR</button>
                            )}
                            <button className="bg-gray-800 text-white font-bold py-2 rounded text-xs hover:bg-gray-700">EDITAR</button>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      )}

      {/* --- USERS & LIMITS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
             <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 mb-4">
                 <h3 className="font-bold text-xs text-gray-400 uppercase mb-2">Controle Geral de Criadores</h3>
                 <p className="text-[10px] text-gray-500">Gerencie limites do plano gratuito, adicione créditos manualmente e bana usuários fraudulentos.</p>
             </div>

             <div className="space-y-3">
                 {users.map(user => (
                     <div key={user.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                         <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-3">
                                 <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-700" alt="u" />
                                 <div>
                                     <h4 className="font-bold text-sm flex items-center gap-2">
                                        {user.name}
                                        {user.status === 'banned' && <span className="bg-red-600 text-white text-[9px] px-1 rounded">BANIDO</span>}
                                     </h4>
                                     <p className="text-[10px] text-gray-500">{user.email}</p>
                                     <p className="text-[10px] text-gray-500">Tipo: {user.role === 'creator' ? 'Anunciante' : 'Usuário'}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] text-gray-400">Créditos</p>
                                 <p className="font-bold text-neon-blue">{user.paidCredits}</p>
                             </div>
                         </div>

                         <div className="bg-black/50 p-3 rounded-lg flex justify-between items-center mb-3">
                             <div>
                                 <p className="text-[10px] text-gray-400 uppercase">Plano Grátis</p>
                                 <div className="flex items-center gap-1">
                                     <span className={`font-bold ${user.freeAdsUsed >= 3 ? 'text-red-500' : 'text-green-500'}`}>
                                         {user.freeAdsUsed} / 3
                                     </span>
                                     <span className="text-[10px] text-gray-600">usados</span>
                                 </div>
                             </div>
                             <button 
                                onClick={() => adminResetFreeLimit(user.id)}
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-600 text-white transition-colors"
                             >
                                 ↺ Resetar Limite
                             </button>
                         </div>

                         <div className="flex flex-wrap gap-2">
                             <button 
                                onClick={() => adminAddCredits(user.id, 5)}
                                className="flex-1 bg-green-900/20 text-green-400 border border-green-900 py-2 rounded text-[10px] font-bold hover:bg-green-900/40"
                             >
                                 +5 Créditos
                             </button>
                             <button 
                                onClick={() => adminBanUser(user.id, user.status === 'active' ? 'banned' : 'active')}
                                className={`flex-1 border py-2 rounded text-[10px] font-bold ${
                                    user.status === 'active' 
                                    ? 'bg-blue-900/20 text-blue-500 border-blue-900 hover:bg-blue-900/40' 
                                    : 'bg-gray-900/20 text-gray-500 border-gray-900 hover:bg-gray-900/40'
                                }`}
                             >
                                 {user.status === 'active' ? 'BANIR TEMP.' : 'DESBANIR'}
                             </button>
                             
                             {/* DELETE BUTTON - ADDED FEATURE */}
                             <button 
                                onClick={() => handleDeleteUserClick(user.id, user.name)}
                                className="bg-red-600 text-white border border-red-700 py-2 px-4 rounded text-[10px] font-bold hover:bg-red-700"
                             >
                                 EXCLUIR CONTA
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
      )}

      {/* --- FINANCIAL (PIX) TAB --- */}
      {activeTab === 'financial' && (
        <div className="space-y-6 animate-fade-in">
             {/* Summary */}
             <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gradient-to-br from-green-900/40 to-black p-4 rounded-xl border border-green-500/30">
                     <p className="text-[10px] text-gray-400 uppercase">Receita Pix (Créditos)</p>
                     <p className="text-xl font-bold text-green-400">R$ {totalPixRevenue.toFixed(2)}</p>
                 </div>
                 <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                     <p className="text-[10px] text-gray-400 uppercase">Saques Pendentes</p>
                     <p className="text-xl font-bold text-orange-400">{withdrawalRequests.filter(w => w.status === 'pending').length}</p>
                 </div>
             </div>

             {/* Credit Transactions List */}
             <div>
                 <h3 className="font-bold text-xs text-gray-400 uppercase mb-3 border-b border-gray-800 pb-2">Histórico de Compra de Créditos</h3>
                 <div className="space-y-2">
                     {creditTransactions.map(tx => (
                         <div key={tx.id} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                             <div>
                                 <p className="font-bold text-xs text-white">{tx.userName}</p>
                                 <p className="text-[10px] text-gray-500 font-mono">{tx.pixId} • {tx.date}</p>
                             </div>
                             <div className="text-right">
                                 <p className="font-bold text-green-400 text-sm">+ {tx.credits} Créditos</p>
                                 <p className="text-[10px] text-gray-400">R$ {tx.amount.toFixed(2)}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Withdrawals List */}
             <div>
                 <h3 className="font-bold text-xs text-gray-400 uppercase mb-3 border-b border-gray-800 pb-2">Solicitações de Saque (Criadores)</h3>
                 <div className="space-y-2">
                    {withdrawalRequests.map(req => (
                        <div key={req.id} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold">{req.userName}</span>
                                <span className={`text-xs font-bold ${req.status === 'pending' ? 'text-yellow-500' : 'text-gray-500'}`}>R$ {req.amount.toFixed(2)}</span>
                            </div>
                            {req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => processWithdrawal(req.id, 'approved')} className="bg-neon-blue text-black text-[10px] font-bold px-3 py-1 rounded">Pagar</button>
                                    <button onClick={() => processWithdrawal(req.id, 'rejected')} className="bg-gray-700 text-white text-[10px] font-bold px-3 py-1 rounded">Negar</button>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
             </div>
        </div>
      )}

      {/* --- CONFIG TAB --- */}
      {activeTab === 'config' && (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h3 className="font-bold mb-6 text-sm uppercase tracking-wider text-neon-pink border-b border-gray-800 pb-2">Regras Financeiras</h3>
                
                <div className="mb-4">
                    <label className="text-xs text-gray-400 block mb-2">Taxa da Plataforma (%)</label>
                    <input type="number" value={localFee} onChange={(e) => setLocalFee(Number(e.target.value))} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-bold outline-none focus:border-neon-pink" />
                </div>

                 <div className="mb-6">
                    <label className="text-xs text-gray-400 block mb-2">Preço por Anúncio (Crédito Avulso)</label>
                    <input type="number" value={localAdPrice} onChange={(e) => setLocalAdPrice(Number(e.target.value))} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-bold outline-none focus:border-neon-pink" />
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl border border-neon-blue/40 shadow-lg shadow-neon-blue/10 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-neon-blue text-black text-[9px] font-bold px-2 py-1">RECEBIMENTOS</div>
                    <label className="text-xs text-neon-blue font-bold block mb-2 uppercase tracking-wide">Carteira Oficial da Plataforma (PIX)</label>
                    <p className="text-[10px] text-gray-500 mb-2">Chave utilizada para receber pagamentos de taxas de upload e compra de créditos.</p>
                    <input 
                        type="text" 
                        value={localPixKey} 
                        onChange={(e) => setLocalPixKey(e.target.value)} 
                        className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-neon-blue" 
                        placeholder="Chave Pix UUID, CPF ou Email"
                    />
                </div>

                <button onClick={handleSaveConfigs} className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${showSaveSuccess ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-white text-black shadow-white/10 hover:bg-gray-200'}`}>
                    {showSaveSuccess ? 'CONFIGURAÇÕES SALVAS!' : 'Salvar Alterações'}
                </button>
             </div>
        </div>
      )}
    </div>
  );
};
