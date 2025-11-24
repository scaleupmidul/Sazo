import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { Plus, Edit, Trash2, Search, LoaderCircle, X, ImageIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import TableSkeleton from '../../components/admin/TableSkeleton';

// Utility function to compress images client-side
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
             notify('File is too large. Please select an image under 15MB.', 'error');
             return;
        }
        
        setIsProcessing(true);
        try {
            const compressedDataUrl = await compressImage(file, options);
            onImageChange(compressedDataUrl);
        } catch (error) {
            console.error('Image compression failed:', error);
            notify('Failed to process image. Please try a different one.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="flex-grow">
            <div className="flex items-center mb-2 space-x-1">
                <button type="button" onClick={() => setInputType('upload')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${inputType === 'upload' ? 'bg-pink-100 text-pink-700' : 'text-slate-500 hover:bg-slate-100'}`}>Upload</button>
                <button type="button" onClick={() => setInputType('url')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${inputType === 'url' ? 'bg-pink-100 text-pink-700' : 'text-slate-500 hover:bg-slate-100'}`}>URL</button>
            </div>
            {inputType === 'upload' ? (
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors w-full">
                    <input 
                        type="file" 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden"
                    />
                     <ImageIcon className="w-4 h-4 text-slate-400" />
                     <span className="text-sm text-slate-500 truncate">
                        {isProcessing ? 'Processing...' : 'Choose File'}
                     </span>
                    {isProcessing && <LoaderCircle className="w-4 h-4 animate-spin text-pink-600 ml-auto" />}
                </label>
            ) : (
                <input 
                    type="text"
                    value={currentImage.startsWith('data:') ? '' : currentImage}
                    onChange={(e) => onImageChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                />
            )}
        </div>
    );
};

const ProductFormModal: React.FC<{ product?: Product | null, onSave: (p: any) => Promise<void>, onClose: () => void }> = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || '',
        price: product?.price || 0,
        description: product?.description || '',
        fabric: product?.fabric || '',
        colors: product?.colors.join(', ') || '',
        sizes: product?.sizes || [],
        image1: product?.images[0] || '',
        image2: product?.images[1] || '',
        image3: product?.images[2] || '',
        isNewArrival: product?.isNewArrival ?? false,
        newArrivalDisplayOrder: (!product?.newArrivalDisplayOrder || product.newArrivalDisplayOrder === 1000) ? '' : product.newArrivalDisplayOrder,
        isTrending: product?.isTrending ?? false,
        trendingDisplayOrder: (!product?.trendingDisplayOrder || product.trendingDisplayOrder === 1000) ? '' : product.trendingDisplayOrder,
        onSale: product?.onSale ?? false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [newSize, setNewSize] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const addSize = () => {
        const trimmedSize = newSize.trim();
        if (trimmedSize && !formData.sizes.includes(trimmedSize)) {
            setFormData(prev => ({...prev, sizes: [...prev.sizes, trimmedSize]}));
            setNewSize('');
        }
    };

    const removeSize = (indexToRemove: number) => {
        setFormData(prev => ({...prev, sizes: prev.sizes.filter((_, index) => index !== indexToRemove)}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const finalData = {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            fabric: formData.fabric,
            price: Number(formData.price),
            colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
            sizes: formData.sizes,
            images: [formData.image1, formData.image2, formData.image3].filter(Boolean),
            isNewArrival: formData.isNewArrival,
            newArrivalDisplayOrder: Number(formData.newArrivalDisplayOrder) || 1000,
            isTrending: formData.isTrending,
            trendingDisplayOrder: Number(formData.trendingDisplayOrder) || 1000,
            onSale: formData.onSale,
        };
        await onSave(product ? { ...finalData, id: product.id } : finalData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm font-medium text-slate-700">Product Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Silk Saree" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" required/>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Category</label>
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Cotton" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" required/>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Price (৳)</label>
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" required/>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                             <label className="text-sm font-medium text-slate-700">Fabric</label>
                            <input name="fabric" value={formData.fabric} onChange={handleChange} placeholder="e.g. 100% Cotton" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"/>
                        </div>

                         <div className="space-y-1 md:col-span-2">
                             <label className="text-sm font-medium text-slate-700">Colors</label>
                            <input name="colors" value={formData.colors} onChange={handleChange} placeholder="Red, Blue, Green (comma separated)" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"/>
                        </div>
                        
                        <div className="md:col-span-2 space-y-2 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                            <label className="block text-sm font-medium text-slate-700">Sizes</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {formData.sizes.map((size, index) => (
                                    <div key={index} className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-sm shadow-sm">
                                        <span>{size}</span>
                                        <button type="button" onClick={() => removeSize(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center mt-2">
                                <input 
                                    value={newSize} 
                                    onChange={(e) => setNewSize(e.target.value)} 
                                    onKeyDown={(e) => { 
                                        if (e.key === 'Enter' || e.key === ',') { 
                                            e.preventDefault(); 
                                            addSize(); 
                                        } 
                                    }}
                                    placeholder="Add size..." 
                                    className="p-2 border border-slate-300 rounded-lg text-sm flex-grow focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                />
                                <button type="button" onClick={addSize} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium">Add</button>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                             <label className="text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product details..." rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"/>
                        </div>
                            
                            <div className="md:col-span-2 space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-pink-600"/> Product Images
                            </h3>
                            <div className="space-y-4">
                                {['image1', 'image2', 'image3'].map((imgField, idx) => (
                                    <div key={imgField}>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Image {idx + 1} {idx === 0 && '(Primary)'}</label>
                                        <div className="flex items-center gap-4">
                                            {(formData as any)[imgField] ? (
                                                <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-white">
                                                    <img src={(formData as any)[imgField]} alt={`Preview ${idx+1}`} className="w-full h-full object-cover"/>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 bg-slate-50 flex-shrink-0">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                            <ImageInput 
                                                currentImage={(formData as any)[imgField]}
                                                onImageChange={(val) => handleImageChange(imgField, val)}
                                                options={{ maxWidth: 1200, quality: 0.85 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                            <div className="md:col-span-2 space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                            <h3 className="text-sm font-semibold text-slate-800">Visibility & Status</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-pink-400 transition-colors">
                                    <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"/>
                                    <span className="text-sm font-medium text-slate-700">New Arrival</span>
                                    {formData.isNewArrival && (
                                        <input 
                                            type="number" 
                                            name="newArrivalDisplayOrder" 
                                            value={formData.newArrivalDisplayOrder} 
                                            onChange={handleChange} 
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-14 p-1 text-xs border rounded ml-auto text-center"
                                            placeholder="#"
                                        />
                                    )}
                                </label>

                                <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-pink-400 transition-colors">
                                    <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"/>
                                    <span className="text-sm font-medium text-slate-700">Trending</span>
                                    {formData.isTrending && (
                                        <input 
                                            type="number" 
                                            name="trendingDisplayOrder" 
                                            value={formData.trendingDisplayOrder} 
                                            onChange={handleChange}
                                            onClick={(e) => e.stopPropagation()} 
                                            className="w-14 p-1 text-xs border rounded ml-auto text-center"
                                            placeholder="#"
                                        />
                                    )}
                                </label>

                                <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-pink-400 transition-colors">
                                    <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"/>
                                    <span className="text-sm font-medium text-slate-700">On Sale</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button form="productForm" type="submit" disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 flex items-center shadow-lg shadow-pink-600/20 transition-all disabled:opacity-70">
                        {isSaving && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminProductsPage: React.FC = () => {
    const { 
        adminProducts, 
        adminProductsPagination, 
        loadAdminProducts,
        addProduct, 
        updateProduct, 
        deleteProduct 
    } = useAppStore();
    
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


    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            if (adminProducts.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                await loadAdminProducts(currentPage, debouncedSearchTerm);
            }
        }
    };

    const handleSave = async (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            await updateProduct(productData);
        } else {
            await addProduct(productData);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
        await loadAdminProducts(currentPage, debouncedSearchTerm);
    };
    
    const PaginationControls = () => {
        const { page, pages, total } = adminProductsPagination;
        if (pages <= 1 && total === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">{page} of {pages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} 
                        disabled={page === pages}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your inventory and catalog.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={handleAdd} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-pink-600/20 hover:bg-pink-700 transition-all flex items-center justify-center space-x-2 font-medium">
                        <Plus className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold text-center">Tags</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        {isLoading ? <TableSkeleton cols={5} rows={6} /> : (
                            <tbody className="divide-y divide-slate-100">
                                {adminProducts.map(product => {
                                    const getOrderDisplay = (val: number | undefined) => (val === undefined || val === null || val === 0 || val === 1000) ? '' : `#${val}`;
                                    
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                                        <img src={product.images[0]} alt="" className="h-full w-full object-cover"/>
                                                    </div>
                                                    <div className="font-medium text-slate-900 group-hover:text-pink-600 transition-colors">{product.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    {product.isNewArrival && (
                                                        <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded text-[10px] font-bold border border-pink-100 w-fit">
                                                            NEW {getOrderDisplay(product.newArrivalDisplayOrder)}
                                                        </span>
                                                    )}
                                                    {product.isTrending && (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100 w-fit">
                                                            HOT {getOrderDisplay(product.trendingDisplayOrder)}
                                                        </span>
                                                    )}
                                                    {!product.isNewArrival && !product.isTrending && <span className="text-slate-300">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">৳{product.price.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4"/>
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        )}
                    </table>
                </div>
                 {!isLoading && adminProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Filter className="w-12 h-12 mb-3 text-slate-200" />
                        <p>No products found matching your search.</p>
                    </div>
                )}
            </div>
            
            <PaginationControls />

            {isModalOpen && <ProductFormModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default AdminProductsPage;
