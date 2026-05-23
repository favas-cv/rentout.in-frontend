import api from './api';

export const getCheckoutSummary = async () => {
  const res = await api.get('/booking/checkout/');
  return res.data; // [{ cart_id, product_name, price_per_day, deposit, quantity }, ...]
};

export const checkAvailability = async ({ cart_id, start_date, end_date }) => {
  const res = await api.post('/booking/check-availability/', {
    cart_id,
    start_date,
    end_date 
  });
  return res.data; // { available: true/false, message: "..." }
};

export const createReservation = async (items, address_id) => {
  // items: [{ cart_id, start_date, end_date }, ...]
  const res = await api.post('/booking/create-reservation/', { items, address_id });
  return res.data; // { reservation_ids, total_rent, total_deposit, total_payable }
};

export const fetchBookings = async () => {
  const res = await api.get('/booking/list/');
  return res.data;
};

export const fetchPreviousItems = async () => {
  const res = await api.get('/booking/prev-items/');
  return res.data;
};

export const confirmBooking = async (bookings) => {
  // bookings: [{ cart_id, start_date, end_date }, ...]
  const res = await api.post('/booking/confirm/', { bookings });
  return res.data;
};

export const createRazorpayOrder = async (reservation_ids) => {
  const res = await api.post('/booking/create-razorpay-order/', { reservation_ids });
  return res.data;
};

export const verifyPayment = async (paymentData) => {
  const res = await api.post('/booking/verify-payment/', paymentData);
  return res.data;
};

export const cancelBooking = async (item_id) => {
  const res = await api.patch('/booking/cancel/', { item_id });
  return res.data;
};
