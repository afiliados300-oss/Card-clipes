
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ViewState } from '../types';

export const Dashboard: React.FC = () => {
  const { currentUser, updateUserPaymentInfo, videos, requestWithdrawal, platformFee, setView, logout, orders, updateOrderStatus } = useApp();
  
  // View Mode: 'advertiser' (Seller) or 'buyer' (Consumer)
  // Default to advertiser if creator, otherwise buyer
  const isCreator = currentUser?.role === 'creator' || currentUser?.role === 'admin';
  const [viewMode, setViewMode] = useState<'advertiser' | 'buyer'>(isCreator ? 'advertiser' : 'buyer');

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'wallet' | 'settings' | 'orders'>('overview');
  
  // Settings State
  const [pixKey, setPixKey] = useState(currentUser?.paymentInfo?.pixKey || '');
  const [companyName, setCompanyName] = useState(currentUser?.paymentInfo?.companyName || '');
  const [logoUrl, setLogoUrl] = useState(currentUser?.paymentInfo?.logoUrl || '');
  const [fullName, setFullName] = useState(currentUser?.paymentInfo?.fullName || '');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (!currentUser) return null; 

  const handleSaveSettings = () => {
    updateUserPaymentInfo({
        pixKey,
        companyName,
        logoUrl,
        fullName
    });
    alert('Perfil atualizado com sucesso!');
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > currentUser.balance) return;
    requestWithdrawal(amount);
    setWithdrawAmount('');
    alert('Saque solicitado com sucesso! Aguarde aprovação do Admin.');
  };

  // Filter Data
  const myVideos = videos.filter(v => v.userId === currentUser.id); 
  const mySales = orders.filter(o => o.sellerId === currentUser.id);
  const myPurchases = orders.filter(o => o.buyerId === currentUser.id); // For Buyers

  const sortedVideos = [...myVideos].sort((a, b) => {
      if (a.status === 'pending_payment' && b.status !== 'pending_payment') return -1;
      if (a.status !== 'pending_payment' && b.status === 'pending_payment') return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
            <img src={currentUser.avatar} className="w-16 h-16 rounded-full border-2 border-neon-blue object-cover" alt="profile" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold truncate">{currentUser.paymentInfo?.companyName || currentUser.name}</h1>
                <span className={`text-[10px] px-2 rounded-full border ${currentUser.role === 'creator' ? 'border-neon-pink text-neon-pink' : 'border-neon-blue text-neon-blue'}`}>
                    {currentUser.role === 'creator' ? 'CRIADOR' : 'CLIENTE'}
                </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
        </div>
        
        <button 
            onClick={logout}
            className="bg-red-900/20 text-red-500 text-xs px-3 py-1 rounded-full border border-red-900 hover:bg-red-900/40 transition-colors"
        >
            Sair
        </button>
      </div>

      {/* --- MODE TOGGLE (ANUNCIANTE vs VER PRODUTOS) --- */}
      <div className="grid grid-cols-2 gap-3 mb-6 bg-[#1a1a1a] p-1.5 rounded-xl border border-gray-800">
          <button 
            onClick={() => {
                setViewMode('advertiser');
                setActiveTab('overview');
            }}
            className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all ${viewMode === 'advertiser' ? 'bg-gradient-to-r from-neon-pink to-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800'}`}
          >
              <span className="text-lg mb-1">💼</span>
              <span className="text-xs font-bold uppercase tracking-wider">Anunciante</span>
          </button>
          
          <button 
            onClick={() => {
                setViewMode('buyer');
                setActiveTab('orders');
            }}
            className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all ${viewMode === 'buyer' ? 'bg-gradient-to-r from-neon-blue to-cyan-600 text-black shadow-lg' : 'text-gray-500 hover:bg-gray-800'}`}
          >
              <span className="text-lg mb-1">🛍️</span>
              <span className="text-xs font-bold uppercase tracking-wider">Ver Produtos</span>
          </button>
      </div>

      {/* --- CONTENT BASED ON MODE --- */}

      {/* ================= ADVERTISER MODE ================= */}
      {viewMode === 'advertiser' && (
        <>
            {!isCreator ? (
                // NON-CREATOR VIEWING ADVERTISER TAB
                <div className="text-center py-10 px-4 animate-fade-in border border-dashed border-gray-700 rounded-xl">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Torne-se um Anunciante</h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Comece a vender seus produtos hoje mesmo! Publique vídeos e ganhe dinheiro com comissões.
                    </p>
                    <button 
                        onClick={() => {
                            logout();
                            // In a real app, this would redirect to an upgrade flow. 
                            // Here we just ask them to re-register or contact admin contextually.
                            alert("Para mudar de conta, por favor faça logout e crie uma nova conta como 'Quero Vender' ou entre em contato com o suporte.");
                        }}
                        className="bg-neon-pink text-white font-bold py-3 px-6 rounded-full shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                    >
                        Criar Conta de Vendedor
                    </button>
                </div>
            ) : (
                // CREATOR DASHBOARD
                <>
                    {/* Sub-Tabs for Advertiser */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'overview' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Painel</button>
                        <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'sales' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Vendas</button>
                        <button onClick={() => setActiveTab('wallet')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'wallet' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Carteira</button>
                        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'settings' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Config</button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-purple-900 to-black p-4 rounded-xl border border-purple-500/30">
                                    <p className="text-gray-300 text-xs mb-1">Vídeos Ativos</p>
                                    <p className="text-2xl font-bold text-white">{myVideos.filter(v => v.status === 'active').length}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-900 to-black p-4 rounded-xl border border-blue-500/30">
                                    <p className="text-gray-300 text-xs mb-1">Visualizações</p>
                                    <p className="text-2xl font-bold text-white">{myVideos.reduce((a, b) => a + (b.likes * 10), 0)}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg">Seus Anúncios ({sortedVideos.length})</h3>
                                    <button onClick={() => setView(ViewState.UPLOAD)} className="text-xs text-neon-pink font-bold border border-neon-pink px-3 py-1.5 rounded-full hover:bg-neon-pink hover:text-white transition-colors">+ Novo Anúncio</button>
                                </div>
                                
                                <div className="space-y-3">
                                    {sortedVideos.map(video => (
                                        <div key={video.id} className="flex gap-3 bg-[#1a1a1a] p-2 rounded-lg items-center border border-gray-800">
                                            <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden relative shrink-0">
                                                <video src={video.url} className="w-full h-full object-cover" muted />
                                                {video.status === 'pending_payment' && <div className="absolute inset-0 bg-yellow-500/50 flex items-center justify-center text-[10px] font-bold">...</div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white font-bold truncate">{video.product?.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{video.product?.brand || 'Sem marca'}</p>
                                                <p className="text-[10px] text-gray-500 truncate">Tags: {video.tags?.join(', ')}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap ${
                                                video.status === 'active' ? 'border-green-500 text-green-500' :
                                                video.status === 'rejected' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'
                                            }`}>
                                                {video.status === 'active' ? 'NO AR' : video.status === 'rejected' ? 'RECUSADO' : 'PENDENTE'}
                                            </div>
                                        </div>
                                    ))}
                                    {sortedVideos.length === 0 && (
                                        <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                                            <p className="text-gray-500 text-sm mb-2">Você ainda não tem anúncios.</p>
                                            <button onClick={() => setView(ViewState.UPLOAD)} className="bg-neon-blue text-black font-bold px-4 py-2 rounded-full text-xs">
                                                Criar Primeiro Anúncio
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sales' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <h3 className="font-bold text-gray-300 text-sm mb-1">Pedidos Recebidos</h3>
                                <p className="text-xs text-gray-500">Confira o PIX na sua conta bancária antes de confirmar.</p>
                            </div>

                            {mySales.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">Nenhuma venda ainda.</p>
                            ) : (
                                mySales.map(order => (
                                    <div key={order.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                                        <div className="bg-gray-900 p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm text-white">Pedido #{order.id.slice(-5)}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                order.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                                                order.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                            }`}>
                                                {order.status === 'pending_verification' ? 'AGUARDANDO APROVAÇÃO' : 
                                                order.status === 'paid' ? 'PAGO / ENVIAR' : order.status}
                                            </span>
                                        </div>
                                        
                                        <div className="p-3 border-b border-gray-800">
                                            <p className="text-xs text-gray-400 mb-1">Comprador: <span className="text-white font-bold">{order.buyerName}</span></p>
                                            <div className="bg-black/40 p-2 rounded border border-gray-700 mb-2">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Entregar Para</p>
                                                <p className="text-xs text-gray-300">{order.shippingAddress.street}, {order.shippingAddress.number} {order.shippingAddress.complement}</p>
                                                <p className="text-xs text-gray-300">{order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state}</p>
                                                <p className="text-xs text-gray-300">CEP: {order.shippingAddress.zipCode}</p>
                                            </div>

                                            {order.transactionProof && (
                                                <div className="bg-black/50 p-2 rounded border border-gray-700 text-[10px] font-mono text-gray-300 mb-2">
                                                    ID/Comprovante: {order.transactionProof}
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <p key={idx} className="text-xs text-gray-300">• {item.quantity}x {item.name}</p>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 flex justify-between items-center bg-black/20">
                                            <p className="text-lg font-bold text-white">R$ {order.total.toFixed(2)}</p>
                                            
                                            {order.status === 'pending_verification' && (
                                                <button 
                                                    onClick={() => updateOrderStatus(order.id, 'paid')}
                                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-lg shadow-green-900/50"
                                                >
                                                    Confirmar PIX
                                                </button>
                                            )}
                                            {order.status === 'paid' && (
                                                <button disabled className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-xs opacity-50 cursor-not-allowed">
                                                    Pronto para Envio
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 text-center">
                                <p className="text-gray-400 mb-2">Saldo Cashback / Bônus</p>
                                <h2 className="text-4xl font-bold text-green-400 mb-4">R$ {currentUser.balance.toFixed(2)}</h2>
                                <p className="text-[10px] text-gray-500">O valor das vendas diretas vai para sua conta bancária. Este saldo é referente a bônus da plataforma.</p>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                                <h3 className="font-bold mb-4">Solicitar Saque (Bônus)</h3>
                                {currentUser.paymentInfo?.pixKey ? (
                                    <>
                                        <div className="mb-4">
                                            <label className="text-xs text-gray-400 block mb-1">Chave Pix</label>
                                            <input disabled value={currentUser.paymentInfo.pixKey} className="w-full bg-black p-3 rounded text-gray-500" />
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                placeholder="Valor" 
                                                value={withdrawAmount}
                                                onChange={e => setWithdrawAmount(e.target.value)}
                                                className="flex-1 bg-black border border-gray-700 p-3 rounded text-white outline-none focus:border-neon-pink"
                                            />
                                            <button onClick={handleWithdraw} className="bg-neon-pink px-6 rounded font-bold text-white">
                                                Sacar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-yellow-400 mb-2 text-sm">⚠ Configure sua chave Pix em "Config" primeiro</p>
                                        <button onClick={() => setActiveTab('settings')} className="text-neon-blue text-xs underline">Ir para Configurações</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fade-in space-y-4">
                             <h3 className="font-bold text-gray-300 mb-2">Dados do Anunciante</h3>
                             <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 ml-1">Nome da Loja (Público)</label>
                                    <input 
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        className="w-full bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 focus:border-neon-pink outline-none text-white"
                                    />
                                </div>
                                <div className="bg-gray-900 p-3 rounded-xl border border-neon-blue/20">
                                    <label className="text-xs text-neon-blue font-bold ml-1 mb-1 block">SUA CHAVE PIX (Para receber dos clientes)</label>
                                    <input 
                                        value={pixKey}
                                        onChange={e => setPixKey(e.target.value)}
                                        placeholder="CPF, Email ou Aleatória"
                                        className="w-full bg-black p-3 rounded-lg border border-gray-800 focus:border-neon-blue outline-none text-white font-mono"
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveSettings}
                                    className="w-full bg-neon-blue text-black font-bold py-3 rounded-xl mt-2"
                                >
                                    Salvar Configurações
                                </button>
                                
                                <div className="pt-6 border-t border-gray-800 flex justify-center">
                                    <button 
                                        onClick={() => setView(ViewState.ADMIN)}
                                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                                    >
                                        🔒 Acesso Administrativo
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </>
            )}
        </>
      )}

      {/* ================= BUYER MODE (VER PRODUTOS) ================= */}
      {viewMode === 'buyer' && (
        <>
            {/* Sub-Tabs for Buyer */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'orders' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Minhas Compras</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeTab === 'settings' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}>Meus Dados</button>
            </div>

            {activeTab === 'orders' && (
                <div className="animate-fade-in space-y-4">
                    {myPurchases.length === 0 ? (
                        <div className="text-center py-10 bg-[#1a1a1a] rounded-xl border border-gray-800">
                            <p className="text-gray-400 mb-4">Você ainda não fez compras.</p>
                            <button onClick={() => setView(ViewState.FEED)} className="bg-neon-blue text-black px-6 py-2 rounded-full font-bold text-xs">
                                Explorar Feed
                            </button>
                        </div>
                    ) : (
                        myPurchases.map(order => (
                             <div key={order.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                                <div className="bg-gray-900 p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-white">Pedido #{order.id.slice(-5)}</p>
                                        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                        order.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                                        order.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {order.status === 'paid' ? 'PAGO' : 'AGUARDANDO'}
                                    </span>
                                </div>
                                <div className="p-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <img src={item.image} className="w-10 h-10 rounded bg-gray-700 object-cover" alt="p"/>
                                            <div>
                                                <p className="text-xs font-bold text-white">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">Qtd: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center">
                                        <p className="text-xs text-gray-500">Status: {order.status === 'pending_verification' ? 'Vendedor verificando PIX' : 'Pagamento Confirmado'}</p>
                                        <p className="font-bold text-neon-blue">Total: R$ {order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                             </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-fade-in space-y-4">
                     <div className="flex flex-col items-center mb-6">
                         <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-2 overflow-hidden border-2 border-dashed border-gray-600">
                            <img src={currentUser.avatar} className="w-full h-full object-cover" alt="avatar"/>
                         </div>
                         <p className="text-xs text-gray-500">{currentUser.name}</p>
                     </div>

                     <div className="space-y-3">
                         <div>
                             <label className="text-xs text-gray-400 ml-1">Nome Completo</label>
                             <input 
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 focus:border-neon-blue outline-none text-white"
                            />
                         </div>
                         <div>
                             <label className="text-xs text-gray-400 ml-1">Email</label>
                             <input 
                                disabled
                                value={currentUser.email}
                                className="w-full bg-[#0f0f0f] p-3 rounded-lg border border-gray-800 text-gray-500"
                            />
                         </div>

                         <button 
                            onClick={handleSaveSettings}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4"
                        >
                            Salvar Meus Dados
                        </button>
                     </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};
