import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Plus, Edit2, Save, Search, Calendar, Tag, AlertCircle } from 'lucide-react';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todo-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim()) {
      const newTask = {
        id: Date.now(),
        text: input,
        completed: false,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        tag: newTaskTag,
        createdAt: Date.now()
      };
      setTasks([...tasks, newTask]);
      setInput('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskTag('');
      setShowAddOptions(false);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, text: editText } : task
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleTaskSelection = (id) => {
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    } else {
      setSelectedTasks([...selectedTasks, id]);
    }
  };

  const deleteSelected = () => {
    setTasks(tasks.filter(task => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-700';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'low': return 'bg-green-100 border-green-300 text-green-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const sortTasks = (tasksToSort) => {
    const sorted = [...tasksToSort];
    switch(sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      case 'date':
      default:
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
  };

  const filteredTasks = sortTasks(tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? !task.completed :
      filter === 'completed' ? task.completed : true;
    
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.tag && task.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }));

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;
  const allTags = [...new Set(tasks.map(t => t.tag).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
              Advanced Task Manager
            </h1>
            <p className="text-purple-100 text-center mt-2">
              Stay organized with priorities, due dates & more
            </p>
          </div>

          {/* Input Section */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={addTask}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
            
            <button
              onClick={() => setShowAddOptions(!showAddOptions)}
              className="text-purple-600 text-sm hover:text-purple-700 font-medium"
            >
              {showAddOptions ? '− Hide Options' : '+ Show Options'}
            </button>

            {showAddOptions && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <input
                    type="text"
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                    placeholder="e.g., Work, Personal"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Search and Sort */}
          <div className="px-6 sm:px-8 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'active'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    <Tag size={14} className="inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Task List */}
          <div className="p-6 sm:p-8 min-h-[300px]">
            {selectedTasks.length > 0 && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={deleteSelected}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedTasks.length})
                </button>
                <button
                  onClick={() => setSelectedTasks([])}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✓</div>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No tasks match your search' :
                   filter === 'completed' && tasks.length > 0 ? 'No completed tasks yet' :
                   filter === 'active' && tasks.length > 0 ? 'No active tasks - great job!' :
                   'No tasks yet. Add one above!'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg transition-all group ${
                      selectedTasks.includes(task.id) ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`flex-shrink-0 mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {task.completed && <Check size={16} className="text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1 border-2 border-purple-500 rounded focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-2 flex-wrap">
                            <span
                              className={`${
                                task.completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-800'
                              }`}
                            >
                              {task.text}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.tag && (
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                {task.tag}
                              </span>
                            )}
                          </div>
                          {task.dueDate && (
                            <div className={`text-xs mt-1 flex items-center gap-1 ${
                              isOverdue(task.dueDate) && !task.completed ? 'text-red-600 font-semibold' : 'text-gray-500'
                            }`}>
                              <Calendar size={12} />
                              {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue(task.dueDate) && !task.completed && (
                                <AlertCircle size={12} className="ml-1" />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(task)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {completedCount > 0 && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <button
                onClick={clearCompleted}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Clear All Completed Tasks
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 px-6 sm:px-8 py-4 text-center text-gray-600">
            <p className="text-sm">
              {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}