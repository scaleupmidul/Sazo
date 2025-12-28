
// pages/admin/AdminProductsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Product, AppSettings } from '../../types';
import { Plus, Edit, Trash2, Search, LoaderCircle, X, Info, ChevronDown, Tag, PlusCircle, AlertCircle, Move } from 'lucide-react';
import { useAppStore } from '../../store';
import TableSkeleton from '../../components/admin/TableSkeleton';

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

interface ImageInputProps {
    currentImage: string;
    onImageChange: (value: string) => void;
    options: { maxWidth: number; quality: number };
}

const ImageInput: React.FC<ImageInputProps> = ({ currentImage, onImageChange, options }) => {
    const { notify } = useAppStore();
    const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
    const [isProcessing, setIsProcessing] = useState(false);
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
             notify('File is too large.', 'error');
             return;
        }
        setIsProcessing(true);
        try {
            const compressedDataUrl = await compressImage(file, options);
            onImageChange(compressedDataUrl);
        } catch (error) {
            notify('Failed to process image.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="flex-grow">
            <div className="flex items-center mb-2">
                <button type="button" onClick={() => setInputType('upload')} className={`px-3 py-1 text-xs rounded-l-md ${inputType === 'upload' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Upload</button>
                <button type="button" onClick={() => setInputType('url')} className={`px-3 py-1 text-xs rounded-r-md ${inputType === 'url' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>URL</button>
            </div>
            {inputType === 'upload' ? (
                <div className="flex items-center gap-2">
                    <input type="file" onChange={handleFileSelect} accept="image/*" className="text-xs w-full text-black" />
                    {isProcessing && <LoaderCircle className="w-4 h-4 animate-spin text-pink-600" />}
                </div>
            ) : (
                <input type="text" value={currentImage.startsWith('data:') ? '' : currentImage} onChange={(e) => onImageChange(e.target.value)} placeholder="https://..." className="w-full p-2 border rounded text-sm bg-white text-black" />
            )}
        </div>
    );
};

const ProductFormModal: React.FC<{ product?: Product | null, onSave: (p: any) => Promise<void>, onClose: () => void }> = ({ product, onSave, onClose }) => {
    const { settings, updateSettings } = useAppStore();
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || 'Cosmetics',
        price: product?.price || 0,
        regularPrice: product?.regularPrice || 0,
        description: product?.description || '',
        fabric: product?.fabric || '',
        colors: product?.colors.join(', ') || '',
        sizes: product?.sizes || [],
        image1: product?.images?.[0] || '',
        image2: product?.images?.[1] || '',
        image3: product?.images?.[2] || '',
        isNewArrival: product?.isNewArrival ?? false,
        newArrivalDisplayOrder: (product?.newArrivalDisplayOrder === undefined || product.newArrivalDisplayOrder >= 1000) ? '' : String(product.newArrivalDisplayOrder),
        isTrending: product?.isTrending ?? false,
        trendingDisplayOrder: (product?.trendingDisplayOrder === undefined || product.trendingDisplayOrder >= 1000) ? '' : String(product.trendingDisplayOrder),
        onSale: product?.onSale ?? false,
        isOutOfStock: product?.isOutOfStock ?? false,
    });
    
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryName, setCustomCategoryName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [newSize, setNewSize] = useState('');

    const COSMETICS_SUB_CATEGORIES = ["Skincare", "Makeup", "Hair Care", "Fragrance"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'category') {
            if (value === 'ADD_NEW') {
                setIsCustomCategory(true);
            } else {
                setIsCustomCategory(false);
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const isCosmetics = !isCustomCategory && formData.category === 'Cosmetics';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const finalCategory = isCustomCategory ? customCategoryName.trim() : formData.category;

        if (isCustomCategory && finalCategory && !settings.categories.includes(finalCategory)) {
            try {
                await updateSettings({
                    categories: [...settings.categories, finalCategory]
                });
            } catch (err) {
                console.error("Failed to auto-add new category to settings", err);
            }
        }

        const finalData = {
            ...formData,
            category: finalCategory,
            price: Number(formData.price),
            regularPrice: formData.onSale ? Number(formData.regularPrice) : undefined,
            colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
            images: [formData.image1, formData.image2, formData.image3].filter(Boolean),
            newArrivalDisplayOrder: formData.newArrivalDisplayOrder === '' ? 1000 : Number(formData.newArrivalDisplayOrder),
            trendingDisplayOrder: formData.trendingDisplayOrder === '' ? 1000 : Number(formData.trendingDisplayOrder),
        };
        await onSave(product ? { ...finalData, id: product.id } : finalData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-extrabold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition"><X className="w-6 h-6 text-black" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isCosmetics && (
                        <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-pink-800 leading-relaxed">
                                <p className="font-bold mb-1 uppercase tracking-wider">Beauty Selection Tip:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Select the <b>Product Type</b> (Skincare/Makeup/etc) to show it in the right category tabs on the website.</li>
                                    <li>Use <b>Sizes</b> for Volumes like "50ml", "100ml", or "One Size".</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white text-black focus:ring-2 focus:ring-pink-500 outline-none" required/>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Main Category</label>
                                <div className="relative">
                                    <select 
                                        name="category" 
                                        value={isCustomCategory ? 'ADD_NEW' : formData.category} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border rounded-xl bg-white text-black focus:ring-2 focus:ring-pink-500 outline-none appearance-none"
                                    >
                                        <option value="Cosmetics">Cosmetics (Beauty Hub)</option>
                                        {settings.categories.filter(c => c !== 'Cosmetics').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                        <option value="ADD_NEW" className="font-bold text-pink-600">+ Add New Category...</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            {isCustomCategory && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-pink-600 uppercase mb-1 flex items-center gap-1">
                                        <PlusCircle className="w-3 h-3" /> New Category Name
                                    </label>
                                    <input 
                                        value={customCategoryName} 
                                        onChange={e => setCustomCategoryName(e.target.value)} 
                                        className="w-full p-3 border-2 border-pink-200 rounded-xl bg-pink-50/30 text-black focus:border-pink-500 outline-none" 
                                        placeholder="e.g. Winter Essentials"
                                        required={isCustomCategory}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCustomCategory(false)} 
                                        className="text-[10px] font-bold text-stone-400 mt-1 hover:text-stone-600 transition"
                                    >
                                        ← Back to dropdown
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isCosmetics ? 'Sub-Category (Type)' : 'Fabric Material / Tag'}</label>
                            {isCosmetics ? (
                                <div className="relative">
                                    <select 
                                        name="fabric" 
                                        value={formData.fabric} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border rounded-xl bg-white text-black focus:ring-2 focus:ring-pink-500 outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Choose Sub-Category</option>
                                        {COSMETICS_SUB_CATEGORIES.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            ) : (
                                <input name="fabric" value={formData.fabric} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white text-black" placeholder="e.g. Silk / Cotton / Winter" />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (৳)</label>
                            <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white text-black" required/>
                        </div>

                        {formData.onSale && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Regular Price (৳)</label>
                                <input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white text-black" />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isCosmetics ? 'Available Volumes / Sizes' : 'Available Sizes'}</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.sizes.map((s, i) => (
                                    <span key={i} className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-stone-200">
                                        {s} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFormData(p => ({...p, sizes: p.sizes.filter((_, idx) => idx !== i)}))} />
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={newSize} onChange={e => setNewSize(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm bg-white text-black" placeholder={isCosmetics ? "e.g. 50ml" : "e.g. XL"} />
                                <button type="button" onClick={() => { if(newSize) { setFormData(p => ({...p, sizes: [...p.sizes, newSize]})); setNewSize(''); } }} className="bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Add</button>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white text-black h-24" />
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['image1', 'image2', 'image3'].map((imgKey, i) => (
                                <div key={imgKey} className="p-3 border rounded-xl bg-gray-50">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Image {i+1}</label>
                                    <div className="flex flex-col gap-3">
                                        {(formData as any)[imgKey] && <img src={(formData as any)[imgKey]} className="w-full aspect-[3/4] object-cover rounded-lg shadow-sm" />}
                                        <ImageInput currentImage={(formData as any)[imgKey]} onImageChange={(val) => setFormData(p => ({...p, [imgKey]: val}))} options={{maxWidth: 1000, quality: 0.8}} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- DISPLAY ORDERING CONTROLS --- */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                            <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-xl border border-stone-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                                        <span className="font-bold text-sm text-gray-700">New Arrival</span>
                                    </div>
                                    {formData.isNewArrival && (
                                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm animate-fadeIn">
                                            <Move className="w-3.5 h-3.5 text-pink-500" />
                                            <input 
                                                type="number" 
                                                name="newArrivalDisplayOrder" 
                                                value={formData.newArrivalDisplayOrder} 
                                                onChange={handleChange} 
                                                placeholder="Pos (1, 2...)" 
                                                className="w-20 p-1 border rounded text-center text-sm font-bold text-pink-600 bg-pink-50/20"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t border-stone-100 my-1"></div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                                        <span className="font-bold text-sm text-gray-700">Mark as Bestseller (Trending)</span>
                                    </div>
                                    {formData.isTrending && (
                                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm animate-fadeIn">
                                            <Move className="w-3.5 h-3.5 text-pink-500" />
                                            <input 
                                                type="number" 
                                                name="trendingDisplayOrder" 
                                                value={formData.trendingDisplayOrder} 
                                                onChange={handleChange} 
                                                placeholder="Pos (1, 2...)" 
                                                className="w-20 p-1 border rounded text-center text-sm font-bold text-pink-600 bg-pink-50/20"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50 rounded-xl gap-4 border border-stone-200">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                                    <span className="font-bold text-sm text-gray-700">Display Sale Price</span>
                                </div>
                                <div className="flex items-center gap-3 border-l-2 border-red-200 pl-4">
                                    <input type="checkbox" name="isOutOfStock" checked={formData.isOutOfStock} onChange={handleChange} className="w-5 h-5 text-red-600 rounded" />
                                    <span className="font-bold text-sm text-red-700">Mark as Stock Out</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-800 transition">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSaving}
                        className="bg-pink-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition flex items-center gap-2"
                    >
                        {isSaving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminProductsPage: React.FC = () => {
    const { adminProducts, adminProductsPagination, loadAdminProducts, addProduct, updateProduct, deleteProduct } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            await loadAdminProducts(currentPage, debouncedSearchTerm);
            setIsLoading(false);
        };
        fetchProducts();
    }, [currentPage, debouncedSearchTerm, loadAdminProducts]);

    const handleSave = async (productData: any) => {
        if (editingProduct) {
            await updateProduct({ ...productData, id: editingProduct.id });
        } else {
            await addProduct(productData);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
        loadAdminProducts(currentPage, debouncedSearchTerm);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this product permanently?')) {
            await deleteProduct(id);
            loadAdminProducts(currentPage, debouncedSearchTerm);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Inventory</h1>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white text-black shadow-sm outline-none focus:ring-2 focus:ring-pink-500/20" placeholder="Search products..." />
                    </div>
                    <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-pink-700 transition flex items-center gap-2 font-bold whitespace-nowrap">
                        <Plus className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category & Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    {isLoading ? <TableSkeleton rows={8} cols={5} /> : (
                        <tbody className="divide-y divide-gray-50">
                            {adminProducts.map(p => (
                                <tr key={p.id} className={`hover:bg-pink-50/30 transition-colors group ${p.isOutOfStock ? 'bg-red-50/20' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200 relative">
                                                <img src={p.images[0]} className={`w-full h-full object-cover ${p.isOutOfStock ? 'grayscale opacity-50' : ''}`} />
                                                {p.isOutOfStock && <div className="absolute inset-0 flex items-center justify-center bg-red-600/60"><AlertCircle className="w-5 h-5 text-white" /></div>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">ID: {p.productId || p.id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${p.category === 'Cosmetics' ? 'bg-pink-100 text-pink-700' : 'bg-stone-100 text-stone-600'}`}>
                                                {p.category}
                                            </span>
                                            {p.fabric && (
                                                <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {p.fabric}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-extrabold text-gray-900">৳{p.price.toLocaleString()}</div>
                                        {p.onSale && <div className="text-[10px] text-gray-400 line-through">৳{p.regularPrice?.toLocaleString()}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {p.isOutOfStock ? (
                                                <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-tighter">OUT OF STOCK</span>
                                            ) : (
                                                <>
                                                    {p.isNewArrival && <span className="w-2 h-2 bg-pink-500 rounded-full" title="New Arrival"></span>}
                                                    {p.isTrending && <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Trending"></span>}
                                                    {p.onSale && <span className="w-2 h-2 bg-green-500 rounded-full" title="On Sale"></span>}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4 text-blue-600" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>

            {adminProductsPagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-xl hover:bg-white transition disabled:opacity-30">Previous</button>
                    <span className="text-sm font-bold text-gray-500">Page {currentPage} of {adminProductsPagination.pages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(adminProductsPagination.pages, p + 1))} disabled={currentPage === adminProductsPagination.pages} className="px-4 py-2 border rounded-xl hover:bg-white transition disabled:opacity-30">Next</button>
                </div>
            )}

            {isModalOpen && <ProductFormModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default AdminProductsPage;
