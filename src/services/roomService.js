import api from './api';

const roomService = {
  // Get all rooms
  getRooms: async () => {
    const response = await api.get('room/');
    return response.data;
  },
  
  // Get a single room by ID
  getRoomById: async (id) => {
    const response = await api.get(`room/${id}/`);
    return response.data;
  },

  // Create a new room (e.g., { title: "Living Room" })
  createRoom: async (roomData) => {
    const response = await api.post('room/', roomData);
    return response.data;
  },

  // Delete an entire room
  deleteRoom: async (roomId) => {
    const response = await api.delete(`room/${roomId}/`);
    return response.data;
  },

  // Add a product to a specific room
  // roomId is passed in URL, productId is passed in payload as 'product'
  addProductToRoom: async (roomId, productId) => {
    const response = await api.post(`room/add-product/${roomId}/`, { product: productId });
    return response.data;
  },

  // Remove a product from a room 
  // id is the RoomProduct relationship ID, not the product ID
  removeProductFromRoom: async (roomProductId) => {
    // Using delete as it's a 'remove' action, matching the 'remove/' endpoint
    const response = await api.delete(`room/product/${roomProductId}/remove/`);
    return response.data;
  }
};


export default roomService;
