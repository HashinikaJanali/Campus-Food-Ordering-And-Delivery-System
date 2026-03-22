import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Sparkles, Gift, Star, Trophy, AlertCircle } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useApp } from '../context/AppContext';

// Notification type configurations
const notificationTypes = {
  points_earned: {
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    icon: Star,
    iconColor: 'text-yellow-600',
    bgIcon: 'bg-yellow-100',
  },
  achievement_unlocked: {
    color: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: Trophy,
    iconColor: 'text-purple-600',
    bgIcon: 'bg-purple-100',
  },
  promotion_new: {
    color: 'bg-pink-50',
    borderColor: 'border-pink-300',
    icon: Gift,
    iconColor: 'text-pink-600',
    bgIcon: 'bg-pink-100',
  },
  review_helpful: {
    color: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: Sparkles,
    iconColor: 'text-blue-600',
    bgIcon: 'bg-blue-100',
  },
  level_up: {
    color: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: Trophy,
    iconColor: 'text-green-600',
    bgIcon: 'bg-green-100',
  },
  reward_redeemed: {
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    icon: Gift,
    iconColor: 'text-indigo-600',
    bgIcon: 'bg-indigo-100',
  },
  default: {
    color: 'bg-gray-50',
    borderColor: 'border-gray-300',
    icon: AlertCircle,
    iconColor: 'text-gray-600',
    bgIcon: 'bg-gray-100',
  },
};

const NotificationBell = () => {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll(currentUser.userId, { limit: 10 });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(currentUser.userId);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(currentUser.userId);
      fetchNotifications();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getNotificationStyle = (type) => {
    return notificationTypes[type] || notificationTypes.default;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Notifications</h3>
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-primary hover:text-primary-600 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    {/* Empty State Illustration */}
                    <img
                      src="https://illustrations.popsy.co/amber/message-sent.svg"
                      alt="No notifications"
                      className="w-48 h-48 mx-auto mb-4 opacity-60"
                    />
                    <p className="font-semibold text-gray-700">No notifications yet</p>
                    <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      const IconComponent = style.icon;

                      return (
                        <div
                          key={notif._id}
                          className={`p-4 hover:bg-gray-50 transition-all ${
                            !notif.read ? `${style.color} border-l-4 ${style.borderColor}` : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.bgIcon} flex items-center justify-center`}>
                              <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm">{notif.title}</h4>
                                <button
                                  onClick={() => handleDelete(notif._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(notif.createdAt)}
                                </span>
                                
                                {!notif.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    className="text-xs text-primary hover:text-primary-600 font-semibold flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;