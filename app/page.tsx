'use client';

import Testimonial from '@/app/api/components/Testimonials';
import { useState, useEffect, useRef } from 'react';

// TypeScript interface for our MongoDB Item
interface MenuItemType {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  type: string;
  image: string;
}

// Cart Item ka interface
interface CartItemType extends MenuItemType {
  cartQuantity: number;
}

// NAYA: Scroll Animation ke liye custom component jisse scroll karne par item aaye
function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.15 } // Jab 15% card screen par aaye tab animation trigger hoga
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`${className} transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  // --- Global States ---
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Dynamic Delivery Settings State ---
  const [deliverySettings, setDeliverySettings] = useState({ local: 50, gaov: 80 });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // --- Store States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  
  // Cart States
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- Checkout States ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'local' | 'gaov'>('local');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  // --- Admin Auth States ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // --- Admin Form States ---
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', compareAtPrice: '', type: 'Fast Food', image: '' });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // NAYA: Custom Category Toggle State
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // MODIFIED: Added state for mobile admin tabs
  const [adminTab, setAdminTab] = useState<'list' | 'form' | 'settings'>('list');

  const ownerWhatsAppNumber = '917878337311'; 

  useEffect(() => {
    fetchMenuItems();
    fetchDeliverySettings(); // Page load hote hi settings fetch karo
  }, []);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.localCharge !== undefined) {
          setDeliverySettings({ local: data.localCharge, gaov: data.gaovCharge });
        }
      }
    } catch (error) {
      console.error('Failed to fetch delivery settings:', error);
    }
  };

  // NAYA: Dynamic categories list banana (Default + Database existing categories)
  const defaultCategories = ['Fast Food', 'Pizza', 'Burger', 'Chinese', 'Beverages'];
  const existingCategories = menuItems.map(item => item.type);
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));

  // --- Store Functions ---
  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const calculateDiscount = (price: number, compareAtPrice?: number) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const addToCart = (item: MenuItemType) => {
    setAddingItemId(item._id);
    
    setTimeout(() => {
      const qty = quantities[item._id] || 1;
      
      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(cartItem => cartItem._id === item._id);
        
        if (existingItemIndex >= 0) {
          const newCart = [...prevCart];
          newCart[existingItemIndex].cartQuantity += qty;
          return newCart;
        } else {
          return [...prevCart, { ...item, cartQuantity: qty }];
        }
      });
      
      setQuantities(prev => ({...prev, [item._id]: 1}));
      setAddingItemId(null);
      setIsCartOpen(true); 
    }, 400); 
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item._id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    setAddress('');
    setDeliveryArea('local');
  };

  const submitOrder = () => {
    if (!address.trim()) {
      alert('Kripya apna pura address daalein');
      return;
    }

    if (cart.length === 0) return;

    setIsSubmittingOrder(true);

    setTimeout(() => {
      // NAYA: Delivery charge ab dynamic DB wali settings se aayega
      const deliveryCharge = deliveryArea === 'local' ? deliverySettings.local : deliverySettings.gaov;
      const areaName = deliveryArea === 'local' ? 'Rani Local' : 'Rani Gaov';
      const itemsTotal = getCartTotal();
      const finalTotal = itemsTotal + deliveryCharge;

      let orderDetails = '';
      cart.forEach((item, index) => {
        orderDetails += `${index + 1}. *${item.name}* (x${item.cartQuantity}) - ₹${item.price * item.cartQuantity}\n`;
      });

      const message = `*Hello Fun & Foods!*\n\nMujhe ek naya order place karna hai:\n\n*Order Details:*\n${orderDetails}\n*Food Total:* ₹${itemsTotal}\n*Delivery Area:* ${areaName}\n*Delivery Charge:* ₹${deliveryCharge}\n\n*Grand Total: ₹${finalTotal}*\n\n*Delivery Address:*\n${address}\n\nKripya mera order confirm karein.`;

      const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      setCart([]);
      setIsSubmittingOrder(false);
      closeCheckoutModal();
      setIsCartOpen(false);
    }, 1500);
  };

  const filteredItems = menuItems.filter((item) => {
    if (!item || !item.name || !item.type) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as { [key: string]: MenuItemType[] });

  // --- Admin Functions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    setTimeout(() => {
      if (email === 'admin@gmail.com' && password === 'admin') {
        setView('admin');
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
      } else {
        alert('Galat Email ya Password!');
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setView('store');
      setIsLoading(false);
    }, 500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'salon_preset'); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dvoenforj/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.secure_url) {
        setNewItem({ ...newItem, image: data.secure_url });
      } else {
        alert('Image upload fail ho gayi. Kripya fir se try karein.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Network error due to image upload.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddOrEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.image || !newItem.type.trim()) {
      alert('Kripya Name, Price, Category aur Image zaroor daalein.');
      return;
    }

    setIsSavingItem(true);

    const payload = { 
      ...newItem, 
      price: Number(newItem.price),
      compareAtPrice: newItem.compareAtPrice ? Number(newItem.compareAtPrice) : 0,
      type: newItem.type.trim() 
    };

    try {
      if (editItemId) {
        const res = await fetch(`/api/menu/${editItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updatedItem = await res.json();
          setMenuItems(menuItems.map(item => item._id === editItemId ? updatedItem : item));
          setEditItemId(null);
          setNewItem({ name: '', description: '', price: '', compareAtPrice: '', type: allCategories[0] || 'Fast Food', image: '' });
          setIsCustomCategory(false);
          alert('Item successfully update ho gaya!');
          // MODIFIED: Added tab switch to list after successful edit
          setAdminTab('list');
        } else {
          alert('Item update karne me error aayi.');
        }
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const addedItem = await res.json();
          setMenuItems([addedItem, ...menuItems]); 
          setNewItem({ name: '', description: '', price: '', compareAtPrice: '', type: allCategories[0] || 'Fast Food', image: '' }); 
          setIsCustomCategory(false);
          alert('Item successfully add ho gaya!');
          // MODIFIED: Added tab switch to list after successful add
          setAdminTab('list');
        } else {
          alert('Item add karne me error aayi.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleEditClick = (item: MenuItemType) => {
    setEditItemId(item._id);
    setIsCustomCategory(false); 
    
    if (!allCategories.includes(item.type)) {
      setIsCustomCategory(true);
    }

    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      compareAtPrice: item.compareAtPrice ? item.compareAtPrice.toString() : '',
      type: item.type,
      image: item.image
    });
    // MODIFIED: Added automatic switch to form tab on mobile when edit is clicked
    setAdminTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setNewItem({ name: '', description: '', price: '', compareAtPrice: '', type: allCategories[0] || 'Fast Food', image: '' });
    setIsCustomCategory(false);
    // MODIFIED: Added return to list tab on cancel
    setAdminTab('list');
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Kya aap sach me is item ko delete karna chahte hain?')) {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/menu/${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setMenuItems(menuItems.filter(item => item._id !== id));
        } else {
          alert('Delete karne me error aayi.');
        }
      } catch (error) {
        console.error(error);
        alert('Network error.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // NAYA: Delivery Settings Save Karne ka Function
  const handleUpdateDeliverySettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localCharge: deliverySettings.local,
          gaovCharge: deliverySettings.gaov
        }),
      });
      
      if (res.ok) {
        alert('Delivery charges successfully update ho gaye!');
      } else {
        alert('Charges update karne me error aayi.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSavingSettings(false);
    }
  };


  // --- ADMIN VIEW RENDER ---
  if (view === 'admin') {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm mb-4 sm:mb-8 gap-4 relative z-30">
            <h1 className="text-2xl font-bold text-gray-900">Fun & Foods <span className="text-orange-600">Admin</span></h1>
            <button onClick={handleLogout} className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition">Logout</button>
          </header>

          {/* MODIFIED: Added Mobile Tabs Navigation */}
          <div className="flex lg:hidden mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-1 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setAdminTab('list')} 
              className={`flex-1 min-w-[100px] py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${adminTab === 'list' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Menu Items
            </button>
            <button 
              onClick={() => setAdminTab('form')} 
              className={`flex-1 min-w-[100px] py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${adminTab === 'form' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {editItemId ? 'Edit Item' : 'Add Item'}
            </button>
            <button 
              onClick={() => setAdminTab('settings')} 
              className={`flex-1 min-w-[100px] py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${adminTab === 'settings' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* MODIFIED: Added conditional rendering classes based on active tab for mobile */}
            <div className={`bg-transparent lg:bg-white lg:p-6 rounded-2xl lg:shadow-sm lg:col-span-1 h-fit lg:sticky lg:top-6 relative z-20 lg:border lg:border-gray-100 flex flex-col gap-6 ${adminTab === 'form' || adminTab === 'settings' ? 'block' : 'hidden lg:flex'}`}>
              
              {/* Product Form Section */}
              <div className={`bg-white p-5 sm:p-0 lg:p-0 rounded-2xl shadow-sm lg:shadow-none border border-gray-100 lg:border-none ${adminTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {editItemId ? 'Edit Item' : 'Add New Item'}
                </h2>
                <form onSubmit={handleAddOrEditItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name</label>
                    <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none" placeholder="E.g. Veg Burger" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none" placeholder="Short description..." rows={2}></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">New Price (₹)</label>
                      <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-bold text-base outline-none" placeholder="99" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Old Price (₹)</label>
                      <input type="number" value={newItem.compareAtPrice} onChange={e => setNewItem({...newItem, compareAtPrice: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none" placeholder="149" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Collection / Category</label>
                    {!isCustomCategory ? (
                      <select 
                        value={newItem.type} 
                        onChange={e => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsCustomCategory(true);
                            setNewItem({...newItem, type: ''});
                          } else {
                            setNewItem({...newItem, type: e.target.value});
                          }
                        }} 
                        className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base cursor-pointer outline-none"
                        required
                      >
                        <option value="" disabled>Select a collection</option>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW" className="font-bold text-orange-600 bg-orange-50">
                          ➕ Add New Collection...
                        </option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newItem.type} 
                          onChange={e => setNewItem({...newItem, type: e.target.value})} 
                          className="w-full p-3.5 rounded-xl border border-orange-500 text-gray-900 bg-orange-50 focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none" 
                          placeholder="Enter new name"
                          autoFocus
                          required 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsCustomCategory(false);
                            setNewItem({...newItem, type: allCategories[0] || 'Fast Food'});
                          }}
                          className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors border border-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload} 
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" 
                    />
                    {isUploadingImage && (
                      <div className="flex items-center gap-2 mt-3 text-orange-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        <p className="text-sm font-medium">Uploading image...</p>
                      </div>
                    )}
                    {newItem.image && !isUploadingImage && (
                      <div className="mt-4 relative inline-block">
                        <img src={newItem.image} alt="Preview" className="h-24 w-24 object-cover rounded-2xl border-2 border-orange-500 shadow-md" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={isUploadingImage || isSavingItem}
                      className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 ${(isUploadingImage || isSavingItem) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-md'}`}
                    >
                      {isSavingItem ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Saving...</>
                      ) : (
                        editItemId ? 'Update Item' : 'Save Item'
                      )}
                    </button>
                    
                    {editItemId && (
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        disabled={isSavingItem}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-colors border border-gray-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* NAYA: Admin Panel Settings Box */}
              <div className={`bg-white p-5 sm:p-0 lg:p-0 rounded-2xl shadow-sm lg:shadow-none border border-gray-100 lg:border-none lg:mt-8 lg:pt-8 lg:border-t ${adminTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                   <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Delivery Charges
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Local (₹)</label>
                      <input 
                        type="number" 
                        value={deliverySettings.local} 
                        onChange={e => setDeliverySettings({...deliverySettings, local: Number(e.target.value)})} 
                        className="w-full p-3 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-bold outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Gaov (₹)</label>
                      <input 
                        type="number" 
                        value={deliverySettings.gaov} 
                        onChange={e => setDeliverySettings({...deliverySettings, gaov: Number(e.target.value)})} 
                        className="w-full p-3 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-bold outline-none" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateDeliverySettings} 
                    disabled={isSavingSettings} 
                    className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 ${isSavingSettings ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 shadow-md'}`}
                  >
                    {isSavingSettings ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
              
            </div>

            {/* MODIFIED: Added conditional rendering class for mobile list tab */}
            <div className={`bg-white p-5 sm:p-6 rounded-2xl shadow-sm lg:col-span-2 relative z-10 border border-gray-100 ${adminTab === 'list' ? 'block' : 'hidden lg:block'}`}>
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center justify-between">
                <span>Manage Menu Items</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">{menuItems.length} Total</span>
              </h2>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading items from database...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div key={item._id} className="border border-gray-100 bg-slate-50 p-4 rounded-2xl flex gap-4 items-start hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 shrink-0 relative bg-gray-200 rounded-xl border overflow-hidden shadow-sm">
                        {!loadedImages[`admin-${item._id}`] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          </div>
                        )}
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          onLoad={() => handleImageLoad(`admin-${item._id}`)}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[`admin-${item._id}`] ? 'opacity-100' : 'opacity-0'}`} 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-lg">{item.name}</p>
                        <span className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mt-1 font-medium">{item.type}</span>
                        
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-extrabold text-orange-600">₹{item.price}</span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="text-xs text-gray-400 line-through font-medium">₹{item.compareAtPrice}</span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleEditClick(item)} disabled={deletingId === item._id} className="flex-1 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem(item._id)} disabled={deletingId === item._id} className="flex-1 bg-white text-red-600 hover:bg-red-50 border border-red-200 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-1">
                            {deletingId === item._id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div> : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-100">
                      No items available. Add some!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- STORE FRONT RENDER ---
  return (
    <>
      {/* GLOBAL STYLES FOR MAKHAN SMOOTH ANIMATIONS & HIDE SCROLLBAR */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUpSmooth {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Hide scrollbar */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      <main className="min-h-screen bg-slate-50 font-sans selection:bg-orange-200 flex flex-col overflow-x-hidden">
        <nav className="fixed top-0 left-0 w-full z-[90] bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Fun<span className="text-orange-600">&</span>Foods
            </h1>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>
              <a 
                href={`https://wa.me/${ownerWhatsAppNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="hidden sm:block text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-4 py-2 rounded-full"
              >
                Contact Support
              </a>
            </div>
          </div>
        </nav>

        <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden mt-[72px]">
          <div className="absolute inset-0 bg-cover bg-center z-0 scale-105 animate-[pulse_10s_ease-in-out_infinite]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000')" }} />
          
          <div className="absolute inset-0 bg-black/20 z-10" /> 
          
          <div className="relative z-20 text-center px-6 max-w-3xl mx-auto mt-8" style={{ animation: 'fadeUpSmooth 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-orange-500/80 text-white backdrop-blur-sm border border-orange-500 text-sm font-bold mb-6 shadow-md">
              Rani's Premium Cloud Kitchen
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
              Craving Something <span className="text-orange-400 drop-shadow-lg">Delicious?</span>
            </h2>
            
            <div className="relative max-w-xl mx-auto group">
              <input
                type="text"
                placeholder="Search for Chinese, Burgers, Catering..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-full bg-white/95 backdrop-blur-md border-2 border-transparent hover:border-orange-200 text-gray-900 placeholder-gray-500 font-semibold focus:outline-none focus:ring-4 focus:ring-orange-500/40 transition-all duration-300 text-lg shadow-2xl"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 flex-grow w-full overflow-hidden">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Our Collections</h3>
              <p className="text-gray-500 mt-2 font-medium">Authentic taste delivered right to your doorstep.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-6"></div>
              <p className="text-xl font-bold text-gray-800">Fetching Menu...</p>
              <p className="text-gray-500 mt-2 font-medium">Please wait while we load delicious items.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="w-full">
                  <ScrollReveal>
                    <div className="flex justify-between items-center mb-6 px-1">
                      <h4 className="text-2xl font-extrabold text-gray-900 capitalize flex items-center gap-3">
                        {category}
                        <span className="text-sm font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full shadow-sm">{items.length} items</span>
                      </h4>
                    </div>
                  </ScrollReveal>

                  <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory px-1 hide-scrollbar">
                    {items.map((item, itemIndex) => (
                      <div key={item._id} className="snap-start shrink-0 w-[280px] md:w-[320px] h-full">
                        <ScrollReveal delay={(itemIndex % 4) * 0.1} className="h-full">
                          <div className="group h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col relative hover:-translate-y-1">
                            
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <div className="absolute top-4 right-4 z-20">
                                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-pulse">
                                  {calculateDiscount(item.price, item.compareAtPrice)}% OFF
                                </span>
                              </div>
                            )}

                            <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                              {!loadedImages[item._id] && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                              )}
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                onLoad={() => handleImageLoad(item._id)}
                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${loadedImages[item._id] ? 'opacity-100' : 'opacity-0'}`} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="p-4 flex flex-col flex-grow bg-white relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight pr-2 group-hover:text-orange-600 transition-colors">{item.name}</h2>
                                <div className="flex flex-col items-end shrink-0">
                                  <p className="text-xl font-extrabold text-orange-600">₹{item.price}</p>
                                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                                    <p className="text-xs font-bold text-gray-400 line-through">₹{item.compareAtPrice}</p>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10 font-medium">{item.description}</p>

                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                  <span className="text-sm font-bold text-gray-700 ml-2">Qty</span>
                                  <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                                    <button onClick={() => handleQuantityChange(item._id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors active:scale-95">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                    </button>
                                    <span className="w-4 text-center font-bold text-gray-900 text-sm">{quantities[item._id] || 1}</span>
                                    <button onClick={() => handleQuantityChange(item._id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors active:scale-95">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={addingItemId === item._id}
                                  className={`w-full font-bold py-3 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98] ${addingItemId === item._id ? 'bg-orange-400 text-white cursor-wait' : 'bg-orange-100 hover:bg-orange-600 hover:text-white text-orange-700'}`}
                                >
                                  {addingItemId === item._id ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Adding...</>
                                  ) : (
                                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Add to Cart</>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {Object.keys(groupedItems).length === 0 && !isLoading && (
            <ScrollReveal>
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xl font-bold text-gray-800">No items found.</p>
                <p className="text-gray-500 mt-2 font-medium">Try searching for something else.</p>
              </div>
            </ScrollReveal>
          )}
        </section>

        <Testimonial/>

        <footer className="bg-slate-900 text-gray-300 py-16 mt-auto">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Fun<span className="text-orange-500">&</span>Foods
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                We bring the best authentic taste right to your doorstep. Experience premium quality ingredients and mouth-watering flavors from Rani's finest cloud kitchen.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Quick Links
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Our Menu</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
                <li><button onClick={() => setShowLoginModal(true)} className="hover:text-orange-500 transition-colors text-left">Admin Access</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Delivery Info
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Rani Local Area</span>
                  {/* NAYA: Footer me bhi dynamic rate */}
                  <span className="text-orange-500 font-bold">₹{deliverySettings.local}</span>
                </li>
                <li className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Rani Gaov Area</span>
                  <span className="text-orange-500 font-bold">₹{deliverySettings.gaov}</span>
                </li>
                <li className="pt-2 text-gray-400">
                  Fast & secure delivery via WhatsApp orders.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Contact Us
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Rani Station, Rajasthan, India</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>+91 {ownerWhatsAppNumber}</span>
                </li>
              </ul>
              <a 
                href={`https://wa.me/${ownerWhatsAppNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-900/50 w-full"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm font-medium">© 2026 Fun & Foods. All rights reserved.</p>
            <div className="flex gap-4">
               <span className="text-gray-500 text-sm font-medium">Designed by Sanjay</span>
            </div>
          </div>
        </footer>

        {/* LOGIN MODAL */}
        {showLoginModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative border border-gray-100 animate-in zoom-in duration-300">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Admin Login</h2>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 font-medium text-base outline-none transition-all" required />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className={`w-full text-white font-bold py-3.5 rounded-xl mt-6 transition-all flex justify-center items-center gap-2 ${isLoggingIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-900/20 active:scale-95'}`}
                >
                  {isLoggingIn ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Verifying...</>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MAKHAN SMOOTH CART SIDEBAR / BOTTOM SHEET */}
        {/* Backdrop Element */}
        <div 
          className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsCartOpen(false)}
        ></div>

        {/* Cart Container */}
        <div 
          className={`fixed z-[101] bg-white flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            bottom-0 left-0 md:left-auto md:right-0 md:top-0 md:bottom-auto
            w-full md:w-[450px] h-[85vh] md:h-full 
            rounded-t-3xl md:rounded-none
            ${isCartOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}
          `}
        >
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          <div className="px-6 py-4 md:py-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 md:bg-white rounded-t-3xl md:rounded-none">
            <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Your Order ({cart.length})
            </h3>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white md:bg-gray-50 rounded-full p-2 shadow-sm border border-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <p className="font-bold text-gray-600">Your cart is empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="text-orange-600 font-bold hover:underline">Browse Menu</button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                      <p className="text-sm font-bold text-gray-500 mt-1">₹{item.price} x {item.cartQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-orange-600 text-lg">₹{item.price * item.cartQuantity}</p>
                      <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-500 hover:text-white hover:bg-red-500 border border-transparent hover:border-red-500 rounded px-2 py-1 transition-colors mt-1 font-bold">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 relative">
              <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-gray-600 font-bold">Food Total</span>
                <span className="font-extrabold text-2xl text-gray-900">₹{getCartTotal()}</span>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); setTimeout(() => setIsCheckoutOpen(true), 300); }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-xl shadow-orange-600/30 text-lg flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                Proceed to Checkout <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* CHECKOUT MODAL */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 my-8">
              <div className="bg-slate-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-extrabold text-xl text-gray-900">Final Checkout</h3>
                <button onClick={closeCheckoutModal} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 text-sm">
                  <p className="text-gray-600 mb-2 font-bold">Total Items: <span className="font-extrabold text-gray-900">{cart.length}</span></p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 font-bold">Food Bill:</p>
                    <p className="font-black text-2xl text-orange-600">₹{getCartTotal()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-extrabold text-gray-700">Select Delivery Area</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* NAYA: Dynamic Delivery Options in Checkout */}
                    <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${deliveryArea === 'local' ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-orange-200 bg-white'}`}>
                      <input type="radio" name="area" value="local" checked={deliveryArea === 'local'} onChange={() => setDeliveryArea('local')} className="sr-only" />
                      <span className="font-extrabold text-gray-900">Rani Local</span>
                      <span className="text-sm font-bold text-gray-500 mt-1">₹{deliverySettings.local} Charge</span>
                    </label>
                    
                    <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${deliveryArea === 'gaov' ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-orange-200 bg-white'}`}>
                      <input type="radio" name="area" value="gaov" checked={deliveryArea === 'gaov'} onChange={() => setDeliveryArea('gaov')} className="sr-only" />
                      <span className="font-extrabold text-gray-900">Rani Gaov</span>
                      <span className="text-sm font-bold text-gray-500 mt-1">₹{deliverySettings.gaov} Charge</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-extrabold text-gray-700">Full Delivery Address</label>
                  <textarea 
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ghar ka number, gali, landmark..."
                    className="w-full p-4 rounded-2xl border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-medium shadow-sm text-base"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-gray-500 font-extrabold">Grand Total</span>
                    {/* NAYA: Dynamic Grand Total */}
                    <span className="text-3xl font-black text-gray-900">₹{getCartTotal() + (deliveryArea === 'local' ? deliverySettings.local : deliverySettings.gaov)}</span>
                  </div>
                  <button
                    onClick={submitOrder}
                    disabled={!address.trim() || isSubmittingOrder}
                    className={`w-full text-white font-extrabold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 text-lg active:scale-[0.98] ${(!address.trim() || isSubmittingOrder) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] shadow-xl shadow-green-500/30'}`}
                  >
                    {isSubmittingOrder ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing Order...</>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Confirm & Send to WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}