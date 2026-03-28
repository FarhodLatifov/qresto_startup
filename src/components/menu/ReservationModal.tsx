import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Users, User, Phone, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    guestName: string;
    guestPhone: string;
    date: string;
    time: string;
    partySize: number;
    comment: string;
  }) => Promise<void>;
}

export function ReservationModal({ isOpen, onClose, onSubmit }: ReservationModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    date: '',
    time: '',
    partySize: 2,
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setStep('success');
    } catch (error) {
      console.error('Error submitting reservation:', error);
      showToast('Произошла ошибка при бронировании. Пожалуйста, попробуйте еще раз.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setFormData({
        guestName: '',
        guestPhone: '',
        date: '',
        time: '',
        partySize: 2,
        comment: ''
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-dark rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 pb-4 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-serif text-gold">Бронь столика</h2>
              <button onClick={handleClose} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 hide-scrollbar">
              {step === 'form' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Ваше имя</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          required
                          value={formData.guestName}
                          onChange={e => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          placeholder="Иван Иванов"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Телефон</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          required
                          value={formData.guestPhone}
                          onChange={e => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          placeholder="+992 00 000 0000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Дата</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date}
                            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Время</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="time"
                            required
                            value={formData.time}
                            onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Количество персон</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="number"
                          required
                          min="1"
                          max="20"
                          value={formData.partySize}
                          onChange={e => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Комментарий (необязательно)</label>
                      <textarea
                        value={formData.comment}
                        onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none h-24"
                        placeholder="Особые пожелания..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-dark font-medium py-4 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    ) : (
                      'Забронировать'
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif text-gold mb-2">Заявка отправлена!</h3>
                  <p className="text-white/60 mb-8">
                    Мы получили вашу заявку на бронирование. Администратор свяжется с вами в ближайшее время для подтверждения.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full bg-white/10 text-white font-medium py-4 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Закрыть
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
