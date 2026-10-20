import { money, type Order } from '@/lib/marketplace';
export function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length) return <p className="market-empty">No orders yet.</p>;
  return <div>{orders.map(order => <article className="market-order" key={order.id}><header><h3>{order.order_number}</h3><span className="menu__price">{money(order.total_amount)}</span></header><p>{order.status} · {order.payment_method} · {order.payment_status}</p><details><summary>View items</summary>{order.items?.map(item => <p key={item.id}>{item.product?.name || `Product ${item.id}`} × {item.quantity} — {money(item.subtotal)}</p>)}</details></article>)}</div>;
}