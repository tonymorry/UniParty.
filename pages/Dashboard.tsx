import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole, EventCategory } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Plus, DollarSign, Image as ImageIcon, Users, List, X, Tag, Clock, Infinity as InfinityIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0'); // Keep as string for input
  const [date, setDate] = useState('');
  const [time, setTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [category, setCategory] = useState<EventCategory>(EventCategory.PARTY);
  
  // Unlimited Logic
  const [isUnlimited, setIsUnlimited] = useState(false);
  
  // PR Lists State
  const [prLists, setPrLists] = useState<string[]>([]);
  const [currentPrInput, setCurrentPrInput] = useState('');

  const [creatingEvent, setCreatingEvent] = useState(false);

  if (!user || user.role !== UserRole.ASSOCIAZIONE) {
    return <div className="p-8">Access Denied</div>;
  }

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const link = await api.stripe.createConnectAccount(user._id);
      const confirmed = window.confirm(`Simulating Redirect to Stripe: ${link}\n\nClick OK to simulate successful onboarding, Cancel to fail.`);
      if(confirmed) {
          await api.stripe.finalizeOnboarding(user._id);
          refreshUser();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect Stripe");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddPrList = () => {
      if (currentPrInput.trim() && !prLists.includes(currentPrInput.trim())) {
          setPrLists([...prLists, currentPrInput.trim()]);
          setCurrentPrInput('');
      }
  };

  const handleRemovePrList = (listToRemove: string) => {
      setPrLists(prLists.filter(list => list !== listToRemove));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: Robust Price Parsing to prevent 14.99 issue
    // 1. Normalize separator (comma to dot)
    const cleanPriceStr = price.toString().replace(',', '.');
    const rawPrice = parseFloat(cleanPriceStr);
    
    // 2. Math.round to ensure 2 decimal precision (15 -> 15.00)
    // This scrubs any floating point artifacts
    const numericPrice = Math.round(rawPrice * 100) / 100;
    
    let numericCapacity = parseInt(maxCapacity);

    if (isUnlimited && numericPrice === 0) {
        numericCapacity = 1000000; 
    }

    if (numericPrice > 0 && !user.stripeOnboardingComplete) {
        alert("To create paid events, you must connect your Stripe account first.");
        return;
    }

    if (numericCapacity <= 0) {
        alert("Max capacity must be at least 1.");
        return;
    }

    setCreatingEvent(true);
    try {
        await api.events.create({
            title,
            description,
            price: numericPrice, // Sends perfectly rounded number
            date: new Date(date).toISOString(),
            time: time,
            location,
            image: image.trim() !== '' ? image : "https://picsum.photos/800/400?random=" + Date.now(),
            maxCapacity: numericCapacity,
            prLists: prLists,
            category: category
        }, user);
        alert("Event created successfully!");
        navigate('/');
    } catch(e) {
        console.error(e);
        alert("Error creating event");
    } finally {
        setCreatingEvent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Association Dashboard</h1>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {user.name}
            </span>
        </div>

        {/* Stripe Onboarding Status */}
        <div className={`rounded-xl p-6 mb-8 border ${user.stripeOnboardingComplete ? 'bg-green-50 border-green-200' : 'bg-white border-orange-200 shadow-sm'}`}>
            <div className="flex items-start">
                <div className={`p-3 rounded-full mr-4 ${user.stripeOnboardingComplete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {user.stripeOnboardingComplete ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {user.stripeOnboardingComplete ? 'Payments Active' : 'Setup Payments'}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        {user.stripeOnboardingComplete 
                            ? 'Your Stripe account is connected. You can create paid events and receive payouts.' 
                            : 'Connect Stripe to sell paid tickets. You can still publish free events without connecting.'}
                    </p>
                    
                    {!user.stripeOnboardingComplete && (
                        <button 
                            onClick={handleStripeConnect}
                            disabled={isConnecting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition disabled:opacity-50"
                        >
                            <DollarSign className="w-4 h-4 mr-2" />
                            {isConnecting ? 'Connecting...' : 'Connect with Stripe'}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Create Event Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                 <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
             </div>
             <div className="p-6">
                 <form onSubmit={handleCreateEvent} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                         <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                            value={title} onChange={e => setTitle(e.target.value)} required
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                                type="date" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                value={date} onChange={e => setDate(e.target.value)} required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="time" 
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                    value={time} onChange={e => setTime(e.target.value)} required
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 appearance-none"
                                >
                                    {Object.values(EventCategory).map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                     </div>
                     
                     <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                value={location} onChange={e => setLocation(e.target.value)} required
                            />
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (€)</label>
                             <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="number" step="0.01" min="0"
                                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 outline-none bg-white text-gray-900 ${!user.stripeOnboardingComplete && parseFloat(price.replace(',','.')) > 0 ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    value={price} 
                                    onChange={e => {
                                        setPrice(e.target.value);
                                        if(parseFloat(e.target.value.replace(',','.')) > 0) setIsUnlimited(false); 
                                    }} 
                                    required
                                />
                             </div>
                             {!user.stripeOnboardingComplete && parseFloat(price.replace(',','.')) > 0 && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    Stripe connection required for paid events. Set price to 0 for free events.
                                </p>
                             )}
                             {parseFloat(price.replace(',','.')) > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Students will pay Price + €0.40 fee.</p>
                             )}
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Max Tickets (Capacity)</label>
                             <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="number" min="1" step="1"
                                    className={`w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 ${isUnlimited ? 'bg-gray-100 text-gray-500' : ''}`}
                                    value={isUnlimited ? 1000000 : maxCapacity} 
                                    onChange={e => setMaxCapacity(e.target.value)} 
                                    required
                                    disabled={isUnlimited}
                                />
                             </div>
                             {parseFloat(price.replace(',','.')) === 0 && (
                                 <div className="mt-2 flex items-center">
                                     <input 
                                        type="checkbox" 
                                        id="unlimited"
                                        checked={isUnlimited}
                                        onChange={(e) => setIsUnlimited(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                     />
                                     <label htmlFor="unlimited" className="ml-2 block text-sm text-gray-900 flex items-center">
                                         <InfinityIcon className="w-4 h-4 mr-1" /> Unlimited Capacity
                                     </label>
                                 </div>
                             )}
                        </div>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">PR Lists (Optional)</label>
                         <div className="flex gap-2 mb-2">
                             <input 
                                 type="text" 
                                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                 placeholder="Enter list name (e.g. Marco's List)"
                                 value={currentPrInput}
                                 onChange={e => setCurrentPrInput(e.target.value)}
                                 onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddPrList(); }}}
                             />
                             <button 
                                 type="button" 
                                 onClick={handleAddPrList}
                                 className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                             >
                                 Add
                             </button>
                         </div>
                         {prLists.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-2">
                                 {prLists.map((list, idx) => (
                                     <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                                         <List className="w-3 h-3 mr-1" />
                                         {list}
                                         <button type="button" onClick={() => handleRemovePrList(list)} className="ml-2 hover:text-red-600">
                                             <X className="w-3 h-3" />
                                         </button>
                                     </span>
                                 ))}
                             </div>
                         )}
                         <p className="text-xs text-gray-500 mt-1">Students will be asked to select one of these lists at checkout.</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Image URL (Optional)</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url"
                                placeholder="https://example.com/image.jpg" 
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                value={image} onChange={e => setImage(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Leave blank to generate a random party image.</p>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea 
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                            value={description} onChange={e => setDescription(e.target.value)} required
                        />
                     </div>
                     
                     <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={creatingEvent || (!user.stripeOnboardingComplete && parseFloat(price.replace(',','.')) > 0)}
                            className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creatingEvent ? 'Publishing...' : (
                                <>
                                    <Plus className="w-5 h-5 mr-2" />
                                    Publish Event
                                </>
                            )}
                        </button>
                     </div>
                 </form>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;