export function matchesOrder(order, query) {
  if (!query || query.trim() === '') return true;
  const q = query.toString().toLowerCase();
  const id = (order.orderId || order.id || order._id || '').toString().toLowerCase();
  const customer = (order.customer || order.customerName || order.customer_name || '').toString().toLowerCase();
  const email = (order.email || order.customerEmail || '').toString().toLowerCase();
  const phone = (order.phone || order.deliveryInfo?.phoneNumber || '').toString().toLowerCase();
  return id.includes(q) || customer.includes(q) || email.includes(q) || phone.includes(q);
}
