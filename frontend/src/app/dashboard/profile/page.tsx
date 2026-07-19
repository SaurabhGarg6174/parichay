'use client';

import { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Pencil, User as UserIcon, Calendar, ChevronLeft, ChevronRight, FileDown, Camera, Clock, QrCode, Share2, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import Modal from '@/components/Modal';

const inputCls = 'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13.5px] text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[12.5px] font-semibold text-foreground mb-1.5';

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-border bg-surface shadow-card">
        <div className="border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
    </section>
);

const KV = ({ label, value, wide = false }: { label: string; value: any; wide?: boolean }) => (
    <div className={`border-b border-border py-2.5 last:border-b-0 ${wide ? 'sm:col-span-2' : ''}`}>
        <p className="text-[11.5px] text-faint">{label}</p>
        <p className="mt-0.5 text-[13.5px] font-medium text-foreground">
            {value || <span className="font-normal text-faint">Not specified</span>}
        </p>
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

    // Date picker state
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
            await api.patch(`/profiles/photo-requests/${requestId}`, { status });
            showToast(`Request ${status.toLowerCase()} successfully`, 'success');
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
            const res = await api.post('/files', formDataFile);
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
            const { data } = await api.post('/payments', { amount: 500, currency: 'INR' });
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
                        await api.post(`/payments/${response.razorpay_order_id}/verify`, {
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
                    color: "#C62828"
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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    const closePopup = () => setPopup({ ...popup, show: false });

    const membershipActive = profile?.membershipStatus?.name === 'ACTIVE';
    const address = `${profile?.familyAddress || ''}, ${profile?.familyCity || ''}, ${profile?.familyState || ''}, ${profile?.familyCountry || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',');

    return (
        <div className="pb-12">
            {/* Page head */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs text-faint">Profile Management / <span className="font-medium text-muted-foreground">My Bio-Data</span></p>
                    <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-foreground">My Profile</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Manage your bio-data, photos and privacy settings.</p>
                </div>
                {!isEditing && profile && (
                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await api.get(`/profiles/${profile.id}/pdf`, { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                    const link = document.createElement('a'); link.href = url;
                                    link.setAttribute('download', `Biodata_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
                                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                } catch (e) {
                                    showToast('Could not download PDF', 'error');
                                }
                            }}
                            className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                        >
                            <FileDown className="h-4 w-4 text-muted-foreground" aria-hidden /> Download PDF
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            <Pencil className="h-4 w-4" aria-hidden /> Edit details
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {isEditing ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] text-muted-foreground">{profile ? 'Update your details below.' : 'Fill in your details to create your bio-data.'}</p>
                                {profile && (
                                    <button type="button" onClick={() => setIsEditing(false)} className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Photo */}
                            <SectionCard title="Profile photo">
                                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                                    <div className="group/photo relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-muted">
                                        {formData.photoUrl ? (
                                            <img src={`${IMAGE_BASE_URL}${formData.photoUrl}`} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <UserIcon className="h-8 w-8 text-faint" aria-hidden />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/photo:opacity-100">
                                            <Camera className="h-5 w-5 text-white" aria-hidden />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-[12.5px] text-muted-foreground">JPG or PNG. A clear, recent photo works best.</p>
                                        <label htmlFor="isPhotoHidden" className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3.5 py-2.5">
                                            <input
                                                type="checkbox"
                                                id="isPhotoHidden"
                                                name="isPhotoHidden"
                                                checked={formData.isPhotoHidden}
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded accent-[var(--primary)]"
                                            />
                                            <span className="text-[13px] font-medium text-foreground">Keep photo private — others must request access</span>
                                        </label>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Personal */}
                            <SectionCard title="Personal details">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelCls}>Full name <span className="text-danger">*</span></label>
                                        <input required minLength={3} maxLength={100} name="fullName" value={formData.fullName} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                                            <option value="">Select gender</option>
                                            {(lookups['GENDER'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Marital status</label>
                                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputCls}>
                                            <option value="">Select status</option>
                                            {(lookups['MARITAL_STATUS'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Contact number</label>
                                        <input type="tel" pattern="[0-9]{10}" maxLength={10} name="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputCls} placeholder="10-digit mobile number" />
                                    </div>
                                    <div className="relative">
                                        <label className={labelCls}>Date of birth <span className="text-danger">*</span></label>
                                        <button
                                            type="button"
                                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                            className={`${inputCls} flex items-center justify-between text-left`}
                                        >
                                            <span className={formData.dob ? 'text-foreground' : 'text-faint'}>
                                                {formData.dob ? new Date(formData.dob).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select date'}
                                            </span>
                                            <Calendar className="h-4 w-4 text-faint" aria-hidden />
                                        </button>

                                        {isDatePickerOpen && (
                                            <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-border bg-surface p-4 shadow-lifted sm:w-[320px]">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCalendarView(calendarView === 'months' ? 'days' : 'months')}
                                                            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
                                                        >
                                                            {monthLabels[viewDate.getMonth()]}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCalendarView(calendarView === 'years' ? 'days' : 'years')}
                                                            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
                                                        >
                                                            {viewDate.getFullYear()}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted" aria-label="Previous month"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
                                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted" aria-label="Next month"><ChevronRight className="h-4 w-4" aria-hidden /></button>
                                                    </div>
                                                </div>

                                                {calendarView === 'days' && (
                                                    <>
                                                        <div className="mb-1 grid grid-cols-7 gap-1">
                                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                                <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide text-faint">{d}</div>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {generateDays(viewDate).map((day, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    disabled={!day}
                                                                    onClick={() => day && handleDateSelect(day)}
                                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] transition-colors ${!day ? 'invisible' : dobValue && day.toDateString() === dobValue.toDateString() ? 'bg-primary font-semibold text-white' : 'text-foreground hover:bg-surface-muted'}`}
                                                                >
                                                                    {day?.getDate()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}

                                                {calendarView === 'years' && (
                                                    <div className="grid max-h-[240px] grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                                                        {yearRange.map(y => (
                                                            <button
                                                                key={y}
                                                                type="button"
                                                                onClick={() => { setViewDate(new Date(viewDate.setFullYear(y))); setCalendarView('days'); }}
                                                                className={`rounded-lg py-1.5 text-[13px] font-medium transition-colors ${viewDate.getFullYear() === y ? 'bg-primary text-white' : 'text-foreground hover:bg-surface-muted'}`}
                                                            >
                                                                {y}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {calendarView === 'months' && (
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {monthLabels.map((m, i) => (
                                                            <button
                                                                key={m}
                                                                type="button"
                                                                onClick={() => { setViewDate(new Date(viewDate.setMonth(i))); setCalendarView('days'); }}
                                                                className={`rounded-lg py-2 text-[13px] font-medium transition-colors ${viewDate.getMonth() === i ? 'bg-primary text-white' : 'text-foreground hover:bg-surface-muted'}`}
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
                                        <label className={labelCls}>Birth time</label>
                                        <input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Birth place</label>
                                        <input name="birthPlace" value={formData.birthPlace} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Gotra <span className="text-danger">*</span></label>
                                        <select required name="gotra" value={formData.gotra} onChange={handleChange} className={inputCls}>
                                            <option value="">Select gotra</option>
                                            {(lookups['GOTRA'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Address line</label>
                                        <input name="familyAddress" value={formData.familyAddress} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>City</label>
                                        <input name="familyCity" value={formData.familyCity} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>State</label>
                                        <input name="familyState" value={formData.familyState} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Country</label>
                                        <input name="familyCountry" value={formData.familyCountry} onChange={handleChange} className={inputCls} />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Physical */}
                            <SectionCard title="Physical attributes">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelCls}>Complexion</label>
                                        <input name="complexion" value={formData.complexion} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Height</label>
                                        <div className="flex gap-2">
                                            {heightUnit === 'ft' ? (
                                                <select name="height" value={formData.height} onChange={handleChange} className={inputCls}>
                                                    <option value="">Select height</option>
                                                    {Array.from({ length: 37 }, (_, i) => {
                                                        const ft = Math.floor(i / 12) + 4;
                                                        const inch = i % 12;
                                                        const val = `${ft}ft ${inch}in`;
                                                        return <option key={val} value={val}>{val}</option>;
                                                    })}
                                                </select>
                                            ) : (
                                                <select name="height" value={formData.height} onChange={handleChange} className={inputCls}>
                                                    <option value="">Select height</option>
                                                    {Array.from({ length: 101 }, (_, i) => i + 120).map(cm => (
                                                        <option key={cm} value={cm}>{cm} cm</option>
                                                    ))}
                                                </select>
                                            )}
                                            <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5">
                                                <button type="button" onClick={() => { setHeightUnit('ft'); setFormData(p => ({ ...p, height: '' })) }} className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${heightUnit === 'ft' ? 'bg-surface text-foreground shadow-card' : 'text-faint hover:text-foreground'}`}>ft/in</button>
                                                <button type="button" onClick={() => { setHeightUnit('cm'); setFormData(p => ({ ...p, height: '' })) }} className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${heightUnit === 'cm' ? 'bg-surface text-foreground shadow-card' : 'text-faint hover:text-foreground'}`}>cm</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Weight</label>
                                        <select name="weight" value={formData.weight} onChange={handleChange} className={inputCls}>
                                            <option value="">Select weight</option>
                                            {Array.from({ length: 111 }, (_, i) => i + 40).map(w => (
                                                <option key={w} value={w}>{w} kg</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Manglik status</label>
                                        <select name="isManglik" value={formData.isManglik} onChange={handleChange} className={inputCls}>
                                            <option value="">Select status</option>
                                            {(lookups['MANGLIK_STATUS'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                                        <input type="checkbox" name="wearsSpectacles" checked={formData.wearsSpectacles} onChange={handleChange} className="h-4 w-4 rounded accent-[var(--primary)]" />
                                        <span className="text-[13px] font-medium text-foreground">Wears spectacles</span>
                                    </label>
                                </div>
                            </SectionCard>

                            {/* Education & career */}
                            <SectionCard title="Education & career">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelCls}>Education</label>
                                        <select name="education" value={formData.education} onChange={handleChange} className={inputCls}>
                                            <option value="">Select education</option>
                                            {(lookups['EDUCATION'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Occupation</label>
                                        <select name="occupation" value={formData.occupation} onChange={handleChange} className={inputCls}>
                                            <option value="">Select occupation</option>
                                            {(lookups['OCCUPATION'] || []).map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Monthly income (₹)</label>
                                        <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className={inputCls} />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Family */}
                            <SectionCard title="Family details">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelCls}>Father's name</label>
                                        <input name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Father's occupation</label>
                                        <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Mother's name</label>
                                        <input name="motherName" value={formData.motherName} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Mother's occupation</label>
                                        <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Brothers married</label>
                                        <input type="number" min="0" name="brothersMarried" value={formData.brothersMarried} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Brothers unmarried</label>
                                        <input type="number" min="0" name="brothersUnmarried" value={formData.brothersUnmarried} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Sisters married</label>
                                        <input type="number" min="0" name="sistersMarried" value={formData.sistersMarried} onChange={handleChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Sisters unmarried</label>
                                        <input type="number" min="0" name="sistersUnmarried" value={formData.sistersUnmarried} onChange={handleChange} className={inputCls} />
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="flex justify-end gap-2 pt-1">
                                {profile && (
                                    <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                                    {profile ? 'Save changes' : 'Create profile'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Identity card */}
                            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted" style={{ width: 72, height: 72 }}>
                                        {profile?.photoUrl ? (
                                            <img src={`${IMAGE_BASE_URL}${profile.photoUrl}`} alt={profile.fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <UserIcon className="h-8 w-8 text-faint" aria-hidden />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{profile?.fullName}</h2>
                                            <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-success">
                                                <CheckCircle className="h-3 w-3" aria-hidden /> Verified
                                            </span>
                                            {membershipActive && (
                                                <span className="rounded-full bg-premium-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-premium">★ Premium</span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-[13px] text-muted-foreground">
                                            {[profile?.occupation, profile?.familyCity].filter(Boolean).join(' · ') || 'Complete your bio-data to improve visibility'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <SectionCard title="Personal information">
                                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                                    <KV label="Full name" value={profile?.fullName} />
                                    <KV label="Gender" value={profile?.gender} />
                                    <KV label="Marital status" value={profile?.maritalStatus} />
                                    <KV label="Contact number" value={profile?.contactNumber} />
                                    <KV label="Date of birth" value={profile?.dob} />
                                    <KV label="Birth time" value={profile?.birthTime} />
                                    <KV label="Birth place" value={profile?.birthPlace} />
                                    <KV label="Gotra" value={profile?.gotra} />
                                    <KV label="Address" value={address} wide />
                                </div>
                            </SectionCard>

                            <SectionCard title="Physical attributes">
                                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                                    <KV label="Complexion" value={profile?.complexion} />
                                    <KV label="Height" value={profile?.formattedHeight || (profile?.height ? `${profile.height} cm` : null)} />
                                    <KV label="Weight" value={profile?.formattedWeight || (profile?.weight ? `${profile.weight} kg` : null)} />
                                    <KV label="Manglik status" value={<span className="capitalize">{profile?.isManglik || 'No'}</span>} />
                                    <KV label="Wears spectacles" value={profile?.wearsSpectacles ? 'Yes' : 'No'} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Education & career">
                                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                                    <KV label="Education" value={profile?.education} />
                                    <KV label="Occupation" value={profile?.occupation} />
                                    <KV label="Monthly income" value={profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : ''} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Family details">
                                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                                    <KV label="Father's name" value={profile?.fatherName} />
                                    <KV label="Father's occupation" value={profile?.fatherOccupation} />
                                    <KV label="Mother's name" value={profile?.motherName} />
                                    <KV label="Mother's occupation" value={profile?.motherOccupation} />
                                    <KV label="Brothers (married / unmarried)" value={`${profile?.brothersMarried || 0} / ${profile?.brothersUnmarried || 0}`} />
                                    <KV label="Sisters (married / unmarried)" value={`${profile?.sistersMarried || 0} / ${profile?.sistersUnmarried || 0}`} />
                                </div>
                            </SectionCard>
                        </>
                    )}
                </div>

                {/* Right rail */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-surface shadow-card">
                        <div className="border-b border-border px-5 py-3.5">
                            <h3 className="text-sm font-semibold text-foreground">Account status</h3>
                        </div>
                        <div className="space-y-4 px-5 py-4">
                            {profile ? (
                                <>
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-muted-foreground">Membership</span>
                                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${membershipActive ? 'bg-success-subtle text-success' : 'bg-surface-muted text-muted-foreground'}`}>
                                            {membershipActive ? <CheckCircle className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
                                            {profile.membershipStatus?.name || 'Not active'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setQrModal(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                                    >
                                        <QrCode className="h-4 w-4 text-muted-foreground" aria-hidden /> Share QR code
                                    </button>
                                </>
                            ) : (
                                <p className="rounded-lg bg-info-subtle px-3.5 py-3 text-[13px] text-info">
                                    Submit your bio-data to activate your profile.
                                </p>
                            )}

                            <div className="border-t border-border pt-4">
                                {membershipActive ? (
                                    <p className="text-[13px] text-muted-foreground">
                                        <span className="font-semibold text-foreground">Premium membership active.</span> Your profile is highlighted and all features are unlocked.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[13px] text-muted-foreground">Unlock contact details and get priority assistance with a membership.</p>
                                        <Link
                                            href="/dashboard/payment/memberships"
                                            className="flex w-full items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                                        >
                                            View plans
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface shadow-card">
                        <div className="border-b border-border px-5 py-3.5">
                            <h3 className="text-sm font-semibold text-foreground">Photo requests</h3>
                        </div>
                        <div className="px-5 py-4">
                            {incomingRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {incomingRequests.map((req) => (
                                        <div key={req.id} className="rounded-lg border border-border p-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[11px] font-semibold text-primary">
                                                    {req.requesterEmail[0].toUpperCase()}
                                                </span>
                                                <p className="min-w-0 truncate text-[12.5px] font-medium text-foreground">{req.requesterEmail}</p>
                                            </div>
                                            <div className="mt-2.5 flex gap-2">
                                                {req.status === 'PENDING' ? (
                                                    <>
                                                        <button onClick={() => handleRespondToRequest(req.id, 'APPROVED')} className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover">Approve</button>
                                                        <button onClick={() => handleRespondToRequest(req.id, 'REJECTED')} className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-subtle">Decline</button>
                                                    </>
                                                ) : (
                                                    <span className={`w-full rounded-full px-2.5 py-1 text-center text-[11.5px] font-semibold ${req.status === 'APPROVED' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                        {req.status === 'APPROVED' ? 'Approved' : 'Declined'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-[12.5px] text-faint">No pending requests</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR modal */}
            <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="Your profile QR code">
                <div className="flex flex-col items-center space-y-5 p-6 text-center">
                    <div className="rounded-xl border border-border bg-white p-4">
                        <img src={`${api.defaults.baseURL}/profiles/${profile?.id}/qr-code`} alt="Profile QR code" className="h-56 w-56" />
                    </div>
                    <p className="max-w-[280px] text-[13px] text-muted-foreground">
                        Share this code to let someone open your verified bio-data directly.
                    </p>
                    <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                        <Share2 className="h-4 w-4" aria-hidden /> Print
                    </button>
                </div>
            </Modal>

            {/* Popup */}
            {popup.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-lifted">
                        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${popup.type === 'success' ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                            {popup.type === 'success' ? (
                                <CheckCircle className="h-6 w-6 text-success" aria-hidden />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-danger" aria-hidden />
                            )}
                        </div>
                        <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                            {popup.type === 'success' ? 'Done' : 'Something went wrong'}
                        </h3>
                        <p className="mt-1.5 text-[13px] text-muted-foreground">{popup.message}</p>
                        <button
                            onClick={closePopup}
                            className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
