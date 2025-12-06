
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { Plus, Edit, Trash2, Search, LoaderCircle, X } from 'lucide-react';
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
            <div className="flex items-center mb-2">
                <button type="button" onClick={() => setInputType('upload')} className={`px-3 py-1 text-xs rounded-l-md ${inputType === 'upload' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Upload File</button>
                <button type="button" onClick={() => setInputType('url')} className={`px-3 py-1 text-xs rounded-r-md ${inputType === 'url' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Use Image URL</button>
            </div>
            {inputType === 'upload' ? (
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                    {isProcessing && <LoaderCircle className="w-5 h-5 animate-spin text-pink-600 flex-shrink-0" />}
                </div>
            ) : (
                <input 
                    type="text"
                    value={currentImage.startsWith('data:') ? '' : currentImage}
                    onChange={(e) => onImageChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border rounded bg-white text-black text-sm"
                />
            )}
        </div>
    );
};

const ProductFormModal: React.FC<{ product?: Product | null, onSave: (p: any) => Promise<void>, onClose: () => void }> = ({ product, onSave, onClose }) => {
    // Initialize form data
    // For displayOrder fields: if they are undefined, 0, or 1000, initialize as empty string to show placeholder
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
            // Ensure empty input or 0 is saved as 1000 (default)
            newArrivalDisplayOrder: Number(formData.newArrivalDisplayOrder) || 1000,
            isTrending: formData.isTrending,
            // Ensure empty input or 0 is saved as 1000 (default)
            trendingDisplayOrder: Number(formData.trendingDisplayOrder) || 1000,
            onSale: formData.onSale,
        };
        await onSave(product ? { ...finalData, id: product.id } : finalData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="p-2 border rounded w-full md:col-span-2 bg-white text-black" required/>
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="p-2 border rounded w-full bg-white text-black" required/>
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="p-2 border rounded w-full bg-white text-black" required/>
                             <input name="fabric" value={formData.fabric} onChange={handleChange} placeholder="Fabric" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                            <input name="colors" value={formData.colors} onChange={handleChange} placeholder="Colors (comma separated)" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                            
                            <div className="md:col-span-2 space-y-2 p-3 border rounded-lg bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700">Sizes</label>
                                <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem]">
                                    {formData.sizes.map((size, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm font-medium">
                                            <span>{size}</span>
                                            <button type="button" onClick={() => removeSize(index)} className="text-pink-600 hover:text-pink-800 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.sizes.length === 0 && <p className="text-xs text-gray-500">No sizes added yet.</p>}
                                </div>
                                <div className="flex gap-2 items-center pt-2 border-t mt-2">
                                    <input 
                                        value={newSize} 
                                        onChange={(e) => setNewSize(e.target.value)} 
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter' || e.key === ',') { 
                                                e.preventDefault(); 
                                                addSize(); 
                                            } 
                                        }}
                                        placeholder="Type a size (e.g., M or 40-42)" 
                                        className="p-2 border rounded w-full bg-white text-black flex-grow"
                                    />
                                    <button type="button" onClick={addSize} className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex-shrink-0">Add</button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Add sizes like 'S', 'Free', or ranges like '45-48'. Press Enter, comma, or click Add.</p>
                            </div>

                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                             
                             <div className="md:col-span-2 space-y-4 p-3 border rounded-lg bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-600">Product Images</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Image 1 (Primary / Front)</label>
                                        <div className="flex items-center gap-4">
                                            {formData.image1 && (
                                                <img src={formData.image1} alt="Preview 1" className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                                            )}
                                            <ImageInput 
                                                currentImage={formData.image1}
                                                onImageChange={(val) => handleImageChange('image1', val)}
                                                options={{ maxWidth: 1200, quality: 0.85 }}
                                            />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Image 2 (Side / Detail)</label>
                                        <div className="flex items-center gap-4">
                                            {formData.image2 && (
                                                <img src={formData.image2} alt="Preview 2" className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                                            )}
                                            <ImageInput 
                                                currentImage={formData.image2}
                                                onImageChange={(val) => handleImageChange('image2', val)}
                                                options={{ maxWidth: 1200, quality: 0.85 }}
                                            />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Image 3 (Back / Style)</label>
                                        <div className="flex items-center gap-4">
                                            {formData.image3 && (
                                                <img src={formData.image3} alt="Preview 3" className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                                            )}
                                            <ImageInput 
                                                currentImage={formData.image3}
                                                onImageChange={(val) => handleImageChange('image3', val)}
                                                options={{ maxWidth: 1200, quality: 0.85 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="md:col-span-2 space-y-3 p-4 border rounded-lg bg-gray-50">
                                <h3 className="font-semibold text-gray-700 mb-2">Visibility & Sorting</h3>
                                
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center text-gray-800 cursor-pointer select-none">
                                        <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded mr-2"/>
                                        <span className="font-medium">New Arrival</span>
                                    </label>
                                    {formData.isNewArrival && (
                                        <div className="flex items-center gap-2 animate-fadeIn">
                                            <label className="text-xs text-gray-500">Pos:</label>
                                            <input 
                                                type="number" 
                                                name="newArrivalDisplayOrder" 
                                                value={formData.newArrivalDisplayOrder} 
                                                onChange={handleChange} 
                                                className="w-16 p-1 text-sm border rounded bg-white text-black"
                                                placeholder="Auto"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center text-gray-800 cursor-pointer select-none">
                                        <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded mr-2"/>
                                        <span className="font-medium">Trending Product</span>
                                    </label>
                                    {formData.isTrending && (
                                        <div className="flex items-center gap-2 animate-fadeIn">
                                            <label className="text-xs text-gray-500">Pos:</label>
                                            <input 
                                                type="number" 
                                                name="trendingDisplayOrder" 
                                                value={formData.trendingDisplayOrder} 
                                                onChange={handleChange} 
                                                className="w-16 p-1 text-sm border rounded bg-white text-black"
                                                placeholder="Auto"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center text-gray-800 cursor-pointer select-none">
                                        <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="w-4 h-4 text-pink-600 rounded mr-2"/>
                                        <span className="font-medium">On Sale</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 flex items-center disabled:bg-pink-400">
                            {isSaving && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
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

    // Debounce search term to avoid excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page on a new search
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch products when page or debounced search term changes
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
            // After deleting, refetch. If it was the last item on the current page, go to the previous page.
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
        // Refetch current page to show changes
        await loadAdminProducts(currentPage, debouncedSearchTerm);
    };
    
    const PaginationControls = () => {
        const { page, pages, total } = adminProductsPagination;
        if (pages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-6 text-sm">
                <span className="text-gray-600">Total Products: {total}</span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span className="font-medium text-gray-700">Page {page} of {pages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} 
                        disabled={page === pages}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg text-sm bg-white text-black"
                        />
                    </div>
                    <button onClick={handleAdd} className="bg-pink-600 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-700 transition flex items-center space-x-2 flex-shrink-0">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3 text-center">Order</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    {isLoading ? <TableSkeleton cols={6} rows={5} /> : (
                        <tbody>
                            {adminProducts.map(product => {
                                // Helper to safely get display order for the table view
                                const getOrderDisplay = (val: number | undefined) => {
                                    if (val === undefined || val === null || val === 0 || val === 1000) return '-';
                                    return val;
                                };
                                return (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4">{product.category}</td>
                                        <td className="px-6 py-4 text-center font-mono">
                                            <div className="text-xs space-y-1">
                                                {product.isNewArrival && <div>New: {getOrderDisplay(product.newArrivalDisplayOrder)}</div>}
                                                {product.isTrending && <div>Trend: {getOrderDisplay(product.trendingDisplayOrder)}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {product.isNewArrival && <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-[10px] font-bold">NEW</span>}
                                                {product.isTrending && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-bold">TRENDING</span>}
                                                {!product.isNewArrival && !product.isTrending && <span className="text-gray-400 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">৳{product.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"><Edit className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    )}
                </table>
                 {!isLoading && adminProducts.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
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
