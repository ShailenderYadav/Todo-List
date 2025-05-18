import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Todo {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
  createdAt: string;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState('all');

  // New todo form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Edit todo form
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        toast.error('Error fetching todos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error fetching todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || undefined,
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([newTodo, ...todos]);
        setShowAddModal(false);
        resetForm();
        toast.success('Todo added successfully');
      } else {
        toast.error('Error adding todo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding todo');
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTodo || !editTitle) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/todos/${selectedTodo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus,
          dueDate: editDueDate || undefined,
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo)));
        setShowEditModal(false);
        setSelectedTodo(null);
        toast.success('Todo updated successfully');
      } else {
        toast.error('Error updating todo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo._id !== id));
        toast.success('Todo deleted successfully');
      } else {
        toast.error('Error deleting todo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting todo');
    }
  };

  const openEditModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditStatus(todo.status);
    setEditDueDate(todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  return (
    <div className="container py-8">
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Todo List</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Todo
          </button>
        </div>

        <div className="form-group">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <div key={todo._id} className={`todo-item ${todo.status === 'completed' ? 'completed' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="title">{todo.title}</h3>
                  {todo.description && <p className="description">{todo.description}</p>}
                  {todo.dueDate && (
                    <p className="due-date">
                      Due: {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                  <span className={`status ${todo.status}`}>
                    {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(todo)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    className="btn bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Todo Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">Add New Todo</h2>
            <form onSubmit={handleAddTodo}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Todo Modal */}
      {showEditModal && selectedTodo && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">Edit Todo</h2>
            <form onSubmit={handleUpdateTodo}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'pending' | 'completed')}
                  className="select"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Todo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList; 