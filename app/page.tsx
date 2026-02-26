'use client';

import { useState } from 'react';

const menuItems = [
  { id: 1, name: 'Veg Chowmein', price: 80, type: 'Chinese' },
  { id: 2, name: 'Paneer Chilli', price: 120, type: 'Chinese' },
  { id: 3, name: 'Aloo Tikki Burger', price: 50, type: 'Fast Food' },
  { id: 4, name: 'Cheese Burger', price: 70, type: 'Fast Food' },
  { id: 5, name: 'Party Catering (50+ pax)', price: 5000, type: 'Catering' }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  
  const deliveryCharge = 50;
  const ownerWhatsAppNumber = '917568045830'; 

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleOrder = (item: any) => {
    const qty = quantities[item.id] || 1;
    const itemTotal = item.price * qty;
    const finalTotal = itemTotal + deliveryCharge;

    const message = `Hello Fund & Foods!\nMujhe ek order place karna hai:\n\nItem: ${item.name}\nQuantity: ${qty}\nPrice: ₹${item.price} x ${qty} = ₹${itemTotal}\nDelivery (Rani): ₹${deliveryCharge}\n\nTotal Amount: ₹${finalTotal}\n\nKripya order confirm karein.`;

    const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Fund & Foods</h1>
          <p className="text-gray-600">Authentic Chinese, Fast Food & Party Catering</p>
        </header>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for burgers, chowmein, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  {item.type}
                </span>
                <p className="text-xl font-bold mt-4 text-green-600">₹{item.price}</p>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-8 h-8 rounded-md bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">{quantities[item.id] || 1}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-8 h-8 rounded-md bg-red-500 border border-red-500 flex items-center justify-center text-white hover:bg-red-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(item)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  Order on WhatsApp
                </button>
                <p className="text-xs text-center text-gray-400 mt-3 font-medium">Fixed ₹50 Delivery anywhere in Rani</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}