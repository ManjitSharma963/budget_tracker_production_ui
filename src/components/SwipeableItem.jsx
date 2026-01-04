import React, { useState, useRef, useEffect } from 'react'
import './SwipeableItem.css'

function SwipeableItem({ children, onSwipeLeft, onSwipeRight, onEdit, onDelete }) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const itemRef = useRef(null)

  const SWIPE_THRESHOLD = 80

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    setSwipeOffset(diff)
  }

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (swipeOffset < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    setSwipeOffset(0)
    setIsDragging(false)
  }

  useEffect(() => {
    const item = itemRef.current
    if (!item) return

    item.addEventListener('touchstart', handleTouchStart, { passive: true })
    item.addEventListener('touchmove', handleTouchMove, { passive: true })
    item.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      item.removeEventListener('touchstart', handleTouchStart)
      item.removeEventListener('touchmove', handleTouchMove)
      item.removeEventListener('touchend', handleTouchEnd)
    }
  }, [swipeOffset, isDragging])

  const showLeftAction = swipeOffset < -SWIPE_THRESHOLD / 2
  const showRightAction = swipeOffset > SWIPE_THRESHOLD / 2

  return (
    <div className="swipeable-item-wrapper" ref={itemRef}>
      <div 
        className="swipeable-item"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
      {showLeftAction && onDelete && (
        <div className="swipe-action swipe-action-left" onClick={onDelete}>
          🗑️ Delete
        </div>
      )}
      {showRightAction && onEdit && (
        <div className="swipe-action swipe-action-right" onClick={onEdit}>
          ✏️ Edit
        </div>
      )}
    </div>
  )
}

export default SwipeableItem

