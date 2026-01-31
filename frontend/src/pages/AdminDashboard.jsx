import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Sparkles, Users, Image, CreditCard, TrendingUp,
    Percent, LogOut, Search, ChevronLeft, ChevronRight,
    Plus, Trash2, ToggleLeft, ToggleRight, IndianRupee,
    Calendar, Eye, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color = "red" }) => (
    <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
            <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
            </div>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState({ users: [], total: 0, page: 1, pages: 1 });
    const [discounts, setDiscounts] = useState([]);
    const [transactions, setTransactions] = useState({ transactions: [], total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [txnPage, setTxnPage] = useState(1);

    // New discount form
    const [newDiscount, setNewDiscount] = useState({
        code: '',
        discount_percent: 10,
        max_uses: '',
        description: ''
    });

    const navigate = useNavigate();

    const loadStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadDiscounts = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/discounts`, { withCredentials: true });
            setDiscounts(res.data);
        } catch (err) {
            console.error('Failed to load discounts:', err);
        }
    }, []);

    const loadUsers = useCallback(async (page = 1, search = '') => {
        try {
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: { page, limit: 15, search: search || undefined },
                withCredentials: true
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    }, []);

    const loadTransactions = useCallback(async (page = 1) => {
        try {
            const res = await axios.get(`${API_URL}/admin/transactions`, {
                params: { page, limit: 15 },
                withCredentials: true
            });
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        }
    }, []);

    // Check auth and load data
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get(`${API_URL}/admin/check`, { withCredentials: true });
                loadStats();
                loadDiscounts();
            } catch (err) {
                navigate('/admin/login');
            }
        };
        checkAuth();
    }, [navigate, loadStats, loadDiscounts]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers(userPage, searchQuery);
        } else if (activeTab === 'transactions') {
            loadTransactions(txnPage);
        }
    }, [activeTab, userPage, txnPage, searchQuery, loadUsers, loadTransactions]);



    const handleLogout = async () => {
        await axios.post(`${API_URL}/admin/logout`, {}, { withCredentials: true });
        navigate('/admin/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setUserPage(1);
        loadUsers(1, searchQuery);
    };

    const createDiscount = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/discounts`, {
                code: newDiscount.code,
                discount_percent: parseInt(newDiscount.discount_percent),
                max_uses: newDiscount.max_uses ? parseInt(newDiscount.max_uses) : null,
                description: newDiscount.description || null
            }, { withCredentials: true });
            toast.success('Discount code created!');
            setNewDiscount({ code: '', discount_percent: 10, max_uses: '', description: '' });
            loadDiscounts();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create discount');
        }
    };

    const deleteDiscount = async (code) => {
        if (!window.confirm(`Delete discount code ${code}?`)) return;
        try {
            await axios.delete(`${API_URL}/admin/discounts/${code}`, { withCredentials: true });
            toast.success('Discount deleted');
            loadDiscounts();
        } catch (err) {
            toast.error('Failed to delete discount');
        }
    };

    const toggleDiscount = async (code) => {
        try {
            await axios.patch(`${API_URL}/admin/discounts/${code}/toggle`, {}, { withCredentials: true });
            loadDiscounts();
        } catch (err) {
            toast.error('Failed to toggle discount');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111827]">
            {/* Header */}
            <header className="bg-[#1F2937] border-b border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">Admin Dashboard</span>
                    </div>
                    <Button onClick={handleLogout} variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-700">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'discounts', label: 'Discounts', icon: Percent },
                        { id: 'transactions', label: 'Transactions', icon: CreditCard }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-red-500 text-white'
                                : 'bg-[#1F2937] text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={Users}
                                label="Total Users"
                                value={stats.total_users}
                                subValue={`+${stats.new_users_30d} this month`}
                            />
                            <StatCard
                                icon={Image}
                                label="Thumbnails Generated"
                                value={stats.total_thumbnails}
                                subValue={`${stats.thumbnails_today} today`}
                                color="blue"
                            />
                            <StatCard
                                icon={IndianRupee}
                                label="Total Revenue"
                                value={`₹${stats.total_revenue?.toLocaleString() || 0}`}
                                subValue={`${stats.successful_transactions} transactions`}
                                color="green"
                            />
                            <StatCard
                                icon={Percent}
                                label="Active Discounts"
                                value={stats.active_discounts}
                                color="purple"
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Paid Users</p>
                                <p className="text-3xl font-bold text-green-400">{stats.paid_users}</p>
                                <p className="text-xs text-gray-500 mt-1">Users with active credits</p>
                            </div>
                            <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Free Tier Users</p>
                                <p className="text-3xl font-bold text-yellow-400">{stats.free_tier_users}</p>
                                <p className="text-xs text-gray-500 mt-1">Users with ≤5 credits</p>
                            </div>
                            <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Conversion Rate</p>
                                <p className="text-3xl font-bold text-blue-400">
                                    {stats.total_users > 0
                                        ? ((stats.paid_users / stats.total_users) * 100).toFixed(1)
                                        : 0}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Free → Paid</p>
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex justify-end">
                            <Button onClick={loadStats} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Stats
                            </Button>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by email or name..."
                                    className="pl-10 bg-[#1F2937] border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <Button type="submit" className="bg-red-500 hover:bg-red-600">Search</Button>
                        </form>

                        {/* Users Table */}
                        <div className="bg-[#1F2937] rounded-xl border border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#111827]">
                                            <th className="text-left text-gray-400 font-medium px-6 py-4">User</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-4">Credits</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-4">Thumbnails</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.users.map((user, i) => (
                                            <tr key={user.user_id} className={i % 2 === 0 ? 'bg-[#1F2937]' : 'bg-[#1a2433]'}>
                                                <td className="px-6 py-4">
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-sm font-medium ${user.credits > 5 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {user.credits}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{user.thumbnail_count}</td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm">
                                    Showing {users.users.length} of {users.total} users
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                        disabled={userPage === 1}
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-gray-400 px-3 py-1">
                                        Page {users.page} of {users.pages}
                                    </span>
                                    <Button
                                        onClick={() => setUserPage(p => Math.min(users.pages, p + 1))}
                                        disabled={userPage >= users.pages}
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Discounts Tab */}
                {activeTab === 'discounts' && (
                    <div className="space-y-6">
                        {/* Create Discount Form */}
                        <div className="bg-[#1F2937] rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Create New Discount
                            </h3>
                            <form onSubmit={createDiscount} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label className="text-gray-300">Code</Label>
                                    <Input
                                        value={newDiscount.code}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                        placeholder="SAVE20"
                                        className="bg-[#111827] border-gray-600 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Discount %</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newDiscount.discount_percent}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, discount_percent: e.target.value })}
                                        className="bg-[#111827] border-gray-600 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Max Uses (optional)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newDiscount.max_uses}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, max_uses: e.target.value })}
                                        placeholder="Unlimited"
                                        className="bg-[#111827] border-gray-600 text-white mt-1"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Code
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Discount Codes List */}
                        <div className="bg-[#1F2937] rounded-xl border border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-white">Active Discount Codes</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#111827]">
                                            <th className="text-left text-gray-400 font-medium px-6 py-3">Code</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-3">Discount</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-3">Uses</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-3">Status</th>
                                            <th className="text-left text-gray-400 font-medium px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {discounts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No discount codes yet. Create one above!
                                                </td>
                                            </tr>
                                        ) : (
                                            discounts.map((discount, i) => (
                                                <tr key={discount.code} className={i % 2 === 0 ? 'bg-[#1F2937]' : 'bg-[#1a2433]'}>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-bold text-white bg-[#111827] px-2 py-1 rounded">
                                                            {discount.code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-green-400 font-semibold">
                                                        {discount.discount_percent}% OFF
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {discount.uses} / {discount.max_uses || '∞'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${discount.is_active
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {discount.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => toggleDiscount(discount.code)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-400 hover:text-white"
                                                            >
                                                                {discount.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                            </Button>
                                                            <Button
                                                                onClick={() => deleteDiscount(discount.code)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-[#1F2937] rounded-xl border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#111827]">
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">Transaction ID</th>
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">User</th>
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">Amount</th>
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">Pack</th>
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">Status</th>
                                        <th className="text-left text-gray-400 font-medium px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No transactions yet
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.transactions.map((txn, i) => (
                                            <tr key={txn.txn_id} className={i % 2 === 0 ? 'bg-[#1F2937]' : 'bg-[#1a2433]'}>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-gray-300">{txn.txn_id}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{txn.email || txn.user_id}</td>
                                                <td className="px-6 py-4 text-green-400 font-semibold">₹{txn.amount}</td>
                                                <td className="px-6 py-4 text-gray-300">{txn.pack_id}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${txn.status === 'success'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">
                                                    {txn.created_at ? new Date(txn.created_at).toLocaleString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.pages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm">
                                    Page {transactions.page} of {transactions.pages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setTxnPage(p => Math.max(1, p - 1))}
                                        disabled={txnPage === 1}
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setTxnPage(p => Math.min(transactions.pages, p + 1))}
                                        disabled={txnPage >= transactions.pages}
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
