import React, { useState } from 'react'
import AddButton from './AddButton'
import './NotesList.css'

function NotesList({ notes, onAddClick, onEdit, onDelete }) {

  if (!notes || notes.length === 0) {
    return (
      <div className="notes-list-container">
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No notes yet. Click the + button to add your first note.</p>
          <AddButton onClick={onAddClick} />
        </div>
      </div>
    )
  }

  return (
    <div className="notes-list-container">
      <div className="notes-header">
        <h3>Notes</h3>
        <AddButton onClick={onAddClick} />
      </div>
      
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-item">
            <div className="note-content">
              {note.title && (
                <h4 className="note-title">{note.title}</h4>
              )}
              {note.note && (
                <p className="note-text">{note.note}</p>
              )}
            </div>
            <div className="note-actions">
              <button
                className="note-action-btn"
                onClick={() => onEdit(note)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="note-action-btn"
                onClick={() => onDelete(note.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotesList
