import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import RoomScene from '../components/ThreeD/RoomScene';
import OrderSummary from './ordersummary';
import roomService from '../services/roomService';
import { toast } from 'react-toastify';
import { Plus, Trash2, Home, Box as BoxIcon, X, AlertCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ARViewer from '../components/ARViewer';
import { Smartphone } from 'lucide-react';

const Room3D = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [placedItems, setPlacedItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [showAR, setShowAR] = useState(false);
  const [arInitialIndex, setArInitialIndex] = useState(0);

  const demoItems = [
    { id: 'default-sofa', name: 'Premium Sofa', url: '/models/sofa.glb', usdzUrl: '/models/sofa.usdz', position: [0, 0, 0], scale: 1.8, hasModel: true, thumbnail: '/models/sofa.png' },
    { id: 'default-bed', name: 'Luxury Bed', url: '/models/bed.glb', usdzUrl: '/models/bed.usdz', position: [4, 0, 0], scale: 1.2, hasModel: true, thumbnail: '/models/bed.png' },
    { id: 'default-flower', name: 'Decorative Plant', url: '/models/flower.glb', usdzUrl: '/models/flower.usdz', position: [-3, 0, 3], scale: 1.5, hasModel: true, thumbnail: '/models/flower.png' },
    { id: 'default-lc', name: 'Decorative Plant', url: '/models/lc.glb', usdzUrl: '/models/lc.usdz', position: [-3, 0, 3], scale: 1.5, hasModel: true, thumbnail: '/models/flower.png' },
  ];

  const fetchRoomData = async () => {
    // If not authenticated, we just stay in demo mode with demoItems
    if (!isAuthenticated) {
      setLoading(false);
      setPlacedItems(demoItems);
      setInventoryItems(demoItems);
      return;
    }

    try {
      setLoading(true);
      const data = await roomService.getRooms();
      setRooms(data.results || []);

      if (data.results && data.results.length > 0) {
        processRoomItems(data.results[selectedRoomIndex]);
      } else {
        setPlacedItems(demoItems);
        setInventoryItems([]);
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError("Failed to load your rooms.");
      setPlacedItems(demoItems);
    } finally {
      setLoading(false);
    }
  };

  const processRoomItems = (room) => {
    if (!room) return;
    const items3D = [];
    const allItems = [];

    room.products.forEach((productItem) => {
      const product = productItem.product;
      const modelImage = product.product_image?.find(img => img.model3d_url);
      const imageUrl = product.product_image?.find(img => img.image_url)?.image_url;

      const hasModel = !!(modelImage && modelImage.model3d_url);

      const itemData = {
        id: product.id,
        relId: productItem.id,
        name: product.title,
        url: modelImage?.model3d_url,
        thumbnail: imageUrl,
        hasModel: hasModel,
        position: [allItems.length * 2 - 4, 0, (allItems.length % 2) * 2 - 2],
        scale: 1
      };

      allItems.push(itemData);
      if (hasModel) {
        items3D.push(itemData);
      }
    });

    // If room has NO 3D items, show demo items in the scene but keep inventory real
    setPlacedItems(items3D.length > 0 ? items3D : demoItems);
    setInventoryItems(allItems);
  };

  useEffect(() => {
    fetchRoomData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (rooms.length > 0) {
      processRoomItems(rooms[selectedRoomIndex]);
    }
  }, [selectedRoomIndex, rooms]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    try {
      await roomService.createRoom({ title: newRoomTitle });
      toast.success('Room created successfully!');
      setShowCreateModal(false);
      setNewRoomTitle('');
      fetchRoomData();
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  const handleRemoveProduct = async (relId) => {
    try {
      await roomService.removeProductFromRoom(relId);
      toast.info('Item removed from room');
      fetchRoomData();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };


  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#635465] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Preparing your 3D experience...</p>
        </div>
      </div>
    );
  }

  const currentRoom = rooms.length > 0 ? rooms[selectedRoomIndex] : null;
  const isDemo = !isAuthenticated || rooms.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            {isDemo ? 'Interactive Demo Space' : 'Virtual Room Staging'}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDemo ? 'bg-amber-500' : 'bg-green-500'}`} />
            {isDemo ? 'Viewing Sample Layout' : `Active Room: ${currentRoom?.title}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/products')}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            Browse Products
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> New Room
          </button>
          {inventoryItems.some(i => i.hasModel) && (
            <button
              onClick={() => { setArInitialIndex(0); setShowAR(true); }}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center gap-2"
            >
              <Smartphone size={18} /> View All in AR
            </button>
          )}
          <button className="bg-[#635465] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#524554] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
            Save Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Room Selection Tabs */}
          {rooms.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {rooms.map((room, idx) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomIndex(idx)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${selectedRoomIndex === idx
                    ? 'bg-[#635465] text-white border-[#635465] shadow-md'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                >
                  {room.title}
                </button>
              ))}
            </div>
          )}

          {/* 3D Scene */}
          <div className="relative group">
            <RoomScene items={placedItems} />
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-medium">
                Right Click to Rotate • Left Click to Move
              </div>
            </div>
            {isDemo && (
              <div className="absolute top-6 right-6 bg-amber-500/90 backdrop-blur text-white text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg">
                Demo Mode
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Room Inventory</h2>
                <p className="text-sm text-slate-400">
                  {isDemo ? 'Sample items for visualization' : `Total ${inventoryItems.length} items in this room`}
                </p>
              </div>
              <div className="flex -space-x-2">
                {(isDemo ? demoItems : inventoryItems).slice(0, 5).map((item, i) => (
                  <div key={item.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {(isDemo ? demoItems : inventoryItems).map((item) => (
                <div key={item.id} className="group bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-[#635465]/10 hover:bg-white hover:shadow-md transition-all relative">
                  {!isDemo && (
                    <button
                      onClick={() => handleRemoveProduct(item.relId)}
                      className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="w-full aspect-square bg-slate-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        alt={item.name}
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                    {!item.hasModel && !isDemo && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                        <BoxIcon size={20} className="text-white/50 mb-2" />
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">No 3D Model</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${item.hasModel || isDemo ? 'text-green-500' : 'text-slate-400'}`}>
                      {item.hasModel || isDemo ? '3D Ready' : '2D View Only'}
                    </p>
                    {item.hasModel && (
                      <button
                        onClick={() => {
                          const idx = inventoryItems.filter(i => i.hasModel).findIndex(i => i.id === item.id);
                          setArInitialIndex(idx >= 0 ? idx : 0);
                          setShowAR(true);
                        }}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-[#635465] hover:text-white transition-all shadow-sm"
                        title="View in AR"
                      >
                        <Smartphone size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!isDemo && inventoryItems.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <BoxIcon size={40} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-bold text-slate-500">Your room is empty</p>
                  <p className="text-xs text-slate-400 mt-1 mb-6">Browse products and click the 🏠 icon to add them here</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="bg-[#635465] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#524554] transition-all"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Info size={18} className="text-[#635465]" /> Staging Info
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Products in Room</p>
                <p className="text-xl font-black text-[#635465]">{isDemo ? 'N/A' : inventoryItems.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">3D Models Loaded</p>
                <p className="text-xl font-black text-green-600">{isDemo ? 3 : inventoryItems.filter(i => i.hasModel).length}</p>
              </div>
            </div>
            {isDemo && (
              <div className="mt-6 p-4 bg-[#635465]/5 rounded-2xl border border-[#635465]/10">
                <p className="text-xs text-[#635465] font-medium leading-relaxed">
                  You are currently in <b>Demo Mode</b>. Create your own room to start adding products from our catalog!
                </p>
              </div>
            )}
          </div>
          <OrderSummary />
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Home className="text-[#635465]" /> New Room
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Room Title</label>
                <input
                  type="text"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="e.g. Master Bedroom"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 focus:ring-2 focus:ring-[#635465]/20 outline-none font-bold"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#635465] text-white py-4 rounded-2xl font-black shadow-lg"
              >
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AR Modal Overlay */}
      {showAR && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-hidden animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex-1 min-h-0">
              {(() => {
                const arProducts = inventoryItems
                  .filter(i => i.hasModel)
                  .map(i => ({
                    modelUrl: i.url,
                    usdzUrl: i.usdzUrl || i.url?.replace('.glb', '.usdz'),
                    thumbnail: i.thumbnail,
                    name: i.name
                  }));

                // Fallback to demo items if inventory has no 3D models
                const finalProducts = arProducts.length > 0 ? arProducts : demoItems.map(i => ({
                  modelUrl: i.url,
                  usdzUrl: i.url?.replace('.glb', '.usdz'),
                  thumbnail: i.thumbnail,
                  name: i.name
                }));

                return (
                  <ARViewer
                    products={finalProducts}
                    initialIndex={arInitialIndex}
                    onClose={() => setShowAR(false)}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room3D;



