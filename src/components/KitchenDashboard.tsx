"use client"

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { Badge, Card, Button, IconClock, IconCheck, IconChefHat } from './UI';

const COLUMNS: { id: OrderStatus; label: string; color: string; bg: string }[] = [
    { id: 'PENDING', label: 'Inbound', color: 'text-orange-500', bg: 'bg-orange-500/5' },
    { id: 'PREPARING', label: 'Chef Working', color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { id: 'READY', label: 'Service', color: 'text-green-500', bg: 'bg-green-500/5' },
    { id: 'COMPLETED', label: 'Done', color: 'text-zinc-500', bg: 'bg-zinc-500/5' }
];

const TerminalCard: React.FC<{
    order: Order;
    onMoveStatus: (id: string, nextStatus: OrderStatus) => void;
    onArchive: (id: string) => void;
    accentColor: string;
}> = ({ order, onMoveStatus, onArchive, accentColor }) => {
    const timeElapsed = Math.floor((Date.now() - order.createdAt) / 1000 / 60);

    const steps: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
    const currentIndex = steps.indexOf(order.status);
    const nextStatus = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

    return (
        <div className="bg-[#111] border border-zinc-800 p-5 rounded-2xl mb-4 animate-fade-in hover:border-zinc-600 transition-colors">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800 border-dashed">
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${accentColor.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
                    <span className="font-mono text-xl text-white font-bold">T-{order.tableId.replace('table-', '')}</span>
                </div>
                <span className={`font-mono text-xs ${timeElapsed > 20 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                    {timeElapsed}m
                </span>
            </div>

            <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-300 font-medium">{item.name}</span>
                        <span className="font-mono bg-zinc-900 text-white px-2 py-1 rounded text-xs">x{item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
                {nextStatus && (
                    <button
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-white hover:text-black transition-colors`}
                        onClick={() => onMoveStatus(order.id, nextStatus)}
                    >
                        Move &gt; {nextStatus}
                    </button>
                )}

                {order.status === 'COMPLETED' && (
                    <button
                        className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors"
                        onClick={() => onArchive(order.id)}
                    >
                        Archive
                    </button>
                )}
            </div>
        </div>
    );
};

const ServiceRequests: React.FC<{ tables: any[], onDismiss: (id: string) => void }> = ({ tables, onDismiss }) => {
    const requests = tables.filter(t => t.needsAssistance);
    if (requests.length === 0) return null;

    return (
        <div className="mb-8 animate-pop">
            <h2 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Service Required
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {requests.map(table => (
                    <div key={table.id} className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-6 min-w-[250px]">
                        <div>
                            <div className="text-white font-bold text-xl">Table {table.qrCode.replace('table-', '')}</div>
                            <div className="text-red-400 text-xs mt-1">Calling Waiter</div>
                        </div>
                        <button
                            onClick={() => onDismiss(table.qrCode)}
                            className="h-10 w-10 bg-red-500 text-black rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <IconCheck className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<any[]>([]);

    const fetchData = async () => {
        const [ordersData, tablesData] = await Promise.all([
            api.getOrders(),
            api.getTables()
        ]);
        setOrders(ordersData);
        setTables(tablesData);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        await api.updateOrder(orderId, { status: nextStatus });
        fetchData();
    };

    const handleArchive = async (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        await api.updateOrder(orderId, { status: 'ARCHIVED' });
        fetchData();
    };

    const handleDismissAssistance = async (tableId: string) => {
        setTables(prev => prev.map(t => t.qrCode === tableId ? { ...t, needsAssistance: false } : t));
        await api.requestAssistance(tableId, false);
        fetchData();
    };

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
            <div className="flex-1 overflow-x-auto p-8">
                <div className="flex gap-8 h-full min-w-max">
                    {/* Order Columns */}
                    {COLUMNS.map(col => {
                        const columnOrders = orders.filter(o => o.status === col.id);
                        return (
                            <div key={col.id} className={`w-[350px] flex flex-col h-full rounded-[2rem] ${col.bg} border border-white/5 p-2`}>
                                <div className="p-6">
                                    <h3 className={`font-bold text-sm uppercase tracking-[0.2em] ${col.color}`}>{col.label}</h3>
                                    <div className="text-5xl font-extrabold text-white mt-2 opacity-20">{String(columnOrders.length).padStart(2, '0')}</div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                                    {columnOrders.map(order => (
                                        <TerminalCard
                                            key={order.id}
                                            order={order}
                                            accentColor={col.color}
                                            onMoveStatus={handleStatusUpdate}
                                            onArchive={handleArchive}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Service Requests Column */}
                    <div className="w-[350px] flex flex-col h-full rounded-[2rem] bg-red-500/5 border border-red-500/10 p-2">
                        <div className="p-6">
                            <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Service
                            </h3>
                            <div className="text-5xl font-extrabold text-white mt-2 opacity-20">{String(tables.filter(t => t.needsAssistance).length).padStart(2, '0')}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar space-y-4">
                            {tables.filter(t => t.needsAssistance).map(table => (
                                <div key={table.id} className="bg-[#111] border border-red-500/30 p-5 rounded-2xl animate-fade-in hover:border-red-500 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_currentColor]" />
                                            <span className="font-mono text-xl text-white font-bold">T-{table.qrCode.replace('table-', '')}</span>
                                        </div>
                                    </div>
                                    <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4">Waiter Requested</div>

                                    <button
                                        onClick={() => handleDismissAssistance(table.qrCode)}
                                        className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500 text-black hover:bg-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <IconCheck className="w-4 h-4" />
                                        Dismiss
                                    </button>
                                </div>
                            ))}
                            {tables.filter(t => t.needsAssistance).length === 0 && (
                                <div className="text-center text-zinc-600 text-sm py-10 italic">
                                    No active requests
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
