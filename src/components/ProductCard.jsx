// src/components/ProductCard.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'sonner'

function ProductCard({ product }) {
  const { addItem } = useCart()
  const { t, language } = useLanguage()

  // Traduções para o card
  const getText = (key) => {
    const texts = {
      ultimasPecas: { PT: 'Últimas', EN: 'Last' },
      emPromocao: { PT: 'PROMOÇÃO', EN: 'SALE' },
      adicionar: { PT: 'Adicionar ao Carrinho', EN: 'Add to Cart' }
    }
    return texts[key]?.[language] || texts[key]?.PT || key
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    toast.success(`${product.nome} ${language === 'PT' ? 'adicionado ao carrinho!' : 'added to cart!'}`)
  }

  // Renderizar estrelas (rating de 0 a 5)
  const renderStars = () => {
    const rating = product.rating || 0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - Math.ceil(rating)

    return (
      <div className="product-stars">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={12} className="star-filled" />
        ))}
        {hasHalfStar && <Star key="half" size={12} className="star-half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="star-empty" />
        ))}
        <span className="rating-count">({product.num_avaliacoes || 0})</span>
      </div>
    )
  }

  return (
    <motion.div
      className="produto-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/produto/${product.id}`} className="produto-link">
        {/* Imagem */}
        <div className="produto-imagem-container">
          <div className="produto-imagem">
            {product.imagem && (product.imagem.startsWith('http') || product.imagem.includes('supabase')) ? (
              <img 
                src={product.imagem} 
                alt={product.nome} 
                className="card-imagem"
                loading="lazy"
              />
            ) : (
              <span className="card-emoji">{product.imagem || '🧶'}</span>
            )}
          </div>
          
          {/* Badge de promoção */}
          {product.em_promocao && (
            <span className="promo-badge">{getText('emPromocao')}</span>
          )}
        </div>

        {/* Informações do produto */}
        <div className="produto-info">
          {/* Categoria */}
          <span className="produto-categoria">{product.categoria?.toUpperCase()}</span>
          
          {/* Nome */}
          <h3 className="produto-nome">{product.nome}</h3>
          
          {/* Avaliação */}
          {renderStars()}
          
          {/* Preço */}
          <div className="produto-preco">
            {product.em_promocao && product.preco_original ? (
              <>
                <span className="preco-original">
                  R$ {product.preco_original.toFixed(2).replace('.', ',')}
                </span>
                <span className="preco-atual promo">
                  R$ {product.preco.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="preco-atual">
                R$ {product.preco.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          
          {/* Estoque baixo */}
          {product.estoque <= 3 && product.estoque > 0 && (
            <p className="estoque-baixo">
              {getText('ultimasPecas')} {product.estoque} peças!
            </p>
          )}
        </div>
      </Link>
      
      {/* Botão de adicionar ao carrinho */}
      <button className="add-to-cart-btn-card" onClick={handleAddToCart}>
        <ShoppingBag size={14} />
        {getText('adicionar')}
      </button>
    </motion.div>
  )
}

export default ProductCard