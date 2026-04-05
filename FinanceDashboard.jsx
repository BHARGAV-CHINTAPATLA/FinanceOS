// FinanceDashboard.jsx — Complete Finance Dashboard SPA
// Single-file React component with RBAC, charts, dark mode, and full CRUD

import React, {
  useState, useReducer, useMemo, useCallback, useEffect, useRef
} from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Sun, Moon, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal, Download, FileJson, FileText,
  AlertTriangle, ShoppingBag, Car, Utensils, Tv, Heart, Zap, Home,
  DollarSign, Briefcase, BarChart2, Lightbulb, ChevronsUpDown, Check,
  Filter, Clock
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = { ADMIN: 'Admin', VIEWER: 'Viewer' };
const TABS  = { DASHBOARD: 'dashboard', TRANSACTIONS: 'transactions', INSIGHTS: 'insights' };
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES = ['Salary','Freelance','Food & Dining','Transport','Shopping',
                    'Entertainment','Healthcare','Utilities','Rent','Investments'];
const PAGE_SIZE = 10;

const CATEGORY_META = {
  'Salary':        { color: '#6366f1', icon: Briefcase  },
  'Freelance':     { color: '#8b5cf6', icon: DollarSign },
  'Food & Dining': { color: '#f59e0b', icon: Utensils   },
  'Transport':     { color: '#3b82f6', icon: Car        },
  'Shopping':      { color: '#ec4899', icon: ShoppingBag},
  'Entertainment': { color: '#10b981', icon: Tv         },
  'Healthcare':    { color: '#ef4444', icon: Heart      },
  'Utilities':     { color: '#f97316', icon: Zap        },
  'Rent':          { color: '#64748b', icon: Home       },
  'Investments':   { color: '#14b8a6', icon: TrendingUp },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  // January
  { id:'t001', date:'2024-01-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t002', date:'2024-01-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t003', date:'2024-01-05', description:'Whole Foods Market',             amount:145,  type:'expense', category:'Food & Dining' },
  { id:'t004', date:'2024-01-07', description:'Netflix Subscription',           amount:17,   type:'expense', category:'Entertainment' },
  { id:'t005', date:'2024-01-09', description:'Uber Ride – Office',             amount:23,   type:'expense', category:'Transport'     },
  { id:'t006', date:'2024-01-12', description:'Freelance Design – Apex Co',     amount:850,  type:'income',  category:'Freelance'     },
  { id:'t007', date:'2024-01-14', description:'Amazon – Desk Supplies',         amount:87,   type:'expense', category:'Shopping'      },
  { id:'t008', date:'2024-01-17', description:'Electric Bill – ConEd',          amount:94,   type:'expense', category:'Utilities'     },
  { id:'t009', date:'2024-01-20', description:'Doctor Appointment – Copay',     amount:40,   type:'expense', category:'Healthcare'    },
  { id:'t010', date:'2024-01-25', description:'Chipotle – Lunch',               amount:14,   type:'expense', category:'Food & Dining' },
  { id:'t011', date:'2024-01-28', description:'S&P 500 ETF – Vanguard',         amount:300,  type:'expense', category:'Investments'   },
  // February
  { id:'t012', date:'2024-02-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t013', date:'2024-02-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t014', date:'2024-02-06', description:'Trader Joes – Groceries',        amount:122,  type:'expense', category:'Food & Dining' },
  { id:'t015', date:'2024-02-08', description:'Spotify Premium',                amount:11,   type:'expense', category:'Entertainment' },
  { id:'t016', date:'2024-02-10', description:'Metro Card – Monthly',           amount:132,  type:'expense', category:'Transport'     },
  { id:'t017', date:'2024-02-13', description:'Freelance Dev – StartupX',       amount:1200, type:'income',  category:'Freelance'     },
  { id:'t018', date:'2024-02-16', description:'H&M – Winter Jacket',            amount:89,   type:'expense', category:'Shopping'      },
  { id:'t019', date:'2024-02-19', description:'Gas Bill – NatGrid',             amount:67,   type:'expense', category:'Utilities'     },
  { id:'t020', date:'2024-02-22', description:'Pharmacy – CVS',                 amount:35,   type:'expense', category:'Healthcare'    },
  { id:'t021', date:'2024-02-25', description:'Movie Tickets – AMC',            amount:34,   type:'expense', category:'Entertainment' },
  { id:'t022', date:'2024-02-27', description:'Index Fund – Fidelity',          amount:400,  type:'expense', category:'Investments'   },
  // March
  { id:'t023', date:'2024-03-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t024', date:'2024-03-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t025', date:'2024-03-07', description:'Whole Foods Market',             amount:168,  type:'expense', category:'Food & Dining' },
  { id:'t026', date:'2024-03-09', description:'YouTube Premium',                amount:14,   type:'expense', category:'Entertainment' },
  { id:'t027', date:'2024-03-11', description:'Lyft – Airport Ride',            amount:48,   type:'expense', category:'Transport'     },
  { id:'t028', date:'2024-03-14', description:'Consulting Fee – BrightEdge',    amount:950,  type:'income',  category:'Freelance'     },
  { id:'t029', date:'2024-03-17', description:'Best Buy – Keyboard',            amount:129,  type:'expense', category:'Shopping'      },
  { id:'t030', date:'2024-03-20', description:'Internet – Xfinity',             amount:79,   type:'expense', category:'Utilities'     },
  { id:'t031', date:'2024-03-23', description:'Dental Checkup',                 amount:90,   type:'expense', category:'Healthcare'    },
  { id:'t032', date:'2024-03-26', description:'Starbucks – Coffee Runs x8',     amount:62,   type:'expense', category:'Food & Dining' },
  { id:'t033', date:'2024-03-29', description:'ARKK ETF',                       amount:200,  type:'expense', category:'Investments'   },
  // April
  { id:'t034', date:'2024-04-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t035', date:'2024-04-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t036', date:'2024-04-06', description:'Trader Joes – Groceries',        amount:138,  type:'expense', category:'Food & Dining' },
  { id:'t037', date:'2024-04-09', description:'Concert Tickets – Live Nation',  amount:95,   type:'expense', category:'Entertainment' },
  { id:'t038', date:'2024-04-12', description:'Gas – Shell Station',            amount:60,   type:'expense', category:'Transport'     },
  { id:'t039', date:'2024-04-15', description:'Freelance UX – NovaTech',        amount:1500, type:'income',  category:'Freelance'     },
  { id:'t040', date:'2024-04-18', description:'Nike – Running Shoes',           amount:140,  type:'expense', category:'Shopping'      },
  { id:'t041', date:'2024-04-21', description:'Electric Bill – ConEd',          amount:88,   type:'expense', category:'Utilities'     },
  { id:'t042', date:'2024-04-24', description:'Urgent Care Visit',              amount:120,  type:'expense', category:'Healthcare'    },
  { id:'t043', date:'2024-04-27', description:'Vanguard Bond Fund',             amount:350,  type:'expense', category:'Investments'   },
  // May
  { id:'t044', date:'2024-05-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t045', date:'2024-05-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t046', date:'2024-05-06', description:'Whole Foods Market',             amount:155,  type:'expense', category:'Food & Dining' },
  { id:'t047', date:'2024-05-08', description:'Disney+ Subscription',           amount:14,   type:'expense', category:'Entertainment' },
  { id:'t048', date:'2024-05-11', description:'Metro Card – Monthly',           amount:132,  type:'expense', category:'Transport'     },
  { id:'t049', date:'2024-05-14', description:'Freelance Branding – FutureCo', amount:700,  type:'income',  category:'Freelance'     },
  { id:'t050', date:'2024-05-17', description:'Zara – Summer Collection',       amount:175,  type:'expense', category:'Shopping'      },
  { id:'t051', date:'2024-05-20', description:'Water & Internet Bundle',        amount:105,  type:'expense', category:'Utilities'     },
  { id:'t052', date:'2024-05-23', description:'Eye Exam + Glasses',             amount:220,  type:'expense', category:'Healthcare'    },
  { id:'t053', date:'2024-05-26', description:'S&P 500 ETF – Top-up',           amount:500,  type:'expense', category:'Investments'   },
  { id:'t054', date:'2024-05-29', description:'Chipotle + DoorDash x5',         amount:78,   type:'expense', category:'Food & Dining' },
  // June
  { id:'t055', date:'2024-06-01', description:'Monthly Salary – Zorvyn Inc',   amount:5500, type:'income',  category:'Salary'        },
  { id:'t056', date:'2024-06-03', description:'Rent – Oakwood Apartments',      amount:1400, type:'expense', category:'Rent'          },
  { id:'t057', date:'2024-06-06', description:'Trader Joes – Groceries',        amount:130,  type:'expense', category:'Food & Dining' },
  { id:'t058', date:'2024-06-09', description:'Steam – Summer Sale',            amount:45,   type:'expense', category:'Entertainment' },
  { id:'t059', date:'2024-06-12', description:'Uber & Metro – Week',            amount:72,   type:'expense', category:'Transport'     },
  { id:'t060', date:'2024-06-15', description:'Freelance API Work – DataCo',    amount:1100, type:'income',  category:'Freelance'     },
  { id:'t061', date:'2024-06-18', description:'IKEA – Home Office Upgrade',     amount:340,  type:'expense', category:'Shopping'      },
  { id:'t062', date:'2024-06-21', description:'Electric + Gas Bills',           amount:118,  type:'expense', category:'Utilities'     },
  { id:'t063', date:'2024-06-24', description:'Therapy Session x2',             amount:160,  type:'expense', category:'Healthcare'    },
  { id:'t064', date:'2024-06-27', description:'Tech ETF – Schwab',              amount:450,  type:'expense', category:'Investments'   },
  { id:'t065', date:'2024-06-29', description:'Sushi Night – Nobu',             amount:92,   type:'expense', category:'Food & Dining' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(n);
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
const fmtDate = (iso) => { const d = new Date(iso); return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
const getMonth = (iso) => MONTHS_SHORT[new Date(iso).getMonth()];
const uniqueId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);

// ─── REDUCER ──────────────────────────────────────────────────────────────────
function txReducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [{ ...action.payload, id: uniqueId(), _new: true }, ...state];
    case 'EDIT':   return state.map(t => t.id === action.payload.id ? { ...action.payload } : t);
    case 'DELETE': return state.filter(t => t.id !== action.id);
    case 'CLEAR_NEW': return state.map(t => ({ ...t, _new: false }));
    default: return state;
  }
}

