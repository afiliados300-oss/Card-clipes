import React from 'react';
import { useApp } from '../context/AppContext';
import { ViewState } from '../types';
import { ShoppingBagIcon } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { setView, currentView, cart } = useApp();

  const NavItem = ({ view, icon, label, primary = false }: { view: ViewState, icon: React.ReactNode, label: string, primary?: boolean }) => (
    <button 
      onClick={() => setView(view)}
      className={`flex flex-col items-center justify-center gap-1 w-full ${primary ? '-mt-6' : ''}`}
    >
      {primary ? (
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink flex items-center justify-center shadow-lg border-2 border-white">
            <span className="text-2xl text-black font-bold">+</span>
        </div>
      ) : (
        <div className={`transition-colors ${currentView === view ? 'text-white' : 'text-gray-500'}`}>
            {icon}
        </div>
      )}
      <span className={`text-[10px] ${currentView === view ? 'text-white font-bold' : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden max-w-md mx-auto border-x border-gray-900 shadow-2xl relative">
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>

      <nav className="h-[70px] bg-black/90 backdrop-blur-md border-t border-gray-800 flex justify-between items-center px-2 pb-2 absolute bottom-0 w-full z-40">
        <NavItem 
            view={ViewState.FEED} 
            label="Início"
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25L3 9v12.75h18V9l-9-6.75z" /></svg>} 
        />
        <NavItem 
            view={ViewState.DISCOVER} 
            label="Descobrir"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>} 
        />
        
        <NavItem view={ViewState.UPLOAD} label="" icon={null} primary />

        <div className="relative">
             <NavItem 
                view={ViewState.CHECKOUT} 
                label="Carrinho"
                icon={<ShoppingBagIcon />} 
            />
            {cart.length > 0 && (
                <span className="absolute top-0 right-3 w-4 h-4 bg-neon-pink text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
            )}
        </div>

        <NavItem 
            view={ViewState.DASHBOARD} 
            label="Perfil"
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>} 
        />
      </nav>
    </div>
  );
};