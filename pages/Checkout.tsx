
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ViewState, CartItem, User, ShippingAddress } from '../types';

export const Checkout: React.FC = () => {
  const { cart, removeFromCart, setView, getUserById, createOrder, clearCart, currentUser } = useApp();
  const [processingSellerId, setProcessingSellerId] = useState<string | null>(null);
  const [proofs, setProofs] = useState<Record<string, string>>({});
  
  // Shipping Address State
  const [address, setAddress] = useState<ShippingAddress>({
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
  });
  
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [showPaymentForSeller, setShowPaymentForSeller] = useState<string | null>(null);

  // Group items by Seller
  const groupedCart: Record<string, CartItem[]> = cart.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
  }, {} as Record<string, CartItem[]>);

  const validateAddress = () => {
      if (address.fullName && address.email && address.street && address.number && address.neighborhood && address.city && address.state && address.zipCode) {
          setIsAddressValid(true);
          return true;
      }
      alert("Por favor, preencha todos os campos do endereço de entrega.");
      return false;
  };

  const openPaymentForSeller = (sellerId: string) => {
      if (validateAddress()) {
          setShowPaymentForSeller(sellerId);
      }
  };

  const handlePaySeller = (sellerId: string) => {
      const items = groupedCart[sellerId];
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const proof = proofs[sellerId] || '';

      setProcessingSellerId(sellerId);
      
      setTimeout(() => {
          createOrder(sellerId, items, total, proof, address);
          clearCart(sellerId);
          setProcessingSellerId(null);
          setShowPaymentForSeller(null);
          alert("Pedido enviado! O vendedor irá conferir seu Pix e enviar para o endereço cadastrado.");
          if (cart.length === items.length) { // If this was the last group
             setView(ViewState.FEED);
          }
      }, 1500);
  };

  const handleProofChange = (sellerId: string, value: string) => {
      setProofs(prev => ({ ...prev, [sellerId]: value }));
  };

  if (cart.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-black text-white">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🛒</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Carrinho vazio</h2>
              <p className="text-gray-400 mb-6">Assista alguns vídeos para encontrar coisas legais!</p>
              <button onClick={() => setView(ViewState.FEED)} className="bg-neon-blue text-black px-6 py-3 rounded-full font-bold">Ir às Compras</button>
          </div>
      )
  }

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      {/* --- ADDRESS FORM --- */}
      <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <span className="text-xl">📍</span>
              <h3 className="font-bold text-white">Endereço de Entrega</h3>
          </div>
          
          <div className="space-y-3">
              <input 
                  placeholder="Nome Completo do Destinatário"
                  value={address.fullName}
                  onChange={e => setAddress({...address, fullName: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
              />
               <input 
                  placeholder="E-mail de Contato"
                  value={address.email}
                  onChange={e => setAddress({...address, email: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
              />
              <div className="flex gap-2">
                  <input 
                      placeholder="CEP"
                      value={address.zipCode}
                      onChange={e => setAddress({...address, zipCode: e.target.value})}
                      className="w-1/3 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
                  <input 
                      placeholder="Cidade"
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="flex-1 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
                  <input 
                      placeholder="UF"
                      value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})}
                      className="w-16 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
              </div>
               <div className="flex gap-2">
                  <input 
                      placeholder="Rua / Avenida"
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      className="flex-[3] bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
                  <input 
                      placeholder="Nº"
                      value={address.number}
                      onChange={e => setAddress({...address, number: e.target.value})}
                      className="flex-1 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
              </div>
               <div className="flex gap-2">
                  <input 
                      placeholder="Bairro"
                      value={address.neighborhood}
                      onChange={e => setAddress({...address, neighborhood: e.target.value})}
                      className="flex-1 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
                  <input 
                      placeholder="Comp. (Apto, Bloco)"
                      value={address.complement}
                      onChange={e => setAddress({...address, complement: e.target.value})}
                      className="flex-1 bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-blue outline-none"
                  />
              </div>
          </div>
      </div>

      <h3 className="font-bold text-gray-400 text-xs uppercase mb-4">Itens do Pedido</h3>

      <div className="space-y-8">
        {Object.entries(groupedCart).map(([sellerId, items]) => {
            const seller = getUserById(sellerId);
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const isPayingThisSeller = showPaymentForSeller === sellerId;
            
            return (
                <div key={sellerId} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden relative">
                    {/* Header Vendedor */}
                    <div className="bg-gray-900 p-4 border-b border-gray-800 flex items-center gap-3">
                         <img src={seller?.avatar || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full" alt="s" />
                         <div>
                             <p className="text-[10px] text-gray-400 uppercase">Loja Parceira</p>
                             <p className="font-bold text-sm">{seller?.paymentInfo?.companyName || seller?.name || 'Vendedor Desconhecido'}</p>
                         </div>
                    </div>

                    {/* Itens */}
                    <div className="p-4 space-y-3">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3">
                                <img src={item.image} className="w-12 h-12 rounded object-cover bg-gray-800" alt="p" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-neon-pink text-sm">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-400 underline">Remover</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Payment Action */}
                    <div className="bg-black/40 p-4 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-300">Total:</span>
                            <span className="text-xl font-bold text-white">R$ {total.toFixed(2)}</span>
                        </div>

                        {!isPayingThisSeller ? (
                            <button 
                                onClick={() => openPaymentForSeller(sellerId)}
                                className="w-full bg-neon-blue hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-all"
                            >
                                Fechar Pedido com {seller?.name?.split(' ')[0]}
                            </button>
                        ) : (
                            <div className="animate-fade-in space-y-4 pt-2 border-t border-gray-700">
                                {seller?.paymentInfo?.pixKey ? (
                                    <>
                                        <div className="bg-gray-800/80 p-4 rounded-lg border border-neon-blue text-center">
                                            <p className="text-xs text-neon-blue font-bold mb-2 uppercase tracking-wide">CHAVE PIX PARA PAGAMENTO</p>
                                            <p className="font-mono text-lg text-white select-all break-all bg-black p-2 rounded mb-2 border border-gray-600">
                                                {seller.paymentInfo.pixKey}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Beneficiário: {seller.paymentInfo.fullName}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Confirmação</label>
                                            <input 
                                                type="text" 
                                                placeholder="Cole o ID da transação ou digite 'PAGO'"
                                                value={proofs[sellerId] || ''}
                                                onChange={(e) => handleProofChange(sellerId, e.target.value)}
                                                className="w-full bg-black border border-gray-700 p-3 rounded text-sm text-white focus:border-neon-pink outline-none mb-3"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => handlePaySeller(sellerId)}
                                            disabled={processingSellerId === sellerId || !proofs[sellerId]}
                                            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                                        >
                                            {processingSellerId === sellerId ? 'Processando...' : 'Confirmar Pagamento e Enviar Pedido'}
                                        </button>
                                        
                                        <button 
                                            onClick={() => setShowPaymentForSeller(null)}
                                            className="w-full text-xs text-gray-500 py-2 hover:text-white"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-red-900/20 p-3 rounded border border-red-900 text-center">
                                        <p className="text-red-400 text-xs">Erro: Vendedor sem chave Pix configurada.</p>
                                        <button onClick={() => setShowPaymentForSeller(null)} className="text-xs text-white underline mt-2">Fechar</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