export default function FinanceDashboard() {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [transactions, dispatch] = useReducer(txReducer, INITIAL_TRANSACTIONS);
  const [activeTab,   setActiveTab]   = useState(TABS.DASHBOARD);
  const [role,        setRole]        = useState(ROLES.ADMIN);
  const [dark,        setDark]        = useState(false);
  const [loading,     setLoading]     = useState(true);
  // Filters
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('all');
  const [filterCat,   setFilterCat]   = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [sortKey,     setSortKey]     = useState('date-desc');
  const [page,        setPage]        = useState(1);
  // Modal
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isAdmin = role === ROLES.ADMIN;

  // Skeleton loader — 400 ms shimmer on mount
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  // Clear _new flag after flash animation
  useEffect(() => {
    if (transactions.some(t => t._new)) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_NEW' }), 1500);
      return () => clearTimeout(t);
    }
  }, [transactions]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, filterType, filterCat, filterMonth, sortKey]);

  const resetFilters = useCallback(() => {
    setSearch(''); setFilterType('all'); setFilterCat('all');
    setFilterMonth('all'); setSortKey('date-desc');
  }, []);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (search) c++;
    if (filterType !== 'all') c++;
    if (filterCat  !== 'all') c++;
    if (filterMonth !== 'all') c++;
    if (sortKey !== 'date-desc') c++;
    return c;
  }, [search, filterType, filterCat, filterMonth, sortKey]);

  // ── Filtered & sorted transactions ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = transactions.slice();
    if (search)         list = list.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterCat  !== 'all') list = list.filter(t => t.category === filterCat);
    if (filterMonth !== 'all') list = list.filter(t => getMonth(t.date) === filterMonth);
    list.sort((a,b) => {
      if (sortKey === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortKey === 'date-asc')  return new Date(a.date) - new Date(b.date);
      if (sortKey === 'amt-desc')  return b.amount - a.amount;
      if (sortKey === 'amt-asc')   return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, search, filterType, filterCat, filterMonth, sortKey]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);

  // ── Summary stats (dashboard) ───────────────────────────────────────────────
  const summary = useMemo(() => {
    const income   = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expenses = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const balance  = income - expenses;
    const savings  = income > 0 ? ((income - expenses) / income) * 100 : 0;
    return { income, expenses, balance, savings };
  }, [transactions]);

  // ── Monthly chart data ──────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const MAP = {};
    ['Jan','Feb','Mar','Apr','May','Jun'].forEach(m => { MAP[m] = { month: m, income: 0, expenses: 0 }; });
    transactions.forEach(t => {
      const m = getMonth(t.date);
      if (!MAP[m]) return;
      if (t.type === 'income')  MAP[m].income   += t.amount;
      if (t.type === 'expense') MAP[m].expenses += t.amount;
    });
    return Object.values(MAP).map(d => ({ ...d, net: d.income - d.expenses }));
  }, [transactions]);

  // ── Category donut data ─────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const MAP = {};
    transactions.filter(t=>t.type==='expense').forEach(t => {
      MAP[t.category] = (MAP[t.category] || 0) + t.amount;
    });
    const total = Object.values(MAP).reduce((s,v)=>s+v,0);
    return Object.entries(MAP).map(([cat,val]) => ({
      name: cat, value: val, pct: total > 0 ? ((val/total)*100).toFixed(1) : 0,
      color: CATEGORY_META[cat]?.color || '#94a3b8'
    })).sort((a,b)=>b.value-a.value);
  }, [transactions]);

  // ── Insights ────────────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const monthlyIncome   = monthlyData.map(d => d.income);
    const monthlyExpenses = monthlyData.map(d => d.expenses);
    const maxExpIdx = monthlyExpenses.indexOf(Math.max(...monthlyExpenses));
    const maxIncIdx = monthlyIncome.indexOf(Math.max(...monthlyIncome));
    const avgInc  = monthlyIncome.reduce((s,v)=>s+v,0)  / monthlyData.length;
    const avgExp  = monthlyExpenses.reduce((s,v)=>s+v,0) / monthlyData.length;
    const savings = monthlyData.map(d => d.income > 0 ? ((d.income-d.expenses)/d.income)*100 : 0);
    const savingTrend = savings.length > 1 ? savings[savings.length-1] - savings[0] : 0;
    const topCat = categoryData[0] || {};
    // food streak
    const foodMonths = ['Jan','Feb','Mar','Apr','May','Jun'];
    let streak = 0;
    for (let i = foodMonths.length-1; i >= 0; i--) {
      const total = transactions.filter(t=>t.type==='expense' && t.category==='Food & Dining' && getMonth(t.date)===foodMonths[i]).reduce((s,t)=>s+t.amount,0);
      if (total < 500) streak++; else break;
    }
    return { maxExpIdx, maxIncIdx, avgInc, avgExp, savingTrend, savings, topCat, streak };
  }, [monthlyData, categoryData, transactions]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ['Date','Description','Category','Type','Amount'];
    const rows = filtered.map(t => [t.date, `"${t.description}"`, t.category, t.type, t.amount]);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'transactions.csv' }).click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(filtered, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: 'transactions.json' }).click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openAdd  = () => setModal({ open: true, mode: 'add', data: null });
  const openEdit = (tx) => setModal({ open: true, mode: 'edit', data: tx });
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSave = useCallback((formData) => {
    if (modal.mode === 'add') dispatch({ type: 'ADD', payload: formData });
    else                       dispatch({ type: 'EDIT', payload: formData });
    closeModal();
  }, [modal.mode]);

  const handleDelete = useCallback((id) => {
    dispatch({ type: 'DELETE', id });
    setConfirmDelete(null);
  }, []);

  // ── Theming helpers ─────────────────────────────────────────────────────────
  const d  = (light, darkCls) => dark ? darkCls : light;
  const bg = d('bg-gray-50',  'bg-gray-900');
  const card = d('bg-white shadow-sm', 'bg-gray-800 border border-gray-700');
  const text = d('text-gray-900', 'text-gray-100');
  const sub  = d('text-gray-500', 'text-gray-400');
  const border = d('border-gray-200', 'border-gray-700');
  const inputCls = d('bg-white border-gray-300 text-gray-900 placeholder-gray-400',
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500');


  // ════════════════════════════════════════════════════════════════════════════
  // SUB-COMPONENTS (defined inside to share closure scope)
  // ════════════════════════════════════════════════════════════════════════════

  // ── CountUp number ─────────────────────────────────────────────────────────
  function CountUp({ target, prefix = '$', suffix = '' }) {
    const [val, setVal] = useState(0);
    const frame = useRef(null);
    useEffect(() => {
      if (loading) return;
      const start = Date.now();
      const dur = 900;
      const tick = () => {
        const progress = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(target * ease));
        if (progress < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame.current);
    }, [target, loading]);
    const display = prefix === '$' ? fmt(val) : `${val.toFixed(suffix === '%' ? 1 : 0)}${suffix}`;
    return <span>{display}</span>;
  }

  // ── Skeleton shimmer ────────────────────────────────────────────────────────
  function Skeleton({ className = '' }) {
    return (
      <div className={`rounded-lg animate-pulse ${dark ? 'bg-gray-700' : 'bg-gray-200'} ${className}`} />
    );
  }

  // ── Summary Card ────────────────────────────────────────────────────────────
  function SummaryCard({ title, value, icon: Icon, accent, trend, subLabel }) {
    const colors = {
      indigo: { bg: dark ? 'bg-indigo-900/40' : 'bg-indigo-50', icon: 'text-indigo-500', ring: 'ring-indigo-200' },
      emerald:{ bg: dark ? 'bg-emerald-900/40':'bg-emerald-50', icon:'text-emerald-500', ring:'ring-emerald-200'},
      rose:   { bg: dark ? 'bg-rose-900/40'   :'bg-rose-50',    icon:'text-rose-500',    ring:'ring-rose-200'   },
      amber:  { bg: dark ? 'bg-amber-900/40'  :'bg-amber-50',   icon:'text-amber-500',   ring:'ring-amber-200'  },
    };
    const c = colors[accent] || colors.indigo;
    return (
      <div className={`rounded-2xl p-6 ${card} transition-all duration-200 hover:scale-[1.02]`}>
        {loading ? (
          <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-16" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${sub}`}>{title}</span>
              <div className={`p-2 rounded-xl ${c.bg}`}>
                <Icon size={18} className={c.icon} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${text} mb-1`}>
              <CountUp target={value} prefix={accent === 'amber' || accent === 'indigo' && title.includes('Rate') ? '' : '$'} suffix={title.includes('Rate') ? '%' : ''} />
            </div>
            {subLabel && (
              <div className={`flex items-center gap-1 text-xs ${sub}`}>
                {trend === 'up'   && <ArrowUpRight size={12} className="text-emerald-500" />}
                {trend === 'down' && <ArrowDownRight size={12} className="text-rose-500" />}
                <span>{subLabel}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Custom Bar Chart Tooltip ────────────────────────────────────────────────
  function BarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <div className={`rounded-xl p-3 shadow-xl text-xs ${dark ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-100 text-gray-700'}`}>
        <p className="font-semibold mb-2">{label} 2024</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.fill }} className="mt-0.5">{p.name}: {fmt(p.value)}</p>
        ))}
        {payload.length >= 2 && <p className={`mt-1.5 pt-1.5 border-t font-semibold ${payload[0].value - payload[1].value >= 0 ? 'text-emerald-500' : 'text-rose-500'} ${border}`}>Net: {fmt(payload[0].value - payload[1].value)}</p>}
      </div>
    );
  }

  // ── Custom Donut Tooltip ────────────────────────────────────────────────────
  function DonutTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d2 = payload[0];
    return (
      <div className={`rounded-xl p-3 shadow-xl text-xs ${dark ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-100 text-gray-700'}`}>
        <p className="font-semibold">{d2.name}</p>
        <p style={{ color: d2.payload.color }}>{fmtDec(d2.value)} ({d2.payload.pct}%)</p>
      </div>
    );
  }

  // ── Transaction Modal ───────────────────────────────────────────────────────
  function TxModal() {
    const init = modal.data || { description:'', amount:'', type:'income', category:'Salary', date: new Date().toISOString().slice(0,10) };
    const [form, setForm] = useState(init);
    const [errors, setErrors] = useState({});
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const validate = () => {
      const e = {};
      if (!form.description.trim()) e.description = 'Required';
      if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Must be > 0';
      if (!form.date) e.date = 'Required';
      setErrors(e);
      return Object.keys(e).length === 0;
    };
    const submit = () => {
      if (!validate()) return;
      handleSave({ ...form, amount: +form.amount });
    };
    const labelCls = `block text-xs font-medium mb-1 ${sub}`;
    const fldCls   = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputCls}`;
    const errCls   = `text-xs text-rose-500 mt-0.5`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
        <div className={`relative rounded-2xl p-6 w-full max-w-md shadow-2xl ${dark ? 'bg-gray-800' : 'bg-white'} ${text}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">{modal.mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}</h2>
            <button onClick={closeModal} className={`p-1.5 rounded-lg hover:bg-gray-100 ${dark ? 'hover:bg-gray-700' : ''}`}><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Description</label>
              <input className={fldCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Whole Foods Market" />
              {errors.description && <p className={errCls}>{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Amount (USD)</label>
                <input className={fldCls} type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
                {errors.amount && <p className={errCls}>{errors.amount}</p>}
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input className={fldCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                {errors.date && <p className={errCls}>{errors.date}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <div className="flex gap-2">
                {['income','expense'].map(t => (
                  <button key={t} onClick={() => set('type', t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-150 capitalize
                      ${form.type === t
                        ? t === 'income' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-rose-500 text-white border-rose-500'
                        : dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={fldCls} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={closeModal} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Cancel</button>
            <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
              {modal.mode === 'add' ? 'Add Transaction' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard Tab ───────────────────────────────────────────────────────────
  function DashboardTab() {
    const savingsAccent = summary.savings >= 20 ? 'emerald' : summary.savings >= 10 ? 'amber' : 'rose';
    const axisColor = dark ? '#6b7280' : '#9ca3af';
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Balance"   value={summary.balance}  icon={DollarSign}   accent="indigo"  trend={summary.balance>=0?'up':'down'} subLabel={summary.balance>=0?'Positive balance':'Deficit'} />
          <SummaryCard title="Total Income"    value={summary.income}   icon={ArrowUpRight}  accent="emerald" trend="up"   subLabel="Across 6 months" />
          <SummaryCard title="Total Expenses"  value={summary.expenses} icon={ArrowDownRight}accent="rose"    trend="down" subLabel="Across 6 months" />
          <SummaryCard title="Savings Rate"    value={parseFloat(summary.savings.toFixed(1))} icon={TrendingUp} accent={savingsAccent} subLabel={summary.savings>=20?'Great savings!':summary.savings>=10?'Room to improve':'Below target'} />
        </div>
        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Bar chart */}
          <div className={`lg:col-span-3 rounded-2xl p-6 ${card}`}>
            <h3 className={`text-base font-semibold mb-4 ${text}`}>Income vs Expenses</h3>
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
                  <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <ReTooltip content={<BarTooltip />} />
                  <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[6,6,0,0]} animationDuration={800} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6,6,0,0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Donut chart */}
          <div className={`lg:col-span-2 rounded-2xl p-6 ${card}`}>
            <h3 className={`text-base font-semibold mb-4 ${text}`}>Spending by Category</h3>
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" animationBegin={0} animationDuration={900}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <ReTooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {categoryData.slice(0,6).map(c => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span className={sub}>{c.name}</span>
                      </div>
                      <span className={`font-medium ${text}`}>{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Transactions Tab ────────────────────────────────────────────────────────
  function TransactionsTab() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun'];
    return (
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className={`text-lg font-bold ${text}`}>Transactions</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>{filtered.length}</span>
            {activeFilterCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">{activeFilterCount} filter{activeFilterCount>1?'s':''}</span>
            )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-emerald-50 ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600'}`}><FileText size={13} />CSV</button>
              <button onClick={exportJSON} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-indigo-50 ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600'}`}><FileJson size={13} />JSON</button>
              <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-all"><Plus size={13} />Add</button>
            </div>
          )}
        </div>
        {/* Filters */}
        <div className={`rounded-2xl p-4 ${card} space-y-3`}>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className={`flex items-center gap-2 flex-1 min-w-40 rounded-lg border px-3 py-2 ${inputCls}`}>
              <Search size={14} className={sub} />
              <input className="bg-transparent flex-1 text-sm outline-none" placeholder="Search transactions…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {/* Type pills */}
            <div className="flex gap-1.5">
              {['all','income','expense'].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150
                    ${filterType===t
                      ? t==='income' ? 'bg-emerald-500 text-white' : t==='expense' ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'
                      : dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Category filter */}
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm flex-1 min-w-36 ${inputCls}`}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Month filter */}
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm flex-1 min-w-28 ${inputCls}`}>
              <option value="all">All Months</option>
              {months.map(m => <option key={m} value={m}>{m} 2024</option>)}
            </select>
            {/* Sort */}
            <select value={sortKey} onChange={e => setSortKey(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm flex-1 min-w-40 ${inputCls}`}>
              <option value="date-desc">Date: Newest first</option>
              <option value="date-asc">Date: Oldest first</option>
              <option value="amt-desc">Amount: High to Low</option>
              <option value="amt-asc">Amount: Low to High</option>
            </select>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className={`px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 ${dark ? 'hover:bg-rose-900/30' : ''} transition-all`}>Clear all</button>
            )}
          </div>
        </div>
        {/* Table */}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : paginated.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${card}`}>
            <svg className="mx-auto mb-4 opacity-30" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" stroke={dark?'#6b7280':'#9ca3af'} strokeWidth="2" fill="none"/><path d="M28 40h24M40 28v24" stroke={dark?'#6b7280':'#9ca3af'} strokeWidth="2" strokeLinecap="round"/></svg>
            <p className={`text-base font-semibold ${text}`}>No transactions found</p>
            <p className={`text-sm mt-1 ${sub}`}>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={`rounded-2xl overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wide ${sub} border-b ${border}`}>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Description</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Category</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className={`divide-y ${border}`}>
                  {paginated.map(tx => {
                    const CatIcon = CATEGORY_META[tx.category]?.icon || DollarSign;
                    const catColor = CATEGORY_META[tx.category]?.color || '#94a3b8';
                    const isNew    = tx._new;
                    const isDel    = confirmDelete === tx.id;
                    return (
                      <tr key={tx.id}
                        className={`transition-all duration-300 group
                          ${isNew ? (dark ? 'bg-yellow-900/30' : 'bg-yellow-50') : dark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                          ${isDel ? (dark ? 'bg-rose-900/30' : 'bg-rose-50') : ''}
                        `}>
                        <td className={`px-5 py-4 text-xs ${sub} whitespace-nowrap`}>{fmtDate(tx.date)}</td>
                        <td className={`px-5 py-4 font-medium ${text} max-w-xs`}>
                          <span className="truncate block">{tx.description}</span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: catColor + '22' }}>
                              <CatIcon size={11} style={{ color: catColor }} />
                            </span>
                            <span className={`text-xs ${sub}`}>{tx.category}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {tx.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-right font-semibold ${tx.type==='income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmtDec(tx.amount)}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4 text-right">
                            {isDel ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`text-xs ${sub}`}>Delete?</span>
                                <button onClick={() => handleDelete(tx.id)} className="text-xs px-2 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all">Yes</button>
                                <button onClick={() => setConfirmDelete(null)} className={`text-xs px-2 py-1 rounded-lg border transition-all ${dark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'}`}>No</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(tx)} className={`p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 ${dark ? 'hover:bg-indigo-900/30' : ''} transition-all`}><Pencil size={13} /></button>
                                <button onClick={() => setConfirmDelete(tx.id)} className={`p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 ${dark ? 'hover:bg-rose-900/30' : ''} transition-all`}><Trash2 size={13} /></button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className={`flex items-center justify-between px-5 py-3 border-t ${border}`}>
              <p className={`text-xs ${sub}`}>Page {page} of {totalPages} · {filtered.length} records</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <ChevronLeft size={14} className={text} />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <ChevronRight size={14} className={text} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Insights Tab ────────────────────────────────────────────────────────────
  function InsightsTab() {
    const { maxExpIdx, maxIncIdx, avgInc, avgExp, savingTrend, savings, topCat, streak } = insights;
    const axisColor = dark ? '#6b7280' : '#9ca3af';
    const insightCard = (bg2, children) => (
      <div className={`rounded-2xl p-5 ${bg2} transition-all duration-200`}>{children}</div>
    );
    return (
      <div className="space-y-4">
        <h2 className={`text-lg font-bold ${text}`}>Financial Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1 – Top spending category */}
          {insightCard(dark ? 'bg-indigo-900/40 border border-indigo-700' : 'bg-indigo-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={16} className="text-indigo-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-indigo-300' : 'text-indigo-600'}`}>Top Spending Category</span>
              </div>
              <p className={`text-2xl font-bold ${text}`}>{topCat.name}</p>
              <p className={`text-sm mt-1 ${sub}`}>{fmtDec(topCat.value)} · {topCat.pct}% of total expenses</p>
              <div className={`mt-3 h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                <div className="h-2 rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${topCat.pct}%` }} />
              </div>
            </>
          )}
          {/* Insight 2 – Highest spending month */}
          {insightCard(dark ? 'bg-rose-900/40 border border-rose-700' : 'bg-rose-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-rose-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-rose-300' : 'text-rose-600'}`}>Highest Spending Month</span>
              </div>
              <p className={`text-2xl font-bold ${text}`}>{monthlyData[maxExpIdx]?.month} 2024</p>
              <p className={`text-sm mt-1 ${sub}`}>{fmt(monthlyData[maxExpIdx]?.expenses)} in total expenses</p>
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={monthlyData}>
                    <Bar dataKey="expenses" radius={[4,4,0,0]} animationDuration={800}>
                      {monthlyData.map((_, i) => <Cell key={i} fill={i===maxExpIdx ? '#f43f5e' : (dark ? '#4b5563' : '#fecdd3')} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {/* Insight 3 – Highest income month */}
          {insightCard(dark ? 'bg-emerald-900/40 border border-emerald-700' : 'bg-emerald-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-emerald-300' : 'text-emerald-600'}`}>Highest Income Month</span>
              </div>
              <p className={`text-2xl font-bold ${text}`}>{monthlyData[maxIncIdx]?.month} 2024</p>
              <p className={`text-sm mt-1 ${sub}`}>{fmt(monthlyData[maxIncIdx]?.income)} earned</p>
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={monthlyData}>
                    <Bar dataKey="income" radius={[4,4,0,0]} animationDuration={800}>
                      {monthlyData.map((_,i) => <Cell key={i} fill={i===maxIncIdx ? '#10b981' : (dark ? '#4b5563' : '#a7f3d0')} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {/* Insight 4 – Avg income vs spend */}
          {insightCard(dark ? 'bg-amber-900/40 border border-amber-700' : 'bg-amber-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={16} className="text-amber-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-amber-300' : 'text-amber-600'}`}>Monthly Average</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className={`text-xs ${sub}`}>Avg Income</p>
                  <p className="text-xl font-bold text-emerald-500">{fmt(avgInc)}</p>
                </div>
                <div>
                  <p className={`text-xs ${sub}`}>Avg Spend</p>
                  <p className="text-xl font-bold text-rose-500">{fmt(avgExp)}</p>
                </div>
              </div>
              <p className={`text-xs mt-3 ${sub}`}>Monthly surplus: <span className="text-emerald-500 font-semibold">{fmt(avgInc - avgExp)}</span></p>
            </>
          )}
          {/* Insight 5 – Savings rate trend */}
          {insightCard(dark ? 'bg-violet-900/40 border border-violet-700' : 'bg-violet-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                {savingTrend >= 0 ? <TrendingUp size={16} className="text-violet-500" /> : <TrendingDown size={16} className="text-violet-500" />}
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-violet-300' : 'text-violet-600'}`}>Savings Rate Trend</span>
              </div>
              <p className={`text-2xl font-bold ${text}`}>{savingTrend >= 0 ? '📈 Improving' : '📉 Declining'}</p>
              <p className={`text-sm mt-1 ${sub}`}>{Math.abs(savingTrend).toFixed(1)}% {savingTrend>=0?'increase':'decrease'} Jan → Jun</p>
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={monthlyData.map((m,i) => ({ month: m.month, rate: parseFloat(savings[i].toFixed(1)) }))}>
                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} animationDuration={800} />
                    <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {/* Insight 6 – Food streak */}
          {insightCard(dark ? 'bg-teal-900/40 border border-teal-700' : 'bg-teal-50',
            <>
              <div className="flex items-center gap-2 mb-3">
                <Utensils size={16} className="text-teal-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-teal-300' : 'text-teal-600'}`}>Spending Streak</span>
              </div>
              <p className={`text-2xl font-bold ${text}`}>🔥 {streak} Month{streak!==1?'s':''}</p>
              <p className={`text-sm mt-1 ${sub}`}>You've kept Food & Dining under $500 for {streak} month{streak!==1?'s':''} in a row</p>
              <div className="flex gap-1.5 mt-3">
                {['Jan','Feb','Mar','Apr','May','Jun'].map((m,i) => {
                  const spent = transactions.filter(t=>t.type==='expense'&&t.category==='Food & Dining'&&getMonth(t.date)===m).reduce((s,t)=>s+t.amount,0);
                  return <div key={m} title={`${m}: ${fmt(spent)}`} className={`flex-1 h-2 rounded-full ${spent < 500 ? 'bg-teal-400' : (dark ? 'bg-gray-600' : 'bg-gray-300')}`} />;
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── NAV items ────────────────────────────────────────────────────────────────
  const navItems = [
    { id: TABS.DASHBOARD,     label: 'Dashboard',     icon: LayoutDashboard },
    { id: TABS.TRANSACTIONS,  label: 'Transactions',  icon: ChevronsUpDown  },
    { id: TABS.INSIGHTS,      label: 'Insights',      icon: Lightbulb       },
  ];

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen flex ${bg} font-sans transition-colors duration-300`} style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* ── Sidebar (desktop) ──────────────────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col w-60 min-h-screen fixed top-0 left-0 z-30 border-r ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} transition-colors duration-300`}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <span className={`font-bold text-base ${text}`}>FinanceOS</span>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active ? 'bg-indigo-600 text-white shadow-sm' : dark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
        {/* Role switcher */}
        <div className={`m-3 p-3 rounded-xl border ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-xs font-semibold mb-2 ${sub}`}>Role</p>
          <div className={`relative flex rounded-lg p-0.5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 bottom-0.5 w-1/2 rounded-md bg-indigo-600 transition-transform duration-200 ${role === ROLES.VIEWER ? 'translate-x-full' : 'translate-x-0'}`} style={{ width: 'calc(50% - 2px)', left: '0.125rem' }} />
            {[ROLES.ADMIN, ROLES.VIEWER].map(r => (
              <button key={r} onClick={() => setRole(r)} className={`relative z-10 flex-1 py-1 text-xs font-medium rounded-md transition-colors duration-150 ${role === r ? 'text-white' : dark ? 'text-gray-400' : 'text-gray-500'}`}>{r}</button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Header */}
        <header className={`sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b ${dark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm transition-colors duration-300`}>
          <div>
            <h1 className={`text-base font-bold ${text}`}>{navItems.find(n=>n.id===activeTab)?.label}</h1>
            {!isAdmin && <p className="text-xs text-amber-500 font-medium">View-only mode</p>}
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${dark ? 'bg-amber-900/40 text-amber-300 border border-amber-700' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <AlertTriangle size={12} /> You are in view-only mode
              </span>
            )}
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg border transition-all ${dark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-5 pb-24 lg:pb-5 overflow-y-auto">
          <div className={`transition-all duration-200 ${activeTab === TABS.DASHBOARD    ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute pointer-events-none'}`}>
            {activeTab === TABS.DASHBOARD    && <DashboardTab />}
          </div>
          <div className={`transition-all duration-200 ${activeTab === TABS.TRANSACTIONS ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute pointer-events-none'}`}>
            {activeTab === TABS.TRANSACTIONS && <TransactionsTab />}
          </div>
          <div className={`transition-all duration-200 ${activeTab === TABS.INSIGHTS    ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute pointer-events-none'}`}>
            {activeTab === TABS.INSIGHTS    && <InsightsTab />}
          </div>
        </main>

        {/* ── Mobile bottom nav ──────────────────────────────────────────────── */}
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} transition-colors duration-300`}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all ${active ? 'text-indigo-600' : dark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Icon size={18} />
                <span className="hidden sm:block">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Modal overlay ──────────────────────────────────────────────────── */}
      {modal.open && isAdmin && <TxModal />}
    </div>
  );
}

/*
 * ARCHITECTURE NOTES
 * ──────────────────
 * • Single-file React component with all state, logic, and UI co-located.
 * • useReducer manages transactions (ADD / EDIT / DELETE / CLEAR_NEW actions).
 * • useMemo drives all derived data: filtered list, summary stats, chart data,
 *   and insights — ensuring O(n) recomputation only when dependencies change.
 * • RBAC is purely presentational: the `role` state gates rendering of action
 *   buttons, the add modal, and export controls; no route protection needed
 *   since data is all in-memory.
 * • Dark mode is toggled via a boolean state; all Tailwind classes are applied
 *   conditionally via helper variables (d, bg, card, text, sub, border).
 * • Skeleton loader fires for 400 ms on mount; CountUp runs via
 *   requestAnimationFrame for smooth easing.
 * • The _new flag on added transactions triggers a yellow highlight flash row
 *   for 1.5 s, then CLEAR_NEW is dispatched to normalise state.
 * • Delete confirmation is inline (confirmDelete state), not a browser alert.
 * • Export functions use URL.createObjectURL + Blob for zero-dependency
 *   CSV / JSON downloads.
 * • Assumptions: all data is Jan–Jun 2024 USD; no time zones are considered;
 *   session-only persistence (no localStorage, no backend).
 */

