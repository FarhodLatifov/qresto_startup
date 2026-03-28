import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Database } from '../../types/supabase';
import { useState } from 'react';

type Dish = Database['public']['Tables']['dishes']['Row'];

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onPlaceOrder: (comment: string) => Promise<void>;
}

export function CartModal({ isOpen, onClose, items = [], onUpdateQuantity, onPlaceOrder }: CartModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await onPlaceOrder(comment);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Checkout failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-dark border-t border-white/10 rounded-t-3xl z-50 max-h-[90vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Handle bar for mobile */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 pb-4 flex items-center justify-between border-b border-white/5">
              <h2 className="font-serif text-2xl text-gold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Ваш заказ
              </h2>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-2">Заказ принят!</h3>
                  <p className="text-white/60">Официант уже спешит к вам.</p>
                </motion.div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p>Корзина пуста</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Cart Items */}
                  <div className="flex flex-col gap-4">
                    {items.map((item) => (
                      <div key={item.dish.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl">
                        {item.dish.image_url ? (
                          <img src={item.dish.image_url} alt={item.dish.name} className="w-16 h-16 object-cover rounded-xl" />
                        ) : (
                          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.dish.name}</h4>
                          <p className="text-gold font-medium">{item.dish.price} TJS</p>
                        </div>

                        <div className="flex items-center gap-3 bg-dark px-3 py-1.5 rounded-full border border-white/10">
                          <button 
                            onClick={() => onUpdateQuantity(item.dish.id, -1)}
                            className="text-white/60 hover:text-white p-1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.dish.id, 1)}
                            className="text-white/60 hover:text-white p-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Field */}
                  <div className="mt-4">
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2 font-medium">
                      Комментарий к заказу
                    </label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Например: без лука, принести счет сразу..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all resize-none h-24"
                    />
                  </div>
                </div>
              )}
            </div>

            {!isSuccess && items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-dark/95 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60">Итого:</span>
                  <span className="text-2xl font-serif text-gold">{totalAmount} TJS</span>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-gold text-dark font-medium py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors shadow-[0_5px_20px_rgba(212,175,55,0.2)] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  ) : (
                    <>
                      Оформить заказ
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
