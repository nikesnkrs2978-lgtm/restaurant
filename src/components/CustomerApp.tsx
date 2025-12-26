"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { MenuItem, Order } from '@/types';
import { Button, Card, Badge, IconPlus, IconMinus, IconShoppingBag, IconCheck, Input, IconArrowRight, IconX, IconClock, IconCreditCard, IconSmartphone, IconZap } from './UI';

interface CustomerAppProps {
    tableId: string;
}

// --- Modern Sub-components ---

const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
      px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap
      ${active
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] transform scale-105'
                : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'
            }
    `}
    >
        {label}
    </button>
);

const MenuCard: React.FC<{ item: MenuItem; onAdd: () => void }> = ({ item, onAdd }) => (
    <div className="group animate-fade-in">
        <div
            onClick={onAdd}
            className="relative h-[22rem] w-full rounded-[2.5rem] overflow-hidden cursor-pointer mb-4 border border-white/5 shadow-2xl"
        >
            {item.imageUrl && (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            )}

            {/* Stronger gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90" />

            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-extrabold text-3xl leading-none tracking-tight">{item.name}</h3>
                    <span className="text-white font-bold text-2xl">${item.price}</span>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
                    {item.description}
                </p>

                <div className="flex items-center justify-between mt-1">
                    {/* Nutrition Info Pills */}
                    <div className="flex gap-2">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                            {item.calories} kcal
                        </div>
                        <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                            {item.macros}
                        </div>
                    </div>

                    <button className="h-12 w-12 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.5)] active:scale-95 transition-transform">
                        <IconPlus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const DynamicIslandCart = ({ count, total, onClick }: { count: number; total: number; onClick: () => void }) => {
    if (count === 0) return null;
    return (
        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 animate-pop">
            <button
                onClick={onClick}
                className="
            bg-[#121214]/90 backdrop-blur-2xl text-white 
            w-full max-w-sm h-20 rounded-[2.5rem] 
            flex items-center justify-between px-2 pl-3 pr-8
            shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]
            border border-white/10
            group hover:scale-[1.02] transition-transform duration-300
        "
            >
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {count}
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold">${total.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-accent group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-bold">Review</span>
                    <IconArrowRight className="w-5 h-5" />
                </div>
            </button>
        </div>
    );
};

const CartSheet = ({ items, menu, onClose, onUpdateQty, onPlaceOrder, loading }: any) => {
    const total = items.reduce((sum: number, item: any) => {
        const menuItem = menu.find((m: any) => m.id === item.id);
        return sum + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="relative bg-[#0F0F11] rounded-t-[3rem] p-8 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col border-t border-white/10">

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Your Order</h2>
                    <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white"><IconX className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar pr-2 pb-4">
                    {items.map((cartItem: any) => {
                        const menuItem = menu.find((m: any) => m.id === cartItem.id);
                        if (!menuItem) return null;
                        return (
                            <div key={cartItem.id} className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-4 flex-1">
                                    {menuItem.imageUrl && (
                                        <img src={menuItem.imageUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                                    )}
                                    <div>
                                        <h4 className="text-white font-bold text-lg leading-tight">{menuItem.name}</h4>
                                        <p className="text-accent text-sm font-bold mt-1">${menuItem.price}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 bg-black rounded-2xl p-1">
                                    <button onClick={() => onUpdateQty(cartItem.id, 1)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-300"><IconPlus className="w-4 h-4" /></button>
                                    <span className="text-white font-mono font-bold text-sm">{cartItem.qty}</span>
                                    <button onClick={() => onUpdateQty(cartItem.id, -1)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-300"><IconMinus className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-400">Total Amount</span>
                        <span className="text-3xl font-bold text-white">${total.toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full text-lg h-16 rounded-[1.5rem]"
                        onClick={onPlaceOrder}
                        disabled={items.length === 0 || loading}
                        loading={loading}
                    >
                        Confirm & Send to Kitchen
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Payment System ---

const PaymentModal = ({ total, onClose, onConfirm }: { total: number, onClose: () => void, onConfirm: () => void }) => {
    const [method, setMethod] = useState<'apple' | 'card' | 'crypto'>('apple');
    const [processing, setProcessing] = useState(false);
    const [loadingText, setLoadingText] = useState('Processing...');

    const handlePay = () => {
        setProcessing(true);
        setLoadingText('Authenticating...');
        setTimeout(() => setLoadingText('Processing Payment...'), 1000);
        setTimeout(() => {
            onConfirm();
        }, 2500);
    };

    const MethodCard = ({ id, icon: Icon, label, sub }: any) => (
        <button
            onClick={() => setMethod(id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${method === id
                ? 'bg-zinc-800 border-accent shadow-[0_0_15px_rgba(255,90,31,0.2)]'
                : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/80'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${method === id ? 'bg-accent text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className={`font-bold text-sm ${method === id ? 'text-white' : 'text-zinc-300'}`}>{label}</p>
                    <p className="text-xs text-zinc-500">{sub}</p>
                </div>
            </div>
            {method === id && (
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                    <IconCheck className="w-3 h-3 text-white" />
                </div>
            )}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity" onClick={processing ? undefined : onClose} />

            <div className="relative bg-[#0F0F11] rounded-t-[3rem] p-8 shadow-2xl animate-slide-up border-t border-white/10">

                <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
                </div>

                {!processing ? (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Total to Pay</p>
                            <h2 className="text-5xl font-extrabold text-white tracking-tight">${total.toFixed(2)}</h2>
                        </div>

                        <div className="space-y-3 mb-8">
                            <MethodCard id="apple" icon={IconSmartphone} label="Apple Pay" sub="Lumina Wallet" />
                            <MethodCard id="card" icon={IconCreditCard} label="Visa **** 4242" sub="Expires 12/28" />
                            <MethodCard id="crypto" icon={IconZap} label="Lightning" sub="BTC Instant Pay" />
                        </div>

                        <Button
                            className="w-full text-lg h-16 rounded-[1.5rem] relative overflow-hidden group"
                            onClick={handlePay}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative z-10 flex items-center gap-2">
                                Pay with {method === 'apple' ? 'Apple Pay' : method === 'card' ? 'Card' : 'Crypto'}
                            </span>
                        </Button>
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="relative h-24 w-24 mb-6">
                            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IconZap className="w-8 h-8 text-accent animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{loadingText}</h3>
                        <p className="text-zinc-500 text-sm">Please do not close the window.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderStatusView = ({ orders, onPay, completedOrderId }: { orders: Order[], onPay: (orderId: string) => void, completedOrderId: string | null }) => {
    const activeOrder = orders.find(o => o.status !== 'ARCHIVED');
    const completedOrder = orders.find(o => o.id === completedOrderId);
    const [showPayModal, setShowPayModal] = useState(false);

    // Show success message if we have a just-completed order
    if (completedOrderId && completedOrder) {
        return (
            <div className="fixed bottom-8 left-4 right-4 z-40 animate-pop">
                <div className="bg-gradient-to-br from-green-900/90 to-black backdrop-blur-xl p-6 rounded-[2rem] border border-green-500/30 flex items-center gap-4 shadow-2xl">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-black">
                        <IconCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Payment Successful</h3>
                        <p className="text-green-300 text-sm">Thank you for dining with us!</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!activeOrder) return null;

    const isCompleted = activeOrder.status === 'COMPLETED';
    const isPaid = activeOrder.paymentStatus === 'PAID';

    if (isPaid && isCompleted) {
        return (
            <div className="fixed bottom-8 left-4 right-4 z-40 animate-pop">
                <div className="bg-gradient-to-br from-green-900/90 to-black backdrop-blur-xl p-6 rounded-[2rem] border border-green-500/30 flex items-center gap-4 shadow-2xl">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-black">
                        <IconCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Order Complete</h3>
                        <p className="text-green-300 text-sm">Thank you!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed bottom-8 left-4 right-4 z-40 animate-pop">
                <div className="bg-[#121214]/95 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Progress Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                        <div
                            className={`h-full bg-accent transition-all duration-1000 ${activeOrder.status === 'PENDING' ? 'w-[25%]' :
                                activeOrder.status === 'PREPARING' ? 'w-[50%]' :
                                    activeOrder.status === 'READY' ? 'w-[75%]' : 'w-[100%]'
                                }`}
                        />
                    </div>

                    <div className="flex justify-between items-start mb-4 mt-2">
                        <div>
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Status</span>
                            <h3 className="text-2xl font-bold text-white mt-1">{activeOrder.status}</h3>
                        </div>
                        <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                            <IconClock className="w-5 h-5 text-accent" />
                        </div>
                    </div>

                    {isCompleted && activeOrder.paymentStatus === 'UNPAID' ? (
                        <Button onClick={() => setShowPayModal(true)} className="w-full mt-2" variant="primary">
                            Pay Bill • ${activeOrder.total.toFixed(2)}
                        </Button>
                    ) : (
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Sit back and relax. We'll update you here when your order status changes.
                        </p>
                    )}
                </div>
            </div>

            {showPayModal && (
                <PaymentModal
                    total={activeOrder.total}
                    onClose={() => setShowPayModal(false)}
                    onConfirm={() => {
                        onPay(activeOrder.id);
                        setShowPayModal(false);
                    }}
                />
            )}
        </>
    );
};

export default function CustomerApp({ tableId }: CustomerAppProps) {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<{ id: string; qty: number; notes: string }[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
    const [assistanceRequested, setAssistanceRequested] = useState(false);

    useEffect(() => {
        const init = async () => {
            const menuData = await api.getMenu();
            setMenu(menuData);
            if (menuData.length > 0) setActiveCategory(menuData[0].category);
            const orderData = await api.getOrders(tableId);
            setOrders(orderData);

            // Initial table status fetch
            try {
                const tableData = await api.getTable(tableId);
                setAssistanceRequested(tableData.needsAssistance);
            } catch (e) {
                console.error("Failed to fetch table status", e);
            }
        };
        init();

        const interval = setInterval(async () => {
            const updatedOrders = await api.getOrders(tableId);
            setOrders(prev => {
                const hasChanges = JSON.stringify(prev) !== JSON.stringify(updatedOrders);
                return hasChanges ? updatedOrders : prev;
            });

            // Poll table status
            try {
                const tableData = await api.getTable(tableId);
                setAssistanceRequested(tableData.needsAssistance);
            } catch (e) {
                console.error("Failed to fetch table status", e);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [tableId]);

    const addToCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing) {
                return prev.map(i => i.id === itemId ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: itemId, qty: 1, notes: '' }];
        });
    };

    const updateCartQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
            return item;
        }).filter(item => item.qty > 0));
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setLoadingOrder(true);
        try {
            const itemsPayload = cart.map(c => ({ menuItemId: c.id, quantity: c.qty, notes: c.notes }));
            await api.createOrder(tableId, itemsPayload);
            setCart([]);
            setIsCartOpen(false);
            const updated = await api.getOrders(tableId);
            setOrders(updated);
        } catch (e: any) {
            alert(e.message || "Failed to place order");
        } finally {
            setLoadingOrder(false);
        }
    };

    const handlePay = async (orderId: string) => {
        await api.updateOrder(orderId, { paymentStatus: 'PAID' });
        setCompletedOrderId(orderId);

        // Clear success message after 10 seconds
        setTimeout(() => {
            setCompletedOrderId(null);
        }, 10000);

        const updated = await api.getOrders(tableId);
        setOrders(updated);
    };



    const toggleAssistance = async () => {
        const newState = !assistanceRequested;
        setAssistanceRequested(newState);
        try {
            await api.requestAssistance(tableId, newState);
        } catch (e: any) {
            alert(e.message || "Failed to call waiter");
            setAssistanceRequested(!newState); // Revert on failure
        }
    };

    const categories = useMemo(() => Array.from(new Set(menu.map(m => m.category))), [menu]);
    const hasActiveOrder = orders.some(o => o.status !== 'ARCHIVED');
    const cartTotal = cart.reduce((sum, item) => {
        const p = menu.find(m => m.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const cartCount = cart.reduce((a, b) => a + b.qty, 0);

    return (
        <div className="min-h-screen pb-40">
            {/* Header */}
            <div className="pt-8 px-6 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Lumina</h1>
                        <p className="text-zinc-400 text-sm font-medium mt-1">Table {tableId.replace('table-', '')} • Guest</p>
                    </div>
                    <button
                        onClick={toggleAssistance}
                        className={`
                            h-12 px-4 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all duration-300
                            ${assistanceRequested
                                ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                            }
                        `}
                    >
                        <div className={`w-2 h-2 rounded-full ${assistanceRequested ? 'bg-red-500' : 'bg-zinc-600'}`} />
                        {assistanceRequested ? 'Waiter Called' : 'Call Waiter'}
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {categories.map(cat => (
                        <CategoryPill
                            key={cat}
                            label={cat}
                            active={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                        />
                    ))}
                </div>
            </div>

            {/* Menu Feed */}
            <div className="px-6 space-y-8">
                {menu.filter(m => m.category === activeCategory).map(item => (
                    <MenuCard key={item.id} item={item} onAdd={() => addToCart(item.id)} />
                ))}
            </div>

            {/* Dynamic Cart Island */}
            {!hasActiveOrder && (
                <DynamicIslandCart
                    count={cartCount}
                    total={cartTotal}
                    onClick={() => setIsCartOpen(true)}
                />
            )}

            {isCartOpen && (
                <CartSheet
                    items={cart}
                    menu={menu}
                    onClose={() => setIsCartOpen(false)}
                    onUpdateQty={updateCartQty}
                    onPlaceOrder={placeOrder}
                    loading={loadingOrder}
                />
            )}

            {hasActiveOrder || completedOrderId ? (
                <OrderStatusView orders={orders} onPay={handlePay} completedOrderId={completedOrderId} />
            ) : null}
        </div>
    );
}
