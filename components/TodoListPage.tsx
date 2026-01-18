import React, { useState } from 'react';
import { TodoItem } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, Edit2, Check, X } from 'lucide-react';

interface TodoListPageProps {
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onUpdateTodo?: (todo: TodoItem) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoListPage: React.FC<TodoListPageProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo,
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText);
      setNewTodoText('');
    }
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim() && onUpdateTodo) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        onUpdateTodo({ ...todo, text: editText });
      }
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="p-6 md:p-12 pb-24 max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <ListTodo className="w-8 h-8 text-purple-500" />
          我们的愿望清单
        </h2>
        <p className="text-slate-500 mt-2">一起实现的每一个小目标</p>
      </div>

      {/* Add New Todo */}
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="添加新的愿望..."
            className="flex-1 p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
          />
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2 font-medium transition-colors shadow-lg shadow-purple-200"
          >
            <Plus className="w-5 h-5" />
            添加
          </button>
        </div>
      </div>

      {/* Active Todos */}
      {activeTodos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">进行中</h3>
          {activeTodos.map(todo => (
            <div
              key={todo.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 group hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className="text-slate-300 hover:text-purple-500 transition-colors shrink-0"
              >
                <Circle className="w-6 h-6" />
              </button>
              
              {editingId === todo.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                    className="flex-1 p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(todo.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-slate-700">{todo.text}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">已完成</h3>
          {completedTodos.map(todo => (
            <div
              key={todo.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 group"
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className="text-green-500 hover:text-slate-400 transition-colors shrink-0"
              >
                <CheckCircle2 className="w-6 h-6" />
              </button>
              <span className="flex-1 text-slate-400 line-through">{todo.text}</span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>还没有愿望清单，快来添加一个吧！</p>
        </div>
      )}
    </div>
  );
};