import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../services/bookService";
import GlassPage from "../components/GlassPage";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await getNotifications();
    setItems(data);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const onRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <GlassPage>
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="glass-animate mb-6 text-3xl font-bold">Notifications</h1>
      <div className="glass-animate space-y-3">
        {items.map((item) => (
          <article key={item._id} className={`rounded-lg border border-white/20 p-4 ${item.read ? "bg-white/10" : "bg-purple-500/20"}`}>
            <p className="font-semibold">{item.title}</p>
            <p className="text-slate-100">{item.message}</p>
            {!item.read && (
              <button onClick={() => onRead(item._id)} className="mt-2 rounded bg-purple-600 px-3 py-1 text-sm text-white">
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
    </GlassPage>
  );
}
