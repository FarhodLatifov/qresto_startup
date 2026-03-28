import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Database } from "../../types/supabase";

type Dish = Database['public']['Tables']['dishes']['Row'];

interface DishCardProps {
  dish: Dish;
  index?: number;
  onAdd: (dish: Dish) => void;
  quantity?: number;
}

export function DishCard({ dish, index = 0, onAdd, quantity = 0 }: DishCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel overflow-hidden rounded-2xl flex flex-col"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full bg-white/5 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <span className="font-serif text-sm italic">No image</span>
          </div>
        )}
        
        {/* Popular Badge */}
        {dish.is_popular && (
          <div className="absolute top-3 left-3 bg-gold/90 backdrop-blur-md text-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Хит
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg leading-tight mb-1 text-white">
            {dish.name}
          </h3>
          {dish.description && (
            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-gold font-medium text-lg">
            {dish.price.toLocaleString('ru-RU')} <span className="text-sm">TJS</span>
          </span>
          
          <div className="flex items-center gap-2">
            {quantity > 0 && (
              <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-medium border border-gold/20">
                {quantity}
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onAdd(dish)}
              disabled={!dish.is_available}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                dish.is_available 
                  ? 'bg-white/10 hover:bg-gold hover:text-dark text-white' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              aria-label="Добавить в корзину"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
