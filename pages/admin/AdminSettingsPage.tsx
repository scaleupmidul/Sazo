
import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';
import { 
    Save, LoaderCircle, Plus, Trash2, CheckCircle, Monitor, 
    Smartphone, Tag, CreditCard, Layout, Image as ImageIcon, 
    MessageSquare, Shield, X, Share2, Facebook, Instagram, 
    Twitter, Youtube, ExternalLink, Settings as SettingsIcon, 
    Type, Percent, Palette, Move, AlertTriangle, HelpCircle,
    ShoppingBag, Info, Sparkles, Layers, Eye, EyeOff, SmartphoneNfc,
    Globe, PhoneCall, MapPin, MousePointer2, AlignLeft,
    Check, ChevronRight, FileText, Lock, User, ShieldCheck, PlusCircle
} from 'lucide-react';
import { SliderImageSetting, ShippingOption, SocialMediaLink, AppSettings, CategoryImageSetting } from '../../types';

// -------------------------------------------------------------------------
// UTILITY: Image Processing
// -------------------------------------------------------------------------
const compressImage = (file: File, options: { maxWidth: number; quality: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const { maxWidth, quality } = options;
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                const maxHeight = maxWidth; 
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Failed to get canvas context');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
    });
};

// -------------------------------------------------------------------------
// REUSABLE SUB-COMPONENTS (Compact UI)
// -------------------------------------------------------------------------

interface ImageInputProps {
    currentImage: string;
    onImageChange: (value: string) => void;
    options: { maxWidth: number; quality: number };
    label?: string;
    description?: string;
}

const ImageAssetInput: React.FC<ImageInputProps> = ({ currentImage, onImageChange, options, label, description }) => {
    const { notify } = useAppStore();
    const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
             notify('File too large (Max 15MB).', 'error');
             return;
        }
        setIsProcessing(true);
        try {
            const result = await compressImage(file, options);
            onImageChange(result);
        } catch (error) {
            notify('Error processing image.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {label && <label className="text-[11px] font-bold text-stone-500 uppercase tracking-tight">{label}</label>}
                <div className="flex bg-stone-100 p-0.5 rounded-lg">
                    <button type="button" onClick={() => setInputType('upload')} className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-md transition-all ${inputType === 'upload' ? 'bg-white text-pink-600 shadow-sm' : 'text-stone-400'}`}>Upload</button>
                    <button type="button" onClick={() => setInputType('url')} className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-md transition-all ${inputType === 'url' ? 'bg-white text-pink-600 shadow-sm' : 'text-stone-400'}`}>URL</button>
                </div>
            </div>
            
            <div className="relative group/asset">
                {inputType === 'upload' ? (
                    <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-dashed border-stone-200 rounded-xl hover:border-pink-300 transition-colors cursor-pointer relative overflow-hidden">
                        <input type="file" onChange={handleFileSelect} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <ImageIcon className="w-4 h-4 text-stone-400" />
                        <span className="text-[11px] font-semibold text-stone-500 truncate">{currentImage ? 'Asset Selected' : 'Choose Local...'}</span>
                        {isProcessing && <LoaderCircle className="w-3 h-3 animate-spin text-pink-600 ml-auto" />}
                    </div>
                ) : (
                    <div className="relative">
                        <input 
                            type="text" 
                            value={currentImage.startsWith('data:') ? '' : currentImage} 
                            onChange={(e) => onImageChange(e.target.value)} 
                            placeholder="https://..." 
                            className="w-full p-2 pl-8 border border-stone-200 rounded-xl text-xs bg-white text-stone-900 focus:border-pink-500 outline-none shadow-sm" 
                        />
                        <ExternalLink className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                    </div>
                )}
                
                {currentImage && (
                    <div className="mt-2 relative rounded-xl overflow-hidden group/prev border border-stone-100 shadow-sm w-20 h-20">
                        <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => onImageChange('')} className="absolute inset-0 bg-black/40 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {description && <p className="text-[9px] text-stone-400">{description}</p>}
        </div>
    );
};

const CompactSectionHeader: React.FC<{ icon: React.ElementType, title: string, sub: string }> = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
        <div className="p-2 bg-pink-50 rounded-lg"><Icon className="w-5 h-5 text-pink-600" /></div>
        <div>
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 block">
        {children}
    </label>
);

const ProfessionalInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none shadow-sm placeholder:text-stone-300 ${props.className || ''}`}
    />
);

const ProfessionalTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea 
        {...props} 
        className={`w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all outline-none shadow-sm placeholder:text-stone-300 ${props.className || ''}`}
    />
);

// -------------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------------

const AdminSettingsPage: React.FC = () => {
    const { settings, updateSettings, notify } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('categories');
    const [confirmSyncText, setConfirmSyncText] = useState('');

    // Password visibility states
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // --- Detailed States for all AppSettings properties ---
    
    // Authentication
    const [adminEmail, setAdminEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // --- Safety Logic: Only require confirmation if password fields have content ---
    const isPasswordModified = newPassword.length > 0 || confirmNewPassword.length > 0;
    const isSecurityTab = activeTab === 'general';
    const isConfirmationRequired = isSecurityTab && isPasswordModified;
    const isConfirmationValid = !isConfirmationRequired || confirmSyncText === 'CONFIRM';
    
    // Category Structure
    const [categoriesList, setCategoriesList] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryImages, setCategoryImages] = useState<CategoryImageSetting[]>([]);
    
    // Payment Systems
    const [onlinePaymentInfo, setOnlinePaymentInfo] = useState('');
    const [onlinePaymentFontSize, setOnlinePaymentFontSize] = useState('0.875rem');
    const [codEnabled, setCodEnabled] = useState(true);
    const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
    const [onlinePaymentMethodsText, setOnlinePaymentMethodsText] = useState('');
    
    // Logistics
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    
    // Hero Components
    const [sliderImages, setSliderImages] = useState<SliderImageSetting[]>([]);
    const [homepageNewArrivalsCount, setHomepageNewArrivalsCount] = useState(4);
    const [homepageTrendingCount, setHomepageTrendingCount] = useState(4);
    const [showSliderText, setShowSliderText] = useState(true);
    
    // Static Content
    const [footerDescription, setFooterDescription] = useState('');
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [showWhatsAppButton, setShowWhatsAppButton] = useState(true);
    const [promoImage, setPromoImage] = useState('');

    // Cosmetics Vertical
    const [cosHero, setCosHero] = useState('');
    const [cosMobHero, setCosMobHero] = useState('');
    const [cosTitle, setCosTitle] = useState('');
    const [cosSub, setCosSub] = useState('');
    const [showCosHeroText, setShowCosHeroText] = useState(true);
    const [cosPromoThreshold, setCosPromoThreshold] = useState(2500);
    const [cosPromoTitle, setCosPromoTitle] = useState('');
    const [cosPromoDesc, setCosPromoDesc] = useState('');
    const [cosPromoImg, setCosPromoImg] = useState('');
    const [cosMobPromoImg, setCosMobPromoImg] = useState('');
    const [showCosPromo, setShowCosPromo] = useState(false);

    // Women Vertical
    const [womenHero, setWomenHero] = useState('');
    const [womenMobHero, setWomenMobHero] = useState('');
    const [womenTitle, setWomenTitle] = useState('');
    const [womenSub, setWomenSub] = useState('');
    const [showWomenHeroText, setShowWomenHeroText] = useState(true);

    // Campaign Banners
    const [sigFashDesk, setSigFashDesk] = useState('');
    const [sigFashMob, setSigFashMob] = useState('');
    const [sigCosDesk, setSigCosDesk] = useState('');
    const [sigCosMob, setSigCosMob] = useState('');

    // Initialize state from store
    useEffect(() => {
        if (settings) {
            setAdminEmail(settings.adminEmail || '');
            setCategoriesList(settings.categories || []);
            setCategoryImages(settings.categoryImages || []);
            setOnlinePaymentInfo(settings.onlinePaymentInfo || '');
            setOnlinePaymentFontSize(settings.onlinePaymentInfoStyles?.fontSize || '0.875rem');
            setCodEnabled(settings.codEnabled ?? true);
            setOnlinePaymentEnabled(settings.onlinePaymentEnabled ?? true);
            setOnlinePaymentMethodsText(settings.onlinePaymentMethods?.join(', ') || '');
            setShippingOptions(settings.shippingOptions || []);
            setSliderImages(settings.sliderImages || []);
            setHomepageNewArrivalsCount(settings.homepageNewArrivalsCount || 4);
            setHomepageTrendingCount(settings.homepageTrendingCount || 4);
            setShowSliderText(settings.showSliderText ?? true);
            setFooterDescription(settings.footerDescription || '');
            setSocialMediaLinks(settings.socialMediaLinks || []);
            setPrivacyPolicy(settings.privacyPolicy || '');
            setContactAddress(settings.contactAddress || '');
            setContactPhone(settings.contactPhone || '');
            setContactEmail(settings.contactEmail || '');
            setWhatsappNumber(settings.whatsappNumber || '');
            setShowWhatsAppButton(settings.showWhatsAppButton ?? true);
            setPromoImage(settings.productPagePromoImage || '');
            
            setCosHero(settings.cosmeticsHeroImage || '');
            setCosMobHero(settings.cosmeticsMobileHeroImage || '');
            setCosTitle(settings.cosmeticsHeroTitle || '');
            setCosSub(settings.cosmeticsHeroSubtitle || '');
            setShowCosHeroText(settings.showCosmeticsHeroText ?? true);
            setCosPromoThreshold(settings.cosmeticsPromoThreshold || 2500);
            setCosPromoTitle(settings.cosmeticsPromoTitle || '');
            setCosPromoDesc(settings.cosmeticsPromoDescription || '');
            setCosPromoImg(settings.cosmeticsPromoImage || '');
            setCosMobPromoImg(settings.cosmeticsMobilePromoImage || '');
            setShowCosPromo(settings.showCosmeticsPromo ?? false);

            setWomenHero(settings.womenHeroImage || '');
            setWomenMobHero(settings.womenMobileHeroImage || '');
            setWomenTitle(settings.womenHeroTitle || '');
            setWomenSub(settings.womenHeroSubtitle || '');
            setShowWomenHeroText(settings.showWomenHeroText ?? true);

            setSigFashDesk(settings.signatureFashionDesktopImage || '');
            setSigFashMob(settings.signatureFashionMobileImage || '');
            setSigCosDesk(settings.signatureCosmeticsDesktopImage || '');
            setSigCosMob(settings.signatureCosmeticsMobileImage || '');
        }
    }, [settings]);

    // --- Interaction Handlers ---

    // TAB SWITCHER WITH CLEANUP
    const handleTabSwitch = (tab: string) => {
        // If we are leaving the security tab, clear password states to prevent blockages on other tabs
        if (activeTab === 'general' && tab !== 'general') {
            setNewPassword('');
            setConfirmNewPassword('');
            setConfirmSyncText('');
            setShowNewPass(false);
            setShowConfirmPass(false);
        }
        setActiveTab(tab);
    };

    const handleAddCategory = () => {
        const val = newCategoryName.trim();
        if (!val || categoriesList.includes(val)) return;
        setCategoriesList(prev => [...prev, val]);
        setCategoryImages(prev => [...prev, { categoryName: val, image: '' }]);
        setNewCategoryName('');
    };

    const handleRemoveCategory = (name: string) => {
        if (name === 'Cosmetics') {
             notify("Cannot remove protected system category.", "error");
             return;
        }
        if (window.confirm(`Remove "${name}" category? Filters will be affected.`)) {
            setCategoriesList(p => p.filter(c => c !== name));
            setCategoryImages(p => p.filter(ci => ci.categoryName !== name));
        }
    };

    const handleAddSlide = () => {
        setSliderImages(prev => [...prev, { 
            id: Date.now(), 
            title: 'New Trend', 
            subtitle: 'Collection description...', 
            color: 'text-white', 
            image: '' 
        }]);
    };

    const handleAddShipping = () => {
        setShippingOptions(prev => [...prev, { id: Date.now().toString(), label: 'New Zone', charge: 0 }]);
    };

    const handleSave = async () => {
        // Validation: ONLY check password match and confirm text if password is actually being changed
        if (isSecurityTab && isPasswordModified) {
            if (newPassword !== confirmNewPassword) {
                notify("Passwords do not match.", "error");
                return;
            }
            if (confirmSyncText !== 'CONFIRM') {
                notify("Please type CONFIRM to push sensitive updates.", "error");
                return;
            }
        }
        
        setIsSaving(true);
        try {
            await updateSettings({
                adminEmail, 
                adminPassword: (isSecurityTab && isPasswordModified) ? newPassword : undefined,
                categories: categoriesList, categoryImages,
                onlinePaymentInfo, onlinePaymentInfoStyles: { fontSize: onlinePaymentFontSize },
                codEnabled, onlinePaymentEnabled,
                onlinePaymentMethods: onlinePaymentMethodsText.split(',').map(m => m.trim()).filter(Boolean),
                shippingOptions, sliderImages, homepageNewArrivalsCount, homepageTrendingCount, showSliderText,
                footerDescription, socialMediaLinks, privacyPolicy, contactAddress, contactPhone, contactEmail,
                whatsappNumber, showWhatsAppButton, productPagePromoImage: promoImage,
                cosmeticsHeroImage: cosHero, cosmeticsMobileHeroImage: cosMobHero, cosmeticsHeroTitle: cosTitle, cosmeticsHeroSubtitle: cosSub, showCosmeticsHeroText: showCosHeroText,
                cosmeticsPromoThreshold: cosPromoThreshold, cosmeticsPromoTitle: cosPromoTitle, cosmeticsPromoDescription: cosPromoDesc, cosmeticsPromoImage: cosPromoImg, cosmeticsMobilePromoImage: cosMobPromoImg, showCosmeticsPromo: showCosPromo,
                womenHeroImage: womenHero, womenMobileHeroImage: womenMobHero, womenHeroTitle: womenTitle, womenHeroSubtitle: womenSub, showWomenHeroText: showWomenHeroText,
                signatureFashionDesktopImage: sigFashDesk, signatureFashionMobileImage: sigFashMob, signatureCosmeticsDesktopImage: sigCosDesk, signatureCosmeticsMobileImage: sigCosMob
            });
            setIsSaved(true);
            setConfirmSyncText('');
            setTimeout(() => setIsSaved(false), 2000);
            setNewPassword(''); setConfirmNewPassword('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tab Rendering Logic (All detail fields included) ---

    const renderTabContent = () => {
        const cardClass = "bg-white p-6 rounded-2xl border border-stone-100 shadow-sm animate-fadeIn space-y-8";

        switch (activeTab) {
            case 'categories': return (
                <div className={cardClass}>
                    <CompactSectionHeader icon={Tag} title="Catalog Structure" sub="Filters & Collection Banners" />
                    <div className="space-y-6">
                        <div className="flex gap-2">
                            <ProfessionalInput 
                                value={newCategoryName} 
                                onChange={e => setNewCategoryName(e.target.value)} 
                                placeholder="Enter category (e.g. Lawn, Saree)..." 
                                onKeyPress={e => e.key === 'Enter' && handleAddCategory()}
                            />
                            <button onClick={handleAddCategory} className="bg-stone-900 text-white px-6 rounded-xl font-bold hover:bg-pink-600 transition flex items-center gap-2 whitespace-nowrap text-xs uppercase">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoriesList.map(cat => (
                                <div key={cat} className="p-4 border border-stone-100 rounded-2xl bg-stone-50/30 space-y-4 group">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs uppercase tracking-tighter">{cat}</span>
                                        {cat !== 'Cosmetics' && (
                                            <button onClick={() => handleRemoveCategory(cat)} className="text-stone-300 hover:text-red-500 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <ImageAssetInput 
                                        label="Filter Banner"
                                        currentImage={categoryImages.find(ci => ci.categoryName === cat)?.image || ''} 
                                        onImageChange={val => setCategoryImages(prev => prev.map(ci => ci.categoryName === cat ? {...ci, image: val} : ci))}
                                        options={{maxWidth: 600, quality: 0.8}}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            case 'general': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Shield} title="Dashboard Security" sub="Admin Access Control" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel>Admin Primary Email</FormLabel>
                                    <Lock className="w-3 h-3 text-pink-300 mb-1" />
                                </div>
                                <ProfessionalInput value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                            </div>
                            
                            {/* New Secure Password with Toggle */}
                            <div className="space-y-1">
                                <FormLabel>New Secure Password</FormLabel>
                                <div className="relative group">
                                    <ProfessionalInput 
                                        type={showNewPass ? 'text' : 'password'} 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        className="pr-10"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNewPass(!showNewPass)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-pink-600 transition-colors"
                                    >
                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Verify New Password with Toggle */}
                            <div className="space-y-1">
                                <FormLabel>Verify New Password</FormLabel>
                                <div className="relative group">
                                    <ProfessionalInput 
                                        type={showConfirmPass ? 'text' : 'password'} 
                                        value={confirmNewPassword} 
                                        onChange={e => setConfirmNewPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        className="pr-10"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPass(!showConfirmPass)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-pink-600 transition-colors"
                                    >
                                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {isPasswordModified && (
                            <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 flex gap-3 items-start animate-fadeIn">
                                <AlertTriangle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold text-pink-700 leading-relaxed uppercase tracking-tight">
                                    Important: Changing security credentials requires typed confirmation below "Push Updates" to activate.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className={cardClass}>
                        <CompactSectionHeader icon={PhoneCall} title="Business Touchpoints" sub="Customer Support Info" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <FormLabel>WhatsApp Connect</FormLabel>
                                <ProfessionalInput value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+8801..." />
                            </div>
                            <div className="flex items-center gap-3 pt-6 px-2">
                                <input type="checkbox" checked={showWhatsAppButton} onChange={e => setShowWhatsAppButton(e.target.checked)} className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500/20" />
                                <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">Active WhatsApp Widget</span>
                            </div>
                            <div className="space-y-1">
                                <FormLabel>Support Hotline</FormLabel>
                                <ProfessionalInput value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <FormLabel>Public Support Email</FormLabel>
                                <ProfessionalInput value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <FormLabel>Warehouse / Office Address</FormLabel>
                                <ProfessionalTextarea value={contactAddress} onChange={e => setContactAddress(e.target.value)} rows={2} />
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 'payments': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={CreditCard} title="Transaction Portal" sub="Gateway Configurations" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${codEnabled ? 'border-pink-500 bg-pink-50/50' : 'border-stone-100 bg-stone-50'}`}>
                                <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)} className="w-5 h-5 text-pink-600" />
                                <span className="text-xs font-bold uppercase tracking-tight">Cash on Delivery</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${onlinePaymentEnabled ? 'border-pink-500 bg-pink-50/50' : 'border-stone-100 bg-stone-50'}`}>
                                <input type="checkbox" checked={onlinePaymentEnabled} onChange={e => setOnlinePaymentEnabled(e.target.checked)} className="w-5 h-5 text-pink-600" />
                                <span className="text-xs font-bold uppercase tracking-tight">Online Advance</span>
                            </label>
                        </div>
                        {onlinePaymentEnabled && (
                            <div className="space-y-6 pt-4 border-t border-stone-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <FormLabel>Payment Instructions (HTML)</FormLabel>
                                        <select value={onlinePaymentFontSize} onChange={e => setOnlinePaymentFontSize(e.target.value)} className="text-[10px] font-bold p-1 bg-white border border-stone-200 rounded outline-none">
                                            <option value="0.75rem">Compact</option>
                                            <option value="0.875rem">Standard</option>
                                            <option value="1rem">Emphasized</option>
                                        </select>
                                    </div>
                                    <ProfessionalTextarea value={onlinePaymentInfo} onChange={e => setOnlinePaymentInfo(e.target.value)} rows={4} placeholder="<b>Send Charge to:</b> 01XXX..." />
                                    <p className="text-[9px] text-stone-400 uppercase tracking-widest px-1 flex items-center gap-1"><Info className="w-3 h-3" /> Supports &lt;b&gt; and &lt;br&gt; tags.</p>
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>Accepted Methods (Comma Separated)</FormLabel>
                                    <ProfessionalInput value={onlinePaymentMethodsText} onChange={e => setOnlinePaymentMethodsText(e.target.value)} placeholder="Bkash, Nagad, Rocket" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={cardClass}>
                        <div className="flex justify-between items-center mb-2">
                            <CompactSectionHeader icon={Move} title="Logistics Engine" sub="Delivery Charge Matrix" />
                            <button onClick={handleAddShipping} className="text-pink-600 font-bold text-[10px] uppercase flex items-center gap-1 border border-pink-100 px-3 py-1 rounded-lg hover:bg-pink-50">+ Add Zone</button>
                        </div>
                        <div className="space-y-3">
                            {shippingOptions.map(opt => (
                                <div key={opt.id} className="flex gap-3 items-end p-3 bg-stone-50 rounded-xl border border-stone-100 group">
                                    <div className="flex-1 space-y-1">
                                        <FormLabel>Location Title</FormLabel>
                                        <ProfessionalInput value={opt.label} onChange={e => setShippingOptions(p => p.map(o => o.id === opt.id ? {...o, label: e.target.value} : o))} placeholder="Inside Dhaka" />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <FormLabel>Charge (৳)</FormLabel>
                                        <ProfessionalInput type="number" value={opt.charge} onChange={e => setShippingOptions(p => p.map(o => o.id === opt.id ? {...o, charge: Number(e.target.value)} : o))} className="font-bold text-pink-600" />
                                    </div>
                                    <button onClick={() => setShippingOptions(p => p.filter(o => o.id !== opt.id))} className="p-2.5 text-stone-300 hover:text-red-500 transition bg-white border border-stone-100 rounded-lg group-hover:border-red-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {shippingOptions.length === 0 && <p className="text-center py-6 text-stone-300 text-[11px] uppercase tracking-widest border border-dashed rounded-xl">No shipping zones configured.</p>}
                        </div>
                    </div>
                </div>
            );

            case 'appearance': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Layout} title="The Grand Fold" sub="Hero Slider Management" />
                        <label className="flex items-center gap-3 mb-6 p-3 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer">
                            <input type="checkbox" checked={showSliderText} onChange={e => setShowSliderText(e.target.checked)} className="w-5 h-5 rounded text-pink-600" />
                            <span className="text-[11px] font-bold uppercase text-stone-600 tracking-tight">Active Slider Overlays (Title/Buttons)</span>
                        </label>
                        <div className="space-y-6">
                            {sliderImages.map((slide, idx) => (
                                <div key={slide.id} className="p-5 border border-stone-100 rounded-2xl bg-white shadow-sm relative group/slide">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-1 rounded">SLIDE #{idx + 1}</span>
                                        <button onClick={() => setSliderImages(p => p.filter(s => s.id !== slide.id))} className="p-1 text-stone-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <FormLabel>Main Headline</FormLabel>
                                                <ProfessionalInput value={slide.title} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, title: e.target.value} : s))} />
                                            </div>
                                            <div className="space-y-1">
                                                <FormLabel>Sub-description</FormLabel>
                                                <ProfessionalTextarea value={slide.subtitle} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, subtitle: e.target.value} : s))} rows={2} />
                                            </div>
                                            <div className="space-y-1">
                                                <FormLabel>Title CSS Color Class</FormLabel>
                                                <ProfessionalInput value={slide.color} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, color: e.target.value} : s))} placeholder="text-white / text-pink-600" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <ImageAssetInput label="Desktop Canvas" currentImage={slide.image} onImageChange={val => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, image: val} : s))} options={{maxWidth: 1600, quality: 0.8}} />
                                            <ImageAssetInput label="Mobile Canvas" currentImage={slide.mobileImage || ''} onImageChange={val => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, mobileImage: val} : s))} options={{maxWidth: 800, quality: 0.8}} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleAddSlide} className="w-full py-8 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 hover:text-pink-600 hover:bg-pink-50/30 transition-all font-bold uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-2">
                                <PlusCircle className="w-6 h-6" /> Append Hero Dimension
                            </button>
                        </div>
                    </div>
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Palette} title="Campaign Identity" sub="Site-wide Signature Banners" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-5 border border-stone-100 rounded-2xl space-y-6">
                                <h4 className="text-[10px] font-black uppercase text-pink-600 tracking-widest border-b pb-2 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Fashion Studio Box</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <ImageAssetInput label="Desktop Image" currentImage={sigFashDesk} onImageChange={setSigFashDesk} options={{maxWidth: 1600, quality: 0.8}} />
                                    <ImageAssetInput label="Mobile Image" currentImage={sigFashMob} onImageChange={setSigFashMob} options={{maxWidth: 800, quality: 0.8}} />
                                </div>
                            </div>
                            <div className="p-5 border border-stone-100 rounded-2xl space-y-6">
                                <h4 className="text-[10px] font-black uppercase text-pink-600 tracking-widest border-b pb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Beauty Rituals Box</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <ImageAssetInput label="Desktop Image" currentImage={sigCosDesk} onImageChange={setSigCosDesk} options={{maxWidth: 1600, quality: 0.8}} />
                                    <ImageAssetInput label="Mobile Image" currentImage={sigCosMob} onImageChange={setSigCosMob} options={{maxWidth: 800, quality: 0.8}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 'cosmetics': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={ImageIcon} title="Beauty Hub Hero" sub="Cosmetics Landing Page" />
                        <div className="space-y-6">
                            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer">
                                <input type="checkbox" checked={showCosHeroText} onChange={e => setShowCosHeroText(e.target.checked)} className="w-5 h-5 rounded text-pink-600" />
                                <span className="text-[11px] font-bold uppercase text-stone-600">Overlay Headline Visible</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <FormLabel>Creative Headline</FormLabel>
                                    <ProfessionalInput value={cosTitle} onChange={e => setCosTitle(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>Supporting Copy</FormLabel>
                                    <ProfessionalInput value={cosSub} onChange={e => setCosSub(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ImageAssetInput label="Desktop Banner" currentImage={cosHero} onImageChange={setCosHero} options={{maxWidth: 1920, quality: 0.8}} />
                                <ImageAssetInput label="Mobile Banner" currentImage={cosMobHero} onImageChange={setCosMobHero} options={{maxWidth: 800, quality: 0.8}} />
                            </div>
                        </div>
                    </div>
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Percent} title="Loyalty Trigger" sub="Promotional Gift System" />
                        <div className="space-y-6">
                            <label className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100 cursor-pointer">
                                <input type="checkbox" checked={showCosPromo} onChange={e => setShowCosPromo(e.target.checked)} className="w-5 h-5 rounded text-pink-600" />
                                <span className="text-[11px] font-bold uppercase text-pink-700">Activate Global Promo Banner</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <FormLabel>Spending Threshold (৳)</FormLabel>
                                    <ProfessionalInput type="number" value={cosPromoThreshold} onChange={e => setCosPromoThreshold(Number(e.target.value))} className="font-bold text-pink-600" />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>Promo Title</FormLabel>
                                    <ProfessionalInput value={cosPromoTitle} onChange={e => setCosPromoTitle(e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <FormLabel>Promo Narrative</FormLabel>
                                    <ProfessionalTextarea value={cosPromoDesc} onChange={e => setCosPromoDesc(e.target.value)} rows={2} />
                                </div>
                                <ImageAssetInput label="Desktop Promo Asset" currentImage={cosPromoImg} onImageChange={setCosPromoImg} options={{maxWidth: 1200, quality: 0.8}} />
                                <ImageAssetInput label="Mobile Promo Asset" currentImage={cosMobPromoImg} onImageChange={setCosMobPromoImg} options={{maxWidth: 600, quality: 0.8}} />
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 'women': return (
                <div className={cardClass}>
                    <CompactSectionHeader icon={Monitor} title="Fashion Landing" sub="Women's Collection Page" />
                    <div className="space-y-6">
                        <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer">
                            <input type="checkbox" checked={showWomenHeroText} onChange={e => setShowWomenHeroText(e.target.checked)} className="w-5 h-5 rounded text-pink-600" />
                            <span className="text-[11px] font-bold uppercase text-stone-600">Overlay Headline Visible</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <FormLabel>Creative Headline</FormLabel>
                                <ProfessionalInput value={womenTitle} onChange={e => setWomenTitle(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <FormLabel>Supporting Copy</FormLabel>
                                <ProfessionalInput value={womenSub} onChange={e => setWomenSub(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <ImageAssetInput label="Desktop Banner" currentImage={womenHero} onImageChange={setWomenHero} options={{maxWidth: 1920, quality: 0.8}} />
                            <ImageAssetInput label="Mobile Banner" currentImage={womenMobHero} onImageChange={setWomenMobHero} options={{maxWidth: 800, quality: 0.8}} />
                        </div>
                    </div>
                </div>
            );

            case 'content': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Share2} title="Social Footprint" sub="External Profile Links" />
                        <div className="space-y-4">
                            {socialMediaLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2 rounded-xl border border-stone-200 group">
                                    <select 
                                        value={link.platform} 
                                        onChange={e => setSocialMediaLinks(p => p.map((l, i) => i === idx ? {...l, platform: e.target.value} : l))} 
                                        className="p-2 bg-white border border-stone-200 rounded-lg text-[10px] font-bold uppercase w-32 outline-none shadow-sm focus:border-pink-500 transition-all"
                                    >
                                        <option value="Facebook">Facebook</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="Youtube">Youtube</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                    <input 
                                        value={link.url} 
                                        onChange={e => setSocialMediaLinks(p => p.map((l, i) => i === idx ? {...l, url: e.target.value} : l))} 
                                        placeholder="https://..." 
                                        className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-xs outline-none shadow-sm focus:border-pink-500 transition-all" 
                                    />
                                    <button onClick={() => setSocialMediaLinks(p => p.filter((_, i) => i !== idx))} className="p-2 text-stone-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                            <button onClick={() => setSocialMediaLinks(p => [...p, {platform: 'Facebook', url: ''}])} className="text-pink-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 border border-pink-100 px-4 py-2 rounded-xl hover:bg-pink-50 transition-all">+ Add Profile</button>
                        </div>
                    </div>
                    <div className={cardClass}>
                        <CompactSectionHeader icon={AlignLeft} title="Brand Legacy" sub="Footer & Global Text" />
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <FormLabel>Footer Brand Bio</FormLabel>
                                <ProfessionalTextarea value={footerDescription} onChange={e => setFooterDescription(e.target.value)} rows={3} />
                            </div>
                            <div className="p-5 bg-stone-50 rounded-2xl space-y-4 border border-stone-100">
                                <h4 className="text-[10px] font-black uppercase text-pink-600 tracking-widest border-b pb-2">Product Details Promotion</h4>
                                <ImageAssetInput label="Size Guide / Details Banner" currentImage={promoImage} onImageChange={setPromoImage} options={{maxWidth: 1200, quality: 0.8}} description="Visible at bottom of all product detail pages." />
                            </div>
                            <div className="space-y-1 pt-4 border-t border-stone-50">
                                <div className="flex justify-between items-center px-1 mb-1">
                                    <FormLabel>Privacy Charter (Markdown Support)</FormLabel>
                                    <span className="text-[8px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded uppercase font-black">logic variable: {"{{CONTACT_EMAIL}}"}</span>
                                </div>
                                <ProfessionalTextarea value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} rows={12} className="font-mono text-xs leading-relaxed" />
                            </div>
                        </div>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-48 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-xl border border-stone-100"><SettingsIcon className="w-6 h-6 text-pink-600" /></div>
                    <div>
                        <h1 className="text-2xl font-black text-stone-900 tracking-tighter uppercase leading-none">Core <span className="text-pink-600">Configurations</span></h1>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-1.5 ml-1 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> SYSTEM SYNCHRONIZED
                        </p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-0.5 leading-none">Sync Key: {new Date().getHours()}X-{new Date().getMinutes()}Y</p>
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest leading-none">Core v2.5.0-Compact</p>
                    </div>
                </div>
            </div>
            
            {/* Layout Body */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:col-span-3 sticky top-24 z-20">
                    <div className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-stone-100 space-y-1.5">
                        <TabButtonUI label="Categories" isActive={activeTab === 'categories'} onClick={() => handleTabSwitch('categories')} icon={Tag} />
                        <TabButtonUI label="Security" isActive={activeTab === 'general'} onClick={() => handleTabSwitch('general')} icon={Shield} />
                        <TabButtonUI label="Payment Logic" isActive={activeTab === 'payments'} onClick={() => handleTabSwitch('payments')} icon={CreditCard} />
                        <TabButtonUI label="Hero Elements" isActive={activeTab === 'appearance'} onClick={() => handleTabSwitch('appearance')} icon={Layout} />
                        <TabButtonUI label="Cosmetics Edit" isActive={activeTab === 'cosmetics'} onClick={() => handleTabSwitch('cosmetics')} icon={ImageIcon} />
                        <TabButtonUI label="Fashion Edit" isActive={activeTab === 'women'} onClick={() => handleTabSwitch('women')} icon={Monitor} />
                        <TabButtonUI label="External API" isActive={activeTab === 'content'} onClick={() => handleTabSwitch('content')} icon={MessageSquare} />
                    </div>
                    
                    {/* Compact Help Box */}
                    <div className="mt-6 p-5 bg-stone-900 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-pink-600/20 rounded-full blur-2xl group-hover:bg-pink-600/40 transition-all duration-700"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-3 relative z-10">Performance Tip</h4>
                        <p className="text-[11px] font-bold leading-relaxed text-stone-300 relative z-10">Optimizing images below 200KB ensures sub-1s LCP for mobile users.</p>
                    </div>
                </aside>
                
                {/* Scrollable Content Region */}
                <main className="w-full lg:col-span-9 pb-20">
                    {renderTabContent()}
                </main>
            </div>
            
            {/* Float-Synced Save Action (Modern) */}
            <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-3">
                 {/* Verification box: ONLY visible if active tab is Security AND password fields have value */}
                 {isConfirmationRequired && (
                    <div className={`p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-100 transition-all duration-500 transform ${isSaved ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
                            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Type CONFIRM to activate</span>
                        </div>
                        <input 
                            type="text" 
                            value={confirmSyncText} 
                            onChange={e => setConfirmSyncText(e.target.value.toUpperCase())} 
                            placeholder="CONFIRM"
                            className={`w-36 p-2 bg-stone-50 border rounded-xl text-xs font-black tracking-widest text-center transition-all outline-none ${confirmSyncText === 'CONFIRM' ? 'border-green-500 ring-4 ring-green-100 bg-white' : 'border-stone-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100'}`}
                        />
                    </div>
                 )}

                <button 
                    onClick={handleSave} 
                    disabled={isSaving || isSaved || !isConfirmationValid} 
                    className={`
                        group px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(219,39,119,0.3)] font-black transition-all duration-500 flex items-center gap-4 active:scale-95
                        ${isSaved 
                            ? 'bg-green-500 text-white scale-105 shadow-green-200' 
                            : isConfirmationValid
                                ? 'bg-pink-600 text-white hover:bg-pink-700 hover:-translate-y-2'
                                : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                        }
                        disabled:opacity-80
                    `}
                >
                    <div className={`p-2 rounded-xl transition-all duration-500 ${isSaved ? 'bg-white/20' : (isConfirmationValid ? 'bg-white/10 group-hover:rotate-12' : 'bg-stone-300')}`}>
                        {isSaving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : isSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-start text-left leading-none pr-2">
                        <span className="uppercase tracking-[0.3em] text-[9px] opacity-70 mb-1.5 font-bold">{isSaving ? 'Processing' : isSaved ? 'Success' : 'Ready'}</span>
                        <span className="uppercase tracking-widest text-sm font-black">{isSaving ? 'Syncing...' : isSaved ? 'Update Done!' : 'Push Updates'}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

// Internal Nav Link UI
const TabButtonUI: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon: React.ElementType }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-black flex items-center gap-3.5 group ${
            isActive 
                ? 'bg-pink-600 text-white shadow-lg translate-x-1.5' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-pink-600 hover:translate-x-1'
        }`}
    >
        <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-stone-100 group-hover:bg-pink-100'}`}>
            <Icon className="w-4 h-4" />
        </div>
        <span className="uppercase tracking-tighter text-[11px]">{label}</span>
        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
    </button>
);

export default AdminSettingsPage;
