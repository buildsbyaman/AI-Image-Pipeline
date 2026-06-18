import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#111113]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#18181B] border border-zinc-800 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-zinc-200">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: any) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors flex gap-3 ${!notification.read ? 'bg-zinc-800/10' : ''}`}
                  >
                    <div className="mt-0.5 text-blue-500 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notification.read ? 'text-zinc-200' : 'text-zinc-400'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
