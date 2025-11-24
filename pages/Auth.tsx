
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ViewState } from '../types';

export const Auth: React.FC = () => {
    const { register, login, setView } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'user' | 'creator'>('user');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Preencha todos os campos.');
            return;
        }

        if (isLogin) {
            const success = login(email, password);
            if (success) {
                // Login successful, view will be controlled by App.tsx
            } else {
                setError('E-mail ou senha incorretos.');
            }
        } else {
            if (!name) {
                setError('Nome é obrigatório para cadastro.');
                return;
            }
            const success = register(email, password, name, role);
            if (success) {
                // Registered and auto-logged in
            } else {
                setError('E-mail já cadastrado.');
            }
        }
    };

    return (
        <div className="h-full bg-black text-white p-6 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            {/* Background Glows */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-pink/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-neon-blue/30 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="z-10 w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue bg-clip-text text-transparent mb-2">
                        ClipCart
                    </h1>
                    <p className="text-gray-400">
                        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta no ClipCart'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-4 border border-gray-800">
                                <button 
                                    type="button"
                                    onClick={() => setRole('user')}
                                    className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${role === 'user' ? 'bg-neon-blue text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    QUERO COMPRAR
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setRole('creator')}
                                    className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${role === 'creator' ? 'bg-neon-pink text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    QUERO VENDER
                                </button>
                            </div>

                            <div className="group">
                                <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block group-focus-within:text-neon-blue transition-colors">SEU NOME / MARCA</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={role === 'creator' ? "Nome da Loja" : "Seu Nome Completo"}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 focus:border-neon-blue text-white p-4 rounded-xl outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </>
                    )}

                    <div className="group">
                        <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block group-focus-within:text-neon-pink transition-colors">E-MAIL</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@email.com"
                            className="w-full bg-[#1a1a1a] border border-gray-800 focus:border-neon-pink text-white p-4 rounded-xl outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="group">
                        <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block group-focus-within:text-neon-purple transition-colors">SENHA</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#1a1a1a] border border-gray-800 focus:border-neon-purple text-white p-4 rounded-xl outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:to-neon-blue text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all active:scale-95 mt-4"
                    >
                        {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-sm text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4"
                    >
                        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center flex flex-col gap-4">
                    <button onClick={() => setView(ViewState.FEED)} className="text-xs text-gray-600 hover:text-gray-400">
                        Voltar para o Feed (Assistir sem logar)
                    </button>

                    <button 
                        onClick={() => setView(ViewState.ADMIN)} 
                        className="text-[10px] text-gray-800 hover:text-red-500 font-mono uppercase tracking-widest transition-colors"
                    >
                        🔒 Acesso Administrativo
                    </button>
                </div>
            </div>
        </div>
    );
};
