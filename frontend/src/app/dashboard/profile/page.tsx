'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, CheckCircle, Pencil, User as UserIcon, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileDown, Camera, Check, X as XIcon, Clock, Lock, Shield, Eye, EyeOff, QrCode, Share2, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import Modal from '@/components/Modal';

const FieldView = ({ label, value, premium = false, className = "" }: { label: string, value: any, premium?: boolean, className?: string }) => (
    <div className={`group p-5 rounded-[1.5rem] border transition-all duration-500 ${
        premium 
            ? 'bg-slate-900 border-indigo-500/20 hover:border-indigo-500/40 shadow-[0_20px_40px_rgba(0,0,0,0.3)]' 
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 shadow-xl shadow-black/5'
    } flex gap-4 items-start ${className}`}>
        <div className="flex-1 min-w-0">
            <p className={`text-[9px] uppercase tracking-[0.3em] font-black ${
                premium ? 'text-indigo-400' : 'text-slate-400'
            } mb-2`}>{label}</p>
            <p className={`text-base font-black truncate leading-none tracking-tight ${
                premium ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}>
                {value || <span className="text-slate-400 font-medium italic">Unassigned</span>}
            </p>
        </div>
    </div>
);

export default function ProfilePage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [popup, setPopup] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    const [heightUnit, setHeightUnit] = useState('ft');

    const [formData, setFormData] = useState({
        photoUrl: '',
        fullName: '',
        gender: '',
        maritalStatus: '',
        contactNumber: '',
        dob: '',
        birthTime: '',
        birthPlace: '',
        familyAddress: '',
        familyCity: '',
        familyState: '',
        familyCountry: '',
        complexion: '',
        height: '',
        weight: '',
        wearsSpectacles: false,
        gotra: '',
        isManglik: 'no',
        education: '',
        occupation: '',
        monthlyIncome: '',
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        motherOccupation: '',
        brothersMarried: 0,
        brothersUnmarried: 0,
        sistersMarried: 0,
        sistersUnmarried: 0,
        isPhotoHidden: false
    });
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [qrModal, setQrModal] = useState(false);

    // Modern Date Picker Logic
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'days' | 'years' | 'months'>('days');

    const dobValue = formData.dob ? (() => {
        const [y, m, d] = formData.dob.split('-').map(Number);
        return new Date(y, m - 1, d);
    })() : null;

    const handleDateSelect = (date: Date) => {
        // Fix for timezone issues: Format the local date manually into YYYY-MM-DD
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${y}-${m}-${d}`;
        setFormData(prev => ({ ...prev, dob: formattedDate }));
        setIsDatePickerOpen(false);
    };

    const generateDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        
        const days = [];
        // Pad start
        for (let i = 0; i < start.getDay(); i++) {
            days.push(null);
        }
        for (let i = 1; i <= end.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const yearRange = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 15 - i);
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const [lookups, setLookups] = useState<Record<string, any[]>>({});

    useEffect(() => {
        loadProfile();
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        try {
            const res = await api.get('/metadata/lookups');
            if (res.data?.data) {
                setLookups(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch lookups", error);
        }
    };

    const loadProfile = async () => {

        try {
            const { data } = await api.get('/profiles/me');
            if (data?.data) {
                setProfile(data.data);
                setIsEditing(false);
                const pd = data.data;

                let hVal = pd.height ? pd.height.toString() : '';
                // Since we now store in cm, default to cm unit for editing
                setHeightUnit('cm');

                setFormData({
                    photoUrl: pd.photoUrl || '',
                    fullName: pd.fullName || '',
                    gender: pd.gender || '',
                    maritalStatus: pd.maritalStatus || '',
                    contactNumber: pd.contactNumber || '',
                    dob: pd.dob || '',
                    birthTime: pd.birthTime || '',
                    birthPlace: pd.birthPlace || '',
                    familyAddress: pd.familyAddress || '',
                    familyCity: pd.familyCity || '',
                    familyState: pd.familyState || '',
                    familyCountry: pd.familyCountry || '',
                    complexion: pd.complexion || '',
                    height: pd.height ? pd.height.toString() : '',
                    weight: pd.weight ? pd.weight.toString() : '',
                    wearsSpectacles: pd.wearsSpectacles || false,
                    gotra: pd.gotra || '',
                    isManglik: pd.isManglik || 'no',
                    education: pd.education || '',
                    occupation: pd.occupation || '',
                    monthlyIncome: pd.monthlyIncome || '',
                    fatherName: pd.fatherName || '',
                    fatherOccupation: pd.fatherOccupation || '',
                    motherName: pd.motherName || '',
                    motherOccupation: pd.motherOccupation || '',
                    brothersMarried: pd.brothersMarried || 0,
                    brothersUnmarried: pd.brothersUnmarried || 0,
                    sistersMarried: pd.sistersMarried || 0,
                    sistersUnmarried: pd.sistersUnmarried || 0,
                    isPhotoHidden: pd.isPhotoHidden || false
                });
                
                // Fetch photo requests
                const reqRes = await api.get('/profiles/photo-requests');
                if (reqRes.data?.data) {
                    setIncomingRequests(reqRes.data.data);
                }
            }
        } catch (e) {
            console.log('No profile exists yet');
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                height: formData.height, // Send raw string, backend will parse
                weight: parseInt(formData.weight as string) || null,
                monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome as string) : null,
                brothersMarried: parseInt(formData.brothersMarried as any) || 0,
                brothersUnmarried: parseInt(formData.brothersUnmarried as any) || 0,
                sistersMarried: parseInt(formData.sistersMarried as any) || 0,
                sistersUnmarried: parseInt(formData.sistersUnmarried as any) || 0
            };

            if (profile?.id) {
                await api.put('/profiles/me', payload);
            } else {
                await api.post('/profiles', payload);
            }
            await loadProfile();
            setPopup({ show: true, message: 'Profile saved successfully!', type: 'success' });
        } catch (err: any) {
            const message = err.response?.data?.details || err.response?.data?.message || 'Failed to save profile';
            const errorMessage = typeof message === 'object' ? JSON.stringify(message) : message;
            setPopup({ show: true, message: errorMessage, type: 'error' });
        }
    };

    const handleRespondToRequest = async (requestId: number, status: string) => {
        try {
            await api.put(`/profiles/photo-requests/${requestId}/respond/${status}`);
            showToast(`Request ${status.toLowerCase()} successfully`, 'success');
            // Refresh requests
            const reqRes = await api.get('/profiles/photo-requests');
            setIncomingRequests(reqRes.data.data || []);
        } catch (e) {
            showToast('Failed to respond to request', 'error');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        try {
            setPopup({ show: true, message: 'Uploading image...', type: 'success' });
            const res = await api.post('/files/upload', formDataFile);
            if (res.data?.data) {
                setFormData(prev => ({ ...prev, photoUrl: res.data.data }));
                setPopup({ show: true, message: 'Image uploaded successfully!', type: 'success' });
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to upload image';
            setPopup({ show: true, message: errorMessage, type: 'error' });
        }
    };

    const handleMakePayment = async () => {
        try {
            setPopup({ show: true, message: 'Initiating payment...', type: 'success' });
            const { data } = await api.post('/payments/initiate', { amount: 500, currency: 'INR' });
            const orderId = data.data.orderId;
            closePopup();

            const options = {
                key: 'rzp_test_SVATz6ya6yetjJ',
                amount: 500 * 100,
                currency: "INR",
                name: "Parichay",
                description: "Membership Fee",
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        setPopup({ show: true, message: 'Verifying payment...', type: 'success' });
                        await api.post('/payments/verify', { 
                            orderId: response.razorpay_order_id, 
                            paymentId: response.razorpay_payment_id, 
                            razorpaySignature: response.razorpay_signature 
                        });
                        setPopup({ show: true, message: 'Payment Successful & profile activated!', type: 'success' });
                        loadProfile();
                    } catch (err: any) {
                        setPopup({ show: true, message: err.response?.data?.message || 'Payment verification failed', type: 'error' });
                    }
                },
                prefill: {
                    name: profile?.fullName || "",
                    email: user?.email || "",
                    contact: profile?.contactNumber || ""
                },
                theme: {
                    color: "#4f46e5"
                }
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setPopup({ show: true, message: response.error.description || 'Payment Failed', type: 'error' });
            });
            rzp.open();

        } catch (err: any) {
            setPopup({ show: true, message: err.response?.data?.message || 'Failed to initiate payment', type: 'error' });
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const closePopup = () => setPopup({ ...popup, show: false });

    return (
        <div className="max-w-7xl mx-auto pb-32">
            {/* Manage Profile Header */}
            <div className="mb-16 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Manage Profile</h4>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">My Profile</h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl">Manage your matrimonial bio-data, photos, and privacy settings.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">

                    <div className="flex justify-between items-center mb-12 border-b dark:border-slate-800 pb-8">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{isEditing ? 'Edit Profile' : 'My Profile'}</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{isEditing ? 'Update your details below' : 'Your current bio-data'}</p>
                        </div>
                        {!isEditing && (
                            <div className="flex gap-4">
                                <button 
                                    onClick={async () => {
                                        try {
                                            const res = await api.get(`/profiles/${profile.id}/download-pdf`, { responseType: 'blob' });
                                            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                            const link = document.createElement('a'); link.href = url;
                                            link.setAttribute('download', `Dossier_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
                                            document.body.appendChild(link); link.click(); document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (e) {
                                            showToast('Extraction failed', 'error');
                                        }
                                    }}
                                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-6 py-3 rounded-xl border border-amber-500/20 transition-all"
                                >
                                    <FileDown className="w-4 h-4" /> Download PDF
                                </button>
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 px-6 py-3 rounded-xl border border-indigo-500/20 transition-all">
                                    <Pencil className="w-4 h-4" /> Edit Details
                                </button>
                            </div>
                        )}
                        {isEditing && profile && (
                            <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">

                             <div className="col-span-full mb-12">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Profile Photo</h3>
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-32 h-32 rounded-[2rem] bg-slate-950 border-2 border-dashed border-slate-800 overflow-hidden flex items-center justify-center shrink-0 relative group/photo">
                                        {formData.photoUrl ? (
                                            <img src={`${IMAGE_BASE_URL}${formData.photoUrl}`} alt="Profile" className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-slate-700" />
                                        )}
                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera className="w-6 h-6 text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-white tracking-tight">Profile Picture</p>
                                            <p className="text-xs text-slate-500">Supported formats: JPG, PNG. Optimal resolution suggested.</p>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                            <input 
                                                type="checkbox" 
                                                id="isPhotoHidden" 
                                                name="isPhotoHidden" 
                                                checked={formData.isPhotoHidden} 
                                                onChange={handleChange}
                                                className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-offset-slate-900"
                                            />
                                            <label htmlFor="isPhotoHidden" className="text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer">
                                                Keep Photo Private (Requires Request)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-full border-b dark:border-slate-800 pb-4 mb-8">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Personal Details</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input required minLength={3} maxLength={100} name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Gender</option>
                                        {(lookups['GENDER'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Marital Status</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Status</option>
                                        {(lookups['MARITAL_STATUS'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact Number</label>
                                    <input type="tel" pattern="[0-9]{10}" maxLength={10} name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" placeholder="10-digit mobile number" />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                    <button 
                                        type="button"
                                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                        className="w-full flex items-center justify-between border px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-indigo-400 transition-all text-left"
                                    >
                                        <span className={formData.dob ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                            {formData.dob ? new Date(formData.dob).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select date'}
                                        </span>
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </button>

                                    {isDatePickerOpen && (
                                        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 overflow-hidden">

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCalendarView(calendarView === 'months' ? 'days' : 'months')}
                                                        className="font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg"
                                                    >
                                                        {monthLabels[viewDate.getMonth()]}
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCalendarView(calendarView === 'years' ? 'days' : 'years')}
                                                        className="font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg"
                                                    >
                                                        {viewDate.getFullYear()}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            {calendarView === 'days' && (
                                                <>
                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                            <div key={d} className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-wider">{d}</div>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {generateDays(viewDate).map((day, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                disabled={!day}
                                                                onClick={() => day && handleDateSelect(day)}
                                                                className={`h-9 w-9 rounded-xl text-sm flex items-center justify-center transition-all ${!day ? 'invisible' : dobValue && day.toDateString() === dobValue.toDateString() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-700 dark:text-gray-300'}`}
                                                            >
                                                                {day?.getDate()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            {calendarView === 'years' && (
                                                <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {yearRange.map(y => (
                                                        <button
                                                            key={y}
                                                            type="button"
                                                            onClick={() => { setViewDate(new Date(viewDate.setFullYear(y))); setCalendarView('days'); }}
                                                            className={`py-2 rounded-xl text-sm font-medium ${viewDate.getFullYear() === y ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                                        >
                                                            {y}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {calendarView === 'months' && (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {monthLabels.map((m, i) => (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onClick={() => { setViewDate(new Date(viewDate.setMonth(i))); setCalendarView('days'); }}
                                                            className={`py-3 rounded-xl text-sm font-medium ${viewDate.getMonth() === i ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <input type="hidden" name="dob" value={formData.dob} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Birth Time</label>
                                    <input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Birth Place</label>
                                    <input name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address Line</label>
                                    <input name="familyAddress" value={formData.familyAddress} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input name="familyCity" value={formData.familyCity} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <input name="familyState" value={formData.familyState} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country</label>
                                    <input name="familyCountry" value={formData.familyCountry} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gotra <span className="text-red-500">*</span></label>
                                    <select required name="gotra" value={formData.gotra} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Gotra</option>
                                        {(lookups['GOTRA'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>

                                {/* Physical Attributes */}
                                <div className="col-span-full mt-12 border-b dark:border-slate-800 pb-4 mb-8">
                                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Physical Attributes</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Complexion</label>
                                    <input name="complexion" value={formData.complexion} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Height</label>
                                    <div className="flex gap-2">
                                        {heightUnit === 'ft' ? (
                                            <select name="height" value={formData.height} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                                <option value="">Select Height</option>
                                                {Array.from({ length: 37 }, (_, i) => {
                                                    const ft = Math.floor(i / 12) + 4;
                                                    const inch = i % 12;
                                                    const val = `${ft}ft ${inch}in`;
                                                    return <option key={val} value={val}>{val}</option>;
                                                })}
                                            </select>
                                        ) : (
                                            <select name="height" value={formData.height} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                                <option value="">Select Height</option>
                                                {Array.from({ length: 101 }, (_, i) => i + 120).map(cm => (
                                                    <option key={cm} value={cm}>{cm} cm</option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="flex items-center gap-1 border rounded-lg px-2 bg-gray-50 flex-shrink-0">
                                            <button type="button" onClick={() => { setHeightUnit('ft'); setFormData(p => ({ ...p, height: '' })) }} className={`px-2 py-1 text-sm rounded ${heightUnit === 'ft' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500'}`}>ft/in</button>
                                            <button type="button" onClick={() => { setHeightUnit('cm'); setFormData(p => ({ ...p, height: '' })) }} className={`px-2 py-1 text-sm rounded ${heightUnit === 'cm' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500'}`}>cm</button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Weight</label>
                                    <select name="weight" value={formData.weight} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Weight</option>
                                        {Array.from({ length: 111 }, (_, i) => i + 40).map(w => (
                                            <option key={w} value={w}>{w} kg</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Manglik Status</label>
                                    <select name="isManglik" value={formData.isManglik} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Status</option>
                                        {(lookups['MANGLIK_STATUS'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="wearsSpectacles" checked={formData.wearsSpectacles} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-medium text-gray-700">Wears Spectacles</span>
                                    </label>
                                </div>

                                {/* Professional Details */}
                                <div className="col-span-full mt-12 border-b dark:border-slate-800 pb-4 mb-8">
                                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Education & Career</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Education</label>
                                    <select name="education" value={formData.education} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Education</option>
                                        {(lookups['EDUCATION'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Occupation</label>
                                    <select name="occupation" value={formData.occupation} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-gray-700">
                                        <option value="">Select Occupation</option>
                                        {(lookups['OCCUPATION'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monthly Income</label>
                                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>


                                {/* Family Details */}
                                <div className="col-span-full mt-12 border-b dark:border-slate-800 pb-4 mb-8">
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Family Details</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Father's Name</label>
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Father's Occupation</label>
                                    <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mother's Name</label>
                                    <input name="motherName" value={formData.motherName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mother's Occupation</label>
                                    <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Brothers Married</label>
                                    <input type="number" min="0" name="brothersMarried" value={formData.brothersMarried} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Brothers Unmarried</label>
                                    <input type="number" min="0" name="brothersUnmarried" value={formData.brothersUnmarried} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sisters Married</label>
                                    <input type="number" min="0" name="sistersMarried" value={formData.sistersMarried} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sisters Unmarried</label>
                                    <input type="number" min="0" name="sistersUnmarried" value={formData.sistersUnmarried} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-slate-800" />
                                </div>

                                <div className="col-span-full pt-12 border-t dark:border-slate-800">
                                    <button type="submit" className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4">
                                        {profile ? 'Save Changes' : 'Create Profile'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-12">
                             <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 mb-12 border-b dark:border-slate-800 pb-12">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl shrink-0">
                                    {profile?.photoUrl ? (
                                        <img src={`${IMAGE_BASE_URL}${profile.photoUrl}`} alt={profile.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                                            <UserIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center sm:text-left space-y-2">
                                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none">{profile?.fullName}</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">{profile?.occupation || 'Role Unassigned'}</p>
                                    <div className="flex gap-2 justify-center sm:justify-start pt-2">
                                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">Identity Verified</div>
                                        {profile?.membershipStatus?.name === 'ACTIVE' && <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">Premium Node</div>}
                                    </div>
                                </div>
                            </div>

                            <section>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FieldView label="Full Name" value={profile?.fullName} />
                                    <FieldView label="Gender" value={profile?.gender} />
                                    <FieldView label="Marital Status" value={profile?.maritalStatus} />
                                    <FieldView label="Contact Number" value={profile?.contactNumber} />
                                    <FieldView label="Date of Birth" value={profile?.dob} />
                                    <FieldView label="Birth Time" value={profile?.birthTime} />
                                    <FieldView label="Birth Place" value={profile?.birthPlace} />
                                    <FieldView label="Gotra" value={profile?.gotra} />
                                    <FieldView className="md:col-span-2" label="Current Geo-Coordinates" value={`${profile?.familyAddress || ''}, ${profile?.familyCity || ''}, ${profile?.familyState || ''}, ${profile?.familyCountry || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',')} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-6">Physical Attributes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FieldView label="Complexion" value={profile?.complexion} />
                                    <FieldView label="Height" value={profile?.formattedHeight || (profile?.height ? `${profile.height} cm` : null)} />
                                    <FieldView label="Weight" value={profile?.formattedWeight || (profile?.weight ? `${profile.weight} kg` : null)} />
                                    <FieldView label="Manglik Status" value={<span className="capitalize">{profile?.isManglik || 'No'}</span>} />
                                    <FieldView label="Wears Spectacles" value={profile?.wearsSpectacles ? 'Active' : 'Negative'} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">Education & Career</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FieldView label="Education" value={profile?.education} />
                                    <FieldView label="Occupation" value={profile?.occupation} />
                                    <FieldView label="Monthly Income" value={profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : ''} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Family Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FieldView premium label="Father's Name" value={profile?.fatherName} />
                                    <FieldView premium label="Father's Occupation" value={profile?.fatherOccupation} />
                                    <FieldView premium label="Mother's Name" value={profile?.motherName} />
                                    <FieldView premium label="Mother's Occupation" value={profile?.motherOccupation} />
                                    <FieldView premium label="Brothers (M / U)" value={`${profile?.brothersMarried || 0} / ${profile?.brothersUnmarried || 0}`} />
                                    <FieldView premium label="Sisters (M / U)" value={`${profile?.sistersMarried || 0} / ${profile?.sistersUnmarried || 0}`} />
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Status Column */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100%]" />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Account Status</h2>
                        
                        {profile ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-emerald-500/20">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="text-emerald-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Current Status</p>
                                        <p className="text-sm font-bold text-white tracking-tight">{profile.membershipStatus?.name || 'INITIALIZED'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setQrModal(true)} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all">
                                    <QrCode className="w-4 h-4" /> Share QR Code
                                </button>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Please submit your bio-data to activate your profile.
                            </div>
                        )}

                        <div className="mt-10 pt-10 border-t border-slate-800">
                            {profile?.membershipStatus?.name === 'ACTIVE' ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Premium Membership Active</p>
                                    <p className="text-sm text-slate-500 font-medium">Your profile is highlighted and you have access to all premium features.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Upgrade to Premium</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Unlock contact details and get priority assistance.</p>
                                    <Link
                                        href="/dashboard/payment/memberships"
                                        className="w-full bg-white text-slate-950 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-100"
                                    >
                                        View Plans
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Photo Requests Column */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100%]" />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Photo Requests</h2>
                        
                        {incomingRequests.length > 0 ? (
                            <div className="space-y-4">
                                {incomingRequests.map((req) => (
                                    <div key={req.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-indigo-400 font-black text-xs">
                                                {req.requesterEmail[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-white truncate tracking-tight">{req.requesterEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                             {req.status === 'PENDING' ? (
                                                <>
                                                    <button onClick={() => handleRespondToRequest(req.id, 'APPROVED')} className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Grant</button>
                                                    <button onClick={() => handleRespondToRequest(req.id, 'REJECTED')} className="flex-1 py-2 bg-rose-500/10 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Deny</button>
                                                </>
                                            ) : (
                                                <span className="w-full text-center py-2 bg-slate-900 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-800">{req.status}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No Pending Requests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="Your Profile QR Code">
                <div className="flex flex-col items-center p-12 text-center space-y-8">
                    <div className="bg-white p-6 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
                        <img src={`${api.defaults.baseURL}/profiles/${profile?.id}/qr-code`} alt="QR" className="w-64 h-64" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tighter">Secure Extraction Link</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">Authorize network nodes to view your verified dossier through this link.</p>
                    </div>
                    <button onClick={() => window.print()} className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                        <Share2 className="w-4 h-4" /> Print Protocol
                    </button>
                </div>
            </Modal>

            {/* Popup Modal */}
            {popup.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl max-w-sm w-full p-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[100%]" />
                        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl mb-8 ${popup.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                            {popup.type === 'success' ? (
                                <CheckCircle className="h-10 w-10 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-10 w-10 text-rose-500" />
                            )}
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                            {popup.type === 'success' ? 'Protocol Executed' : 'System Error'}
                        </h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">{popup.message}</p>
                        <button
                            onClick={closePopup}
                            className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-black/40"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
