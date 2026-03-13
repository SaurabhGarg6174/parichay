'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, CheckCircle, Pencil, User as UserIcon } from 'lucide-react';

const FieldView = ({ label, value }: { label: string, value: any }) => (
    <div className="mb-4 bg-gray-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100/50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{value || <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>}</p>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
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
        sistersUnmarried: 0
    });

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

                let hUnit = 'ft';
                let hVal = pd.height || '';
                if (hVal.toLowerCase().includes('cm')) {
                    hUnit = 'cm';
                }

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
                    height: hVal,
                    weight: pd.weight || '',
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
                    sistersUnmarried: pd.sistersUnmarried || 0
                });
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        try {
            setPopup({ show: true, message: 'Uploading image...', type: 'success' });
            const res = await api.post('/files/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.data) {
                setFormData(prev => ({ ...prev, photoUrl: res.data.data }));
                setPopup({ show: true, message: 'Image uploaded successfully!', type: 'success' });
            }
        } catch (err: any) {
            setPopup({ show: true, message: 'Failed to upload image', type: 'error' });
        }
    };

    const handleMakePayment = async () => {
        try {
            const { data } = await api.post('/payments/initiate', { amount: 500, currency: 'INR' });
            const orderId = data.data.orderId;

            await api.post('/payments/verify', { orderId, paymentId: 'PAY_' + Date.now(), success: true });
            setPopup({ show: true, message: 'Payment Successful & profile activated!', type: 'success' });
            loadProfile();
        } catch (err: any) {
            setPopup({ show: true, message: err.response?.data?.message || 'Payment simulation failed', type: 'error' });
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const closePopup = () => setPopup({ ...popup, show: false });

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
            {/* Popup Modal */}
            {popup.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100 opacity-100 border dark:border-slate-800">
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {popup.type === 'success' ? (
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            ) : (
                                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {popup.type === 'success' ? 'Success' : 'Error'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{popup.message}</p>
                        <button
                            onClick={closePopup}
                            className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors ${popup.type === 'success' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : 'bg-gray-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600'
                                }`}
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Dashboard</h1>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6 border-b dark:border-slate-800 pb-4">
                        <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">{isEditing ? 'Bio-Data Form' : 'Profile Details'}</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg">
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                        )}
                        {isEditing && profile && (
                            <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">

                            <div className="col-span-full mb-4">
                                <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-4 text-gray-900 dark:text-gray-100">Profile Photo</h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                                        {formData.photoUrl ? (
                                            <img src={`http://localhost:8081${formData.photoUrl}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block">
                                            <span>Choose Image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-full">
                                    <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-2 text-gray-900 dark:text-gray-100">Personal Details</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
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
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                    <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
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
                                <div className="col-span-full mt-4">
                                    <h3 className="text-lg font-medium border-b pb-2 mb-2">Physical Attributes</h3>
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
                                                    <option key={`${cm} cm`} value={`${cm} cm`}>{cm} cm</option>
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
                                            <option key={w} value={`${w} kg`}>{w} kg</option>
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
                                <div className="col-span-full mt-4">
                                    <h3 className="text-lg font-medium border-b pb-2 mb-2">Professional Details</h3>
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
                                <div className="col-span-full mt-4">
                                    <h3 className="text-lg font-medium border-b pb-2 mb-2">Family Details</h3>
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
                                    <input type="number" min="0" name="sistersUnmarried" value={formData.sistersUnmarried} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                                </div>

                            </div>

                            <div className="pt-4 border-t dark:border-slate-800">
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg w-full transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                                    {profile ? 'Update Bio-Data' : 'Submit Bio-Data'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 mt-4">
                            {/* Personal Details View */}
                            <div className="flex items-center gap-6 mb-8 border-b dark:border-slate-800 pb-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-sm shrink-0">
                                    {profile?.photoUrl ? (
                                        <img src={`http://localhost:8081${profile.photoUrl}`} alt={profile.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-300 dark:text-indigo-400">
                                            <UserIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.fullName}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">{profile?.occupation || 'Occupation not specified'}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-4 text-gray-800 dark:text-gray-200">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldView label="Full Name" value={profile?.fullName} />
                                <FieldView label="Gender" value={profile?.gender} />
                                <FieldView label="Marital Status" value={profile?.maritalStatus} />
                                <FieldView label="Contact Number" value={profile?.contactNumber} />
                                <FieldView label="Date of Birth" value={profile?.dob} />
                                <FieldView label="Birth Time" value={profile?.birthTime} />
                                <FieldView label="Birth Place" value={profile?.birthPlace} />
                                <FieldView label="Gotra" value={profile?.gotra} />
                                <FieldView label="Address" value={`${profile?.familyAddress || ''}, ${profile?.familyCity || ''}, ${profile?.familyState || ''}, ${profile?.familyCountry || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',')} />
                            </div>

                            {/* Physical Attributes View */}
                            <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-4 mt-6 text-gray-800 dark:text-gray-200">Physical Attributes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldView label="Complexion" value={profile?.complexion} />
                                <FieldView label="Height" value={profile?.height} />
                                <FieldView label="Weight" value={profile?.weight} />
                                <FieldView label="Manglik Status" value={<span className="capitalize">{profile?.isManglik || 'No'}</span>} />
                                <FieldView label="Wears Spectacles" value={profile?.wearsSpectacles ? 'Yes' : 'No'} />
                            </div>

                            {/* Professional Details View */}
                            <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-4 mt-6 text-gray-800 dark:text-gray-200">Professional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldView label="Education" value={profile?.education} />
                                <FieldView label="Occupation" value={profile?.occupation} />
                                <FieldView label="Monthly Income" value={profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : ''} />
                            </div>

                            {/* Family Details View */}
                            <h3 className="text-lg font-medium border-b dark:border-slate-800 pb-2 mb-4 mt-6 text-gray-800 dark:text-gray-200">Family Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldView label="Father's Name" value={profile?.fatherName} />
                                <FieldView label="Father's Occupation" value={profile?.fatherOccupation} />
                                <FieldView label="Mother's Name" value={profile?.motherName} />
                                <FieldView label="Mother's Occupation" value={profile?.motherOccupation} />
                                <FieldView label="Brothers (Married / Unmarried)" value={`${profile?.brothersMarried || 0} / ${profile?.brothersUnmarried || 0}`} />
                                <FieldView label="Sisters (Married / Unmarried)" value={`${profile?.sistersMarried || 0} / ${profile?.sistersUnmarried || 0}`} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 sticky top-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Profile Status</h2>
                        {profile ? (
                            <div className="flex items-start gap-3 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                <CheckCircle className="text-green-500 w-6 h-6 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.membershipStatus?.name || 'PENDING'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Your profile is currently {profile.membershipStatus?.name?.toLowerCase() || 'pending'}.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl text-sm font-medium border dark:border-yellow-900/30">
                                Please submit your bio-data first to see a profile status.
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Membership Fee
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Complete your payment of ₹500 to activate your profile and join the platform.
                            </p>
                            <button
                                onClick={handleMakePayment}
                                className="w-full bg-black dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                                disabled={!profile}
                            >
                                Pay ₹500
                            </button>
                            {!profile && (
                                <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">Submit bio-data to enable payment</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
